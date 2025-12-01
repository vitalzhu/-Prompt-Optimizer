import React from 'react';
import { CrispeState, Language } from '../types';
import { InfoIcon } from './Icons';
import { getTranslation } from '../locales';

interface CRISPEInputProps {
  data: CrispeState;
  onChange: (field: keyof CrispeState, value: string) => void;
  language: Language;
}

const CRISPEInput: React.FC<CRISPEInputProps> = ({ data, onChange, language }) => {
  const t = getTranslation(language);
  
  const fields = [
    { key: 'context', letter: 'C', ...t.fields.context, isTextArea: true },
    { key: 'role', letter: 'R', ...t.fields.role, isTextArea: false },
    { key: 'instruction', letter: 'I', ...t.fields.instruction, isTextArea: true },
    { key: 'specifics', letter: 'S', ...t.fields.specifics, isTextArea: false },
    { key: 'process', letter: 'P', ...t.fields.process, isTextArea: true },
    { key: 'example', letter: 'E', ...t.fields.example, isTextArea: true },
  ];

  return (
    <div className="space-y-6">
      {fields.map((field) => (
        <div key={field.key} className="group">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center justify-center w-6 h-6 rounded bg-indigo-500/20 text-indigo-400 text-xs font-bold border border-indigo-500/30">
              {field.letter}
            </span>
            <label className="text-sm font-semibold text-slate-200">
              {field.label}
            </label>
            <div className="group relative ml-auto">
              <InfoIcon className="w-4 h-4 text-slate-500 cursor-help hover:text-indigo-400 transition-colors" />
              <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-slate-800 text-xs text-slate-300 rounded border border-slate-700 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none">
                {field.description}
              </div>
            </div>
          </div>
          
          {field.isTextArea ? (
            <textarea
              value={data[field.key as keyof CrispeState]}
              onChange={(e) => onChange(field.key as keyof CrispeState, e.target.value)}
              placeholder={field.placeholder}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none h-24"
            />
          ) : (
            <input
              type="text"
              value={data[field.key as keyof CrispeState]}
              onChange={(e) => onChange(field.key as keyof CrispeState, e.target.value)}
              placeholder={field.placeholder}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default CRISPEInput;
