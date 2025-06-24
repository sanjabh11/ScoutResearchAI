import React, { useState } from 'react';
import { Filter, X, Check, Search } from 'lucide-react';

interface SearchFiltersProps {
  onFilterChange: (filters: any) => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    dateRange: 'all',
    complexity: [],
    domains: [],
    sortBy: 'relevance'
  });

  const [isOpen, setIsOpen] = useState(false);

  const complexityOptions = [
    { id: 'basic', label: 'Basic (1-3)' },
    { id: 'intermediate', label: 'Intermediate (4-6)' },
    { id: 'advanced', label: 'Advanced (7-8)' },
    { id: 'expert', label: 'Expert (9-10)' }
  ];

  const domainOptions = [
    { id: 'computer_science', label: 'Computer Science' },
    { id: 'medicine', label: 'Medicine & Healthcare' },
    { id: 'physics', label: 'Physics' },
    { id: 'biology', label: 'Biology' },
    { id: 'chemistry', label: 'Chemistry' },
    { id: 'psychology', label: 'Psychology' },
    { id: 'economics', label: 'Economics' },
    { id: 'engineering', label: 'Engineering' }
  ];

  const dateRangeOptions = [
    { id: 'all', label: 'All Time' },
    { id: 'year', label: 'Past Year' },
    { id: 'month', label: 'Past Month' },
    { id: 'week', label: 'Past Week' }
  ];

  const sortOptions = [
    { id: 'relevance', label: 'Relevance' },
    { id: 'date_desc', label: 'Newest First' },
    { id: 'date_asc', label: 'Oldest First' },
    { id: 'complexity_asc', label: 'Complexity (Low to High)' },
    { id: 'complexity_desc', label: 'Complexity (High to Low)' }
  ];

  const toggleComplexity = (id: string) => {
    setFilters(prev => {
      const newComplexity = prev.complexity.includes(id)
        ? prev.complexity.filter(c => c !== id)
        : [...prev.complexity, id];
      
      const newFilters = { ...prev, complexity: newComplexity };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const toggleDomain = (id: string) => {
    setFilters(prev => {
      const newDomains = prev.domains.includes(id)
        ? prev.domains.filter(d => d !== id)
        : [...prev.domains, id];
      
      const newFilters = { ...prev, domains: newDomains };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const setDateRange = (range: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, dateRange: range };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const setSortBy = (sort: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, sortBy: sort };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const clearFilters = () => {
    const resetFilters = {
      dateRange: 'all',
      complexity: [],
      domains: [],
      sortBy: 'relevance'
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.dateRange !== 'all') count++;
    count += filters.complexity.length;
    count += filters.domains.length;
    if (filters.sortBy !== 'relevance') count++;
    return count;
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-200"
        >
          <Filter className="w-4 h-4 text-slate-600" />
          <span className="text-slate-700 font-medium">Filters</span>
          {getActiveFilterCount() > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
        </button>

        {getActiveFilterCount() > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Clear all
          </button>
        )}
      </div>

      {isOpen && (
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 mt-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Advanced Filters</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Range */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">Date Range</h4>
              <div className="space-y-2">
                {dateRangeOptions.map(option => (
                  <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={filters.dateRange === option.id}
                      onChange={() => setDateRange(option.id)}
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-slate-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Complexity */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">Complexity Level</h4>
              <div className="space-y-2">
                {complexityOptions.map(option => (
                  <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.complexity.includes(option.id)}
                      onChange={() => toggleComplexity(option.id)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-slate-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Domains */}
            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-slate-700 mb-3">Research Domains</h4>
              <div className="flex flex-wrap gap-2">
                {domainOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => toggleDomain(option.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors duration-200 ${
                      filters.domains.includes(option.id)
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {filters.domains.includes(option.id) && (
                      <Check className="w-3 h-3 inline mr-1" />
                    )}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-slate-700 mb-3">Sort Results By</h4>
              <select
                value={filters.sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors duration-200"
            >
              Clear All
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};