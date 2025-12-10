import api from './api';

class DataService {
  async getData(params = {}) {
    const response = await api.get('/data', { params });
    return response.data;
  }

  async getDataById(id) {
    const response = await api.get(`/data/${id}`);
    return response.data;
  }

  async getStatistics(params = {}) {
    const response = await api.get('/data/statistics', { params });
    return response.data;
  }

  async deleteData(id) {
    const response = await api.delete(`/data/${id}`);
    return response.data;
  }

  async bulkDeleteOldData(days) {
    const response = await api.post('/data/bulk-delete', { days });
    return response.data;
  }
}

export default new DataService();