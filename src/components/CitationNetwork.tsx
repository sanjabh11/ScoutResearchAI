import React, { useState, useEffect } from 'react';
import { Network, Search, Filter, Zap, Users, BookOpen, TrendingUp } from 'lucide-react';
import { SupabaseService } from '../lib/supabase';

export const CitationNetwork: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [networkData, setNetworkData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'citations' | 'collaborations' | 'topics'>('citations');

  const generateNetwork = async () => {
    setIsLoading(true);
    // Fetch research papers and similar_papers from Supabase
    const papers = await SupabaseService.getPapers();
    // TODO: Fetch similar_papers and build edges
    // For now, just create nodes from papers
    const nodes = papers.map((paper, idx) => ({
      id: paper.id,
      title: paper.title || paper.analysis?.paper_metadata?.title,
      authors: paper.analysis?.paper_metadata?.authors || [],
      year: paper.analysis?.paper_metadata?.publication_year,
      citations: paper.analysis?.paper_metadata?.citations,
      influence_score: paper.analysis?.influence_score || 0.5,
      type: 'paper',
      x: 200 + idx * 100,
      y: 200 + idx * 50,
      size: 16
    }));
    // Edges and communities can be built from similar_papers table if needed
    setNetworkData({
      nodes,
      edges: [],
      communities: [],
      metrics: {
        total_papers: nodes.length,
        total_citations: nodes.reduce((sum, n) => sum + (n.citations || 0), 0),
        avg_influence: nodes.length ? (nodes.reduce((sum, n) => sum + (n.influence_score || 0), 0) / nodes.length) : 0,
        network_density: 0
      }
    });
    setIsLoading(false);
  };

  useEffect(() => {
    generateNetwork();
  }, []);

  const getNodeColor = (node: any) => {
    if (node.influence_score >= 0.8) return '#EF4444'; // High influence - red
    if (node.influence_score >= 0.6) return '#F59E0B'; // Medium influence - amber
    return '#6B7280'; // Low influence - gray
  };

  const getNodeSize = (citations: number) => {
    return Math.max(8, Math.min(24, citations / 10));
  };

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Citation Network Visualization
          </h1>
          <p className="text-xl text-slate-600">
            Explore research influence patterns and academic relationships through interactive network graphs.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Search Network</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search papers, authors..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* View Mode */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Network View</h3>
              <div className="space-y-3">
                {[
                  { id: 'citations', label: 'Citation Network', icon: BookOpen },
                  { id: 'collaborations', label: 'Author Collaborations', icon: Users },
                  { id: 'topics', label: 'Topic Clusters', icon: TrendingUp }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as any)}
                    className={`w-full p-3 rounded-lg text-left transition-all duration-200 flex items-center space-x-3 ${
                      viewMode === mode.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <mode.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Network Metrics */}
            {networkData && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Network Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-600 text-sm">Total Papers</span>
                    <span className="font-semibold text-slate-900">{networkData.metrics.total_papers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 text-sm">Total Citations</span>
                    <span className="font-semibold text-slate-900">{networkData.metrics.total_citations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 text-sm">Avg. Influence</span>
                    <span className="font-semibold text-slate-900">{networkData.metrics.avg_influence}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 text-sm">Network Density</span>
                    <span className="font-semibold text-slate-900">{networkData.metrics.network_density}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Node Info */}
            {selectedNode && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Paper Details</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-slate-900 mb-1">{selectedNode.title}</div>
                    <div className="text-xs text-slate-600">{selectedNode.authors.join(', ')}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-slate-600">Year</div>
                      <div className="font-semibold">{selectedNode.year}</div>
                    </div>
                    <div>
                      <div className="text-slate-600">Citations</div>
                      <div className="font-semibold">{selectedNode.citations}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-600 text-sm mb-1">Influence Score</div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${selectedNode.influence_score * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold">{Math.round(selectedNode.influence_score * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Network Visualization */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Interactive Network Graph</h2>
                <div className="flex items-center space-x-3">
                  <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-200">
                    <Filter className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={generateNetwork}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Generating network visualization...</p>
                  </div>
                </div>
              ) : networkData ? (
                <div className="relative">
                  {/* SVG Network Visualization */}
                  <svg width="100%" height="500" className="border border-slate-200 rounded-lg bg-slate-50">
                    {/* Edges */}
                    {networkData.edges.map((edge: any, index: number) => {
                      const sourceNode = networkData.nodes.find((n: any) => n.id === edge.source);
                      const targetNode = networkData.nodes.find((n: any) => n.id === edge.target);
                      return (
                        <line
                          key={index}
                          x1={sourceNode.x}
                          y1={sourceNode.y}
                          x2={targetNode.x}
                          y2={targetNode.y}
                          stroke="#CBD5E1"
                          strokeWidth={edge.strength * 3}
                          opacity={0.6}
                        />
                      );
                    })}
                    
                    {/* Nodes */}
                    {networkData.nodes.map((node: any) => (
                      <g key={node.id}>
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={getNodeSize(node.citations)}
                          fill={getNodeColor(node)}
                          stroke="#fff"
                          strokeWidth="2"
                          className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
                          onClick={() => setSelectedNode(node)}
                        />
                        <text
                          x={node.x}
                          y={node.y + getNodeSize(node.citations) + 15}
                          textAnchor="middle"
                          className="text-xs fill-slate-700 pointer-events-none"
                        >
                          {node.title.substring(0, 20)}...
                        </text>
                      </g>
                    ))}
                  </svg>

                  {/* Legend */}
                  <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Influence Level</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-xs text-slate-600">High (80%+)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                        <span className="text-xs text-slate-600">Medium (60-80%)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                        <span className="text-xs text-slate-600">Low (&lt;60%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <Network className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Network Visualization</h3>
                    <p className="text-slate-600">Interactive citation network will appear here</p>
                  </div>
                </div>
              )}
            </div>

            {/* Community Analysis */}
            {networkData && (
              <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Research Communities</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {networkData.communities.map((community: any) => (
                    <div key={community.id} className="p-6 rounded-lg border-2" style={{ borderColor: community.color + '40', backgroundColor: community.color + '10' }}>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: community.color }}></div>
                        <h4 className="font-semibold text-slate-900">{community.name}</h4>
                      </div>
                      <div className="text-sm text-slate-600">
                        {community.papers.length} papers in this cluster
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {community.papers.map((paperId: number) => {
                          const paper = networkData.nodes.find((n: any) => n.id === paperId);
                          return (
                            <span key={paperId} className="px-2 py-1 bg-white rounded text-xs">
                              Paper {paperId}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};