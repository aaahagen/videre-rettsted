
export interface Auth {
  // Registers a new organization and its first admin user
  registerOrganization(email: string, password: string, organizationName: string): Promise<{ uid: string; orgId: string }>;

  // Sends an invitation email to a new user
  inviteUser(email: string, role: 'driver' | 'admin'): Promise<void>;

  // Signs in a user
  signIn(email: string, password: string): Promise<{ uid: string }>;

  // Signs out the current user
  signOut(): Promise<void>;

  // Sends a password reset email
  sendPasswordResetEmail(email: string): Promise<void>;

  // Gets the current user
  getCurrentUser(): any;
}
