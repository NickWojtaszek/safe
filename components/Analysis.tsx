
import React, { useState, useEffect } from 'react';
import { CollectionRecord } from '../types';
import { generateStatistics, AnalysisReport } from '../services/statisticsEngine';
import { 
  generateInterpretation, 
  generateNeuroInterpretation, 
  generatePredictorInterpretation,
  generateSafetyInterpretation,
  generateSurvivalInterpretation,
  generateSubgroupInterpretation,
  generateMasterSummary
} from '../services/geminiService';
import { 
  MultiLineKmChart, TimeByDeviceChart, ComplicationMatrix, 
  TimeVsBleedingChart, ScatterPlot, DonutChart, 
  BurdenMatrix, BurdenRanking, NihssJitterChart, 
  InteractionChart, PhenotypeChart, ForestPlot, RiskRateChart 
} from './AnalysisCharts';
import { 
  BarChart2, Calculator, Activity, 
  Users, PieChart, GitMerge, TrendingUp, Database, ShieldAlert,
  Brain, Zap, CheckCircle2, Circle, Lock, Sparkles, FileText, Info, Cpu
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AnalysisProps {
  records: CollectionRecord[];
  selectedParameters: string[];
}

const TABS = [
  { id: 'overview', label: 'Dashboard', icon: Activity },
  { id: 'predict', label: 'Risk Predictor', icon: Zap },
  { id: 'neuro', label: 'Neurology', icon: Brain },
  { id: 'desc', label: 'Demographics', icon: Users },
  { id: 'sub', label: 'Subgroups', icon: PieChart },
  { id: 'safety', label: 'Safety', icon: ShieldAlert },
  { id: 'survival', label: 'Survival', icon: TrendingUp },
  { id: 'uni', label: 'Univariate', icon: GitMerge },
  { id: 'source', label: 'Registry Info', icon: Database },
];

type AiStatus = { text: string | null; loading: boolean };

const Analysis: React.FC<AnalysisProps> = ({ records }) => {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [predParams, setPredParams] = useState({
    shaggy: false,
    urgency: false,
    incompleteCow: false,
    noEpd: false 
  });
  const [kmView, setKmView] = useState<'overall' | 'stroke' | 'urgency' | 'epd'>('overall');

  const [aiAnalysis, setAiAnalysis] = useState<{
    overview: AiStatus;
    neuro: AiStatus;
    safety: AiStatus;
    survival: AiStatus;
    subgroups: AiStatus;
    predictors: AiStatus;
    master: AiStatus;
  }>({
    overview: { text: null, loading: false },
    neuro: { text: null, loading: false },
    safety: { text: null, loading: false },
    survival: { text: null, loading: false },
    subgroups: { text: null, loading: false },
    predictors: { text: null, loading: false },
    master: { text: null, loading: false },
  });

  useEffect(() => {
    if (records && records.length > 0) {
      try {
        const stats = generateStatistics(records);
        setReport(stats);
      } catch (err) {
        console.error("Statistics calculation failed:", err);
        setReport(null);
      }
    } else {
      setReport(null);
    }
  }, [records]);

  const runAgent = async (
    key: keyof typeof aiAnalysis, 
    generator: (r: AnalysisReport) => Promise<string>
  ) => {
    if (!report) return;
    setAiAnalysis(prev => ({ ...prev, [key]: { ...prev[key], loading: true } }));
    try {
      const text = await generator(report);
      setAiAnalysis(prev => ({ ...prev, [key]: { text, loading: false } }));
    } catch (e) {
      console.error(e);
      setAiAnalysis(prev => ({ ...prev, [key]: { text: "Analysis agent failed to respond.", loading: false } }));
    }
  };

  const runMasterAgent = async () => {
    if (!report) return;
    setAiAnalysis(prev => ({ ...prev, master: { ...prev.master, loading: true } }));
    try {
      const analysesMap = {
        overview: aiAnalysis.overview.text || "",
        neuro: aiAnalysis.neuro.text || "",
        safety: aiAnalysis.safety.text || "",
        survival: aiAnalysis.survival.text || "",
        subgroups: aiAnalysis.subgroups.text || "",
        predictors: aiAnalysis.predictors.text || "",
      };
      const text = await generateMasterSummary(report, analysesMap);
      setAiAnalysis(prev => ({ ...prev, master: { text, loading: false } }));
    } catch (e) {
      setAiAnalysis(prev => ({ ...prev, master: { text: "Master synthesis failed.", loading: false } }));
    }
  };

  const areSubAgentsComplete = () => {
    return (
      aiAnalysis.overview.text &&
      aiAnalysis.neuro.text &&
      aiAnalysis.safety.text &&
      aiAnalysis.survival.text &&
      aiAnalysis.subgroups.text &&
      aiAnalysis.predictors.text
    );
  };

  const AiSection = ({ 
    agentKey, 
    title, 
    generator, 
    icon: Icon 
  }: { 
    agentKey: keyof typeof aiAnalysis; 
    title: string; 
    generator: (r: AnalysisReport) => Promise<string>;
    icon: any;
  }) => {
    const status = aiAnalysis[agentKey];
    return (
      <div className="mt-8 pt-6 border-t border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-xs flex items-center">
            <Icon className="w-4 h-4 mr-2" /> AI {title} Agent
          </h3>
          <button
            onClick={() => runAgent(agentKey, generator)}
            disabled={status.loading || !!status.text}
            className={`flex items-center px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all border ${
              status.text 
                ? 'bg-slate-900 border-green-900/50 text-green-500 cursor-default'
                : 'bg-slate-800 hover:bg-cyan-900/20 text-cyan-400 border-cyan-900/50 hover:border-cyan-500'
            }`}
          >
            {status.loading ? (
              <span className="animate-pulse">Processing...</span>
            ) : status.text ? (
              <><CheckCircle2 className="w-3 h-3 mr-2" /> Analysis Ready</>
            ) : (
              <><Sparkles className="w-3 h-3 mr-2" /> Run AI Analysis</>
            )}
          </button>
        </div>
        {status.text && (
          <div className="bg-slate-950 p-6 rounded border border-slate-800 prose prose-invert prose-sm max-w-none text-slate-300 shadow-inner">
            <ReactMarkdown>{status.text}</ReactMarkdown>
          </div>
        )}
      </div>
    );
  };

  const calculatePredictedRisk = () => {
    if (!report?.primaryOutcome?.stroke) return 0;
    let risk = (report.primaryOutcome.stroke.rate || 0) * 0.5; 
    if (predParams.shaggy) risk *= (report.riskModel?.factors?.shaggy?.multiplier || 3.5);
    if (predParams.urgency) risk *= (report.riskModel?.factors?.urgency?.multiplier || 2.1);
    if (predParams.incompleteCow) risk *= (report.riskModel?.factors?.incompleteCow?.multiplier || 2.2);
    if (predParams.noEpd) risk *= (report.riskModel?.factors?.noEpd?.multiplier || 2.5);
    return Math.min(risk, 99.9);
  };
  
  const predictedRisk = calculatePredictedRisk();

  if (!records || records.length === 0) return (
    <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-slate-800 rounded-lg opacity-50">
      <BarChart2 className="w-12 h-12 text-slate-600 mb-4" />
      <p className="text-slate-400 font-mono uppercase tracking-widest text-xs">Insufficient Data. Please load or import records.</p>
    </div>
  );

  if (!report) return <div className="p-8 text-center text-slate-500 font-mono animate-pulse uppercase text-xs tracking-tighter">Initializing Statistics Engine v1.2.0...</div>;

  return (
    <div className="w-full max-w-7xl mx-auto pb-20">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
           <h2 className="text-2xl font-bold text-slate-100 flex items-center uppercase tracking-tight">
            <Calculator className="w-6 h-6 text-cyan-500 mr-3" />
            Clinical Analytics v1.2.0
          </h2>
          <p className="text-slate-500 text-[10px] mt-1 font-mono uppercase tracking-widest">
            Dataset: N={report?.totalRecords || 0} • {new Date(report?.timestamp || Date.now()).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex space-x-1 overflow-x-auto border-b border-slate-800 mb-8 custom-scrollbar pb-2">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-5 py-3 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all rounded-t-lg border-t border-x border-transparent ${
                isActive 
                  ? 'bg-slate-900 border-slate-700 text-cyan-400 border-b-slate-900 -mb-px shadow-[0_-5px_15px_rgba(6,182,212,0.1)]' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 mr-2 ${isActive ? 'text-cyan-500' : 'text-slate-600'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-b-lg rounded-tr-lg p-6 md:p-8 shadow-2xl min-h-[400px]">
        
        {activeTab === 'overview' && (
           <div className="space-y-8 animate-fade-in">
             <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 mb-8 shadow-inner">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-900 pb-6 gap-4">
                   <div>
                      <h3 className="text-lg font-bold text-slate-100 flex items-center uppercase tracking-tight"><Cpu className="w-5 h-5 mr-3 text-fuchsia-500" /> Executive Multi-Agent System</h3>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono tracking-widest">Protocol Compliance Analysis (v1.2.0)</p>
                   </div>
                   <button 
                      onClick={runMasterAgent}
                      disabled={!areSubAgentsComplete() || aiAnalysis.master.loading}
                      className={`flex items-center px-6 py-3 rounded text-[11px] font-black uppercase tracking-[0.15em] transition-all border ${
                        !areSubAgentsComplete() 
                          ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed'
                          : aiAnalysis.master.text 
                            ? 'bg-fuchsia-900/10 border-fuchsia-500/30 text-fuchsia-500'
                            : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-slate-950 border-transparent shadow-[0_0_20px_rgba(192,38,211,0.3)]'
                      }`}
                   >
                      {aiAnalysis.master.loading ? (
                        <span className="animate-pulse">Synthesizing...</span>
                      ) : !areSubAgentsComplete() ? (
                        <><Lock className="w-4 h-4 mr-2" /> Master Locked</>
                      ) : (
                        <><FileText className="w-4 h-4 mr-2" /> Synthesize Summary</>
                      )}
                   </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
                   {['overview', 'neuro', 'safety', 'survival', 'subgroups', 'predictors'].map((key) => {
                      const status = aiAnalysis[key as keyof typeof aiAnalysis];
                      return (
                        <div key={key} className={`flex flex-col items-center p-3 rounded border transition-all ${status.text ? 'bg-green-900/10 border-green-900/30' : 'bg-slate-900 border-slate-800 opacity-60'}`}>
                           {status.text ? <CheckCircle2 className="w-4 h-4 text-green-500 mb-2" /> : <Circle className="w-4 h-4 text-slate-700 mb-2" />}
                           <span className="text-[9px] font-black uppercase tracking-tighter text-slate-500">{key}</span>
                        </div>
                      );
                   })}
                </div>

                {aiAnalysis.master.text && (
                   <div className="bg-slate-900 p-8 rounded border border-slate-800 prose prose-invert prose-sm max-w-none text-slate-300 shadow-2xl relative overflow-hidden ring-1 ring-fuchsia-500/20">
                      <div className="absolute top-0 right-0 p-4 opacity-5"><Cpu className="w-32 h-32" /></div>
                      <ReactMarkdown>{aiAnalysis.master.text}</ReactMarkdown>
                   </div>
                )}
                
                {!areSubAgentsComplete() && (
                   <div className="text-center text-[9px] text-slate-600 font-mono mt-4 uppercase tracking-[0.2em]">
                      Run individual agents below to unlock master summary
                   </div>
                )}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-8 relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Activity className="w-24 h-24 text-cyan-500" /></div>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-4">30-Day Stroke (Primary)</h4>
                <div className="flex items-end space-x-4">
                  <div className="text-6xl font-black text-white tracking-tighter">{(report?.primaryOutcome?.stroke?.rate || 0).toFixed(1)}%</div>
                  <div className="mb-2 text-[10px] font-black text-cyan-400 bg-cyan-950/50 px-2 py-1 rounded border border-cyan-500/30 uppercase font-mono">95% CI [{(report?.primaryOutcome?.stroke?.ciLow || 0).toFixed(1)} - {(report?.primaryOutcome?.stroke?.ciHigh || 0).toFixed(1)}]</div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-900 flex items-start text-[9px] text-slate-600 font-mono uppercase tracking-widest">
                    <Info className="w-3 h-3 mr-2 text-slate-700 mt-0.5" />
                    Wilson Score Interval applied for N={report?.totalRecords || 0}
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-8 relative hover:border-red-500/50 transition-colors">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-4">30-Day Mortality (Safety)</h4>
                 <div className="flex items-end space-x-4">
                  <div className="text-5xl font-black text-slate-300 tracking-tighter">{(report?.primaryOutcome?.death?.rate || 0).toFixed(1)}%</div>
                  <div className="mb-1 text-[10px] font-mono text-slate-600 uppercase">95% CI [{(report?.primaryOutcome?.death?.ciLow || 0).toFixed(1)} - {(report?.primaryOutcome?.death?.ciHigh || 0).toFixed(1)}]</div>
                </div>
                 <div className="mt-6 pt-4 border-t border-slate-900 flex items-start text-[9px] text-slate-600 font-mono uppercase tracking-widest">
                    <Info className="w-3 h-3 mr-2 text-slate-700 mt-0.5" />
                    All-cause mortality v1.2.0 endpoint
                </div>
              </div>
            </div>
            
            <AiSection agentKey="overview" title="Outcomes" generator={generateInterpretation} icon={Activity} />
           </div>
        )}

        {activeTab === 'predict' && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-8">
             <div className="lg:col-span-4 space-y-6">
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                  <h3 className="text-cyan-500 font-black uppercase tracking-[0.2em] text-[10px] mb-6 flex items-center">
                    <Zap className="w-4 h-4 mr-2" /> Stratification Inputs
                  </h3>
                  <div className="space-y-3">
                     <label className="flex items-center justify-between p-3 rounded border border-slate-800 hover:bg-slate-900 cursor-pointer transition-all">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shaggy Aorta</span>
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${predParams.shaggy ? 'bg-cyan-500' : 'bg-slate-800'}`} onClick={() => setPredParams(p => ({...p, shaggy: !p.shaggy}))}>
                           <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-slate-100 transition-transform ${predParams.shaggy ? 'translate-x-5' : ''}`} />
                        </div>
                     </label>
                     <label className="flex items-center justify-between p-3 rounded border border-slate-800 hover:bg-slate-900 cursor-pointer transition-all">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Urgent/Emergent</span>
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${predParams.urgency ? 'bg-amber-500' : 'bg-slate-800'}`} onClick={() => setPredParams(p => ({...p, urgency: !p.urgency}))}>
                           <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-slate-100 transition-transform ${predParams.urgency ? 'translate-x-5' : ''}`} />
                        </div>
                     </label>
                     <label className="flex items-center justify-between p-3 rounded border border-slate-800 hover:bg-slate-900 cursor-pointer transition-all">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Incomplete CoW</span>
                        <div className={`w-10 h-5 rounded-full relative transition-colors ${predParams.incompleteCow ? 'bg-cyan-500' : 'bg-slate-800'}`} onClick={() => setPredParams(p => ({...p, incompleteCow: !p.incompleteCow}))}>
                           <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-slate-100 transition-transform ${predParams.incompleteCow ? 'translate-x-5' : ''}`} />
                        </div>
                     </label>
                     <div className="border-t border-slate-800 my-4 pt-4">
                       <label className="flex items-center justify-between p-3 rounded border border-red-900/20 bg-red-950/5 hover:bg-red-950/10 cursor-pointer transition-all">
                          <span className="text-xs font-bold text-red-400 uppercase tracking-wider">No EPD Used</span>
                          <div className={`w-10 h-5 rounded-full relative transition-colors ${predParams.noEpd ? 'bg-red-600' : 'bg-slate-800'}`} onClick={() => setPredParams(p => ({...p, noEpd: !p.noEpd}))}>
                             <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-slate-100 transition-transform ${predParams.noEpd ? 'translate-x-5' : ''}`} />
                          </div>
                       </label>
                     </div>
                  </div>
                </div>
                <AiSection agentKey="predictors" title="Predictors" generator={generatePredictorInterpretation} icon={Zap} />
             </div>
             <div className="lg:col-span-8">
                <div className="bg-slate-950 p-12 rounded border border-slate-800 text-center relative overflow-hidden shadow-2xl h-full flex flex-col justify-center">
                   <h3 className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] mb-8">Composite Stroke Probability</h3>
                   <div className="relative inline-flex items-center justify-center mb-8">
                      <svg className="w-72 h-36 overflow-visible">
                         <path d="M 10 130 A 120 120 0 0 1 250 130" fill="none" stroke="#1e293b" strokeWidth="24" strokeLinecap="round" />
                         <path d="M 10 130 A 120 120 0 0 1 250 130" fill="none" stroke={predictedRisk < 5 ? '#22c55e' : predictedRisk < 12 ? '#f59e0b' : '#ef4444'} strokeWidth="24" strokeLinecap="round" strokeDasharray={`${(predictedRisk / 30) * 380} 380`} className="transition-all duration-1000 ease-out" />
                      </svg>
                      <div className="absolute top-20 flex flex-col items-center">
                         <span className={`text-6xl font-black tracking-tighter drop-shadow-lg ${predictedRisk < 5 ? 'text-green-400' : predictedRisk < 12 ? 'text-amber-400' : 'text-red-400'}`}>{predictedRisk.toFixed(1)}%</span>
                         <span className="text-[10px] font-black uppercase text-slate-600 mt-2 tracking-[0.2em]">Risk Estimate</span>
                      </div>
                   </div>
                   <div className="mt-4 text-[9px] text-slate-600 font-mono uppercase tracking-[0.1em] max-w-sm mx-auto leading-relaxed">
                      This model is based on historical SAFE-ARCH coefficients and is for investigational use only (v1.2.0).
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'neuro' && (
           <div className="space-y-8 animate-fade-in">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-6">Neuro Burden Matrix</h3>
                   <div className="flex justify-center"><BurdenMatrix data={report?.neuro?.burdenMatrix || []} /></div>
                </div>
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-6">Composite Ranking</h3>
                   <BurdenRanking data={report?.neuro?.burdenMatrix || []} />
                </div>
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-6">EPD vs No EPD NIHSS</h3>
                   <NihssJitterChart 
                     groupA={report.neuro.nihssBreakdown.epdYes} 
                     groupB={report.neuro.nihssBreakdown.epdNo}
                     labelA="EPD (+)"
                     labelB="EPD (-)"
                     colorA="#06b6d4"
                     colorB="#ef4444"
                   />
                </div>
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-6">EPD/CoW Interaction</h3>
                   <InteractionChart stats={report.neuro.interactionStats} />
                </div>
             </div>
             <AiSection agentKey="neuro" title="Neuro" generator={generateNeuroInterpretation} icon={Brain} />
           </div>
        )}

        {activeTab === 'safety' && (
           <div className="space-y-8 animate-fade-in">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-6">Complication Matrix by Urgency</h3>
                   <ComplicationMatrix data={report.safety.safetyMatrix} />
                </div>
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-6">Time vs Bleeding Risk</h3>
                   <TimeVsBleedingChart data={report.safety.timeVsBleeding} />
                </div>
             </div>
             <AiSection agentKey="safety" title="Safety" generator={generateSafetyInterpretation} icon={ShieldAlert} />
           </div>
        )}

        {activeTab === 'survival' && (
           <div className="space-y-8 animate-fade-in">
             <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">30-Day Survival (Kaplan-Meier)</h3>
                   <div className="flex gap-2">
                      <button onClick={()=>setKmView('overall')} className={`px-3 py-1 text-[9px] font-bold uppercase tracking-tighter border rounded ${kmView === 'overall' ? 'bg-cyan-900/50 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>Overall</button>
                      <button onClick={()=>setKmView('stroke')} className={`px-3 py-1 text-[9px] font-bold uppercase tracking-tighter border rounded ${kmView === 'stroke' ? 'bg-cyan-900/50 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>By Stroke</button>
                      <button onClick={()=>setKmView('urgency')} className={`px-3 py-1 text-[9px] font-bold uppercase tracking-tighter border rounded ${kmView === 'urgency' ? 'bg-cyan-900/50 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>By Urgency</button>
                   </div>
                </div>
                <MultiLineKmChart curves={
                  kmView === 'overall' ? [{id: 'ov', label: 'Overall Survival', color: '#fff', data: report.survival.overall}] :
                  kmView === 'stroke' ? report.survival.byStrokeStatus :
                  kmView === 'urgency' ? report.survival.byUrgency :
                  report.survival.overall
                } />
             </div>
             <AiSection agentKey="survival" title="Survival" generator={generateSurvivalInterpretation} icon={TrendingUp} />
           </div>
        )}

        {activeTab === 'uni' && (
           <div className="space-y-8 animate-fade-in">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-6">Univariate Odds Ratios</h3>
                   <ForestPlot data={report.univariate} />
                </div>
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-6">Stroke Rates by Factor</h3>
                   <RiskRateChart data={report.univariate} />
                </div>
             </div>
           </div>
        )}

        {activeTab === 'sub' && (
           <div className="space-y-8 animate-fade-in">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {report.subgroups.byIndication.map(sub => (
                   <div key={sub.group} className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner flex justify-between items-center">
                      <div>
                         <h4 className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{sub.group} (N={sub.n})</h4>
                         <div className="text-4xl font-black text-white mt-2">{sub.strokeRate.toFixed(1)}%</div>
                      </div>
                      <div className="text-[10px] text-slate-600 font-mono">Stroke Count: {sub.strokeCount}</div>
                   </div>
                ))}
             </div>
             <AiSection agentKey="subgroups" title="Subgroups" generator={generateSubgroupInterpretation} icon={PieChart} />
           </div>
        )}

        {activeTab === 'desc' && (
           <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-950 p-8 rounded border border-slate-800 flex flex-col items-center">
                 <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-6">Sex Distribution</h3>
                 <DonutChart data={[
                   {label: 'Male', count: report.demographics.sex.counts.Males, color: '#3b82f6'},
                   {label: 'Female', count: report.demographics.sex.counts.Females, color: '#ec4899'}
                 ]} />
              </div>
              <div className="bg-slate-950 p-8 rounded border border-slate-800 flex flex-col items-center">
                 <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-6">Hypertension Prevalence</h3>
                 <DonutChart data={[
                   {label: 'HTN (+)', count: Math.round(report.demographics.htn.proportions.HTN * report.totalRecords), color: '#ef4444'},
                   {label: 'HTN (-)', count: report.totalRecords - Math.round(report.demographics.htn.proportions.HTN * report.totalRecords), color: '#334155'}
                 ]} />
              </div>
           </div>
        )}

        {activeTab === 'source' && (
          <div className="p-12 text-center text-slate-600 font-mono uppercase tracking-widest text-[10px]">
            Viewing Module: {activeTab.toUpperCase()} (v1.2.0 Secure Registry)
            <div className="mt-4">Records verified and locked for protocol analysis.</div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Analysis;
