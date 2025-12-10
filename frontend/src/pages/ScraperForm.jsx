import React, { useState, useEffect } from 'react';
import Input from '../common/Input/Input';
import Button from '../common/Button/Button';
import { useCreateScraper, useUpdateScraper } from '../../hooks/useScrapers';

const ScraperForm = ({ scraper = null, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    scraperType: 'ecommerce',
    targetUrl: '',
    scheduleCron: '',
    isActive: true,
    configJson: {}
  });

  const createMutation = useCreateScraper();
  const updateMutation = useUpdateScraper();
  const isEdit = !!scraper;

  useEffect(() => {
    if (scraper) {
      setFormData({
        name: scraper.name,
        scraperType: scraper.scraperType,
        targetUrl: scraper.targetUrl,
        scheduleCron: scraper.scheduleCron || '',
        isActive: scraper.isActive,
        configJson: scraper.configJson || {}
      });
    }
  }, [scraper]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: scraper.id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Form submission failed:', error);
    }
  };

  const scraperTypes = [
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'jobs', label: 'Job Listings' },
    { value: 'news', label: 'News Articles' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Scraper Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="e.g., Tokopedia Phone Prices"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Scraper Type <span className="text-red-500">*</span>
        </label>
        <select
          name="scraperType"
          value={formData.scraperType}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          {scraperTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Target URL"
        name="targetUrl"
        value={formData.targetUrl}
        onChange={handleChange}
        placeholder="https://example.com/products"
        required
      />

      <Input
        label="Schedule (Cron Expression)"
        name="scheduleCron"
        value={formData.scheduleCron}
        onChange={handleChange}
        placeholder="0 */6 * * * (every 6 hours) - Leave empty for manual execution"
      />

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <label className="text-sm font-medium text-gray-700">
          Active (Enable scheduled execution)
        </label>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Cron Expression Examples:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <code className="bg-blue-100 px-1 rounded">0 */6 * * *</code> - Every 6 hours</li>
          <li>• <code className="bg-blue-100 px-1 rounded">0 8 * * *</code> - Daily at 8 AM</li>
          <li>• <code className="bg-blue-100 px-1 rounded">0 */2 * * *</code> - Every 2 hours</li>
          <li>• <code className="bg-blue-100 px-1 rounded">0 0 * * 0</code> - Weekly on Sunday</li>
        </ul>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="ghost" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button
          type="submit"
          loading={createMutation.isLoading || updateMutation.isLoading}
        >
          {isEdit ? 'Update Scraper' : 'Create Scraper'}
        </Button>
      </div>
    </form>
  );
};

export default ScraperForm;