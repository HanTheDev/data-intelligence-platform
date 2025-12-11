import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import Card from '../components/common/Card/Card';
import { useQuery } from '@tanstack/react-query';
import scraperService from '../services/scraperService';

const Logs = () => {
  const [selectedScraperId, setSelectedScraperId] = useState('all');
  const [page, setPage] = useState(1);

  // Get all scrapers for filter
  const { data: scrapersData } = useQuery({
    queryKey: ['scrapers'],
    queryFn: () => scraperService.getScrapers()
  });

  // Get logs
  const { data: logsData, isLoading } = useQuery({
    queryKey: ['allLogs', selectedScraperId, page],
    queryFn: async () => {
      if (selectedScraperId === 'all') {
        // Get logs from all scrapers
        const scrapers = scrapersData?.data || [];
        const allLogs = [];
        
        for (const scraper of scrapers.slice(0, 5)) { // Limit to first 5 scrapers
          try {
            const logs = await scraperService.getScraperLogs(scraper.id, { limit: 10 });
            allLogs.push(...logs.data.map(log => ({ ...log, scraperName: scraper.name })));
          } catch (error) {
            console.error(`Failed to fetch logs for scraper ${scraper.id}:`, error);
          }
        }
        
        // Sort by date
        allLogs.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
        return { data: allLogs };
      } else {
        const logs = await scraperService.getScraperLogs(selectedScraperId, { page, limit: 20 });
        const scraper = scrapersData?.data?.find(s => s.id === parseInt(selectedScraperId));
        return {
          ...logs,
          data: logs.data.map(log => ({ ...log, scraperName: scraper?.name }))
        };
      }
    },
    enabled: !!scrapersData
  });

  const statusConfig = {
    success: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      label: 'Success'
    },
    failed: {
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      label: 'Failed'
    },
    running: {
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      label: 'Running'
    },
    partial: {
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      label: 'Partial'
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
        <p className="text-gray-600 mt-2">Monitor scraper execution history</p>
      </div>

      {/* Filter */}
      <Card>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by Scraper:</label>
          <select
            value={selectedScraperId}
            onChange={(e) => {
              setSelectedScraperId(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Scrapers</option>
            {scrapersData?.data?.map((scraper) => (
              <option key={scraper.id} value={scraper.id}>
                {scraper.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Logs List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : logsData?.data && logsData.data.length > 0 ? (
          logsData.data.map((log) => {
            const config = statusConfig[log.status] || statusConfig.partial;
            const Icon = config.icon;

            return (
              <Card key={log.id} className={config.bgColor}>
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-full ${config.bgColor}`}>
                    <Icon className={config.color} size={24} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {log.scraperName || 'Unknown Scraper'}
                        </h3>
                        <p className={`text-sm font-medium ${config.color}`}>
                          {config.label}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {new Date(log.startedAt).toLocaleString()}
                        </p>
                        {log.executionTimeMs && (
                          <p className="text-xs text-gray-500 mt-1">
                            Duration: {(log.executionTimeMs / 1000).toFixed(2)}s
                          </p>
                        )}
                      </div>
                    </div>

                    {log.itemsScraped > 0 && (
                      <p className="text-sm text-gray-700 mt-2">
                        Successfully scraped <span className="font-semibold">{log.itemsScraped}</span> items
                      </p>
                    )}

                    {log.errorMessage && (
                      <div className="mt-3 p-3 bg-white rounded border border-red-200">
                        <p className="text-sm font-medium text-red-900 mb-1">Error:</p>
                        <p className="text-sm text-red-700">{log.errorMessage}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card>
            <p className="text-center text-gray-500 py-12">No activity logs found</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Logs;