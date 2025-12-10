import React from 'react';
import { ExternalLink, Calendar, Tag, DollarSign } from 'lucide-react';

const DataDetails = ({ data }) => {
  return (
    <div className="space-y-6">
      {/* Image */}
      {data.imageUrl && (
        <div className="flex justify-center">
          <img
            src={data.imageUrl}
            alt={data.title}
            className="max-w-full h-64 object-contain rounded-lg"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}

      {/* Basic Info */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{data.title}</h3>
        {data.description && (
          <p className="text-gray-600">{data.description}</p>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        {data.price && (
          <div className="flex items-center space-x-2">
            <DollarSign className="text-green-600" size={20} />
            <div>
              <label className="text-sm text-gray-600">Price</label>
              <p className="font-medium text-gray-900">
                {data.currency} {data.price.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Tag className="text-blue-600" size={20} />
          <div>
            <label className="text-sm text-gray-600">Type</label>
            <p className="font-medium text-gray-900 capitalize">{data.dataType}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="text-purple-600" size={20} />
          <div>
            <label className="text-sm text-gray-600">Scraped At</label>
            <p className="font-medium text-gray-900">
              {new Date(data.scrapedAt).toLocaleString()}
            </p>
          </div>
        </div>

        {data.scraperConfig && (
          <div className="flex items-center space-x-2">
            <Tag className="text-orange-600" size={20} />
            <div>
              <label className="text-sm text-gray-600">Source</label>
              <p className="font-medium text-gray-900">{data.scraperConfig.name}</p>
            </div>
          </div>
        )}
      </div>

      {/* Metadata */}
      {data.metadata && Object.keys(data.metadata).length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Additional Information</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(data.metadata).map(([key, value]) => (
                <div key={key}>
                  <label className="text-sm text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <p className="font-medium text-gray-900">
                    {typeof value === 'object' ? JSON.stringify(value) : value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Source Link */}
      {data.url && (
        <div>
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ExternalLink size={20} />
            <span>View Original Source</span>
          </a>
        </div>
      )}
    </div>
  );
};

export default DataDetails;