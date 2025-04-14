export interface Patient {
    id: string;
    name: string;
    identifier: string;
    gender: string;
    dateOfBirth: string;
  }
  
  export interface Drug {
    uuid: string;
    name: string;
    display: string;
  }
  
  export interface RefillFormData {
    encounterDatetime: string;
    medications: Array<{
      drug: string;
      drugName: string;
      quantity: string;
      dosage: string;
      batchNumber: string;
      nextRefillDate: string;
    }>;
    notes: string;
  }
  
  export interface RefillEncounter {
    id: string;
    patientId: string;
    timestamp: string;
    medications: Array<{
      medicationName: string;
      quantityDispensed: string;
      batchNumber?: string;
    }>;
    pharmacistName: string;
    pharmacistNotes?: string;
    nextRefillDate?: string;
  }