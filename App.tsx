import React, { useState } from 'react';
import CRISPEInput from './components/CRISPEInput';
import PromptResult from './components/PromptResult';
import { SparklesIcon, ArrowRightIcon, LanguagesIcon } from './components/Icons';
import { CrispeState, INITIAL_CRISPE_STATE, Language, GeneratedPrompts } from './types';
import { optimizePromptWithSiliconFlow } from './services/apiService';
import { getTranslation } from './locales';

const App: React.FC = () => {
  const [crispeData, setCrispeData] = useState<CrispeState>(INITIAL_CRISPE_STATE);
  const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedPrompts | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingText, setLoadingText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');

  const t = getTranslation(language);

  const handleInputChange = (field: keyof CrispeState, value: string) => {
    setCrispeData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'cn' : 'en');
  };

  const canGenerate = crispeData.instruction.trim().length > 0;

  const handleOptimize = async () => {
    if (!canGenerate) return;
    
    setIsGenerating(true);
    setError(null);
    setGeneratedPrompts(null);
    setLoadingText(t.optimizing);

    try {
      // Use SiliconFlow API service
      const result = await optimizePromptWithSiliconFlow(
        crispeData, 
        language,
        (status) => setLoadingText(status)
      );
      setGeneratedPrompts(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
      setLoadingText("");
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0f172a] text-slate-200 selection:bg-indigo-500/30 flex flex-col">
      {/* Header */}
      <header className="flex-none border-b border-slate-800 bg-slate-900/50 backdrop-blur-md z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                {t.title}
              </h1>
              <span className="text-xs text-indigo-400 font-mono tracking-wider uppercase">{t.subtitle}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {/* Language Toggle */}
             <button 
               onClick={toggleLanguage}
               className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-all text-xs font-semibold text-slate-300"
             >
               <LanguagesIcon className="w-4 h-4 text-indigo-400" />
               <span>{language === 'en' ? 'English' : '中文'}</span>
             </button>

             <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
               <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
               <span className="text-xs text-slate-400 font-medium">DeepSeek V3 (Cloud)</span>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-0 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 overflow-y-auto lg:overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-full">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-5 flex flex-col lg:h-full lg:min-h-0">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 shadow-xl backdrop-blur-sm flex flex-col lg:h-full lg:min-h-0">
              
              {/* Scrollable Content */}
              <div className="flex-1 p-6 lg:overflow-y-auto">
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-white">{t.inputDetails}</h2>
                    <button 
                     onClick={() => setCrispeData(INITIAL_CRISPE_STATE)}
                     className="text-xs text-slate-500 hover:text-white transition-colors"
                    >
                      {t.clearAll}
                    </button>
                 </div>
                 
                 <CRISPEInput data={crispeData} onChange={handleInputChange} language={language} />
              </div>
              
              {/* Fixed Footer */}
              <div className="flex-none p-6 pt-4 border-t border-slate-700 bg-slate-800/50 rounded-b-xl z-10">
                <button
                  onClick={handleOptimize}
                  disabled={!canGenerate || isGenerating}
                  className={`w-full group relative flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                    canGenerate && !isGenerating
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transform hover:-translate-y-0.5'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isGenerating ? (
                    t.optimizing
                  ) : (
                    <>
                      {t.generateBtn}
                      <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                {!canGenerate && (
                   <p className="text-center mt-2 text-xs text-red-400/80">
                     {t.required}
                   </p>
                )}
                {error && (
                  <p className="text-center mt-2 text-xs text-red-400">
                    {error}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-7 flex flex-col lg:h-full lg:min-h-0 min-h-[500px]">
            <div className="h-full bg-slate-800/50 rounded-xl border border-slate-700/50 p-1 shadow-xl backdrop-blur-sm flex flex-col">
              <div className="flex-1 bg-slate-900/50 rounded-lg p-6 border border-slate-800 flex flex-col min-h-0">
                <PromptResult 
                    prompt={generatedPrompts} 
                    isLoading={isGenerating} 
                    loadingText={loadingText}
                    language={language} 
                />
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default App;