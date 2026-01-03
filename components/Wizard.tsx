
import React, { useState } from 'react';
import { DATA_SCHEMA } from '../constants';
import { FieldType, CollectionRecord } from '../types';
import { ArrowRight, ArrowLeft, Save, FileText, AlertTriangle, Info } from 'lucide-react';

interface WizardProps {
  onComplete: (record: CollectionRecord) => void;
  initialRecord?: CollectionRecord | null;
}

const Wizard: React.FC<WizardProps> = ({ onComplete, initialRecord }) => {
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>(initialRecord?.data || {});
  
  const [warnings, setWarnings] = useState<Record<string, string>>({});

  const currentSegment = DATA_SCHEMA[currentSegmentIndex];
  const isLastStep = currentSegmentIndex === DATA_SCHEMA.length - 1;

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    if (warnings[fieldId]) {
      setWarnings(prev => {
        const newWarnings = { ...prev };
        delete newWarnings[fieldId];
        return newWarnings;
      });
    }
  };

  const checkValidation = () => {
    const newWarnings: Record<string, string> = {};
    currentSegment.fields.forEach(field => {
      if (field.required && !formData[field.id]) {
        newWarnings[field.id] = 'Missing value';
      }
    });
    setWarnings(newWarnings);
    return true; 
  };

  const handleNext = () => {
    checkValidation();
    if (isLastStep) {
      const newRecord: CollectionRecord = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        data: formData
      };
      onComplete(newRecord);
      setFormData({});
      setCurrentSegmentIndex(0);
      setWarnings({});
    } else {
      setCurrentSegmentIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentSegmentIndex > 0) {
      setCurrentSegmentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-210px)] min-h-[600px]">
      
      {/* Left Sidebar - Navigation */}
      <div className="col-span-3 bg-slate-900 border border-slate-800 rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950">
          <h3 className="text-slate-400 text-[10px] font-mono uppercase tracking-widest mb-1">CRF PROTOCOL V1.1.5</h3>
          <div className="text-cyan-500 font-bold text-sm">SEGMENT {currentSegmentIndex + 1}/{DATA_SCHEMA.length}</div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar bg-slate-900/40">
          {DATA_SCHEMA.map((segment, idx) => (
            <button
              key={segment.id}
              onClick={() => setCurrentSegmentIndex(idx)}
              className={`w-full text-left px-3 py-2.5 rounded text-[11px] transition-all flex items-center group ${
                idx === currentSegmentIndex 
                  ? 'bg-cyan-900/20 text-cyan-400 border border-cyan-900/50 shadow-sm' 
                  : idx < currentSegmentIndex
                    ? 'text-slate-400 hover:bg-slate-800'
                    : 'text-slate-600 hover:bg-slate-800'
              }`}
            >
              <div className={`w-2 h-2 rounded-full mr-3 shrink-0 ${
                idx === currentSegmentIndex ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 
                idx < currentSegmentIndex ? 'bg-slate-500' : 'bg-slate-800'
              }`} />
              <span className="truncate font-medium">{segment.title.split(': ')[1] || segment.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Area */}
      <div className="col-span-9 bg-slate-900 border border-slate-800 rounded-lg shadow-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-100 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-cyan-500" />
                {currentSegment.title}
              </h2>
              <p className="text-slate-400 mt-1 font-mono text-xs uppercase tracking-wider">{currentSegment.description}</p>
            </div>
            <div className="bg-slate-950 px-3 py-1 rounded border border-slate-800 text-[10px] font-mono text-slate-500">
              V1.1.5 • {currentSegment.id.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Scrollable Form Fields */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-900/50 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {currentSegment.fields.map(field => {
              if (field.type === FieldType.SECTION_HEADER) {
                return (
                  <div key={field.id} className="col-span-2 pt-6 pb-2 border-b border-slate-800 mb-2">
                    <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] flex items-center">
                      <div className="w-1 h-3 bg-cyan-500 mr-2 rounded-sm"></div>
                      {field.label}
                    </h4>
                  </div>
                );
              }

              const isFullWidth = field.type === FieldType.TEXTAREA;
              const hasWarning = !!warnings[field.id];

              return (
                <div key={field.id} className={isFullWidth ? "col-span-2" : "col-span-1"}>
                  <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">
                    {field.label} {hasWarning && <span className="text-amber-500 ml-2 inline-flex items-center font-mono"><AlertTriangle className="w-3 h-3 mr-1" /> REQ</span>}
                  </label>
                  
                  <div className="relative group">
                    {field.type === FieldType.SELECT ? (
                      <select
                        className={`block w-full rounded bg-slate-950 border ${hasWarning ? 'border-amber-900/50' : 'border-slate-800'} text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-sm p-3 transition-colors appearance-none`}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                      >
                        <option value="" className="bg-slate-900 text-slate-500">Wybierz...</option>
                        {field.options?.map(opt => (
                          <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.label}</option>
                        ))}
                      </select>
                    ) : field.type === FieldType.RADIO ? (
                      <div className="flex flex-wrap gap-2">
                        {field.options?.map((opt) => {
                          const isSelected = formData[field.id] === opt.value;
                          return (
                            <label 
                              key={opt.value} 
                              className={`flex-1 min-w-[80px] text-center cursor-pointer border rounded px-3 py-2 text-[10px] font-bold transition-all ${
                                isSelected 
                                  ? 'bg-cyan-900/20 border-cyan-500 text-cyan-400' 
                                  : 'bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-900 hover:border-slate-700'
                              }`}
                            >
                              <input
                                type="radio"
                                className="sr-only"
                                name={field.id}
                                checked={isSelected}
                                onChange={() => handleInputChange(field.id, opt.value)}
                              />
                              {opt.label}
                            </label>
                          );
                        })}
                      </div>
                    ) : field.type === FieldType.TEXTAREA ? (
                      <textarea
                        className={`block w-full rounded bg-slate-950 border ${hasWarning ? 'border-amber-900/50' : 'border-slate-800'} text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-sm p-3 font-mono`}
                        rows={3}
                        placeholder={field.placeholder || "Wprowadź dane..."}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                      />
                    ) : (
                      <div className="flex rounded shadow-sm">
                        <input
                          type={field.type === FieldType.DATE ? 'date' : field.type === FieldType.NUMBER ? 'number' : 'text'}
                          className={`block w-full flex-1 rounded rounded-r-none bg-slate-950 border ${hasWarning ? 'border-amber-900/50' : 'border-slate-800'} text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-sm p-3 font-mono`}
                          placeholder={field.placeholder || "---"}
                          value={formData[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                        />
                        {field.unit && (
                          <span className="inline-flex items-center rounded-r border border-l-0 border-slate-800 bg-slate-950 px-4 text-slate-500 text-[10px] font-mono">
                            {field.unit}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-12 p-4 bg-slate-950 rounded border border-slate-800 flex items-start gap-4 text-[10px] text-slate-500 font-mono">
             <Info className="w-4 h-4 text-cyan-500 shrink-0" />
             <div>
                <p className="font-bold text-slate-300 mb-1 underline">UWAGA PROTOKOLARNA V1.1.5:</p>
                <p>Wszystkie sekcje są zaktualizowane do najnowszego protokołu 1.1. Dane demo v1.1.5 są w pełni kompatybilne z nowymi algorytmami analitycznymi.</p>
             </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 px-8 py-5 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentSegmentIndex === 0}
            className={`flex items-center px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded transition-all ${
              currentSegmentIndex === 0
                ? 'text-slate-700 cursor-not-allowed'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Wstecz
          </button>
          
          <button
            onClick={handleNext}
            className="flex items-center px-8 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-950 bg-cyan-500 rounded hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
          >
            {isLastStep ? (
              <>
                Zatwierdź Pełny Rekord v1.1.5 <Save className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Następny Segment <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Wizard;
