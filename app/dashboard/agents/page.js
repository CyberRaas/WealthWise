'use client';

/**
 * Agent Dashboard - Monitor and control autonomous agents
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Bell,
  RefreshCw,
  Zap
} from 'lucide-react';

export default function AgentDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [statusRes, notificationsRes] = await Promise.all([
        fetch('/api/agents/status'),
        fetch('/api/agents/notifications?unreadOnly=true')
      ]);

      if (statusRes.ok) {
        const data = await statusRes.json();
        setAgents(data.agents || []);
        setRecentActivity(data.recentActivity || []);
      }

      if (notificationsRes.ok) {
        const data = await notificationsRes.json();
        setNotifications(data.notifications || []);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load agent data');
    } finally {
      setLoading(false);
    }
  };

  const runAllAgents = async () => {
    try {
      setRunning(true);
      toast.loading('Running all agents...', { id: 'run-agents' });

      const response = await fetch('/api/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(
          `Agents executed successfully! ${data.results?.length || 0} actions taken.`,
          { id: 'run-agents' }
        );
        fetchData();
      } else {
        toast.error('Failed to run agents', { id: 'run-agents' });
      }
    } catch (error) {
      console.error('Error running agents:', error);
      toast.error('Failed to run agents', { id: 'run-agents' });
    } finally {
      setRunning(false);
    }
  };

  const runSpecificAgent = async (agentName) => {
    try {
      toast.loading(`Running ${agentName}...`, { id: agentName });

      const response = await fetch('/api/agents/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent: agentName })
      });

      if (response.ok) {
        toast.success(`${agentName} executed successfully!`, { id: agentName });
        fetchData();
      } else {
        toast.error(`Failed to run ${agentName}`, { id: agentName });
      }
    } catch (error) {
      console.error('Error running agent:', error);
      toast.error(`Failed to run ${agentName}`, { id: agentName });
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await fetch('/api/agents/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      });
      fetchData();
    } catch (error) {
      console.error('Error marking notification:', error);
    }
  };

  const getAgentIcon = (agentName) => {
    const icons = {
      'IncomeAnalyzer': TrendingUp,
      'FinancialCoach': Activity,
      'SmartSavings': Zap,
      'FinancialHealthMonitor': CheckCircle
    };
    return icons[agentName] || Activity;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

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
            🤖 Agent Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Monitor your autonomous financial agents</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline" className="border-green-200 hover:bg-green-50">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={runAllAgents}
            disabled={running}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
          >
            <Zap className="h-4 w-4 mr-2" />
            {running ? 'Running...' : 'Run All Agents'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Active Agents</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              {agents.filter(a => a.enabled).length}/{agents.length}
            </div>
            <p className="text-xs text-green-600 mt-1">Running 24/7</p>
          </CardContent>
        </Card>

        <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Runs</CardTitle>
            <Activity className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">
              {agents.reduce((sum, a) => sum + (a.runCount || 0), 0)}
            </div>
            <p className="text-xs text-blue-600 mt-1">Autonomous checks</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-900">Success Rate</CardTitle>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700">
              {agents.length > 0
                ? ((agents.reduce((sum, a) => sum + (a.successCount || 0), 0) /
                    agents.reduce((sum, a) => sum + (a.runCount || 1), 1)) * 100).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-emerald-600 mt-1">Performance</p>
          </CardContent>
        </Card>

        <Card className="border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Notifications</CardTitle>
            <Bell className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700">{notifications.length}</div>
            <p className="text-xs text-orange-600 mt-1">Unread alerts</p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>Important alerts from your agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification._id}
                  className="flex items-start justify-between border-b border-green-100 pb-3 cursor-pointer hover:bg-green-50 p-3 rounded-lg transition-colors"
                  onClick={() => markNotificationRead(notification._id)}
                >
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`p-2 rounded-lg ${getPriorityColor(notification.priority)}`}>
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {notification.agentName}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agents List */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Agents</CardTitle>
          <CardDescription>Your autonomous financial assistants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agents.map((agent) => {
              const Icon = getAgentIcon(agent.name);
              return (
                <div key={agent.name} className="border border-green-100 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${agent.enabled ? 'bg-gradient-to-br from-green-100 to-emerald-100' : 'bg-gray-100'}`}>
                        <Icon className={`h-6 w-6 ${agent.enabled ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{agent.name}</h3>
                        <p className="text-sm text-gray-600">
                          Priority: {agent.priority} | Runs: {agent.runCount || 0} | Success: {agent.successRate || 'N/A'}
                        </p>
                        {agent.lastRun && (
                          <p className="text-xs text-gray-400">
                            Last run: {new Date(agent.lastRun).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={agent.enabled ? 'default' : 'secondary'}>
                        {agent.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => runSpecificAgent(agent.name)}
                        disabled={!agent.enabled}
                        className={agent.enabled ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        Run
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest agent actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                  <Badge variant="outline">{activity.agentName}</Badge>
                  <span className="text-gray-800">{activity.type}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
