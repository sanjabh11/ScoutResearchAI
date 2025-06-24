import React, { useState, useRef } from 'react';
import { Brain, BarChart3, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { GeminiService, ResearchAnalysis } from '../lib/gemini';
import { LocalStorageService } from '../lib/localStorageService';
import { FileProcessor } from '../lib/fileProcessor';
import { FileUploader } from './FileUploader';


interface ResearchUploadProps {
  onPaperUploaded: (paper: any) => void;
  onNavigate?: (view: string) => void;
}

export const ResearchUpload: React.FC<ResearchUploadProps> = ({ onPaperUploaded, onNavigate }) => {

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<ResearchAnalysis | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const analysisTimeoutRef = useRef<number | null>(null);

  const handleFileSelected = async (file: File) => {
    setUploadedFile(file);
    setError(null);
    await analyzeDocument(file);
  };

  const analyzeDocument = async (file: File) => {
    setIsAnalyzing(true);
    setProgress(0);
    setError(null);
    analysisTimeoutRef.current = window.setTimeout(() => {
      setIsAnalyzing(false);
      setError('Analysis timed out. Please try again or check your connection.');
    }, 60000);
    try {
      setProgress(10);
      setProgress(25);
      let extractedText = '';
      try {
        extractedText = await FileProcessor.extractTextFromPDF(file);
      } catch (extractErr) {
        setIsAnalyzing(false);
        setError('Failed to extract text from PDF. Please ensure the file is a valid PDF and try again.');
        return;
      }
      setProgress(50);
      const analysis = await GeminiService.analyzeResearchPaper(extractedText, file.name);
      setProgress(75);
      try {
        const savedPaper = LocalStorageService.savePaper({
          title: analysis.paper_metadata.title,
          content: extractedText,
          filename: file.name,
          analysis: analysis
        });
        setProgress(100);
        setAnalysisResults(analysis);
        const paperData = {
          id: savedPaper.id,
          file,
          analysis,
          uploadDate: savedPaper.uploadDate,
          content: extractedText
        };
        onPaperUploaded(paperData);
        setTimeout(() => {
          if (onNavigate) {
            if (typeof onNavigate === 'function') { onNavigate('dashboard'); }
          }
        }, 1000);
      } catch (dbErr) {
        setError('Analysis complete, but failed to save paper locally.');
        setAnalysisResults(analysis);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze document');
    } finally {
      setIsAnalyzing(false);
      const timeoutId = analysisTimeoutRef.current;
      if (typeof timeoutId === 'number') {
        window.clearTimeout(Number(timeoutId));
      }
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setAnalysisResults(null);
    setError(null);
    setProgress(0);
    const timeoutId = analysisTimeoutRef.current;
    if (typeof timeoutId === 'number') {
      window.clearTimeout(Number(timeoutId));
    }
  };

  const getComplexityColor = (score: number) => {
    if (score >= 9) return 'text-red-600 bg-red-100';
    if (score >= 7) return 'text-orange-600 bg-orange-100';
    if (score >= 5) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Research Paper Analysis
          </h1>
          <p className="text-lg md:text-xl text-slate-600">
            Upload your research paper for instant AI-powered complexity assessment and insights.
          </p>
        </div>

        {!uploadedFile ? (
          /* Upload Zone */
          <FileUploader onFileSelected={handleFileSelected} />
        ) : isAnalyzing ? (
          /* Analysis in Progress */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 text-center">
            <div className="space-y-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-teal-100 rounded-2xl flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              
              <div>
                <h3 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">
                  Analyzing Your Research Paper
                </h3>
                <p className="text-slate-600 mb-6">
                  Our AI is performing comprehensive analysis including complexity assessment,
                  domain classification, and methodology evaluation.
                </p>
                
                <div className="bg-slate-100 rounded-full h-3 max-w-md mx-auto mb-4">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-teal-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                <div className="text-sm text-slate-500">
                  {progress < 10 ? 'Checking authentication...' :
                   progress < 25 ? 'Extracting text from PDF...' :
                   progress < 50 ? 'Processing with AI...' :
                   progress < 75 ? 'Analyzing content...' :
                   progress < 100 ? 'Saving results...' : 'Complete!'}
                </div>
              </div>
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 md:p-12 text-center">
            <div className="space-y-6">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              
              <div>
                <h3 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">
                  Analysis Failed
                </h3>
                <p className="text-red-600 mb-6">{error}</p>
                
                <button
                  onClick={resetUpload}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        ) : analysisResults ? (
          /* Analysis Results */
          <div className="space-y-6 md:space-y-8">
            {/* Paper Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900">Analysis Complete</h2>
                    <p className="text-slate-600">Paper successfully analyzed and classified</p>
                  </div>
                </div>
                <button
                  onClick={resetUpload}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Complexity Score */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900">Complexity Score</h3>
                    <Brain className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                    {analysisResults.complexity_score}/10
                  </div>
                  <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getComplexityColor(analysisResults.complexity_score)}`}>
                    {analysisResults.technical_depth}
                  </div>
                </div>

                {/* Domain Classification */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900">Primary Domain</h3>
                    <BarChart3 className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="text-lg font-semibold text-slate-900 mb-2">
                    {analysisResults.domain_primary}
                  </div>
                  <div className="text-sm text-slate-600">
                    {analysisResults.domain_secondary.join(', ')}
                  </div>
                </div>

                {/* Confidence Level */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900">AI Confidence</h3>
                    <AlertCircle className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                    {Math.round(analysisResults.analysis_confidence * 100)}%
                  </div>
                  <div className="text-sm text-slate-600">
                    High reliability
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Methodologies */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-6">Key Methodologies</h3>
                <div className="space-y-3">
                  {analysisResults.key_methodologies.map((method: string, index: number) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                      <span className="text-slate-700">{method}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prerequisites */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-6">Prerequisites</h3>
                <div className="space-y-3">
                  {analysisResults.recommended_prerequisites.map((prereq: string, index: number) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-teal-600 rounded-full flex-shrink-0"></div>
                      <span className="text-slate-700">{prereq}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>Background Required:</strong> {analysisResults.estimated_background_required}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button 
                onClick={() => { if (typeof onNavigate === 'function') { onNavigate('summarize'); } }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Generate Summary
              </button>
              <button 
                onClick={() => { if (typeof onNavigate === 'function') { onNavigate('visualize'); } }}
                className="px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded-xl font-semibold hover:bg-slate-50 transition-colors duration-200"
              >
                Create Visualization
              </button>
              <button 
                onClick={() => { if (typeof onNavigate === 'function') { onNavigate('discover'); } }}
                className="px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded-xl font-semibold hover:bg-slate-50 transition-colors duration-200"
              >
                Find Similar Papers
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};