/**
 * Server Analytics Page Component
 * 
 * Comprehensive analytics dashboard for server owners
 * showing impressions, clicks, conversions, and performance metrics.
 * 
 * @component
 * @author ServerCraft Development Team
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, BarChart3, Eye, MousePointer, Copy, Vote, MessageSquare, TrendingUp, Users, Calendar, Filter } from 'lucide-react';
import { AnalyticsService, AnalyticsSummary, DailyAnalytics } from '../services/analyticsService';
import { ServerService } from '../services/serverService';

// ==================== INTERFACES ====================

interface ServerAnalyticsPageProps {
  serverId: string;
  onBack: () => void;
}

interface Server {
  id: string;
  name: string;
  ip: string;
  user_id: string;
}

interface ChartMetric {
  key: keyof DailyAnalytics;
  label: string;
  color: string;
  icon: React.ComponentType<any>;
}

// ==================== CONSTANTS ====================

const CHART_METRICS: ChartMetric[] = [
  { key: 'impressions', label: 'Impressions', color: '#3B82F6', icon: Eye },
  { key: 'clicks', label: 'Clicks', color: '#10B981', icon: MousePointer },
  { key: 'ip_copies', label: 'IP Copies', color: '#8B5CF6', icon: Copy },
  { key: 'votes', label: 'Votes', color: '#5865F2', icon: Vote },
  { key: 'reviews', label: 'Reviews', color: '#F59E0B', icon: MessageSquare },
];

// ==================== COMPONENT ====================

export const ServerAnalyticsPage: React.FC<ServerAnalyticsPageProps> = ({ serverId, onBack }) => {
  const [server, setServer] = useState<Server | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(new Set(['impressions', 'clicks', 'ip_copies']));

  // ==================== EFFECTS ====================

  useEffect(() => {
    loadServerAndAnalytics();
  }, [serverId]);

  // ==================== HANDLERS ====================

  const loadServerAndAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load server data
      const serverData = await ServerService.getServerById(serverId);
      setServer(serverData);

      // Load analytics data
      const analyticsData = await AnalyticsService.getServerAnalytics(serverId);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const toggleMetric = (metricKey: string) => {
    setSelectedMetrics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(metricKey)) {
        newSet.delete(metricKey);
      } else {
        newSet.add(metricKey);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getCurrentMonth = () => {
    // Show "Last 30 Days" if we have data from previous month, otherwise show current month
    if (analytics?.daily_data && analytics.daily_data.length > 0) {
      const oldestDate = new Date(analytics.daily_data[0].date);
      const currentMonth = new Date();
      currentMonth.setDate(1);
      
      if (oldestDate < currentMonth) {
        return 'Last 30 Days';
      }
    }
    
    return new Date().toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getMaxValue = () => {
    if (!analytics?.daily_data) return 100;
    
    let max = 0;
    analytics.daily_data.forEach(day => {
      selectedMetrics.forEach(metric => {
        const value = day[metric as keyof DailyAnalytics] as number;
        if (value > max) max = value;
      });
    });
    return Math.max(max, 10);
  };

  const renderChart = () => {
    if (!analytics?.daily_data || analytics.daily_data.length === 0) {
      return (
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-light-gray mx-auto mb-3" />
          <p className="text-light-gray">No data available for this month</p>
          <p className="text-sm text-light-gray">Analytics will appear as users interact with your server</p>
        </div>
      );
    }

    const maxValue = getMaxValue();
    const chartHeight = 300;

    return (
      <div className="relative">
        {/* Chart Area */}
        <div className="relative bg-secondary-dark/20 rounded-lg p-4" style={{ height: chartHeight + 60 }}>
          {/* Y-axis labels */}
          <div className="absolute left-0 top-4 bottom-12 flex flex-col justify-between text-xs text-light-gray">
            {[maxValue, Math.round(maxValue * 0.75), Math.round(maxValue * 0.5), Math.round(maxValue * 0.25), 0].map((value, index) => (
              <span key={index} className="text-right pr-2">{value}</span>
            ))}
          </div>

          {/* Chart bars */}
          <div className="ml-8 mr-4 h-full flex items-end justify-between pb-12 pt-4">
            {analytics.daily_data.map((day, dayIndex) => (
              <div key={dayIndex} className="flex flex-col items-center space-y-1 flex-1 max-w-12">
                {/* Bars container */}
                <div className="relative flex items-end justify-center space-x-0.5 h-full w-full">
                  {CHART_METRICS.filter(metric => selectedMetrics.has(metric.key)).map((metric, metricIndex) => {
                    const value = day[metric.key] as number;
                    const height = maxValue > 0 ? (value / maxValue) * (chartHeight - 80) : 0;
                    
                    return (
                      <div
                        key={metric.key}
                        className="relative group cursor-pointer transition-all duration-200 hover:opacity-80"
                        style={{
                          height: Math.max(height, value > 0 ? 4 : 0),
                          backgroundColor: metric.color,
                          width: `${Math.max(100 / selectedMetrics.size - 2, 8)}%`,
                          borderRadius: '2px 2px 0 0'
                        }}
                        title={`${metric.label}: ${value}`}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-primary-dark text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {metric.label}: {value}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Date label */}
                <span className="text-xs text-light-gray transform -rotate-45 origin-center mt-2">
                  {formatDate(day.date)}
                </span>
              </div>
            ))}
          </div>

          {/* Grid lines */}
          <div className="absolute left-8 right-4 top-4 bottom-12 pointer-events-none">
            {[0.25, 0.5, 0.75].map((ratio, index) => (
              <div
                key={index}
                className="absolute left-0 right-0 border-t border-white/10"
                style={{ bottom: `${ratio * (chartHeight - 80) + 48}px` }}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {CHART_METRICS.map((metric) => (
            <button
              key={metric.key}
              onClick={() => toggleMetric(metric.key)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all ${
                selectedMetrics.has(metric.key)
                  ? 'border-white/20 bg-white/5'
                  : 'border-white/10 bg-transparent opacity-50 hover:opacity-75'
              }`}
            >
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: metric.color }}
              />
              <metric.icon className="w-4 h-4" style={{ color: metric.color }} />
              <span className="text-sm text-white">{metric.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-dark pt-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-discord-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-light-gray">Loading analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !server || !analytics) {
    return (
      <div className="min-h-screen bg-primary-dark pt-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-discord-blue hover:text-blue-400 transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Server</span>
          </button>
          
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📊</div>
            <h1 className="text-2xl font-bold text-white mb-2">Analytics Unavailable</h1>
            <p className="text-light-gray mb-4">{error || 'Unable to load analytics data'}</p>
            <button
              onClick={loadServerAndAnalytics}
              className="btn bg-discord-blue hover:bg-blue-600 text-white"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark pt-20 px-4">
      <div className="container mx-auto max-w-6xl">
        
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-discord-blue hover:text-blue-400 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Server</span>
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-8 h-8 text-discord-blue" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wider uppercase">
                Server Analytics
              </h1>
              <p className="text-light-gray">
                {server.name} • {getCurrentMonth()}
              </p>
            </div>
          </div>
          <div className="w-16 h-1 bg-discord-blue"></div>
        </div>

        <div className="space-y-8">
          
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Impressions */}
            <div className="glass rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-white">Impressions</h3>
                </div>
              </div>
              <div className="text-3xl font-black text-white mb-2">
                {analytics.total_impressions.toLocaleString()}
              </div>
              <p className="text-sm text-light-gray">
                Times your server was shown
              </p>
            </div>

            {/* Clicks */}
            <div className="glass rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MousePointer className="w-5 h-5 text-green-400" />
                  <h3 className="font-bold text-white">Clicks</h3>
                </div>
              </div>
              <div className="text-3xl font-black text-white mb-2">
                {analytics.total_clicks.toLocaleString()}
              </div>
              <p className="text-sm text-light-gray">
                Visits to your server page
              </p>
            </div>

            {/* IP Copies */}
            <div className="glass rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Copy className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-white">IP Copies</h3>
                </div>
              </div>
              <div className="text-3xl font-black text-white mb-2">
                {analytics.total_ip_copies.toLocaleString()}
              </div>
              <p className="text-sm text-light-gray">
                Times IP was copied
              </p>
            </div>

            {/* Estimated Joins */}
            <div className="glass rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-grass-green" />
                  <h3 className="font-bold text-white">Est. Joins</h3>
                </div>
              </div>
              <div className="text-3xl font-black text-white mb-2">
                {analytics.estimated_joins.toLocaleString()}
              </div>
              <p className="text-sm text-light-gray">
                Estimated server joins
              </p>
            </div>
          </div>

          {/* Interactive Chart */}
          <div className="glass rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-discord-blue" />
                Daily Performance Chart
              </h2>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-light-gray" />
                <span className="text-sm text-light-gray">Click metrics to toggle</span>
              </div>
            </div>
            
            {renderChart()}
          </div>

          {/* Performance Metrics */}
          <div className="glass rounded-xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-discord-blue" />
              Server Listing Performance
            </h2>
            <p className="text-light-gray mb-6">
              This is processed data to help you understand how your listing is performing.
              Try out different banners or a better description and see what works best.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-secondary-dark/40 rounded-lg p-4 border border-white/10">
                <h4 className="font-bold text-white mb-2">Avg. CTR</h4>
                <div className="text-2xl font-bold text-discord-blue mb-1">
                  {analytics.avg_ctr}%
                </div>
                <p className="text-xs text-light-gray">Click-through rate</p>
              </div>
              
              <div className="bg-secondary-dark/40 rounded-lg p-4 border border-white/10">
                <h4 className="font-bold text-white mb-2">Avg. Conversion Rate</h4>
                <div className="text-2xl font-bold text-grass-green mb-1">
                  {analytics.avg_conversion_rate}%
                </div>
                <p className="text-xs text-light-gray">IP copy rate</p>
              </div>
              
              <div className="bg-secondary-dark/40 rounded-lg p-4 border border-white/10">
                <h4 className="font-bold text-white mb-2">Total Engagement</h4>
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  {(analytics.total_votes + analytics.total_reviews).toLocaleString()}
                </div>
                <p className="text-xs text-light-gray">Votes + Reviews</p>
              </div>
            </div>
          </div>

          {/* Votes & Reviews Breakdown */}
          <div className="glass rounded-xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Vote className="w-6 h-6 text-grass-green" />
              Votes & Reviews
            </h2>
            <p className="text-light-gray mb-6">
              Here's a breakdown of the votes and reviews your server has received on a per-day basis.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-secondary-dark/40 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Vote className="w-4 h-4 text-grass-green" />
                  <h4 className="font-bold text-white">Total Votes</h4>
                </div>
                <div className="text-2xl font-bold text-grass-green">
                  {analytics.total_votes.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-secondary-dark/40 rounded-lg p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  <h4 className="font-bold text-white">Total Reviews</h4>
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {analytics.total_reviews.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Raw Data Table */}
          <div className="glass rounded-xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-discord-blue" />
              Daily Data - {getCurrentMonth()}
            </h2>
            <p className="text-light-gray mb-6">
              Raw data collected from users interacting with your server listing over the selected time period.
              This shows daily breakdowns of impressions, clicks, IP copies, votes, and reviews.
            </p>
            
            {analytics.daily_data.length > 0 ? (
              <div className="space-y-4">
                {/* Table Header */}
                <div className="grid grid-cols-6 gap-4 text-sm font-medium text-light-gray border-b border-white/10 pb-2">
                  <div>Date</div>
                  <div>Impressions</div>
                  <div>Clicks</div>
                  <div>IP Copies</div>
                  <div>Votes</div>
                  <div>Reviews</div>
                </div>
                
                {/* Table Data */}
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {analytics.daily_data.map((day, index) => (
                    <div key={index} className="grid grid-cols-6 gap-4 text-sm py-2 hover:bg-white/5 rounded transition-colors">
                      <div className="text-white font-medium">{formatDate(day.date)}</div>
                      <div className="text-blue-400">{day.impressions.toLocaleString()}</div>
                      <div className="text-green-400">{day.clicks.toLocaleString()}</div>
                      <div className="text-purple-400">{day.ip_copies.toLocaleString()}</div>
                      <div className="text-grass-green">{day.votes.toLocaleString()}</div>
                      <div className="text-yellow-400">{day.reviews.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-light-gray mx-auto mb-3" />
                <p className="text-light-gray">No data available for this month</p>
                <p className="text-sm text-light-gray">Analytics will appear as users interact with your server</p>
              </div>
            )}
          </div>

          {/* Explanation */}
          <div className="glass rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">What does this mean?</h2>
            <div className="space-y-3 text-sm text-light-gray">
              <div>
                <strong className="text-white">Impression:</strong> Every time your server gets shown to a user.
              </div>
              <div>
                <strong className="text-white">Click:</strong> Every time a user clicks on your server's page. This includes clicks within the website, direct & referral visits, but excludes all visits made using the voting link.
              </div>
              <div>
                <strong className="text-white">IP Copy:</strong> Every time a user copies your server's IP using the "Copy IP" button. This excludes users who manually select and copy your server's IP address.
              </div>
              <div>
                <strong className="text-white">Estimated Joins:</strong> 50% of all unique users that copy your server's IP using the "Copy IP" button. This excludes users who have cookies disabled or who manually select and copy your server's IP address.
              </div>
              <div>
                <strong className="text-white">CTR:</strong> Click-Through Rate. The ratio of clicks to impressions.
              </div>
              <div>
                <strong className="text-white">Conversion Rate:</strong> The ratio of IP copies to impressions.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};