import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import scraperService from '../services/scraperService';
import toast from 'react-hot-toast';

export const useScrapers = (params = {}) => {
  return useQuery({
    queryKey: ['scrapers', params],
    queryFn: () => scraperService.getScrapers(params)
  });
};

export const useScraper = (id) => {
  return useQuery({
    queryKey: ['scraper', id],
    queryFn: () => scraperService.getScraper(id),
    enabled: !!id
  });
};

export const useCreateScraper = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => scraperService.createScraper(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['scrapers']);
      toast.success('Scraper created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create scraper');
    }
  });
};

export const useUpdateScraper = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => scraperService.updateScraper(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['scrapers']);
      toast.success('Scraper updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update scraper');
    }
  });
};

export const useDeleteScraper = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => scraperService.deleteScraper(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['scrapers']);
      toast.success('Scraper deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete scraper');
    }
  });
};

export const useExecuteScraper = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => scraperService.executeScraper(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['scrapers']);
      toast.success('Scraper execution started');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to execute scraper');
    }
  });
};