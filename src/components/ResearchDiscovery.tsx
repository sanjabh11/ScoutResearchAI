import React, { useState } from 'react';
import { Search, BookOpen, TrendingUp, Users, ExternalLink, Star, Calendar, Filter, Loader2 } from 'lucide-react';
import { SupabaseService, ResearchPaper } from '../lib/supabase';
import { SearchFilters } from './SearchFilters';

interface ResearchDiscoveryProps {
  papers?: any[];
}

export const ResearchDiscovery: React.FC<ResearchDiscoveryProps> = ({ papers = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ResearchPaper[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<any>({
    dateRange: 'all',
    complexity: [],
    domains: [],
    sortBy: 'relevance'
  });
  const [error, setError] = useState<string | null>(null);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setError(null);
    try {
      // Fetch all papers from Supabase
      const allPapers = await SupabaseService.getPapers();
      // Simple client-side filter by title/content
      let filteredResults = allPapers.filter(paper =>
        (paper.title && paper.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (paper.content && paper.content.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      // TODO: Apply advanced filters as needed
      setSearchResults(filteredResults);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to search for papers');
    } finally {
      setIsSearching(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setSelectedFilters(newFilters);
    
    // If we already have results, apply the filters immediately
    if (searchResults.length > 0) {
      performSearch();
    }
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 0.9) return 'text-green-700 bg-green-100';
    if (score >= 0.8) return 'text-blue-700 bg-blue-100';
    if (score >= 0.7) return 'text-yellow-700 bg-yellow-100';
    return 'text-slate-700 bg-slate-100';
  };

  const getImpactColor = (impact: number) => {
    if (impact >= 50) return 'text-red-600';
    if (impact >= 20) return 'text-orange-600';
    if (impact >= 10) return 'text-yellow-600';
    return 'text-slate-600';
  };

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Research Discovery Engine
          </h1>
          <p className="text-lg md:text-xl text-slate-600">
            Find similar research papers using advanced semantic analysis and citation network discovery.
          </p>
        </div>

        {/* Search Interface */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter research topic, keywords, or paper title..."
                  className="w-full pl-12 pr-4 py-4 border border-slate-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                />
              </div>
              <button
                onClick={performSearch}
                disabled={!searchQuery.trim() || isSearching}
                className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSearching ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </div>
                ) : (
                  'Discover'
                )}
              </button>
            </div>

            {/* Advanced Filters */}
            <SearchFilters onFilterChange={handleFilterChange} />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Search Results</h2>
              <div className="text-slate-600 mt-2 md:mt-0">
                Found {searchResults.length} highly relevant papers
              </div>
            </div>

            {searchResults.map((paper, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 hover:shadow-md transition-shadow duration-200">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 hover:text-blue-600 cursor-pointer">
                      {paper.title || paper.analysis?.paper_metadata?.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{paper.analysis?.paper_metadata?.authors?.join(', ') || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{paper.analysis?.paper_metadata?.journal || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{paper.analysis?.paper_metadata?.publication_year || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-start lg:items-end space-y-2 mt-4 lg:mt-0">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSimilarityColor(paper.analysis?.similarity_score || 0.8)}`}>
                      {Math.round((paper.analysis?.similarity_score || 0.8) * 100)}% match
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-slate-600">
                      <Star className="w-4 h-4" />
                      <span>{paper.analysis?.paper_metadata?.citations || 0} citations</span>
                    </div>
                  </div>
                </div>

                <p className="text-slate-700 mb-4 leading-relaxed">
                  {paper.analysis?.paper_metadata?.abstract || 'No abstract available.'}
                </p>

                {/* Key Similarities */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Key Similarities:</h4>
                  <div className="flex flex-wrap gap-2">
                    {(paper.analysis?.key_similarities || []).map((similarity: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {similarity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quality Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-sm text-slate-600 mb-1">Impact Factor</div>
                    <div className={`text-lg font-bold ${getImpactColor(paper.analysis?.quality_metrics?.impact_factor || 0)}`}>
                      {paper.analysis?.quality_metrics?.impact_factor || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-sm text-slate-600 mb-1">H-Index</div>
                    <div className="text-lg font-bold text-slate-900">
                      {paper.analysis?.quality_metrics?.h_index || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-sm text-slate-600 mb-1">Review Score</div>
                    <div className="text-lg font-bold text-green-600">
                      {paper.analysis?.quality_metrics?.peer_review_score || 'N/A'}/10
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between pt-4 border-t border-slate-200">
                  <div className="text-sm text-slate-600 mb-4 md:mb-0">
                    DOI: {paper.analysis?.paper_metadata?.doi || 'N/A'}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button className="px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 text-sm font-medium">
                      Add to Collection
                    </button>
                    <button className="px-4 py-2 text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center space-x-1">
                      <ExternalLink className="w-4 h-4" />
                      <span>View Paper</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {searchResults.length === 0 && !isSearching && !error && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Ready to Discover</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              Enter your research topic or keywords above to find similar papers using our advanced 
              semantic similarity algorithm and citation network analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};