import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import { PatientTable } from '../PatientCard';
import { SearchBar } from '../SearchBar';
import { cn } from '@/lib/utils';
import { Patient } from '@/types';
import { usePatients } from '@/hooks/usePatients';
import { authService } from '@/utils/authService';

interface MedicationDetails {
  name: string;
  drug_name: string;
  drug_uuid: string;
  duration: string;
  frequency: string;
  dispensed: string;
  numberOfPills: string;
}

interface DisplayPatient {
  patient_id: number;
  patient_uuid: string;
  pickup_location_uuid: string;
  identifier: string;
  prescription_date: string;
  medications: MedicationDetails[];
  dispense_status: string;
}

export function PatientList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'completed' | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const patient = authService.getUserData();
  const patientUuid = patient?.userProperties?.["grantAccessToLocationOperationalData[0]"];
  const { data: patientsData, isPending, error } = usePatients(patientUuid);

  useEffect(() => {
    const state = location.state as { filterStatus?: 'pending' | 'completed' };
    if (state?.filterStatus) {
      setStatusFilter(state.filterStatus);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);

  const transformedPatients = useMemo(() => {
    if (!patientsData?.result || isPending || error) {
      return [];
    }
    
    const patientsDetails = patientsData.result;
    const patientMap = new Map();
    
    patientsDetails.forEach((item: any) => {
      if (!patientMap.has(item.patient_id)) {
        patientMap.set(item.patient_id, {
          patient_id: item.patient_id,
          patient_uuid: item.person_uuid,
          pickup_location_uuid: item.pickup_location_uuid,
          identifier: item.patient_identifier,
          prescription_date: item.prescription_date,
          return_to_clinic_date: item.return_to_clinic_date || "N/A",
          medication_pickup_date: item.medication_pickup_date || "N/A",
          medications: [],
          dispense_status: item.dispense_status
        });
      }

      const patientInfo = patientMap.get(item.patient_id);
      
      if (item.questionId === "ANTIRETROVIRALS_STARTED" && item.answer !== "N/A") {
        const medicationInfo: MedicationDetails = {
          name: item.drug_name ? item.drug_name : item.answer,
          drug_name: item.drug_name,
          drug_uuid: item.drug_uuid,
          duration: patientsDetails.find((detail: any) => 
            detail.patient_id === item.patient_id && 
            detail.questionId === "DURATION_IN_DAYS"
          )?.answer || "N/A",
          frequency: patientsDetails.find((detail: any) => 
            detail.patient_id === item.patient_id && 
            detail.questionId === "MEDICATION_FREQUENCY"
          )?.answer || "N/A",
          dispensed: patientsDetails.find((detail: any) => 
            detail.patient_id === item.patient_id && 
            detail.questionId === "MEDICATION_DISPENSED"
          )?.answer || "N/A",
          numberOfPills: patientsDetails.find((detail: any) => 
            detail.patient_id === item.patient_id && 
            detail.questionId === "MEDICATION_DISPENSED"
          )?.answer || "N/A"
        };
        
        if (!patientInfo.medications.some((med: any) => med.name === medicationInfo.name)) {
          patientInfo.medications.push(medicationInfo);
        }
      }
    });
    
    return Array.from(patientMap.values());
  }, [patientsData, isPending, error]);

  const filteredPatients = useMemo(() => {
    return transformedPatients.filter((patient) => {
      const matchesSearch = 
        patient.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.medications.some((med: MedicationDetails) => 
          med.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

      if (!statusFilter) return matchesSearch;

      const matchesStatus = statusFilter === 'pending' 
        ? patient.dispense_status === 'Not Dispensed'
        : patient.dispense_status !== 'Not Dispensed';

      return matchesSearch && matchesStatus;
    });
  }, [transformedPatients, searchQuery, statusFilter]);

  const handlePatientSelect = (patient: DisplayPatient) => {
    navigate('/patients/details', { state: { patient } });
  };

  const clearFilters = () => {
    setStatusFilter(null);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isPending) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="text-center text-red-600">
          <p className="mt-2">Error loading patient data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
      </div>

      <div className="flex flex-col gap-4 p-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Patient Line List</h2>
          <div className="relative w-64">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {statusFilter && (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm">
              {statusFilter === 'pending' ? 'Pending Refills' : 'Completed Refills'}
            </span>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>

      <PatientTable
        patients={filteredPatients}
        onSelect={handlePatientSelect}
      />
    </div>
  );
}