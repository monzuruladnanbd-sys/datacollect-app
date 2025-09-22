// Client-side user consistency helper
// This avoids importing server-side code in client components

export class UserConsistencyClient {
  // Normalize user email format
  static normalizeEmail(email: string): string {
    if (!email) return '';
    return email.toLowerCase().trim();
  }

  // Check if two user identifiers refer to the same user (client-side only)
  static isSameUser(user1: string, user2: string): boolean {
    if (!user1 || !user2) return false;
    
    const normalized1 = this.normalizeEmail(user1);
    const normalized2 = this.normalizeEmail(user2);
    
    // Direct match
    if (normalized1 === normalized2) return true;
    
    // Extract base username (before @)
    const base1 = normalized1.split('@')[0];
    const base2 = normalized2.split('@')[0];
    
    // Check if base usernames match (for cases like "submitter" vs "submitter@domain.com")
    if (base1 === base2) return true;
    
    // Special cases for known users - check if both emails are in the same user group
    const knownMappings: { [key: string]: string[] } = {
      'admin': ['admin@datacollect.app', 'admin'],
      'submitter': ['submitter@submit.com', 'submitter@datacollect.app', 'submitter'],
      'reviewer': ['reviewer@review.com', 'reviewer@datacollect.app', 'reviewer'],
      'approver': ['approver@approve.com', 'approver@datacollect.app', 'approver']
    };

    // Check if both emails belong to the same user group
    for (const [base, variations] of Object.entries(knownMappings)) {
      const user1InGroup = variations.includes(normalized1) || variations.includes(base1);
      const user2InGroup = variations.includes(normalized2) || variations.includes(base2);
      
      if (user1InGroup && user2InGroup) {
        return true;
      }
    }
    
    return false;
  }
}
