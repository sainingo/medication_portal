import React from 'react';
import { Bell, Menu } from 'lucide-react';
import { mockUser, mockLocation } from '@/lib/mockData';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const {user } = useAuth();
  const pickupLocationName = sessionStorage.getItem('pickup_location_name');

  return (
    <header className="h-16 bg-white shadow">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          {/* <div>
            <h1 className="text-xl font-semibold text-gray-900">{currentSession?.user.display}</h1>
            <p className="text-sm text-gray-500">{mockLocation.address}</p>
          </div> */}
        </div>
        
        <div className="flex items-center gap-4">
          <button className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200">
            <Bell className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.display}</p>
              <p className="text-sm text-gray-500">{pickupLocationName}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
              {user?.display.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}