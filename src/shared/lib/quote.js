// Utility functions for formatting currency and quotes
import { SHOW_PRICE } from '../config/flags';

export const formatCurrency = (amount) => {
  if (!SHOW_PRICE) return '';
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD'
  }).format(amount || 0);
};