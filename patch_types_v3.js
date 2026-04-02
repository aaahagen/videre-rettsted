const fs = require('fs');
const file = 'src/lib/types.ts';
let content = fs.readFileSync(file, 'utf8');

const targetRoute = `export interface Route {
  id: string;
  name: string;
  shipmentNumber?: string;
  orgId: string; // Database field is orgId
  organizationId?: string;
  places: string[]; // array of placeIds
  completedStops?: string[]; // array of placeIds that are marked as complete
  completedStopEvents?: Record<string, CompletedStopEvent>; // map of placeId to completion event`;

const newRoute = `export interface Route {
  id: string;
  name: string;
  status?: 'active' | 'completed';
  shipmentNumber?: string;
  orgId: string; // Database field is orgId
  organizationId?: string;
  places: string[]; // array of placeIds
  completedStops?: string[]; // array of placeIds that are marked as complete
  completedStopEvents?: Record<string, CompletedStopEvent>; // map of placeId to completion event`;

content = content.replace(targetRoute, newRoute);
fs.writeFileSync(file, content);
