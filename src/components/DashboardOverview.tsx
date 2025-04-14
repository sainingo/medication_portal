import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  RefreshCw,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { usePatients } from '@/hooks/usePatients';
import { authService } from '@/utils/authService';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: number;
  className?: string;
  onClick?: () => void;
}

function StatCard({ title, value, icon, trend, className, onClick }: StatCardProps) {
  return (
    <div 
      className={cn(
        "bg-white rounded-lg p-6 shadow-sm transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-md hover:scale-[1.02]",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-blue-50 p-3">
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          </div>
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1">
            <TrendingUp className={cn(
              "h-4 w-4",
              trend >= 0 ? "text-green-500" : "text-red-500"
            )} />
            <span className={cn(
              "text-sm font-medium",
              trend >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {trend}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function DashboardOverview() {
  const navigate = useNavigate();
  const patient = authService.getUserData();
  const patientUuid = patient?.userProperties?.["grantAccessToLocationOperationalData[0]"];
  const { data: patientsData, isPending, error } = usePatients(patientUuid);
  
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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Total Patients"
        value={dashboardStats.totalPatients}
        icon={<Users className="h-6 w-6 text-blue-600" />}
        trend={5}
      />
      <StatCard
        title="Pending Refills"
        value={dashboardStats.pendingRefills}
        icon={<RefreshCw className="h-6 w-6 text-amber-600" />}
        onClick={() => handleRefillClick('pending')}
      />
      <StatCard
        title="Completed Refills"
        value={dashboardStats.completedRefills}
        icon={<CheckCircle className="h-6 w-6 text-green-600" />}
        trend={12}
        onClick={() => handleRefillClick('completed')}
      />
    </div>
  );
}