import React, { useState, useEffect } from 'react';
import { Brain, Users, Lightbulb, BookOpen, Target, Zap, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { GeminiService, AgeSummary } from '../lib/gemini';
import { SupabaseService } from '../lib/supabase';

interface SummarizationEngineProps {
  papers: any[];
}

export const SummarizationEngine: React.FC<SummarizationEngineProps> = ({ papers }) => {
  const [selectedAge, setSelectedAge] = useState(15);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<AgeSummary | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<any>(papers[0]);
  const [error, setError] = useState<string | null>(null);

  const ageGroups = [
    { age: 12, label: 'Middle School (12-13)', description: 'Basic concepts with simple analogies' },
    { age: 15, label: 'High School (15-16)', description: 'Moderate complexity with real-world examples' },
    { age: 18, label: 'College (18-20)', description: 'Technical depth with academic context' },
    { age: 22, label: 'Graduate (22+)', description: 'Advanced concepts with research implications' }
  ];

  useEffect(() => {
    if (papers.length > 0 && !selectedPaper) {
      setSelectedPaper(papers[0]);
    }
  }, [papers, selectedPaper]);

  const generateSummary = async () => {
    if (!selectedPaper) return;

    setIsGenerating(true);
    setError(null);
    
    try {
      // Check if summary already exists
      const existingSummary = await SupabaseService.getSummary(selectedPaper.id, selectedAge);
      if (existingSummary) {
        setSummary(existingSummary.content);
        setIsGenerating(false);
        return;
      }

      // Generate new summary
      const content = selectedPaper.content || selectedPaper.analysis?.paper_metadata?.title || '';
      const analysis = selectedPaper.analysis;
      let generatedSummary;
      try {
        generatedSummary = await GeminiService.generateAgeSummary(content, selectedAge, analysis);
      } catch (err) {
        setError('Gemini AI failed to generate a summary. Please check your API key, quota, or try again later.');
        setIsGenerating(false);
        return;
      }
      // Save summary
      const userId = await SupabaseService.getCurrentUserId();
      if (!userId) {
        setError('User not authenticated. Please sign in to save summaries.');
        setIsGenerating(false);
        return;
      }
      await SupabaseService.saveSummary({
        paper_id: selectedPaper.id,
        user_id: userId,
        target_age: selectedAge,
        content: generatedSummary
      });
      setSummary(generatedSummary);
    } catch (err) {
      console.error('Error generating summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300 text-center">
            {error}
          </div>
        )}
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            AI-Powered Summarization Engine
          </h1>
          <p className="text-lg md:text-xl text-slate-600">
            Generate age-appropriate explanations with real-world examples and interactive learning elements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Paper Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Select Research Paper</h3>
              {papers.length > 0 ? (
                <div className="space-y-3">
                  {papers.map((paper, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedPaper(paper)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedPaper?.id === paper.id
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-medium text-slate-900 text-sm">
                        {paper.analysis?.paper_metadata?.title || paper.title || paper.file?.name}
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        {paper.analysis?.domain_primary} • Complexity: {paper.analysis?.complexity_score}/10
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 bg-slate-50 rounded-lg">
                  <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600 text-sm">No papers uploaded yet</p>
                </div>
              )}
            </div>

            {/* Age Group Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Target Audience</h3>
              <div className="space-y-3">
                {ageGroups.map((group) => (
                  <div
                    key={group.age}
                    onClick={() => setSelectedAge(group.age)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedAge === group.age
                        ? 'border-teal-200 bg-teal-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-medium text-slate-900 text-sm">{group.label}</div>
                    <div className="text-xs text-slate-600 mt-1">{group.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateSummary}
              disabled={!selectedPaper || isGenerating}
              className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Summary...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Generate Summary</span>
                </div>
              )}
            </button>
          </div>

          {/* Summary Results */}
          <div className="lg:col-span-2">
            {error ? (
              <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 md:p-12 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Generation Failed</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Try Again
                </button>
              </div>
            ) : !summary ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 text-center">
                <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Ready to Generate</h3>
                <p className="text-slate-600">
                  Select a research paper and target age group, then click "Generate Summary" to create 
                  an age-appropriate explanation with examples and learning activities.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Executive Summary */}
                <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl p-6 md:p-8 border border-blue-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-900">Executive Summary</h3>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-base md:text-lg">
                    {summary.executive_summary}
                  </p>
                </div>

                {/* What Is This About */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <Lightbulb className="w-6 h-6 text-amber-600" />
                    <h3 className="text-lg md:text-xl font-bold text-slate-900">What Is This About?</h3>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {summary.what_is_this_about}
                  </p>
                </div>

                {/* Why Should I Care */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <Users className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg md:text-xl font-bold text-slate-900">Why Should I Care?</h3>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {summary.why_should_i_care}
                  </p>
                </div>

                {/* Real World Examples */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg md:text-xl font-bold text-slate-900">Real-World Examples</h3>
                  </div>
                  <div className="space-y-4">
                    {summary.real_world_examples.map((example: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-green-600 text-sm font-bold">{index + 1}</span>
                        </div>
                        <p className="text-slate-700">{example}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fun Facts */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <Zap className="w-6 h-6 text-yellow-600" />
                    <h3 className="text-lg md:text-xl font-bold text-slate-900">Fun Facts</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {summary.fun_facts.map((fact: string, index: number) => (
                      <div key={index} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-slate-700">{fact}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Career Connections */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <Target className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg md:text-xl font-bold text-slate-900">Career Connections</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {summary.career_connections.map((career: string, index: number) => (
                      <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="font-semibold text-blue-900">{career.split(' - ')[0]}</p>
                        <p className="text-blue-700 text-sm">{career.split(' - ')[1]}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Discussion Questions */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <BookOpen className="w-6 h-6 text-indigo-600" />
                    <h3 className="text-lg md:text-xl font-bold text-slate-900">Discussion Questions</h3>
                  </div>
                  <div className="space-y-3">
                    {summary.discussion_questions.map((question: string, index: number) => (
                      <div key={index} className="p-4 bg-indigo-50 rounded-lg">
                        <p className="text-slate-700 font-medium">{question}</p>
                      </div>
                    ))}
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