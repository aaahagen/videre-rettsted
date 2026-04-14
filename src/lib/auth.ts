import { UserProfile } from './types';

export interface Auth {
  login(email: string, password?: string): Promise<void>;
  logout(): Promise<void>;
  register(email: string, password?: string, name?: string, orgName?: string): Promise<void>;
  inviteUser(email: string, role: 'driver' | 'admin' | 'contractor' | 'loader' | 'planner', name?: string): Promise<string>;
  getCurrentUser(): Promise<UserProfile | null>;
}
