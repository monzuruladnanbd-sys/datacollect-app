import { DatabaseService } from './supabase';
import { LocalDatabaseService } from './local-database';

export interface WorkloadStats {
  userEmail: string;
  role: string;
  pendingCount: number;
  completedToday: number;
  lastAssigned: Date | null;
}

export interface RoundRobinConfig {
  enabled: boolean;
  assignmentStrategy: 'round_robin' | 'least_loaded' | 'random';
  maxWorkloadPerUser: number;
  resetDaily: boolean;
}

export class RoundRobinService {
  private static config: RoundRobinConfig = {
    enabled: true,
    assignmentStrategy: 'least_loaded',
    maxWorkloadPerUser: 10,
    resetDaily: true
  };

  /**
   * Get the next available reviewer using round-robin logic
   */
  static async getNextReviewer(): Promise<string | null> {
    try {
      console.log('🔄 Getting next reviewer using round-robin...');
      
      const reviewers = await this.getActiveUsersByRole('reviewer');
      if (reviewers.length === 0) {
        console.log('❌ No active reviewers found');
        return null;
      }

      if (reviewers.length === 1) {
        console.log('✅ Only one reviewer available:', reviewers[0].email);
        return reviewers[0].email;
      }

      const assignments = await this.getWorkloadStats('reviewer');
      const nextReviewer = this.selectNextUser(reviewers, assignments, 'submitted');
      
      console.log('✅ Next reviewer selected:', nextReviewer);
      return nextReviewer;
      
    } catch (error) {
      console.error('❌ Error getting next reviewer:', error);
      return null;
    }
  }

  /**
   * Get the next available approver using round-robin logic
   */
  static async getNextApprover(): Promise<string | null> {
    try {
      console.log('🔄 Getting next approver using round-robin...');
      
      const approvers = await this.getActiveUsersByRole('approver');
      if (approvers.length === 0) {
        console.log('❌ No active approvers found');
        return null;
      }

      if (approvers.length === 1) {
        console.log('✅ Only one approver available:', approvers[0].email);
        return approvers[0].email;
      }

      const assignments = await this.getWorkloadStats('approver');
      const nextApprover = this.selectNextUser(approvers, assignments, 'reviewed');
      
      console.log('✅ Next approver selected:', nextApprover);
      return nextApprover;
      
    } catch (error) {
      console.error('❌ Error getting next approver:', error);
      return null;
    }
  }

  /**
   * Get active users by role
   */
  private static async getActiveUsersByRole(role: string): Promise<any[]> {
    try {
      // Try database first
      const { isSupabaseConfigured } = await import('./supabase');
      if (isSupabaseConfigured) {
        const { supabase } = await import('./supabase');
        const { data, error } = await supabase
          .from('users')
          .select('email, full_name, role, is_active')
          .eq('role', role)
          .eq('is_active', true)
          .order('created_at', { ascending: true }); // For consistent round-robin

        if (error) throw error;
        return data || [];
      } else {
        // Fallback to local database
        const localUsers = await LocalDatabaseService.getUsers();
        return localUsers
          .filter(user => user.role === role && user.is_active)
          .sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateA - dateB;
          });
      }
    } catch (error) {
      console.error(`Error getting ${role} users:`, error);
      return [];
    }
  }

  /**
   * Get workload statistics for users
   */
  private static async getWorkloadStats(role: string): Promise<WorkloadStats[]> {
    try {
      const users = await this.getActiveUsersByRole(role);
      const { getRows } = await import('./storage');
      const allRows = await getRows();
      
      const stats: WorkloadStats[] = [];
      
      for (const user of users) {
        const userEmail = user.email;
        const pendingStatus = role === 'reviewer' ? 'submitted' : 'reviewed';
        
        const pendingCount = allRows.filter(row => 
          row.user === userEmail && row.status === pendingStatus
        ).length;
        
        const completedToday = allRows.filter(row => {
          const today = new Date().toDateString();
          const rowDate = new Date(row.savedAt).toDateString();
          return row.user === userEmail && 
                 (row.status === 'approved' || row.status === 'rejected') &&
                 rowDate === today;
        }).length;
        
        // Get last assignment time
        const userRows = allRows.filter(row => row.user === userEmail);
        const lastAssigned = userRows.length > 0 
          ? new Date(Math.max(...userRows.map(row => new Date(row.savedAt).getTime())))
          : null;
        
        stats.push({
          userEmail,
          role,
          pendingCount,
          completedToday,
          lastAssigned
        });
      }
      
      return stats;
      
    } catch (error) {
      console.error('Error getting workload stats:', error);
      return [];
    }
  }

  /**
   * Select next user based on strategy
   */
  private static selectNextUser(users: any[], assignments: WorkloadStats[], statusFilter: string): string {
    const strategy = this.config.assignmentStrategy;
    
    switch (strategy) {
      case 'least_loaded':
        return this.selectLeastLoadedUser(users, assignments);
      
      case 'round_robin':
        return this.selectRoundRobinUser(users, assignments);
      
      case 'random':
        return users[Math.floor(Math.random() * users.length)].email;
      
      default:
        return this.selectLeastLoadedUser(users, assignments);
    }
  }

  /**
   * Select user with least workload
   */
  private static selectLeastLoadedUser(users: any[], assignments: WorkloadStats[]): string {
    let selectedUser = users[0];
    let minWorkload = Infinity;
    
    for (const user of users) {
      const userStats = assignments.find(stat => stat.userEmail === user.email);
      const workload = userStats ? userStats.pendingCount : 0;
      
      if (workload < minWorkload) {
        minWorkload = workload;
        selectedUser = user;
      }
    }
    
    return selectedUser.email;
  }

  /**
   * Select user using round-robin (least recently assigned)
   */
  private static selectRoundRobinUser(users: any[], assignments: WorkloadStats[]): string {
    let selectedUser = users[0];
    let oldestAssignment: Date | null = null;
    
    for (const user of users) {
      const userStats = assignments.find(stat => stat.userEmail === user.email);
      const lastAssigned = userStats?.lastAssigned;
      
      if (!lastAssigned) {
        // User has never been assigned, prioritize them
        return user.email;
      }
      
      if (!oldestAssignment || lastAssigned < oldestAssignment) {
        oldestAssignment = lastAssigned;
        selectedUser = user;
      }
    }
    
    return selectedUser.email;
  }

  /**
   * Get workload dashboard data
   */
  static async getWorkloadDashboard(): Promise<{
    reviewers: WorkloadStats[];
    approvers: WorkloadStats[];
    totalPending: number;
    totalCompletedToday: number;
  }> {
    try {
      const reviewerStats = await this.getWorkloadStats('reviewer');
      const approverStats = await this.getWorkloadStats('approver');
      
      const totalPending = [...reviewerStats, ...approverStats]
        .reduce((sum, stat) => sum + stat.pendingCount, 0);
      
      const totalCompletedToday = [...reviewerStats, ...approverStats]
        .reduce((sum, stat) => sum + stat.completedToday, 0);
      
      return {
        reviewers: reviewerStats,
        approvers: approverStats,
        totalPending,
        totalCompletedToday
      };
      
    } catch (error) {
      console.error('Error getting workload dashboard:', error);
      return {
        reviewers: [],
        approvers: [],
        totalPending: 0,
        totalCompletedToday: 0
      };
    }
  }

  /**
   * Update round-robin configuration
   */
  static updateConfig(newConfig: Partial<RoundRobinConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('🔄 Round-robin config updated:', this.config);
  }

  /**
   * Get current configuration
   */
  static getConfig(): RoundRobinConfig {
    return { ...this.config };
  }
}
