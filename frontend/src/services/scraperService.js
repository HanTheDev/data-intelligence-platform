import api from './api';

class ScraperService {
  async getScrapers(params = {}) {
    const response = await api.get('/scrapers', { params });
    return response.data;
  }

  async getScraper(id) {
    const response = await api.get(`/scrapers/${id}`);
    return response.data;
  }

  async createScraper(data) {
    const response = await api.post('/scrapers', data);
    return response.data;
  }

  async updateScraper(id, data) {
    const response = await api.put(`/scrapers/${id}`, data);
    return response.data;
  }

  async deleteScraper(id) {
    const response = await api.delete(`/scrapers/${id}`);
    return response.data;
  }

  async executeScraper(id) {
    const response = await api.post(`/scrapers/${id}/execute`);
    return response.data;
  }

  async getScraperLogs(id, params = {}) {
    const response = await api.get(`/scrapers/${id}/logs`, { params });
    return response.data;
  }
}

export default new ScraperService();