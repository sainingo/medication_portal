import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isValid } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null | undefined): string {
  // Handle null, undefined, or empty values
  if (!date) {
    return "Not Available"
  }
  
  try {
    const dateObj = new Date(date)
    
    // Check if the date is valid
    if (!isValid(dateObj)) {
      return "Invalid Date"
    }
    
    return format(dateObj, 'PPP')
  } catch (error) {
    console.error('Date formatting error:', error, 'Original value:', date)
    return "Invalid Date"
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  // Handle null, undefined, or empty values
  if (!date) {
    return "Not Available"
  }
  
  try {
    const dateObj = new Date(date)
    
    // Check if the date is valid
    if (!isValid(dateObj)) {
      return "Invalid Date"
    }
    
    return format(dateObj, 'PPpp')
  } catch (error) {
    console.error('DateTime formatting error:', error, 'Original value:', date)
    return "Invalid Date"
  }
}

export const colors = {
  totalPatients: '#ec7d31',
  pendingRefills: '#fec000',
  completedRefills: '#91cf50'
} as const;