import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { Dashboard } from './components/Dashboard';
import { ResearchUpload } from './components/ResearchUpload';
import { SummarizationEngine } from './components/SummarizationEngine';
import { VisualizationStudio } from './components/VisualizationStudio';
import { ResearchDiscovery } from './components/ResearchDiscovery';
import { CodeGenerator } from './components/CodeGenerator';
import { ComparisonMatrix } from './components/ComparisonMatrix';
import { CitationNetwork } from './components/CitationNetwork';
import { ContinueFeatures } from './components/ContinueFeatures';
import { Footer } from './components/Footer';
import { DataStore } from './lib/dataStore';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

export type ViewType = 'home' | 'dashboard' | 'upload' | 'summarize' | 'visualize' | 'discover' | 'code' | 'compare' | 'network' | 'continue';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [uploadedPapers, setUploadedPapers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    // Timeout fallback for auth check
    const timeout = setTimeout(() => {
      setTimeoutReached(true);
      setIsAuthChecking(false);
      setIsLoading(false);
    }, 10000); // 10 seconds

    // Check authentication status
    const checkAuth = async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          setUser(user);
          setAuthError(null);
          console.log('Auth check: user', user);
        } catch (error) {
          setAuthError('Authentication failed. Please sign in again.');
          console.error('Error checking auth status:', error);
        } finally {
          setIsAuthChecking(false);
          clearTimeout(timeout);
        }
      } else {
        setIsAuthChecking(false);
        clearTimeout(timeout);
      }
    };

    checkAuth();

    // Set up auth state change listener
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event: AuthChangeEvent, session: Session | null) => {
          setUser(session?.user || null);
          setAuthError(null);
          // Reload papers when auth state changes
          if (session?.user) {
            loadPapers();
          } else {
            setUploadedPapers([]);
          }
        }
      );
      return () => {
        subscription.unsubscribe();
        clearTimeout(timeout);
      };
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!isAuthChecking) {
      loadPapers();
    }
  }, [isAuthChecking]);

  const loadPapers = async () => {
    try {
      const papers = await DataStore.getPapers();
      setUploadedPapers(papers);
    } catch (error) {
      console.error('Error loading papers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaperUploaded = (paper: any) => {
    setUploadedPapers(prev => [paper, ...prev]);
  };

  const renderView = () => {
    if (isLoading || isAuthChecking) {
      if (timeoutReached) {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-red-600">Loading timed out. Please check your connection or try signing in again.</p>
            </div>
          </div>
        );
      }
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading ScoutResearchAI...</p>
          </div>
        </div>
      );
    }
    if (authError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-red-600">{authError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    switch (currentView) {
      case 'home':
        return <Hero onGetStarted={() => setCurrentView('dashboard')} />;
      case 'dashboard':
        return <Dashboard onNavigate={(view: string) => setCurrentView(view as ViewType)} uploadedPapers={uploadedPapers} />;
      case 'upload':
        return <ResearchUpload onPaperUploaded={handlePaperUploaded} />;
      case 'summarize':
        return <SummarizationEngine papers={uploadedPapers} />;
      case 'visualize':
        return <VisualizationStudio papers={uploadedPapers} />;
      case 'discover':
        return <ResearchDiscovery papers={uploadedPapers} />;
      case 'code':
        return <CodeGenerator papers={uploadedPapers} />;
      case 'compare':
        return <ComparisonMatrix papers={uploadedPapers} />;
      case 'network':
        return <CitationNetwork />;
      case 'continue':
        return <ContinueFeatures onContinue={() => setCurrentView('dashboard')} />;
      default:
        return <Hero onGetStarted={() => setCurrentView('dashboard')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation currentView={currentView} onNavigate={(view: ViewType) => setCurrentView(view)} />
      <main className="relative">
        {renderView()}
      </main>
      {currentView === 'home' && <Footer />}
      
      {/* Continue Features Button - Fixed Position */}
      {currentView !== 'home' && currentView !== 'continue' && (
        <button
          onClick={() => setCurrentView('continue')}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 z-50"
        >
          Continue with Remaining Features
        </button>
      )}
    </div>
  );
}

export default App;