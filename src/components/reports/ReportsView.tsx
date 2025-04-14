import React from 'react';
import {
  BarChart,
  FileText,
  Download,
  TrendingUp,
} from 'lucide-react';
import { mockRefillEncounters } from '@/lib/mockData';
import { formatDate } from '@/lib/utils';

export function ReportsView() {
  return (
    <div className="space-y-6 p-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Reports</h2>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          <Download className="h-4 w-4" />
          Export Data
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-blue-100 p-3">
              <BarChart className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Monthly Refills
              </h3>
              <p className="text-2xl font-semibold text-gray-900">247</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span>12% increase from last month</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-100 p-3">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Completed Today
              </h3>
              <p className="text-2xl font-semibold text-gray-900">18</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b p-4">
          <h3 className="font-medium text-gray-900">Recent Refills</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-sm font-medium text-gray-500">
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Patient</th>
                <th className="px-6 py-3">Medication</th>
                <th className="px-6 py-3">Quantity</th>
                <th className="px-6 py-3">Next Refill</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm text-gray-900">
              {mockRefillEncounters.map((encounter) => (
                <tr key={encounter.id}>
                  <td className="px-6 py-4">
                    {formatDate(encounter.timestamp)}
                  </td>
                  <td className="px-6 py-4">John Doe</td>
                  <td className="px-6 py-4">
                    {encounter.medications[0].medicationName}
                  </td>
                  <td className="px-6 py-4">
                    {encounter.medications[0].quantityDispensed}
                  </td>
                  <td className="px-6 py-4">
                    {encounter.nextRefillDate
                      ? formatDate(encounter.nextRefillDate)
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}