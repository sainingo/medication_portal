import React, { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Pill,
  Clock,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface MedicationDetails {
  name: string;
  drug_name: string;
  drug_uuid: string;
  duration: string;
  frequency: string;
  dispensed: string;
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

type SortField = 'identifier' | 'prescription_date' | 'medications' | 'dispense_status';
type SortDirection = 'asc' | 'desc';

interface PatientTableProps {
  patients: DisplayPatient[];
  onSelect: (patient: DisplayPatient) => void;
}

export function PatientTable({ patients, onSelect }: PatientTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    field: SortField;
    direction: SortDirection;
  }>({ field: 'prescription_date', direction: 'desc' });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const sortedPatients = [...patients].sort((a, b) => {
    if (sortConfig.field === 'medications') {
      const aMeds = a.medications.map(m => m.name).join(', ');
      const bMeds = b.medications.map(m => m.name).join(', ');
      
      if (aMeds < bMeds) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aMeds > bMeds) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    }
    
    const aValue = a[sortConfig.field] || '';
    const bValue = b[sortConfig.field] || '';

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedPatients.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedPatients.slice(indexOfFirstItem, indexOfLastItem);

  const requestSort = (field: SortField) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.field === field && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ field, direction });
  };

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) return <ChevronsUpDown className="ml-1 h-4 w-4" />;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
            Show
          </label>
          <select
            id="itemsPerPage"
            className="rounded-md border border-gray-300 text-sm"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          <span className="text-sm text-gray-600">entries</span>
        </div>
        <div className="text-sm text-gray-600">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedPatients.length)} of {sortedPatients.length} entries
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  onClick={() => requestSort('identifier')}
                >
                  <div className="flex cursor-pointer items-center">
                    Patient Identifier
                    {getSortIcon('identifier')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  onClick={() => requestSort('prescription_date')}
                >
                  <div className="flex cursor-pointer items-center">
                    <CalendarIcon className="mr-1 h-4 w-4" />
                    Prescription Date
                    {getSortIcon('prescription_date')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  onClick={() => requestSort('medications')}
                >
                  <div className="flex cursor-pointer items-center">
                    <Pill className="mr-1 h-4 w-4" />
                    Medications
                    {getSortIcon('medications')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  onClick={() => requestSort('dispense_status')}
                >
                  <div className="flex cursor-pointer items-center">
                    Status
                    {getSortIcon('dispense_status')}
                  </div>
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {currentItems.length > 0 ? (
                currentItems.map((patient) => (
                  <tr
                    key={patient.patient_id}
                    className="group cursor-pointer transition-colors hover:bg-gray-50"
                    onClick={() => onSelect(patient)}
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {patient.identifier}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="mr-2 h-4 w-4" />
                        {patient.prescription_date 
                          ? format(new Date(patient.prescription_date), 'MMM d, yyyy')
                          : 'Not Available'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {patient.medications.map((med, idx) => (
                          <div key={idx} className="flex flex-col space-y-1">
                            <div className="flex items-center">
                              <Pill className="mr-2 h-4 w-4 text-blue-500" />
                              <span className="font-medium text-gray-900">{med.name}</span>
                            </div>
                            <div className="ml-6 flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Clock className="mr-1 h-3 w-3" />
                                {med.frequency}
                              </span>
                              <span>•</span>
                              <span>{med.duration} days</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
                          patient.dispense_status === 'Not Dispensed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        )}
                      >
                        {patient.dispense_status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <button
                        className="rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 opacity-0 transition-opacity hover:bg-blue-100 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(patient);
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="text-gray-500">
                      No patients found
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={cn(
              "relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium",
              currentPage === 1 
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={cn(
              "relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium",
              currentPage === totalPages
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={cn(
                  "relative inline-flex items-center rounded-l-md px-2 py-2 ring-1 ring-inset ring-gray-300",
                  currentPage === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-400 hover:bg-gray-50"
                )}
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={cn(
                    "relative inline-flex items-center px-4 py-2 text-sm font-semibold",
                    page === currentPage
                      ? "z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                  )}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={cn(
                  "relative inline-flex items-center rounded-r-md px-2 py-2 ring-1 ring-inset ring-gray-300",
                  currentPage === totalPages
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-400 hover:bg-gray-50"
                )}
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}