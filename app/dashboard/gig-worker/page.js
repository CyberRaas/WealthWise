'use client';

/**
 * Gig Worker Dashboard - Specialized dashboard for gig economy workers
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  TrendingDown,
  Clock,
  Target,
  AlertCircle,
  Bike,
  Car,
  Package
} from 'lucide-react';

export default function GigWorkerDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    platform: 'swiggy',
    amount: '',
    tripCount: '1',
    date: new Date().toISOString().split('T')[0],
    expenses: {
      fuel: '',
      toll: '',
      parking: ''
    }
  });

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch earnings and insights in parallel
      const [earningsRes, insightsRes] = await Promise.all([
        fetch('/api/gig/earnings?period=month'),
        fetch('/api/gig/insights')
      ]);

      if (earningsRes.ok) {
        const data = await earningsRes.json();
        setEarnings(data.earnings || []);
        setSummary(data.summary || {});
      }

      if (insightsRes.ok) {
        const data = await insightsRes.json();
        setInsights(data.insights || []);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEarning = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/gig/earnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          tripCount: parseInt(formData.tripCount),
          expenses: {
            fuel: parseFloat(formData.expenses.fuel) || 0,
            toll: parseFloat(formData.expenses.toll) || 0,
            parking: parseFloat(formData.expenses.parking) || 0
          }
        })
      });

      if (response.ok) {
        toast.success('Earning added successfully!');
        setShowAddForm(false);
        setFormData({
          platform: 'swiggy',
          amount: '',
          tripCount: '1',
          date: new Date().toISOString().split('T')[0],
          expenses: { fuel: '', toll: '', parking: '' }
        });
        fetchData();
      } else {
        toast.error('Failed to add earning');
      }
    } catch (error) {
      console.error('Error adding earning:', error);
      toast.error('Failed to add earning');
    }
  };

  const platforms = [
    { value: 'swiggy', label: 'Swiggy', icon: Package },
    { value: 'zomato', label: 'Zomato', icon: Package },
    { value: 'uber', label: 'Uber', icon: Car },
    { value: 'ola', label: 'Ola', icon: Car },
    { value: 'rapido', label: 'Rapido', icon: Bike },
    { value: 'urban_company', label: 'Urban Company', icon: Package },
    { value: 'dunzo', label: 'Dunzo', icon: Package },
    { value: 'porter', label: 'Porter', icon: Package },
    { value: 'other', label: 'Other', icon: DollarSign }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            💼 Gig Worker Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Track your earnings across all platforms</p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className={showAddForm
            ? 'bg-gray-500 hover:bg-gray-600 text-white'
            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'}
        >
          {showAddForm ? 'Cancel' : '+ Add Earning'}
        </Button>
      </div>

      {/* Quick Add Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Today&apos;s Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddEarning} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Platform</label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value) => setFormData({ ...formData, platform: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map(p => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Amount (₹)</label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Trips/Orders</label>
                  <Input
                    type="number"
                    value={formData.tripCount}
                    onChange={(e) => setFormData({ ...formData, tripCount: e.target.value })}
                    placeholder="5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Fuel Expense (₹)</label>
                  <Input
                    type="number"
                    value={formData.expenses.fuel}
                    onChange={(e) => setFormData({
                      ...formData,
                      expenses: { ...formData.expenses, fuel: e.target.value }
                    })}
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Other Expenses (₹)</label>
                  <Input
                    type="number"
                    value={formData.expenses.toll}
                    onChange={(e) => setFormData({
                      ...formData,
                      expenses: { ...formData.expenses, toll: e.target.value }
                    })}
                    placeholder="50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                Add Earning
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">Total Earnings</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">
                ₹{summary.totalEarnings?.toLocaleString('en-IN') || 0}
              </div>
              <p className="text-xs text-green-600 mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-900">Net Earnings</CardTitle>
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-700">
                ₹{summary.netEarnings?.toLocaleString('en-IN') || 0}
              </div>
              <p className="text-xs text-emerald-600 mt-1">
                After ₹{summary.totalExpenses?.toLocaleString('en-IN') || 0} expenses
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Total Trips</CardTitle>
              <Target className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">{summary.totalTrips || 0}</div>
              <p className="text-xs text-blue-600 mt-1">
                Avg ₹{summary.avgEarningsPerTrip?.toFixed(0) || 0} per trip
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">Daily Average</CardTitle>
              <Calendar className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700">
                ₹{summary.avgEarningsPerDay?.toFixed(0) || 0}
              </div>
              <p className="text-xs text-purple-600 mt-1">Per day</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            💡 AI-Powered Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <Card key={index} className="border-green-100 hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="text-base text-green-900">{insight.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-gray-700">{insight.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Earnings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Earnings</CardTitle>
          <CardDescription>Your latest earnings this month</CardDescription>
        </CardHeader>
        <CardContent>
          {earnings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="mx-auto h-12 w-12 mb-4" />
              <p>No earnings recorded yet. Add your first earning!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {earnings.slice(0, 10).map((earning) => (
                <div key={earning._id} className="flex items-center justify-between border-b border-green-100 pb-3 hover:bg-green-50 p-2 rounded transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-2 rounded-lg">
                      {platforms.find(p => p.value === earning.platform)?.icon
                        ? (() => {
                            const Icon = platforms.find(p => p.value === earning.platform).icon;
                            return <Icon className="h-5 w-5 text-green-600" />;
                          })()
                        : <DollarSign className="h-5 w-5 text-green-600" />
                      }
                    </div>
                    <div>
                      <p className="font-medium capitalize">{earning.platform}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(earning.date).toLocaleDateString()} • {earning.tripCount} trip(s)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      ₹{earning.amount.toLocaleString('en-IN')}
                    </p>
                    {earning.netEarnings < earning.amount && (
                      <p className="text-xs text-gray-500">
                        Net: ₹{earning.netEarnings.toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
