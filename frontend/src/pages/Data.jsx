import React, { useState } from 'react';
import { Search, Filter, Download, Trash2, Eye } from 'lucide-react';
import Card from '../components/common/Card/Card';
import Button from '../components/common/Button/Button';
import Input from '../components/common/Input/Input';
import Table from '../components/common/Table/Table';
import Modal from '../components/common/Modal/Modal';
import DataDetails from '../components/data/DataDetails';
import { useScrapedData, useDeleteData } from '../hooks/useData';

const Data = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    dataType: '',
    scraperId: ''
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const { data, isLoading, refetch } = useScrapedData({ 
    page, 
    limit: 20,
    ...filters 
  });
  const deleteMutation = useDeleteData();

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value });
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this data?')) {
      try {
        await deleteMutation.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleViewDetails = (item) => {
    setSelectedData(item);
    setShowDetailsModal(true);
  };

  const handleExport = () => {
    // Simple CSV export
    if (!data?.data || data.data.length === 0) return;

    const headers = ['Title', 'Type', 'Price', 'URL', 'Scraped At'];
    const rows = data.data.map(item => [
      item.title,
      item.dataType,
      item.price ? `${item.currency} ${item.price}` : 'N/A',
      item.url,
      new Date(item.scrapedAt).toLocaleString()
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scraped-data-${Date.now()}.csv`;
    a.click();
  };

  const columns = [
    {
      header: 'Title',
      accessor: 'title',
      render: (row) => (
        <div className="max-w-md">
          <div className="font-medium text-gray-900 truncate">{row.title}</div>
          <div className="text-sm text-gray-500 capitalize">{row.dataType}</div>
        </div>
      )
    },
    {
      header: 'Source',
      accessor: 'scraperConfig',
      render: (row) => (
        <span className="text-sm text-gray-600">
          {row.scraperConfig?.name || 'Unknown'}
        </span>
      )
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (row) => row.price ? (
        <span className="font-medium text-gray-900">
          {row.currency} {row.price.toLocaleString()}
        </span>
      ) : (
        <span className="text-gray-400">N/A</span>
      )
    },
    {
      header: 'Scraped At',
      accessor: 'scrapedAt',
      render: (row) => (
        <span className="text-sm text-gray-600">
          {new Date(row.scrapedAt).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="text-blue-600 hover:text-blue-800"
            title="View Details"
          >
            <Eye size={18} />
          </button>
          <a
            href={row.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-800"
            title="Visit Source"
          >
            <Download size={18} />
          </a>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-600 hover:text-red-800"
            title="Delete"
            disabled={deleteMutation.isLoading}
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scraped Data</h1>
          <p className="text-gray-600 mt-2">Browse and manage collected data</p>
        </div>
        <Button
          onClick={handleExport}
          variant="outline"
          className="flex items-center space-x-2"
          disabled={!data?.data || data.data.length === 0}
        >
          <Download size={20} />
          <span>Export CSV</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by title..."
              value={filters.search}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filters.dataType}
            onChange={(e) => {
              setFilters({ ...filters, dataType: e.target.value });
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="product">Products</option>
            <option value="job">Jobs</option>
            <option value="article">Articles</option>
          </select>

          <Button
            variant="outline"
            onClick={() => {
              setFilters({ search: '', dataType: '', scraperId: '' });
              setPage(1);
            }}
            className="flex items-center justify-center space-x-2"
          >
            <Filter size={20} />
            <span>Clear Filters</span>
          </Button>
        </div>
      </Card>

      {/* Data Table */}
      <Card>
        <Table
          columns={columns}
          data={data?.data || []}
          loading={isLoading}
          emptyMessage="No data found. Start scraping to collect data."
        />

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-600">
              Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, data.pagination.total)} of {data.pagination.total} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= data.pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedData(null);
        }}
        title="Data Details"
        size="lg"
      >
        {selectedData && <DataDetails data={selectedData} />}
      </Modal>
    </div>
  );
};

export default Data;