import React from 'react';
import { TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: number;
  className?: string;
  onClick?: () => void;
  iconColor?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  trend, 
  className, 
  onClick,
  iconColor = '#4B5563'
}: StatCardProps) {
  return (
    <div 
      className={cn(
        "rounded-lg p-6 shadow-sm transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-md hover:scale-[1.02]",
        className
      )}
      onClick={onClick}
      style={{ backgroundColor: iconColor }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="rounded-full p-3 bg-white/20"
          >
            {React.cloneElement(icon as React.ReactElement, {
              className: "h-6 w-6 text-white"
            })}
          </div>
          <div>
            <h3 className="text-sm font-medium text-white/80">{title}</h3>
            <p className="text-2xl font-semibold text-white">{value}</p>
          </div>
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded">
            <TrendingUp className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">
              {trend}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}