import React, { useState } from 'react';
import { Code, Download, Copy, Play, FileText, Zap, Loader2 } from 'lucide-react';
import { GeminiService, CodeGeneration } from '../lib/gemini';
import { DataStore } from '../lib/dataStore';

interface CodeGeneratorProps {
  papers: any[];
}

export const CodeGenerator: React.FC<CodeGeneratorProps> = ({ papers }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [selectedFramework, setSelectedFramework] = useState('tensorflow');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<CodeGeneration | null>(null);
  const [selectedPaper, setSelectedPaper] = useState(papers[0]);
  const [error, setError] = useState<string | null>(null);

  const languages = [
    { id: 'python', name: 'Python', icon: '🐍', popular: true },
    { id: 'javascript', name: 'JavaScript', icon: '📜', popular: true },
    { id: 'r', name: 'R', icon: '📊', popular: false },
    { id: 'julia', name: 'Julia', icon: '🔬', popular: false }
  ];

  const frameworks = {
    python: [
      { id: 'tensorflow', name: 'TensorFlow', description: 'Google\'s ML framework' },
      { id: 'pytorch', name: 'PyTorch', description: 'Facebook\'s deep learning library' },
      { id: 'scikit-learn', name: 'Scikit-learn', description: 'General-purpose ML library' },
      { id: 'numpy', name: 'NumPy/SciPy', description: 'Scientific computing' }
    ],
    javascript: [
      { id: 'tensorflow-js', name: 'TensorFlow.js', description: 'ML in the browser' },
      { id: 'brain-js', name: 'Brain.js', description: 'Neural networks in JS' },
      { id: 'd3', name: 'D3.js', description: 'Data visualization' }
    ],
    r: [
      { id: 'caret', name: 'Caret', description: 'Classification and regression' },
      { id: 'randomforest', name: 'RandomForest', description: 'Ensemble methods' }
    ],
    julia: [
      { id: 'flux', name: 'Flux.jl', description: 'ML library for Julia' },
      { id: 'mlj', name: 'MLJ.jl', description: 'Machine learning framework' }
    ]
  };

  const generateCode = async () => {
    if (!selectedPaper) return;

    setIsGenerating(true);
    setError(null);
    
    try {
      const content = selectedPaper.content || selectedPaper.analysis?.paper_metadata?.title || '';
      const analysis = selectedPaper.analysis;
      
      const code = await GeminiService.generateCode(content, selectedLanguage, selectedFramework, analysis);
      setGeneratedCode(code);
      // Persist locally (or Supabase if configured)
      await DataStore.saveCodeGeneration(selectedPaper.id, {
        language: selectedLanguage,
        framework: selectedFramework,
        code_content: code,
      });
    } catch (err) {
      console.error('Code generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate code');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadText = (filename: string, text: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Research-to-Code Generator
          </h1>
          <p className="text-lg md:text-xl text-slate-600">
            Transform research methodologies into production-ready, documented code implementations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Language Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Programming Language</h3>
              <div className="space-y-3">
                {languages.map((lang) => (
                  <div
                    key={lang.id}
                    onClick={() => setSelectedLanguage(lang.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedLanguage === lang.id
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{lang.icon}</span>
                      <div>
                        <div className="font-medium text-slate-900 text-sm">{lang.name}</div>
                        {lang.popular && (
                          <div className="text-xs text-blue-600">Popular</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Framework Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Framework</h3>
              <div className="space-y-3">
                {frameworks[selectedLanguage as keyof typeof frameworks]?.map((framework) => (
                  <div
                    key={framework.id}
                    onClick={() => setSelectedFramework(framework.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedFramework === framework.id
                        ? 'border-teal-200 bg-teal-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-medium text-slate-900 text-sm mb-1">{framework.name}</div>
                    <div className="text-xs text-slate-600">{framework.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Generation Options */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Options</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300" />
                  <span className="text-sm text-slate-700">Include documentation</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300" />
                  <span className="text-sm text-slate-700">Generate tests</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300" />
                  <span className="text-sm text-slate-700">Optimize for production</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded border-slate-300" />
                  <span className="text-sm text-slate-700">Include Docker setup</span>
                </label>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateCode}
              disabled={!selectedPaper || isGenerating}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Code...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Generate Code</span>
                </div>
              )}
            </button>
          </div>

          {/* Code Output */}
          <div className="lg:col-span-3">
            {error ? (
              <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 md:p-12 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Code className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Generation Failed</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Try Again
                </button>
              </div>
            ) : !generatedCode ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 text-center">
                <Code className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Ready to Generate</h3>
                <p className="text-slate-600">
                  Select your preferred programming language and framework, then click "Generate Code" 
                  to create a production-ready implementation of the research methodology.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Code Tabs */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                  <div className="border-b border-slate-200 px-6 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <h3 className="text-lg md:text-xl font-bold text-slate-900">Generated Implementation</h3>
                      <div className="flex space-x-2 mt-4 md:mt-0">
                        <button
                          onClick={() => copyToClipboard(generatedCode.main_implementation)}
                          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadText(`${selectedLanguage}-${selectedFramework}-impl.txt`, generatedCode.main_implementation)}
                          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <pre className="bg-slate-900 text-slate-100 p-6 rounded-lg overflow-x-auto text-sm leading-relaxed">
                      <code>{generatedCode.main_implementation}</code>
                    </pre>
                  </div>
                </div>

                {/* Test Suite */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                  <div className="border-b border-slate-200 px-6 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <h3 className="text-lg md:text-xl font-bold text-slate-900">Test Suite</h3>
                      <div className="flex space-x-2 mt-4 md:mt-0">
                        <button
                          onClick={() => copyToClipboard(generatedCode.test_suite)}
                          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadText(`${selectedLanguage}-${selectedFramework}-tests.txt`, generatedCode.test_suite)}
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200 text-sm font-medium flex items-center space-x-1"
                        >
                          <Play className="w-3 h-3" />
                          <span>Run Tests</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <pre className="bg-slate-900 text-slate-100 p-6 rounded-lg overflow-x-auto text-sm leading-relaxed max-h-96">
                      <code>{generatedCode.test_suite}</code>
                    </pre>
                  </div>
                </div>

                {/* Documentation */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                  <div className="border-b border-slate-200 px-6 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <h3 className="text-lg md:text-xl font-bold text-slate-900">Documentation</h3>
                      <div className="flex space-x-2 mt-4 md:mt-0">
                        <button
                          onClick={() => downloadText(`${selectedLanguage}-${selectedFramework}-docs.md`, generatedCode.documentation)}
                          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="prose prose-slate max-w-none">
                      <pre className="bg-slate-50 p-6 rounded-lg text-sm whitespace-pre-wrap">{generatedCode.documentation}</pre>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
                    <div className="text-xl md:text-2xl font-bold text-green-600 mb-1">{generatedCode.performance_metrics.accuracy}</div>
                    <div className="text-sm text-slate-600">Accuracy</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
                    <div className="text-xl md:text-2xl font-bold text-blue-600 mb-1">{generatedCode.performance_metrics.inference_time}</div>
                    <div className="text-sm text-slate-600">Inference</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
                    <div className="text-xl md:text-2xl font-bold text-purple-600 mb-1">{generatedCode.performance_metrics.parameters}</div>
                    <div className="text-sm text-slate-600">Parameters</div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
                    <div className="text-xl md:text-2xl font-bold text-amber-600 mb-1">{generatedCode.performance_metrics.test_coverage}</div>
                    <div className="text-sm text-slate-600">Test Coverage</div>
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