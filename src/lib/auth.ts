
export interface Auth {
  // Registers a new organization and its first admin user
  registerOrganization(email: string, password: string, organizationName: string, name: string, orgNumber?: string): Promise<{ uid: string; orgId: string }>;

  // Creates an invitation and returns the invitation link
  inviteUser(email: string, role: 'driver' | 'admin' | 'contractor', name?: string): Promise<string>;

  // Signs in a user
  signIn(email: string, password: string, rememberMe?: boolean): Promise<{ uid: string }>;

  // Signs out the current user
  signOut(): Promise<void>;

  // Sends a password reset email
  sendPasswordResetEmail(email: string): Promise<void>;

  // Gets the current user
  getCurrentUser(): any;

  // Updates the current user's profile
  updateProfile(profile: { displayName?: string; photoURL?: string }): Promise<void>;

  // Deletes a user from the system
  deleteUser(userId: string): Promise<void>;
}