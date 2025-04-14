import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  Pill,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const navigation = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Patients Referred', path: '/patients', icon: Users },
  // { name: 'Medication Dispensed', path: '/medication-dispense', icon: Activity },
  // { name: 'Forms', path: '/forms', icon: FileText },
  { name: 'Reports', path: '/reports', icon: FileText },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const pathname = window.location.pathname; 

  const handleLogout = async () => {
    // First remove the session data
    logout();
    // Then manually navigate to login
    navigate('/login');
  };

  return (
    <div className="flex h-full flex-col bg-[#1a2942] w-64">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-[#0672c4]">
        <Pill className="h-8 w-8 text-[#039dfc]" />
        <span className="text-lg font-semibold text-white">MedicationPortal</span>
      </div>
      
      <nav className="flex-1 space-y-2 px-4 py-6">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onNavigate}
              className={cn(
                'group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200',
                pathname === item.path
                  ? 'bg-[#2a3f5f] text-[#AABBCC]'
                  : 'text-gray-300 hover:bg-[#243552] hover:text-[#AABBCC]'
              )}
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#2a3f5f] p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-[#243552] hover:text-[#AABBCC] transition-colors duration-200"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}