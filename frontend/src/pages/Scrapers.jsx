import React, { useState } from 'react';
import { Plus, Play, Edit, Trash2, Eye } from 'lucide-react';
import Card from '../components/common/Card/Card';
import Button from '../components/common/Button/Button';
import Table from '../components/common/Table/Table';
import Modal from '../components/common/Modal/Modal';
import ScraperForm from '../components/scrapers/ScraperForm';
import ScraperDetails from '../components/scrapers/ScraperDetails';
import { useScrapers, useDeleteScraper, useExecuteScraper } from '../hooks/useScrapers';
import toast from 'react-hot-toast';

const Scrapers = () => {
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedScraper, setSelectedScraper] = useState(null);

  const { data, isLoading, refetch } = useScrapers({ page, limit: 20 });
  const deleteMutation = useDeleteScraper();
  const executeMutation = useExecuteScraper();

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this scraper?')) {
      try {
        await deleteMutation.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleExecute = async (id) => {
    try {
      await executeMutation.mutateAsync(id);
      toast.success('Scraper execution started. Check logs for progress.');
      refetch();
    } catch (error) {
      console.error('Execute failed:', error);
    }
  };

  const handleEdit = (scraper) => {
    setSelectedScraper(scraper);
    setShowEditModal(true);
  };

  const handleViewDetails = (scraper) => {
    setSelectedScraper(scraper);
    setShowDetailsModal(true);
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          <div className="text-sm text-gray-500">{row.scraperType}</div>
        </div>
      )
    },
    {
      header: 'Target URL',
      accessor: 'targetUrl',
      render: (row) => (
        <div className="max-w-xs truncate" title={row.targetUrl}>
          {row.targetUrl}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (row) => (
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
          row.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Schedule',
      accessor: 'scheduleCron',
      render: (row) => row.scheduleCron || 'Manual'
    },
    {
      header: 'Last Run',
      accessor: 'lastRunAt',
      render: (row) => row.lastRunAt 
        ? new Date(row.lastRunAt).toLocaleString() 
        : 'Never'
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
          <button
            onClick={() => handleExecute(row.id)}
            className="text-green-600 hover:text-green-800"
            title="Execute Now"
            disabled={!row.isActive || executeMutation.isLoading}
          >
            <Play size={18} />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="text-yellow-600 hover:text-yellow-800"
            title="Edit"
          >
            <Edit size={18} />
          </button>
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
          <h1 className="text-3xl font-bold text-gray-900">Scrapers</h1>
          <p className="text-gray-600 mt-2">Manage your web scraping configurations</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>New Scraper</span>
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          data={data?.data || []}
          loading={isLoading}
          emptyMessage="No scrapers configured yet. Create your first scraper to get started."
        />

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
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
        )}
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Scraper"
        size="lg"
      >
        <ScraperForm
          onSuccess={() => {
            setShowCreateModal(false);
            refetch();
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedScraper(null);
        }}
        title="Edit Scraper"
        size="lg"
      >
        <ScraperForm
          scraper={selectedScraper}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedScraper(null);
            refetch();
          }}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedScraper(null);
          }}
        />
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedScraper(null);
        }}
        title="Scraper Details"
        size="xl"
      >
        {selectedScraper && <ScraperDetails scraper={selectedScraper} />}
      </Modal>
    </div>
  );
};

export default Scrapers;