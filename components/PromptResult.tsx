import React, { useState, useEffect } from 'react';
import { CopyIcon, CheckIcon } from './Icons';
import { Language, GeneratedPrompts } from '../types';
import { getTranslation } from '../locales';

interface PromptResultProps {
  prompt: GeneratedPrompts | null;
  isLoading: boolean;
  loadingText?: string; // Added prop for progress text
  language: Language;
}

const PromptResult: React.FC<PromptResultProps> = ({ prompt, isLoading, loadingText, language }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<Language>(language);
  const t = getTranslation(language);

  useEffect(() => {
    if (prompt) {
        if (prompt.cn && prompt.en) {
            setActiveTab(language);
        } else if (prompt.en) {
            setActiveTab('en');
        }
    }
  }, [prompt, language]);

  const displayedContent = prompt ? (activeTab === 'cn' ? prompt.cn : prompt.en) : null;
  const showTabs = prompt && prompt.cn && prompt.en;

  const handleCopy = async () => {
    if (!displayedContent) return;
    try {
      await navigator.clipboard.writeText(displayedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 p-8 min-h-[400px]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-indigo-400 font-medium animate-pulse">
            {/* Show specific WebLLM progress (e.g., "Loading model 50%") or default text */}
            {loadingText || t.optimizingTitle}
        </p>
        <div className="text-xs text-slate-500 max-w-xs text-center font-mono">
          {/* If loading model, explain it only happens once */}
          {loadingText?.includes('[') ? "First run requires downloading model weights (~1GB)." : t.optimizingDesc}
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 min-h-[400px] text-center border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/20">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">✨</span>
        </div>
        <h3 className="text-lg font-medium text-slate-300 mb-2">{t.readyTitle}</h3>
        <p className="text-sm text-slate-500 max-w-sm">
          {t.readyDesc}
        </p>
        <p className="text-xs text-indigo-400/70 mt-4 border border-indigo-500/20 bg-indigo-500/10 px-2 py-1 rounded">
            Powered by WebLLM (Qwen 1.5B) - Local Browser Inference
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        
        {showTabs ? (
            <div className="flex bg-slate-950/50 p-1 rounded-lg border border-slate-700/50">
                <button
                    onClick={() => setActiveTab('cn')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        activeTab === 'cn'
                            ? 'bg-indigo-500 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                    {t.tabCn}
                </button>
                <button
                    onClick={() => setActiveTab('en')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        activeTab === 'en'
                            ? 'bg-indigo-500 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                    }`}
                >
                    {t.tabEn}
                </button>
            </div>
        ) : (
            <h3 className="text-lg font-semibold text-slate-200">{t.resultTitle}</h3>
        )}

        <button
          onClick={handleCopy}
          className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            copied
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20'
          }`}
        >
          {copied ? (
            <>
              <CheckIcon className="w-4 h-4" /> {t.copied}
            </>
          ) : (
            <>
              <CopyIcon className="w-4 h-4" /> {t.copy}
            </>
          )}
        </button>
      </div>

      <div className="flex-1 relative group">
        <div className="absolute inset-0 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-inner">
           <pre className="h-full w-full p-6 overflow-y-auto font-mono text-sm text-slate-300 whitespace-pre-wrap leading-relaxed scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {displayedContent || "No content available."}
           </pre>
           <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50"></div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-slate-500 text-center">
        Generated by Qwen 2.5 1.5B (WebLLM) • Optimization Framework by CRISPE
      </div>
    </div>
  );
};

export default PromptResult;