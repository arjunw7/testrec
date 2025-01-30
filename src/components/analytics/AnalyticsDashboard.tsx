import React from 'react';
import { Card } from '../ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import { formatDuration } from '@/lib/utils';
import { Clock, Users, Building2 } from 'lucide-react';

interface AnalyticsData {
  totalRecons: number;
  avgReconTime: number;
  avgExportTime: number;
  insurerSplit: { [key: string]: number };
  userSplit: { [key: string]: number };
  dailyRecons: { [key: string]: number };
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
}

const COLORS = ['#025F4C', '#BCDD33', '#FF6B6B', '#4ECDC4', '#45B7D1'];

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const dailyReconData = Object.entries(data.dailyRecons)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      count
    }));

  const insurerData = Object.entries(data.insurerSplit)
    .sort((a, b) => b[1] - a[1]) // Sort by count descending
    .map(([name, value]) => ({
      name,
      value
    }));

  const userData = Object.entries(data.userSplit)
    .sort((a, b) => b[1] - a[1]) // Sort by count descending
    .map(([name, value]) => ({
      name,
      value
    }));

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Total Reconciliations</h3>
              <p className="text-2xl font-bold text-primary mt-1">{data.totalRecons}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Average Time to Reconcile</h3>
              <p className="text-2xl font-bold text-primary mt-1">
                {formatDuration(Math.round(data.avgReconTime))}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Average Time to Export</h3>
              <p className="text-2xl font-bold text-primary mt-1">
                {formatDuration(Math.round(data.avgExportTime))}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Daily Recons Chart */}
        <Card className="col-span-2 p-6">
          <h3 className="text-lg font-semibold mb-4">Daily Reconciliations</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyReconData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#025F4C" 
                  strokeWidth={2}
                  name="Reconciliations"
                  dot={{ fill: '#025F4C', r: 4 }}
                  activeDot={{ r: 6, fill: '#BCDD33' }}
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Insurer Split */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Reconciliations by Insurer</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={insurerData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number"
                  tick={{ fontSize: 12 }}
                  allowDecimals={false}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={150}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey="value" name="Reconciliations">
                  {insurerData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Bar>
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* User Split */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Reconciliations by User</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number"
                  tick={{ fontSize: 12 }}
                  allowDecimals={false}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={150}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey="value" name="Reconciliations">
                  {userData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Bar>
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}