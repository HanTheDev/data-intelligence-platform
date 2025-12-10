import React from "react";
import { Activity, Database, TrendingUp, AlertCircle } from "lucide-react";
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
      color: "blue",
    },
    {
      title: "Active Scrapers",
      value: scrapers?.data?.filter((s) => s.isActive).length || 0,
      icon: Activity,
      color: "green",
    },
    {
      title: "Data Sources",
      value: stats?.data?.byType?.length || 0,
      icon: TrendingUp,
      color: "purple",
    },
    {
      title: "Failed Jobs (24h)",
      value: 0,
      icon: AlertCircle,
      color: "red",
    },
  ];
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    red: "bg-red-100 text-red-600",
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Overview of your data intelligence platform
        </p>
      </div>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {statsLoading || scrapersLoading
                    ? "..."
                    : stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`p-3 rounded-full ${colorClasses[stat.color]}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Data Collection Trend">
          {statsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <LineChart
              data={stats?.data?.dailyCounts || []}
              xKey="date"
              yKey="count"
            />
          )}
        </Card>

        <Card title="Data by Type">
          {statsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {stats?.data?.byType?.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {item.type}
                    </span>
                    <span className="text-sm text-gray-600">
                      {item.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(item.count / stats.data.totalCount) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Scrapers */}
      <Card title="Recent Scraper Activity">
        {scrapersLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {scrapers?.data?.slice(0, 5).map((scraper) => (
              <div
                key={scraper.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h4 className="font-medium text-gray-900">{scraper.name}</h4>
                  <p className="text-sm text-gray-600">{scraper.scraperType}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      scraper.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {scraper.isActive ? "Active" : "Inactive"}
                  </span>
                  {scraper.lastRunAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last run: {new Date(scraper.lastRunAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
export default Dashboard;