export interface User {
  id: string;
  name: string;
  email: string;
  role: 'PHARMACIST' | 'ADMIN';
  locationId: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  type: 'PHARMACY' | 'CHEMIST';
  contact: string;
}

export interface Patient {
  id: string;
  identifier: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  consentStatus: boolean;
  consentedLocations: string[];
  lastRefillDate?: string;
  nextAppointmentDate?: string;
  prescriptions: Prescription[];
}

export interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  prescribedDate: string;
  prescribedBy: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DISCONTINUED';
}

export interface RefillEncounter {
  id: string;
  patientId: string;
  locationId: string;
  medications: DispensedMedication[];
  pharmacistNotes: string;
  pharmacistName: string;
  timestamp: string;
  pharmacistId: string;
  nextRefillDate?: string;
}

export interface DispensedMedication {
  id: string;
  prescriptionId: string;
  medicationName: string;
  quantityDispensed: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingRefills: number;
  completedRefills: number;
  lowStockMedications: number;
}