import React from 'react';
import { useScraper } from '../../hooks/useScrapers';
import scraperService from '../../services/scraperService';
import { useQuery } from '@tanstack/react-query';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const ScraperDetails = ({ scraper }) => {
  const { data: logs } = useQuery({
    queryKey: ['scraperLogs', scraper.id],
    queryFn: () => scraperService.getScraperLogs(scraper.id, { limit: 10 })
  });

  const statusIcons = {
    success: <CheckCircle className="text-green-600" size={20} />,
    failed: <XCircle className="text-red-600" size={20} />,
    running: <Clock className="text-blue-600" size={20} />
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <p className="font-medium text-gray-900">{scraper.name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Type</label>
            <p className="font-medium text-gray-900 capitalize">{scraper.scraperType}</p>
          </div>
          <div className="col-span-2">
            <label className="text-sm text-gray-600">Target URL</label>
            <p className="font-medium text-gray-900 break-all">{scraper.targetUrl}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Schedule</label>
            <p className="font-medium text-gray-900">{scraper.scheduleCron || 'Manual'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Status</label>
            <p className={`font-medium ${scraper.isActive ? 'text-green-600' : 'text-gray-600'}`}>
              {scraper.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
      </div>

      {/* Execution History */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Execution History</h3>
        {logs?.data && logs.data.length > 0 ? (
          <div className="space-y-3">
            {logs.data.map((log) => (
              <div key={log.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="mt-1">
                  {statusIcons[log.status] || <AlertCircle className="text-gray-600" size={20} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${
                      log.status === 'success' ? 'text-green-700' :
                      log.status === 'failed' ? 'text-red-700' :
                      'text-blue-700'
                    }`}>
                      {log.status.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(log.startedAt).toLocaleString()}
                    </span>
                  </div>
                  {log.itemsScraped > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      Scraped {log.itemsScraped} items in {log.executionTimeMs}ms
                    </p>
                  )}
                  {log.errorMessage && (
                    <p className="text-sm text-red-600 mt-1">{log.errorMessage}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No execution history yet</p>
        )}
      </div>
    </div>
  );
};

export default ScraperDetails;