const fs = require('fs');
const file = 'src/lib/types.ts';
let content = fs.readFileSync(file, 'utf8');

const targetUser = `export interface User {
  avatarUrl?: string;
  id: string;
  name: string;
  email: string;
  orgId: string;
  role: 'admin' | 'driver' | 'contractor';
  favorites: string[];
  status?: 'active' | 'paused';
  images?: { url: string; description?: string; uploadedAt?: any }[];
}`;

const newUser = `export interface User {
  avatarUrl?: string;
  id: string;
  name: string;
  email: string;
  orgId: string;
  role: 'admin' | 'driver' | 'contractor';
  favorites: string[];
  visitedPlaces?: string[]; // Array of placeIds the user has completed on a route
  status?: 'active' | 'paused';
  images?: { url: string; description?: string; uploadedAt?: any }[];
}`;

content = content.replace(targetUser, newUser);
fs.writeFileSync(file, content);
