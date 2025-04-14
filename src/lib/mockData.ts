import { Location, Patient, RefillEncounter, User, DashboardStats } from '../types';
import { addDays, subDays } from 'date-fns';

export const mockUser: User = {
  id: '1',
  name: 'Dr. Sarah Wilson',
  email: 'sarah.wilson@pharmacy.com',
  role: 'PHARMACIST',
  locationId: 'loc1',
};

export const mockLocation: Location = {
  id: 'loc1',
  name: 'Annex Pharmacy',
  address: '123 Healthcare Ave, Eldoret City',
  type: 'PHARMACY',
  contact: '+1 (555) 123-4567',
};

export const mockPatients: Patient[] = [
  {
    id: '1',
    identifier: '322607033-667',
    name: 'John Doe',
    dateOfBirth: '1990-05-15',
    gender: 'M',
    consentStatus: true,
    consentedLocations: ['loc1'],
    lastRefillDate: '2024-02-15',
    nextAppointmentDate: '2024-03-15',
    prescriptions: [
      {
        id: 'rx1',
        medicationName: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '30 days',
        quantity: 60,
        prescribedDate: '2024-02-01',
        prescribedBy: 'Dr. Smith',
        status: 'ACTIVE',
      },
    ],
  },
  {
    id: '2',
    identifier: '322607033-6',
    name: 'Jane Smith',
    dateOfBirth: '1985-08-22',
    gender: 'F',
    consentStatus: true,
    consentedLocations: ['loc1'],
    nextAppointmentDate: '2024-03-20',
    prescriptions: [
      {
        id: 'rx2',
        medicationName: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '30 days',
        quantity: 30,
        prescribedDate: '2024-02-01',
        prescribedBy: 'Dr. Johnson',
        status: 'ACTIVE',
      },
    ],
  },
];

export const mockRefillEncounters: RefillEncounter[] = [
  {
    id: 'enc1',
    patientId: '1',
    locationId: 'loc1',
    pharmacistName: 'John Doe',
    medications: [
      {
        id: 'disp1',
        prescriptionId: 'rx1',
        medicationName: 'Metformin',
        quantityDispensed: 60,
        batchNumber: 'B12345',
        expiryDate: '2025-12-31',
      },
    ],
    pharmacistNotes: 'Patient reported good medication adherence',
    timestamp: subDays(new Date(), 30).toISOString(),
    pharmacistId: '1',
    nextRefillDate: addDays(new Date(), 30).toISOString(),
  },
];

export const mockDashboardStats: DashboardStats = {
  totalPatients: 150,
  todayAppointments: 12,
  pendingRefills: 8,
  completedRefills: 45,
  lowStockMedications: 3,
};