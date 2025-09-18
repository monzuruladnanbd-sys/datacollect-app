import { User, Role } from "./session";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: Role;
  department?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  passwordHash: string;
}

export interface UserStats {
  totalUsers: number;
  submitters: number;
  reviewers: number;
  approvers: number;
  activeUsers: number;
}

// In-memory user storage (in production, this would be a database)
let users: UserProfile[] = [
  // Default admin user
  {
    id: "admin-001",
    email: "admin@example.com",
    name: "System Administrator",
    role: "admin",
    department: "IT",
    isActive: true,
    createdAt: new Date().toISOString(),
    passwordHash: "admin123", // In production, use proper hashing
  },
  // Default submitters
  {
    id: "submitter-001",
    email: "data@example.com",
    name: "Data Submitter",
    role: "submitter",
    department: "Data Collection",
    isActive: true,
    createdAt: new Date().toISOString(),
    passwordHash: "Passw0rd!",
  },
  {
    id: "submitter-002",
    email: "field@example.com",
    name: "Field Data Collector",
    role: "submitter",
    department: "Field Operations",
    isActive: true,
    createdAt: new Date().toISOString(),
    passwordHash: "Passw0rd!",
  },
  {
    id: "submitter-003",
    email: "research@example.com",
    name: "Research Assistant",
    role: "submitter",
    department: "Research",
    isActive: true,
    createdAt: new Date().toISOString(),
    passwordHash: "Passw0rd!",
  },
  // 3 Reviewers
  {
    id: "reviewer-001",
    email: "review@example.com",
    name: "Senior Data Reviewer",
    role: "reviewer",
    department: "Quality Assurance",
    isActive: true,
    createdAt: new Date().toISOString(),
    passwordHash: "Passw0rd!",
  },
  {
    id: "reviewer-002",
    email: "review2@example.com",
    name: "Data Quality Manager",
    role: "reviewer",
    department: "Quality Assurance",
    isActive: true,
    createdAt: new Date().toISOString(),
    passwordHash: "Passw0rd!",
  },
  {
    id: "reviewer-003",
    email: "review3@example.com",
    name: "Technical Reviewer",
    role: "reviewer",
    department: "Technical Review",
    isActive: true,
    createdAt: new Date().toISOString(),
    passwordHash: "Passw0rd!",
  },
  // 3 Approvers
  {
    id: "approver-001",
    email: "approve@example.com",
    name: "Project Manager",
    role: "approver",
    department: "Project Management",
    isActive: true,
    createdAt: new Date().toISOString(),
    passwordHash: "Passw0rd!",
  },
  {
    id: "approver-002",
    email: "approve2@example.com",
    name: "Department Head",
    role: "approver",
    department: "Management",
    isActive: true,
    createdAt: new Date().toISOString(),
    passwordHash: "Passw0rd!",
  },
  {
    id: "approver-003",
    email: "approve3@example.com",
    name: "Executive Director",
    role: "approver",
    department: "Executive",
    isActive: true,
    createdAt: new Date().toISOString(),
    passwordHash: "Passw0rd!",
  },
];

export function getAllUsers(): UserProfile[] {
  return users.filter(user => user.isActive);
}

export function getUserByEmail(email: string): UserProfile | undefined {
  return users.find(user => user.email.toLowerCase() === email.toLowerCase() && user.isActive);
}

export function getUserById(id: string): UserProfile | undefined {
  return users.find(user => user.id === id && user.isActive);
}

export function createUser(userData: Omit<UserProfile, 'id' | 'createdAt' | 'passwordHash'> & { password: string }): UserProfile {
  const id = `${userData.role}-${Date.now()}`;
  const newUser: UserProfile = {
    ...userData,
    id,
    createdAt: new Date().toISOString(),
    passwordHash: userData.password, // In production, hash this
  };
  
  users.push(newUser);
  return newUser;
}

export function updateUser(id: string, updates: Partial<UserProfile>): UserProfile | null {
  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex === -1) return null;
  
  users[userIndex] = { ...users[userIndex], ...updates };
  return users[userIndex];
}

export function deactivateUser(id: string): boolean {
  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex === -1) return false;
  
  users[userIndex].isActive = false;
  return true;
}

export function getUserStats(): UserStats {
  const activeUsers = users.filter(user => user.isActive);
  return {
    totalUsers: activeUsers.length,
    submitters: activeUsers.filter(user => user.role === "submitter").length,
    reviewers: activeUsers.filter(user => user.role === "reviewer").length,
    approvers: activeUsers.filter(user => user.role === "approver").length,
    activeUsers: activeUsers.length,
  };
}

export function getUsersByRole(role: Role): UserProfile[] {
  return users.filter(user => user.role === role && user.isActive);
}

export function validateUserCredentials(email: string, password: string): UserProfile | null {
  const user = getUserByEmail(email);
  if (!user || user.passwordHash !== password) return null;
  
  // Update last login
  updateUser(user.id, { lastLogin: new Date().toISOString() });
  
  return user;
}

export function canAddUser(role: Role): boolean {
  const stats = getUserStats();
  
  // Check role limits
  if (role === "reviewer" && stats.reviewers >= 3) return false;
  if (role === "approver" && stats.approvers >= 3) return false;
  
  return true;
}

export function getAvailableRoles(): { role: Role; available: boolean; current: number; max?: number }[] {
  const stats = getUserStats();
  
  return [
    { role: "submitter", available: true, current: stats.submitters },
    { role: "reviewer", available: stats.reviewers < 3, current: stats.reviewers, max: 3 },
    { role: "approver", available: stats.approvers < 3, current: stats.approvers, max: 3 },
    { role: "admin", available: false, current: 1, max: 1 }, // Only one admin
  ];
}

// User registration (for submitters only)
export function registerUser(userData: {
  name: string;
  email: string;
  password: string;
  department?: string;
  phone?: string;
}): { success: boolean; message: string; user?: UserProfile } {
  // Check if email already exists
  if (getUserByEmail(userData.email)) {
    return { success: false, message: "Email already registered" };
  }

  // Create new submitter user
  const newUser = createUser({
    ...userData,
    role: "submitter",
    isActive: true,
  });

  return { success: true, message: "Registration successful", user: newUser };
}

// Change user role (admin only)
export function changeUserRole(userId: string, newRole: Role): { success: boolean; message: string } {
  const user = getUserById(userId);
  if (!user) {
    return { success: false, message: "User not found" };
  }

  // Check if trying to change to admin (only one admin allowed)
  if (newRole === "admin") {
    const adminCount = users.filter(u => u.role === "admin" && u.isActive).length;
    if (adminCount >= 1) {
      return { success: false, message: "Only one admin user is allowed" };
    }
  }

  // Check role limits
  if (!canAddUser(newRole) && user.role !== newRole) {
    return { success: false, message: `Cannot change to ${newRole}. Limit reached.` };
  }

  // Update user role
  const updated = updateUser(userId, { role: newRole });
  if (!updated) {
    return { success: false, message: "Failed to update user role" };
  }

  return { success: true, message: `User role changed to ${newRole}` };
}

// Check if user can manage roles
export function canManageRoles(user: UserProfile | null): boolean {
  return user?.role === "admin";
}

// Get users that can be promoted/demoted
export function getManageableUsers(): UserProfile[] {
  return users.filter(user => user.isActive && user.role !== "admin");
}
