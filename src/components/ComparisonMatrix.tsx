import React, { useState, useEffect } from 'react';
import { GitCompare, BarChart3, TrendingUp, Users, Calendar, Award, Filter } from 'lucide-react';
import { SupabaseService, ResearchPaper } from '../lib/supabase';

interface ComparisonMatrixProps {
  papers?: ResearchPaper[];
}

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({ papers = [] }) => {
  const [selectedPapers, setSelectedPapers] = useState<ResearchPaper[]>([]);
  const [comparisonResults, setComparisonResults] = useState<any>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [allPapers, setAllPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPapers = async () => {
      setLoading(true);
      const supabasePapers = await SupabaseService.getPapers();
      setAllPapers(supabasePapers);
      setLoading(false);
    };
    fetchPapers();
  }, []);

  const generateComparison = async () => {
    setIsComparing(true);
    // TODO: Implement real comparison logic based on selectedPapers
    await new Promise(resolve => setTimeout(resolve, 2000));
    setComparisonResults({
      methodology_comparison: {},
      performance_metrics: {},
      key_similarities: [],
      key_differences: [],
      synthesis_opportunities: {}
    });
    setIsComparing(false);
  };

  const togglePaperSelection = (paper: ResearchPaper) => {
    setSelectedPapers(prev => {
      const isSelected = prev.some(p => p.id === paper.id);
      if (isSelected) {
        return prev.filter(p => p.id !== paper.id);
      } else if (prev.length < 5) {
        return [...prev, paper];
      }
      return prev;
    });
  };

  const availablePapers = papers.length > 0 ? papers : allPapers;

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Research Comparison Matrix
          </h1>
          <p className="text-xl text-slate-600">
            Compare multiple research papers side-by-side to identify methodological differences and synthesis opportunities.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Paper Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Select Papers ({selectedPapers.length}/5)
              </h3>
              
              <div className="space-y-3 mb-6">
                {availablePapers.map((paper) => (
                  <div
                    key={paper.id}
                    onClick={() => togglePaperSelection(paper)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedPapers.some(p => p.id === paper.id)
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-medium text-slate-900 text-sm mb-2">
                      {paper.title || paper.analysis?.paper_metadata?.title}
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <div>Authors: {paper.analysis?.paper_metadata?.authors?.join(', ') || 'N/A'}</div>
                      <div>Year: {paper.analysis?.paper_metadata?.publication_year || 'N/A'}</div>
                      <div>Citations: {paper.analysis?.paper_metadata?.citations || 'N/A'}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={generateComparison}
                disabled={selectedPapers.length < 2 || isComparing}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isComparing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <GitCompare className="w-4 h-4" />
                    <span>Compare Papers</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Comparison Results */}
          <div className="lg:col-span-3">
            {!comparisonResults ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                <GitCompare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Ready to Compare</h3>
                <p className="text-slate-600">
                  Select at least 2 research papers from the left panel to generate a comprehensive 
                  comparison matrix with methodological analysis and synthesis opportunities.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Comparison Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900">Paper Comparison Matrix</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Attribute</th>
                          {selectedPapers.map((paper, index) => (
                            <th key={index} className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                              Paper {index + 1}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">Title</td>
                          {selectedPapers.map((paper, index) => (
                            <td key={index} className="px-6 py-4 text-sm text-slate-700">
                              {paper.title?.substring(0, 50) || paper.analysis?.paper_metadata?.title?.substring(0, 50) || 'N/A'}...
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-slate-50">
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">Methodology</td>
                          {selectedPapers.map((paper, index) => (
                            <td key={index} className="px-6 py-4 text-sm text-slate-700">
                              {paper.analysis?.methodology || 'Experimental'}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">Sample Size</td>
                          {selectedPapers.map((paper, index) => (
                            <td key={index} className="px-6 py-4 text-sm text-slate-700">
                              {paper.analysis?.sample_size || 'N/A'}
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-slate-50">
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">Accuracy</td>
                          {selectedPapers.map((paper, index) => (
                            <td key={index} className="px-6 py-4 text-sm text-slate-700">
                              {paper.analysis?.accuracy || 'N/A'}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">Citations</td>
                          {selectedPapers.map((paper, index) => (
                            <td key={index} className="px-6 py-4 text-sm text-slate-700">
                              {paper.analysis?.paper_metadata?.citations || 'N/A'}
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-slate-50">
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">Quality Score</td>
                          {selectedPapers.map((paper, index) => (
                            <td key={index} className="px-6 py-4 text-sm text-slate-700">
                              <div className="flex items-center space-x-2">
                                <span>{paper.analysis?.quality_score || '8.5'}/10</span>
                                <div className={`w-2 h-2 rounded-full ${
                                  (paper.analysis?.quality_score || 8.5) >= 9 ? 'bg-green-500' :
                                  (paper.analysis?.quality_score || 8.5) >= 8 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}></div>
                              </div>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Key Insights */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Similarities */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Award className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Key Similarities</h3>
                    </div>
                    <div className="space-y-3">
                      {comparisonResults.key_similarities.map((similarity: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-slate-700">{similarity}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Differences */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Filter className="w-4 h-4 text-orange-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Key Differences</h3>
                    </div>
                    <div className="space-y-3">
                      {comparisonResults.key_differences.map((difference: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-slate-700">{difference}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Performance Visualization */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-bold text-slate-900">Performance Comparison</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {comparisonResults.performance_metrics.accuracy_range}
                      </div>
                      <div className="text-slate-600">Accuracy Range</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {comparisonResults.performance_metrics.citation_range}
                      </div>
                      <div className="text-slate-600">Citation Range</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {comparisonResults.performance_metrics.quality_range}
                      </div>
                      <div className="text-slate-600">Quality Range</div>
                    </div>
                  </div>
                </div>

                {/* Synthesis Opportunities */}
                <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl p-8 border border-blue-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-bold text-slate-900">Synthesis Opportunities</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Meta-Analysis Potential</h4>
                      <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        comparisonResults.synthesis_opportunities.meta_analysis_feasible
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {comparisonResults.synthesis_opportunities.meta_analysis_feasible ? 'Feasible' : 'Not Feasible'}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-3">Common Datasets</h4>
                      <div className="flex flex-wrap gap-2">
                        {comparisonResults.synthesis_opportunities.common_datasets.map((dataset: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                            {dataset}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold text-slate-900 mb-3">Identified Research Gaps</h4>
                    <div className="space-y-2">
                      {comparisonResults.synthesis_opportunities.research_gaps.map((gap: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-slate-700">{gap}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};