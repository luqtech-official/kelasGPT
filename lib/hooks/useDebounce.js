/**
 * useDebounce Hook
 * Debounces a value to prevent excessive API calls or expensive operations
 * 
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 400ms)
 * @returns {any} - The debounced value
 */

import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value changes before the delay
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useSearchDebounce Hook
 * Specialized debounce hook for search functionality with additional features
 * 
 * @param {string} searchTerm - The search term to debounce
 * @param {number} delay - Delay in milliseconds (default: 400ms)
 * @returns {object} - Object with debouncedSearchTerm and isSearching flag
 */
export function useSearchDebounce(searchTerm, delay = 400) {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Start searching indicator if user is typing
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    }

    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm, delay, debouncedSearchTerm]);

  return {
    debouncedSearchTerm,
    isSearching
  };
}