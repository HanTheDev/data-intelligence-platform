import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dataService from '../services/dataService';
import toast from 'react-hot-toast';

export const useScrapedData = (params = {}) => {
  return useQuery({
    queryKey: ['scrapedData', params],
    queryFn: () => dataService.getData(params)
  });
};

export const useDataStatistics = (params = {}) => {
  return useQuery({
    queryKey: ['statistics', params],
    queryFn: () => dataService.getStatistics(params)
  });
};

export const useDeleteData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => dataService.deleteData(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['scrapedData']);
      toast.success('Data deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete data');
    }
  });
};