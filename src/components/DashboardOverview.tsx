import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import { StatCard } from './StatCard';
import { DashboardChart } from './DashboardChart';
import { colors } from '../lib/utils';
import { usePatients } from '../hooks/usePatients';
import { authService } from '../utils/authService';

export function DashboardOverview() {
  const navigate = useNavigate();
  const patient = authService.getUserData();
  const patientUuid = patient?.userProperties?.["grantAccessToLocationOperationalData[0]"];
  const { data: patientsData, isPending, error } = usePatients(patientUuid);
  
  useEffect(() => {
    if (patientsData?.result && !isPending && !error && patientsData.result.length > 0) {
      const pickupLocationName = patientsData.result[0].pickup_location_name;
      if (pickupLocationName) {
        sessionStorage.setItem('pickup_location_name', pickupLocationName);
      }
    }
  }, [patientsData, isPending, error]);

  const dashboardStats = useMemo(() => {
    if (!patientsData?.result || isPending || error) {
      return {
        totalPatients: 0,
        pendingRefills: 0,
        completedRefills: 0
      };
    }
    
    const patientsDetails = patientsData.result;
    
    const uniquePatientIds = [...new Set(patientsDetails.map((item: any) => item.patient_id))];

    const patientGroups = patientsDetails.reduce((groups: any, item: any) => {
      const patientId = item.patient_id;
      if (!groups[patientId]) {
        groups[patientId] = [];
      }
      groups[patientId].push(item);
      return groups;
    }, {});
    
    const pendingRefills = Object.values(patientGroups).filter((records: any) => 
      records.some((record: any) => record.dispense_status === "Not Dispensed")
    ).length;
    
    const completedRefills = Object.values(patientGroups).filter((records: any) => 
      records.some((record: any) => record.dispense_status !== "Not Dispensed")
    ).length;
    
    return {
      totalPatients: uniquePatientIds.length,
      pendingRefills,
      completedRefills
    };
  }, [patientsData, isPending, error]);

  const handleRefillClick = (status: 'pending' | 'completed') => {
    navigate('/patients', { state: { filterStatus: status } });
  };

  if (isPending) return <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>;
  
  if (error) return <div className="bg-red-50 text-red-600 p-4 rounded-lg">Error loading patient data</div>;

  return (
    <div className="space-y-6 p-1.5">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Patients"
          value={dashboardStats.totalPatients}
          icon={<Users />}
          trend={5}
          onClick={() => navigate('/patients')}
          iconColor={colors.totalPatients}
        />
        <StatCard
          title="Pending Refills"
          value={dashboardStats.pendingRefills}
          icon={<RefreshCw />}
          onClick={() => handleRefillClick('pending')}
          iconColor={colors.pendingRefills}
        />
        <StatCard
          title="Completed Refills"
          value={dashboardStats.completedRefills}
          icon={<CheckCircle />}
          trend={12}
          onClick={() => handleRefillClick('completed')}
          iconColor={colors.completedRefills}
        />
      </div>
      <DashboardChart data={dashboardStats} />
    </div>
  );
}