import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { colors } from '../lib/utils';

ChartJS.register(
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardChartProps {
  data: {
    totalPatients: number;
    pendingRefills: number;
    completedRefills: number;
  };
}

export function DashboardChart({ data }: DashboardChartProps) {
  const chartData = {
    labels: ['Total Patients', 'Pending Refills', 'Completed Refills'],
    datasets: [
      {
        data: [data.totalPatients, data.pendingRefills, data.completedRefills],
        backgroundColor: [colors.totalPatients, colors.pendingRefills, colors.completedRefills],
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 20,
          font: {
            size: 14
          }
        }
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <div className="bg-white rounded-lg p-12  shadow-sm h-[400px]">
      <h2 className="text-lg font-semibold mb-4">Statistics Overview</h2>
      <Pie data={chartData} options={options} />
    </div>
  );
}