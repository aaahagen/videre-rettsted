'use client';

import { collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';
import { firebaseStorage } from './storage';
import { Database } from '../database';
import { Place, User, Organization, Route, LogEntry, Vehicle, WorkLog, ProofOfDelivery, Order, Manifest, VehicleInspection } from '../types';

// Import refactored domain-specific database operations
import * as usersDb from '../db/users';
import * as organizationsDb from '../db/organizations';
import * as placesDb from '../db/places';
import * as logsDb from '../db/logs';
import * as routesDb from '../db/routes';
import * as vehiclesDb from '../db/vehicles';
import * as workLogsDb from '../db/workLogs';
import * as ordersDb from '../db/orders';
import * as manifestsDb from '../db/manifests';
import * as inspectionsDb from '../db/inspections';

export const firebaseDB: Database = {
  // Organization methods
  createOrganization: organizationsDb.createOrganization,
  getOrganization: organizationsDb.getOrganization,
  deleteOrganization: organizationsDb.deleteOrganization,
  updateOrganization: organizationsDb.updateOrganization,

  // User methods
  createUser: usersDb.createUser,
  getUser: usersDb.getUser,
  getUsers: usersDb.getUsers,
  updateUser: usersDb.updateUser,
  deleteUser: usersDb.deleteUser,
  toggleFavorite: usersDb.toggleFavorite,
  markPlaceVisited: usersDb.markPlaceVisited,

  // Place methods
  createPlace: placesDb.createPlace,
  getPlace: placesDb.getPlace,
  getPlaces: placesDb.getPlaces,
  updatePlace: placesDb.updatePlace,
  deletePlace: placesDb.deletePlace,

  // Logging methods
  logEvent: logsDb.logEvent,
  getLogs: logsDb.getLogs,
  createLogEntry: logsDb.createLogEntry,

  // Route methods
  getRoute: routesDb.getRoute,
  getRoutes: routesDb.getRoutes,
  createRoute: routesDb.createRoute,
  updateRoute: routesDb.updateRoute,
  deleteRoute: routesDb.deleteRoute,

  // Vehicle methods
  createVehicle: vehiclesDb.createVehicle,
  getVehicle: vehiclesDb.getVehicle,
  getVehicles: vehiclesDb.getVehicles,
  updateVehicle: vehiclesDb.updateVehicle,
  deleteVehicle: vehiclesDb.deleteVehicle,

  // WorkLog methods
  createWorkLog: workLogsDb.createWorkLog,
  getWorkLog: workLogsDb.getWorkLog,
  getWorkLogsForDriver: workLogsDb.getWorkLogsForDriver,
  getWorkLogsForOrganization: workLogsDb.getWorkLogsForOrganization,
  updateWorkLog: workLogsDb.updateWorkLog,
  deleteWorkLog: workLogsDb.deleteWorkLog,

  // Order & Manifest methods (Phase 3)
  createOrder: ordersDb.createOrder,
  getOrder: ordersDb.getOrder,
  getOrders: ordersDb.getOrders,
  getOrdersForRoute: ordersDb.getOrdersForRoute,
  updateOrderStatus: ordersDb.updateOrderStatus,
  updateOrder: ordersDb.updateOrder,
  deleteOrder: ordersDb.deleteOrder,

  createManifest: manifestsDb.createManifest,
  updateManifest: manifestsDb.updateManifest,
  deleteManifest: manifestsDb.deleteManifest,
  getManifestByRoute: manifestsDb.getManifestByRoute,
  incrementManifestItemLoadedCount: manifestsDb.incrementManifestItemLoadedCount,
  processManifestScan: manifestsDb.processManifestScan,
  decrementManifestItemLoadedCount: manifestsDb.decrementManifestItemLoadedCount,
  finalizeManifest: manifestsDb.finalizeManifest,
  addManifestNote: manifestsDb.addManifestNote,

  // Proof of Delivery & Inspections
  submitProofOfDelivery: inspectionsDb.submitProofOfDelivery,
  submitVehicleInspection: inspectionsDb.submitVehicleInspection,
  getVehicleInspections: inspectionsDb.getVehicleInspections,
};