const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  appName: 'Data Intelligence Platform',
  itemsPerPage: 20,
  dateFormat: 'MMM dd, yyyy HH:mm',
  chartColors: {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4'
  }
};

export default config;