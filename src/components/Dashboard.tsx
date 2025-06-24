import React, { useState, useEffect } from 'react';
import { 
  Upload, Brain, BarChart3, Search, Code, GitCompare, Network, 
  TrendingUp, Clock, FileText, Users, ArrowRight, Zap, Bell, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SupabaseService } from '../lib/supabase';

interface DashboardProps {
  onNavigate: (view: string) => void;
  uploadedPapers: any[];
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, uploadedPapers }) => {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    setIsLoadingNotifications(true);
    
    try {
      // In a real implementation, this would fetch from the database
      // For now, we'll use mock data
      const mockNotifications = [
        { id: 1, title: 'Analysis Complete', message: 'Your paper "Deep Learning in Medical Imaging" has been analyzed', time: '2 hours ago', read: false },
        { id: 2, title: 'New Feature Available', message: 'Try our new citation network visualization tool', time: '1 day ago', read: true },
        { id: 3, title: 'Weekly Summary', message: 'View your research activity summary for this week', time: '3 days ago', read: true }
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const quickActions = [
    {
      id: 'upload',
      title: 'Upload Research',
      description: 'Analyze new research papers with AI-powered insights',
      icon: Upload,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      id: 'summarize',
      title: 'Generate Summary',
      description: 'Create age-appropriate explanations with examples',
      icon: Brain,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-700'
    },
    {
      id: 'visualize',
      title: 'Create Visuals',
      description: 'Build interactive diagrams and infographics',
      icon: BarChart3,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700'
    },
    {
      id: 'discover',
      title: 'Discover Similar',
      description: 'Find related research using semantic analysis',
      icon: Search,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      id: 'code',
      title: 'Generate Code',
      description: 'Convert research into production-ready code',
      icon: Code,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      id: 'compare',
      title: 'Compare Papers',
      description: 'Side-by-side analysis and synthesis',
      icon: GitCompare,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    }
  ];

  const recentActivity = [
    { action: 'Paper Analysis', paper: 'Deep Learning in Medical Imaging', time: '2 hours ago', status: 'completed' },
    { action: 'Code Generation', paper: 'Quantum Computing Algorithms', time: '5 hours ago', status: 'in-progress' },
    { action: 'Visualization', paper: 'Climate Change Models', time: '1 day ago', status: 'completed' },
    { action: 'Similar Research', paper: 'Neural Network Optimization', time: '2 days ago', status: 'completed' }
  ];

  const insights = [
    { metric: 'Papers Analyzed', value: uploadedPapers.length, change: '+12%', icon: FileText },
    { metric: 'Visualizations', value: profile?.visualizations_count || '0', change: '+8%', icon: BarChart3 },
    { metric: 'Code Generated', value: profile?.code_generations_count || '0', change: '+23%', icon: Code },
    { metric: 'Research Hours Saved', value: '156', change: '+34%', icon: Clock },
  ];

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {user ? `Welcome, ${profile?.full_name || 'Researcher'}` : 'Research Intelligence Dashboard'}
          </h1>
          <p className="text-xl text-slate-600">
            Transform your research workflow with AI-powered analysis and visualization tools.
          </p>
        </div>

        {/* Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {insights.map((insight, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-teal-100 rounded-lg flex items-center justify-center">
                  <insight.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-sm text-green-600 font-medium flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{insight.change}</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{insight.value}</div>
              <div className="text-slate-600 text-sm">{insight.metric}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action) => (
              <div
                key={action.id}
                onClick={() => onNavigate(action.id)}
                className="group cursor-pointer bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{action.title}</h3>
                <p className="text-slate-600 mb-4">{action.description}</p>
                <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                  <span className="text-sm">Get Started</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity and Notifications */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Recent Activity</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-4 border-b border-slate-100 last:border-b-0">
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'completed' ? 'bg-green-500' : 
                          activity.status === 'in-progress' ? 'bg-yellow-500' : 'bg-slate-300'
                        }`}></div>
                        <div>
                          <div className="font-semibold text-slate-900">{activity.action}</div>
                          <div className="text-slate-600 text-sm">{activity.paper}</div>
                        </div>
                      </div>
                      <div className="text-slate-500 text-sm">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Panel */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Notifications</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-slate-600" />
                  <span className="font-medium text-slate-900">Recent Updates</span>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  Mark all as read
                </button>
              </div>

              {isLoadingNotifications ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 rounded-lg ${notification.read ? 'bg-white' : 'bg-blue-50'} border border-slate-200`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`font-medium ${notification.read ? 'text-slate-900' : 'text-blue-700'}`}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-slate-500">{notification.time}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{notification.message}</p>
                      <button className="text-xs text-blue-600 hover:text-blue-800">
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};