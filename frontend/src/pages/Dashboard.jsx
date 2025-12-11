import React from "react";
import { 
  Activity, 
  Database, 
  TrendingUp, 
  AlertCircle, 
  Zap, 
  Users, 
  BarChart3, 
  Calendar,
  CheckCircle  // Added this import
} from "lucide-react";
import Card from "../components/common/Card/Card";
import LineChart from "../components/common/Chart/LineChart";
import { useDataStatistics } from "../hooks/useData";
import { useScrapers } from "../hooks/useScrapers";

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDataStatistics({
    days: 7,
  });
  const { data: scrapers, isLoading: scrapersLoading } = useScrapers();

  const statCards = [
    {
      title: "Total Data Scraped",
      value: stats?.data?.totalCount || 0,
      icon: Database,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-gradient-to-br from-blue-500/10 to-blue-600/10",
      trend: "+12%",
      description: "This week"
    },
    {
      title: "Active Scrapers",
      value: scrapers?.data?.filter((s) => s.isActive).length || 0,
      icon: Activity,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-gradient-to-br from-green-500/10 to-emerald-600/10",
      trend: "+3",
      description: "Currently running"
    },
    {
      title: "Success Rate",
      value: "98%",
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-gradient-to-br from-purple-500/10 to-purple-600/10",
      trend: "+2.5%",
      description: "Last 24 hours"
    },
    {
      title: "Avg. Response Time",
      value: "1.2s",
      icon: Zap,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-gradient-to-br from-amber-500/10 to-orange-600/10",
      trend: "-0.3s",
      description: "Faster than yesterday"
    }
  ];

  const recentActivities = [
    { scraper: "Tokopedia Scraper", time: "2 minutes ago", status: "success", items: 45 },
    { scraper: "Glints Jobs", time: "15 minutes ago", status: "success", items: 23 },
    { scraper: "TechCrunch News", time: "1 hour ago", status: "running", items: 0 },
    { scraper: "E-commerce Monitor", time: "2 hours ago", status: "failed", items: 0 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Monitor your data collection in real-time
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            <span className="flex items-center space-x-2">
              <Zap size={18} />
              <span>Run All Scrapers</span>
            </span>
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200">
            Export Report
          </button>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div 
            key={index} 
            className={`${stat.bgColor} rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {statsLoading || scrapersLoading ? "..." : stat.value}
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${
                    stat.trend.startsWith('+') ? 'text-green-600' : 
                    stat.trend.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stat.trend}
                  </span>
                  <span className="text-sm text-gray-500">{stat.description}</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-md`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Data Collection Trend</h3>
              <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last quarter</option>
              </select>
            </div>
            {statsLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <LineChart
                data={stats?.data?.dailyCounts || []}
                xKey="date"
                yKey="count"
              />
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Data by Type</h3>
          {statsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-5">
              {stats?.data?.byType?.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        'bg-purple-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {item.type}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {item.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        'bg-purple-500'
                      }`}
                      style={{
                        width: `${(item.count / stats.data.totalCount) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {((item.count / stats.data.totalCount) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Recent Activities</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-100 text-green-600' :
                    activity.status === 'running' ? 'bg-blue-100 text-blue-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {activity.status === 'success' ? <CheckCircle size={18} /> :
                     activity.status === 'running' ? <Activity size={18} /> :
                     <AlertCircle size={18} />}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{activity.scraper}</h4>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  {activity.items > 0 && (
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {activity.items} items
                    </span>
                  )}
                  <span className={`block text-xs font-medium mt-1 ${
                    activity.status === 'success' ? 'text-green-600' :
                    activity.status === 'running' ? 'text-blue-600' :
                    'text-red-600'
                  }`}>
                    {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
          <h3 className="text-xl font-semibold mb-6">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <Database size={20} />
                <span>Database</span>
              </div>
              <span className="px-3 py-1 bg-green-500/20 text-green-300 text-sm font-medium rounded-full">
                Healthy
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <BarChart3 size={20} />
                <span>API Server</span>
              </div>
              <span className="px-3 py-1 bg-green-500/20 text-green-300 text-sm font-medium rounded-full">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <Users size={20} />
                <span>Active Users</span>
              </div>
              <span className="text-lg font-semibold">12</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <Calendar size={20} />
                <span>Next Scheduled Job</span>
              </div>
              <span className="text-sm">in 2h 15m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;