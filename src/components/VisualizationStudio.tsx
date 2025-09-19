import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Network, Image, Play, Palette, Download, Loader2 } from 'lucide-react';
import { GeminiService } from '../lib/gemini';
import { DataStore } from '../lib/dataStore';

interface VisualizationStudioProps {
  papers: any[];
}

export const VisualizationStudio: React.FC<VisualizationStudioProps> = ({ papers }) => {
  const [selectedVisualization, setSelectedVisualization] = useState('infographic');
  const [selectedPaper, setSelectedPaper] = useState(papers[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVisual, setGeneratedVisual] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [gallery, setGallery] = useState<any[]>([]);

  const visualizationTypes = [
    {
      id: 'infographic',
      title: 'Infographic',
      description: 'Static visual summary with key statistics and insights',
      icon: BarChart3,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'diagram',
      title: 'Animated Diagram',
      description: 'Step-by-step process visualization with animations',
      icon: Play,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50'
    },
    {
      id: 'interactive',
      title: 'Interactive Chart',
      description: 'Dynamic data exploration with user controls',
      icon: TrendingUp,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      id: 'network',
      title: 'Network Graph',
      description: 'Relationship mapping and concept connections',
      icon: Network,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const generateVisualization = async () => {
    if (!selectedPaper) return;

    setIsGenerating(true);
    setError(null);
    
    try {
      const content = selectedPaper.content || selectedPaper.analysis?.paper_metadata?.title || '';
      const analysis = selectedPaper.analysis;
      
      const visual = await GeminiService.generateVisualization(content, selectedVisualization, analysis);
      setGeneratedVisual(visual);
      await DataStore.saveVisualization(selectedPaper.id, {
        visualization_type: selectedVisualization,
        config: visual,
      });
      // refresh gallery
      const items = await DataStore.getVisualizations(selectedPaper.id);
      setGallery(items);
    } catch (err) {
      console.error('Visualization generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate visualization');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!selectedPaper) return;
      const items = await DataStore.getVisualizations(selectedPaper.id);
      setGallery(items);
    };
    load();
  }, [selectedPaper]);

  const downloadJSON = (filename: string, obj: any) => {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderGeneratedVisualization = () => {
    if (!generatedVisual) return null;

    return (
      <div className="bg-gradient-to-br from-blue-600 to-teal-600 rounded-2xl p-8 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-24 h-24 border-2 border-white rounded-full"></div>
        </div>
        
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">{generatedVisual.title}</h2>
          
          {generatedVisual.data_points && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {generatedVisual.data_points.slice(0, 3).map((point: any, index: number) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold mb-2">{point.value}</div>
                  <div className="text-sm opacity-90">{point.label}</div>
                </div>
              ))}
            </div>
          )}

          {generatedVisual.insights && (
            <div className="space-y-4">
              {generatedVisual.insights.map((insight: string, index: number) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-white rounded-full flex-shrink-0"></div>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="text-sm opacity-75">{generatedVisual.description}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Visualization Studio
          </h1>
          <p className="text-lg md:text-xl text-slate-600">
            Transform research data into compelling visual stories with AI-generated infographics and interactive diagrams.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Visualization Type */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Visualization Type</h3>
              <div className="space-y-3">
                {visualizationTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => setSelectedVisualization(type.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedVisualization === type.id
                        ? `border-blue-200 ${type.bgColor}`
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <type.icon className="w-5 h-5 text-slate-600" />
                      <span className="font-medium text-slate-900 text-sm">{type.title}</span>
                    </div>
                    <p className="text-xs text-slate-600">{type.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Design Options */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Design Options</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Color Scheme</label>
                  <div className="flex space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full cursor-pointer border-2 border-slate-300"></div>
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full cursor-pointer"></div>
                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full cursor-pointer"></div>
                    <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full cursor-pointer"></div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Style</label>
                  <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                    <option>Modern & Clean</option>
                    <option>Academic & Professional</option>
                    <option>Creative & Artistic</option>
                    <option>Technical & Detailed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateVisualization}
              disabled={!selectedPaper || isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Palette className="w-4 h-4" />
                  <span>Create Visual</span>
                </div>
              )}
            </button>
          </div>

          {/* Preview Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900">Live Preview</h2>
                <div className="flex items-center space-x-3 mt-4 md:mt-0">
                  <button
                    onClick={() => generatedVisual && downloadJSON(`${selectedVisualization}-visual.json`, generatedVisual)}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors duration-200 text-sm font-medium">
                    Export
                  </button>
                </div>
              </div>

              {error ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors duration-200"
                  >
                    Try Again
                  </button>
                </div>
              ) : generatedVisual ? (
                renderGeneratedVisualization()
              ) : (
                <div className="bg-slate-50 rounded-2xl p-8 md:p-12 text-center">
                  <Palette className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Ready to Create</h3>
                  <p className="text-slate-600">
                    Select a visualization type and click "Create Visual" to generate an AI-powered 
                    visualization based on your research data.
                  </p>
                </div>
              )}
            </div>

            {/* Visualization Gallery */}
            <div className="mt-8">
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-4">Recent Visualizations</h3>
              {gallery.length === 0 ? (
                <div className="text-slate-600 text-sm">No visualizations yet</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {gallery.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer">
                      <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mb-3 flex items-center justify-center">
                        <Image className="w-8 h-8 text-slate-400" />
                      </div>
                      <h4 className="font-medium text-slate-900 text-sm mb-1">{item.visualization_type}</h4>
                      <p className="text-xs text-slate-600">{new Date(item.createdAt || item.created_at || Date.now()).toLocaleString()}</p>
                      <div className="mt-2">
                        <button
                          onClick={() => downloadJSON(`${item.visualization_type}-${item.id}.json`, item.config || item)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Download JSON
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};