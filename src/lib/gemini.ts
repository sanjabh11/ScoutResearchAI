import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Use gemini-1.5-flash instead of pro for better quota limits
// Use the latest available Gemini model name. If this fails, try 'gemini-1.0-pro' or check Google API docs for updates.
export const geminiModel = genAI.getGenerativeModel({ 
  model: "models/gemini-1.5-flash", // <-- update to full model name per Gemini API
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 4096, // Reduced for flash model
  }
});

export interface ResearchAnalysis {
  complexity_score: number;
  technical_depth: 'basic' | 'intermediate' | 'advanced' | 'expert';
  domain_primary: string;
  domain_secondary: string[];
  key_methodologies: string[];
  estimated_background_required: string;
  recommended_prerequisites: string[];
  analysis_confidence: number;
  paper_metadata: {
    title: string;
    estimated_pages: number;
    estimated_citations: number;
    publication_year: number;
    research_quality: string;
  };
}

export interface AgeSummary {
  executive_summary: string;
  what_is_this_about: string;
  why_should_i_care: string;
  real_world_examples: string[];
  fun_facts: string[];
  career_connections: string[];
  discussion_questions: string[];
  vocabulary_simplified: Record<string, string>;
}

export interface SimilarPaper {
  title: string;
  authors: string[];
  journal: string;
  year: number;
  citations: number;
  similarity_score: number;
  doi: string;
  abstract: string;
  key_similarities: string[];
  quality_metrics: {
    impact_factor: number;
    h_index: number;
    peer_review_score: number;
  };
}

export interface CodeGeneration {
  main_implementation: string;
  test_suite: string;
  documentation: string;
  requirements: string[];
  performance_metrics: {
    accuracy: string;
    inference_time: string;
    parameters: string;
    test_coverage: string;
  };
}

// Helper function to handle API errors with retry logic
async function callGeminiWithRetry(prompt: string, maxRetries = 2): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a quota error
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        throw new Error(
          'API quota exceeded. Please try again later or upgrade your Gemini API plan. ' +
          'Free tier has very limited requests per day. Consider using a paid plan for development.'
        );
      }
      
      // Check if it's a rate limit error
      if (error.message?.includes('rate limit')) {
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          const waitTime = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
      
      // For other errors, don't retry
      break;
    }
  }
  
  throw lastError || new Error('Failed to call Gemini API after retries');
}

export class GeminiService {
  static async analyzeResearchPaper(content: string, filename: string): Promise<ResearchAnalysis> {
    // Truncate content more aggressively to reduce token usage
    const truncatedContent = content.substring(0, 2000);
    
    const prompt = `
Role: Research Analysis Specialist
Context: You are analyzing an uploaded research paper for initial assessment.

TASK: Perform comprehensive research paper analysis with multi-dimensional scoring.

ANALYSIS FRAMEWORK:
1. Technical Complexity Assessment (Scale: 1-10)
   - Mathematical complexity
   - Domain-specific terminology density
   - Methodological sophistication
   - Statistical analysis depth

2. Content Structure Analysis
   - Abstract quality and completeness
   - Literature review comprehensiveness
   - Methodology clarity
   - Results presentation quality
   - Discussion depth

3. Domain Classification
   - Primary research domain
   - Secondary domains
   - Interdisciplinary connections
   - Application areas

Paper Content: ${truncatedContent}...
Filename: ${filename}

OUTPUT FORMAT (JSON only):
{
  "complexity_score": 7,
  "technical_depth": "advanced",
  "domain_primary": "Computer Science",
  "domain_secondary": ["Machine Learning", "Data Science"],
  "key_methodologies": ["Statistical Analysis", "Experimental Design"],
  "estimated_background_required": "Graduate level understanding",
  "recommended_prerequisites": ["Statistics", "Research Methods"],
  "analysis_confidence": 0.85,
  "paper_metadata": {
    "title": "Research Paper Title",
    "estimated_pages": 15,
    "estimated_citations": 25,
    "publication_year": 2023,
    "research_quality": "High"
  }
}

CONSTRAINTS:
- Analyze within 30 seconds
- Provide confidence scores for all assessments
- Identify potential bias or limitations in methodology
- Flag incomplete or low-quality papers
`;

    try {
      const text = await callGeminiWithRetry(prompt);
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error: any) {
      console.error('Error analyzing research paper:', error);
      
      // Provide a more helpful error message
      if (error.message?.includes('quota')) {
        throw new Error(
          'API quota exceeded. The free tier of Gemini API has very limited daily requests. ' +
          'Please wait 24 hours for quota reset or upgrade to a paid plan for higher limits.'
        );
      }
      
      throw new Error(`Failed to analyze research paper: ${error.message}`);
    }
  }

  static async generateAgeSummary(content: string, targetAge: number, analysis: ResearchAnalysis): Promise<AgeSummary> {
    const truncatedContent = content.substring(0, 1500);
    
    const prompt = `
Role: Educational Content Adapter & Science Communication Expert
Context: Convert complex research into age-appropriate educational content.

TARGET AUDIENCE: ${targetAge}-year-old students
COGNITIVE LEVEL: ${targetAge <= 13 ? 'Middle school' : targetAge <= 16 ? 'High school' : targetAge <= 20 ? 'College' : 'Graduate'} level

Research Content: ${truncatedContent}...
Research Domain: ${analysis.domain_primary}
Complexity Score: ${analysis.complexity_score}/10

OUTPUT STRUCTURE (JSON only):
{
  "executive_summary": "2-3 sentence overview in plain English",
  "what_is_this_about": "Detailed explanation using analogies",
  "why_should_i_care": "Relevance to target age group's world",
  "real_world_examples": ["example1", "example2", "example3"],
  "fun_facts": ["fact1", "fact2", "fact3"],
  "career_connections": ["career1", "career2"],
  "discussion_questions": ["question1", "question2", "question3"],
  "vocabulary_simplified": {"technical_term": "simple_explanation"}
}

Create age-appropriate summary for ${targetAge}-year-olds.
`;

    try {
      const text = await callGeminiWithRetry(prompt);
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error: any) {
      console.error('Error generating age summary:', error);
      
      if (error.message?.includes('quota')) {
        throw new Error(
          'API quota exceeded. Please wait for quota reset or upgrade your plan.'
        );
      }
      
      throw new Error(`Failed to generate age-appropriate summary: ${error.message}`);
    }
  }

  static async findSimilarPapers(content: string, analysis: ResearchAnalysis): Promise<SimilarPaper[]> {
    const truncatedContent = content.substring(0, 1500);
    
    const prompt = `
Role: Research Intelligence Analyst & Academic Database Curator
Context: Identify and rank similar research papers using multi-dimensional similarity algorithms.

Research Content: ${truncatedContent}...
Primary Domain: ${analysis.domain_primary}
Key Methodologies: ${analysis.key_methodologies.join(', ')}

Generate 5 similar research papers with realistic details.

OUTPUT FORMAT (JSON only):
{
  "papers": [
    {
      "title": "realistic_paper_title",
      "authors": ["author1", "author2"],
      "journal": "publication_venue",
      "year": 2023,
      "citations": 150,
      "similarity_score": 0.85,
      "doi": "10.xxxx/realistic.doi",
      "abstract": "realistic_abstract_snippet",
      "key_similarities": ["similarity1", "similarity2"],
      "quality_metrics": {
        "impact_factor": 3.5,
        "h_index": 25,
        "peer_review_score": 8.5
      }
    }
  ]
}
`;

    try {
      const text = await callGeminiWithRetry(prompt);
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.papers || [];
    } catch (error: any) {
      console.error('Error finding similar papers:', error);
      
      if (error.message?.includes('quota')) {
        throw new Error(
          'API quota exceeded. Please wait for quota reset or upgrade your plan.'
        );
      }
      
      throw new Error(`Failed to find similar papers: ${error.message}`);
    }
  }

  static async generateCode(content: string, language: string, framework: string, analysis: ResearchAnalysis): Promise<CodeGeneration> {
    const truncatedContent = content.substring(0, 1500);
    
    const prompt = `
Role: Senior Software Architect & Research Implementation Specialist
Context: Transform research methodologies into production-ready, documented code implementations.

Research Content: ${truncatedContent}...
Target Language: ${language}
Framework: ${framework}
Domain: ${analysis.domain_primary}
Methodologies: ${analysis.key_methodologies.join(', ')}

OUTPUT FORMAT (JSON only):
{
  "main_implementation": "complete_production_ready_code",
  "test_suite": "comprehensive_test_code",
  "documentation": "markdown_documentation",
  "requirements": ["dependency1", "dependency2"],
  "performance_metrics": {
    "accuracy": "95%",
    "inference_time": "100ms",
    "parameters": "1M",
    "test_coverage": "90%"
  }
}

Generate production-ready ${language} code using ${framework} that implements the research methodology.
`;

    try {
      const text = await callGeminiWithRetry(prompt);
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error: any) {
      console.error('Error generating code:', error);
      
      if (error.message?.includes('quota')) {
        throw new Error(
          'API quota exceeded. Please wait for quota reset or upgrade your plan.'
        );
      }
      
      throw new Error(`Failed to generate code implementation: ${error.message}`);
    }
  }

  static async generateVisualization(content: string, type: string, analysis: ResearchAnalysis): Promise<any> {
    const truncatedContent = content.substring(0, 1500);
    
    const prompt = `
Role: Data Visualization Expert & Interactive Design Specialist
Context: Transform research data into compelling, interactive visual experiences.

Research Content: ${truncatedContent}...
Visualization Type: ${type}
Domain: ${analysis.domain_primary}

OUTPUT FORMAT (JSON only):
{
  "title": "visualization_title",
  "description": "what_this_shows",
  "data_points": [
    {
      "label": "data_label",
      "value": 75,
      "category": "category_name"
    }
  ],
  "insights": ["insight1", "insight2"],
  "chart_config": {
    "type": "${type}",
    "color_scheme": ["#3b82f6", "#ef4444"],
    "animations": true
  }
}

Generate visualization data for ${type} showing key research insights.
`;

    try {
      const text = await callGeminiWithRetry(prompt);
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error: any) {
      console.error('Error generating visualization:', error);
      
      if (error.message?.includes('quota')) {
        throw new Error(
          'API quota exceeded. Please wait for quota reset or upgrade your plan.'
        );
      }
      
      throw new Error(`Failed to generate visualization: ${error.message}`);
    }
  }
}