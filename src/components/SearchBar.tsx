import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../lib/utils';

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch: (query: string) => void;
}

export function SearchBar({ className, onSearch, ...props }: SearchBarProps) {
  return (
    <div className={cn('relative w-full max-w-xl', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        className="h-10 w-full rounded-md border border-gray-200 bg-white pl-10 pr-4 text-sm placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="Search patients by ID or name..."
        onChange={(e) => onSearch(e.target.value)}
        {...props}
      />
    </div>
  );
}