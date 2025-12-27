
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
  TimeVsBleedingChart, TimeVsStrokeChart, ScatterPlot, DonutChart, 
  BurdenMatrix, BurdenRanking, NihssJitterChart, 
  InteractionChart, PhenotypeChart, ForestPlot, RiskRateChart, ComorbidityBarChart, SexByIndicationChart, IndicationSexAgeChart, StrokeTypeDistribution, StrokeSeverityCard, ProtectiveEfficacyCard, AnatomicalRiskCard, NihssVsAnatomyChart,
  ComplicationRatesList, ProceduralTimeByConfig, ContrastVsCreatinine, ComplicationRate
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
            Dataset: N={report?.totalRecords || 0} • Generated: {new Date(report?.timestamp || Date.now()).toLocaleString()}
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
             {/* Stroke Type & Severity */}
             <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner mb-4">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[11px] mb-4">Stroke Type Distribution</h3>
                   <div className="flex justify-center">
                     <StrokeTypeDistribution strokeTypes={report.neuro.strokeTypesBySex} />
                   </div>
                </div>
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner mb-4">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[11px] mb-4">Stroke Severity (NIHSS)</h3>
                   <StrokeSeverityCard meanNihss={report.neuro.avgNihss} maxNihss={report.neuro.maxNihss} />
                </div>
             </div>
             <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-900 p-4 rounded border border-slate-800">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Graph 1. Stroke Type Distribution</h3>
                   <p className="text-slate-400 text-[11px] leading-relaxed">Grouped bar chart comparing stroke type distribution between males and females. Blue bars represent males, pink bars represent females. Shows the prevalence of ischemic vs hemorrhagic strokes separated by gender, with absolute counts displayed on top of each bar.</p>
                </div>
                <div className="bg-slate-900 p-4 rounded border border-slate-800">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Graph 2. Stroke Severity (NIHSS)</h3>
                   <p className="text-slate-400 text-[11px] leading-relaxed"><strong>Mean Score:</strong> Average National Institutes of Health Stroke Scale (0-42) across all stroke patients in the cohort. <strong>Max Recorded:</strong> The highest NIHSS score observed. Higher scores indicate more severe neurological impairment. NIHSS is the standard scale for assessing acute stroke severity.</p>
                </div>
             </div>

             {/* Burden Matrix & Ranking */}
             <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner mb-4">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[11px] mb-4">Neuro Burden Matrix</h3>
                   <div className="flex justify-center"><BurdenMatrix data={report?.neuro?.burdenMatrix || []} /></div>
                </div>
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner mb-4">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[11px] mb-4">Composite Ranking</h3>
                   <BurdenRanking data={report?.neuro?.burdenMatrix || []} dataAll={report?.neuro?.burdenMatrixAll || []} />
                </div>
             </div>
             <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-900 p-4 rounded border border-slate-800">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Graph 3. Neuro Burden Matrix</h3>
                   <p className="text-slate-400 text-[11px] leading-relaxed"><strong>Formula:</strong> X-axis shows 30-day stroke event rate (%) within each subgroup. Y-axis shows mean NIHSS at diagnosis for stroke-affected patients only. Bubble size represents total cohort size (n) in each subgroup. Colors denote category: Anatomy (amber), Device (cyan), Patient (purple). <strong>Note:</strong> Analysis limited to stroke cohort in neuro tab. <strong>Interpretation:</strong> Upper-right quadrant indicates groups with high stroke frequency and severe neurological outcomes.</p>
                </div>
                <div className="bg-slate-900 p-4 rounded border border-slate-800">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Graph 4. Composite Ranking</h3>
                   <p className="text-slate-400 text-[11px] leading-relaxed"><strong>Visualization:</strong> Stacked bar chart showing patient composition per subgroup. <strong>Light bar:</strong> Total cohort size for that subgroup. <strong>Dark bar overlay:</strong> 30-day stroke event rate (%) within that subgroup. <strong>Labels:</strong> Display absolute patient count (n) and stroke percentage. <strong>Interpretation:</strong> Shows both the size of each population and their stroke risk - larger groups with high stroke rates represent highest overall burden.</p>
                </div>
             </div>

             {/* EPD & CoW Efficacy/Risk Cards */}
             <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner mb-4">
                   <div className="flex items-center justify-between mb-4">
                      <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[11px]">Protective Efficacy (EPD)</h3>
                      <span className="text-xs text-slate-400 font-mono">P={report.neuro.epdStats?.pValue?.toFixed(2) || '0.00'}</span>
                   </div>
                   <ProtectiveEfficacyCard 
                     withEpd={report.neuro.epdStats?.withEpd || { n: 0, rate: 0 }}
                     noEpd={report.neuro.epdStats?.noEpd || { n: 0, rate: 0 }}
                     pValue={report.neuro.epdStats?.pValue || 0}
                   />
                </div>
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner mb-4">
                   <div className="flex items-center justify-between mb-4">
                      <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[11px]">Anatomical Risk (CoW)</h3>
                      <span className="text-xs text-slate-400 font-mono">P={report.neuro.cowStats?.pValue?.toFixed(2) || '0.00'}</span>
                   </div>
                   <AnatomicalRiskCard 
                     incompleteCow={report.neuro.cowStats?.incomplete || { n: 0, rate: 0 }}
                     completeCow={report.neuro.cowStats?.complete || { n: 0, rate: 0 }}
                     pValue={report.neuro.cowStats?.pValue || 0}
                   />
                </div>
             </div>

             {/* EPD & CoW Descriptions */}
             <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-900 p-4 rounded border border-slate-800">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Graph 5. Protective Efficacy (EPD)</h3>
                   <p className="text-slate-400 text-[11px] leading-relaxed">Comparison of stroke event rates between patients with and without Endovascular Procedures (EPD) protection. Demonstrates the protective effect of EPD by showing the percentage difference in stroke occurrence. Statistical significance (p-value) indicates whether the observed difference is meaningful or due to chance.</p>
                </div>
                <div className="bg-slate-900 p-4 rounded border border-slate-800">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Graph 6. Anatomical Risk (Circle of Willis)</h3>
                   <p className="text-slate-400 text-[11px] leading-relaxed">Comparison of stroke event rates based on Circle of Willis (CoW) completeness, an anatomical factor affecting collateral blood flow. Complete CoW provides better alternative circulation routes, potentially reducing stroke risk. Incomplete CoW may limit compensatory blood flow options, increasing vulnerability to arterial occlusion.</p>
                </div>
             </div>

             {/* NIHSS & Interaction Charts */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner mb-4">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[11px] mb-4">EPD vs No EPD NIHSS</h3>
                   <NihssJitterChart 
                     groupA={report.neuro.nihssBreakdown.epdYes} 
                     groupB={report.neuro.nihssBreakdown.epdNo}
                     labelA="EPD (+)"
                     labelB="EPD (-)"
                     colorA="#06b6d4"
                     colorB="#ef4444"
                     pValue={report.neuro.epdStats?.pValue}
                   />
                </div>
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner mb-4">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[11px] mb-4">EPD/CoW Interaction</h3>
                   <InteractionChart stats={report.neuro.interactionStats} />
                </div>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-900 p-4 rounded border border-slate-800">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Graph 7. EPD vs No EPD NIHSS</h3>
                   <p className="text-slate-400 text-[11px] leading-relaxed">Analyzes NIHSS severity distribution among stroke patients, stratified by Endovascular Procedures (EPD) status. Each dot represents a stroke patient's NIHSS score at diagnosis, with the mean value highlighted for each group. Shows how EPD treatment relates to neurological outcome severity in stroke cases.</p>
                </div>
                <div className="bg-slate-900 p-4 rounded border border-slate-800">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Graph 8. EPD/CoW Interaction</h3>
                   <p className="text-slate-400 text-[11px] leading-relaxed">Analyzes the interactive effects between Endovascular Procedures and Circle of Willis (CoW) completeness on patient outcomes. The bubble size represents patient volume, showing how different combinations of EPD status and CoW configuration impact NIHSS scores.</p>
                </div>
             </div>

             {/* NIHSS vs Anatomy & Phenotype */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner mb-4">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[11px] mb-4">Severity vs. Anatomy</h3>
                   <NihssVsAnatomyChart 
                     cowComplete={report.neuro.nihssBreakdown.cowComplete}
                     cowIncomplete={report.neuro.nihssBreakdown.cowIncomplete}
                     pValue={report.neuro.cowStats?.pValue}
                   />
                </div>
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner mb-4">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[11px] mb-4">Stroke Phenotype Distribution</h3>
                   <PhenotypeChart breakdown={report.neuro.typeBreakdown} />
                </div>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-900 p-4 rounded border border-slate-800">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Graph 9. Severity vs. Anatomy</h3>
                   <p className="text-slate-400 text-[11px] leading-relaxed">Comparison of stroke severity (NIHSS scores at diagnosis) between anatomical groups. Individual data points show each stroke patient's NIHSS score, with horizontal lines indicating the mean for each group. Complete Circle of Willis (CoW) shown in cyan, incomplete CoW in amber. Shows whether anatomical variation affects stroke severity outcomes.</p>
                </div>
                <div className="bg-slate-900 p-4 rounded border border-slate-800">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Graph 10. Stroke Phenotype Distribution</h3>
                   <p className="text-slate-400 text-[11px] leading-relaxed">Distribution of stroke subtypes (ischemic, hemorrhagic, mixed) across different risk groups: With EPD, No EPD, Complete CoW, and Incomplete CoW. Stacked bars show the composition and prevalence of each stroke type within each subgroup, helping identify phenotype patterns across protective and anatomical risk factors.</p>
                </div>
             </div>
             <AiSection agentKey="neuro" title="Neuro" generator={generateNeuroInterpretation} icon={Brain} />
           </div>
        )}

        {activeTab === 'safety' && (
           <div className="space-y-8 animate-fade-in">
             <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-6">Complication Matrix by Urgency</h3>
                   <ComplicationMatrix data={report.safety.safetyMatrix} />
                </div>
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-6">Complication Matrix by Device</h3>
                   <ComplicationMatrix data={report.safety.deviceMatrix} />
                </div>
             </div>
             <div className="grid grid-cols-2 gap-6">
               <div className="bg-slate-950 border border-slate-800 rounded px-6 py-4 flex gap-8 items-center justify-start">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded" style={{backgroundColor: '#f59e0b', opacity: 0.8}}></div>
                   <span className="text-[9px] text-slate-300 font-semibold">Endoleak</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded" style={{backgroundColor: '#ef4444', opacity: 0.8}}></div>
                   <span className="text-[9px] text-slate-300 font-semibold">SCI</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded" style={{backgroundColor: '#ec4899', opacity: 0.8}}></div>
                   <span className="text-[9px] text-slate-300 font-semibold">Bleeding</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded" style={{backgroundColor: '#8b5cf6', opacity: 0.8}}></div>
                   <span className="text-[9px] text-slate-300 font-semibold">Stroke</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded" style={{backgroundColor: '#f87171', opacity: 0.8}}></div>
                   <span className="text-[9px] text-slate-300 font-semibold">Death</span>
                 </div>
               </div>
               <div className="bg-slate-950 border border-slate-800 rounded px-6 py-4 flex gap-8 items-center justify-start">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded" style={{backgroundColor: '#f59e0b', opacity: 0.8}}></div>
                   <span className="text-[9px] text-slate-300 font-semibold">Endoleak</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded" style={{backgroundColor: '#ef4444', opacity: 0.8}}></div>
                   <span className="text-[9px] text-slate-300 font-semibold">SCI</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded" style={{backgroundColor: '#ec4899', opacity: 0.8}}></div>
                   <span className="text-[9px] text-slate-300 font-semibold">Bleeding</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded" style={{backgroundColor: '#8b5cf6', opacity: 0.8}}></div>
                   <span className="text-[9px] text-slate-300 font-semibold">Stroke</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded" style={{backgroundColor: '#f87171', opacity: 0.8}}></div>
                   <span className="text-[9px] text-slate-300 font-semibold">Death</span>
                 </div>
               </div>
             </div>
             <div className="grid grid-cols-2 gap-6 mb-8">
               <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                 <h4 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Graph 1. Complication Matrix by Urgency</h4>
                 <p className="text-[10px] text-slate-400 leading-relaxed">Comparative analysis of endoleak and spinal ischemia (SCI) rates stratified by procedure urgency. Elective procedures show 17.9% endoleak vs 18.2% in urgent cases, with SCI rates of 5.1% and 0.0% respectively.</p>
               </div>
               <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                 <h4 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Graph 2. Complication Matrix by Device</h4>
                 <p className="text-[10px] text-slate-400 leading-relaxed">Comparative analysis of endoleak and spinal ischemia (SCI) rates across different stentgraft systems (NEXUS, COOK arch, RelayBranch, Gore TAG). Allows assessment of device-specific complication profiles in this patient cohort.</p>
               </div>
             </div>
             <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-6">Complication Matrix by Procedure Type</h3>
                   <ComplicationMatrix data={report.safety.procTypeMatrix} />
                </div>
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-6">Complication Matrix by Indication</h3>
                   <ComplicationMatrix data={report.safety.indicationMatrix} />
                </div>
             </div>
             <div className="grid grid-cols-2 gap-6">
               <div className="bg-slate-950 border border-slate-800 rounded px-6 py-4 flex gap-8 items-center justify-start">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded" style={{backgroundColor: '#f59e0b', opacity: 0.8}}></div>
                   <span className="text-[9px] text-slate-300 font-semibold">Endoleak</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded" style={{backgroundColor: '#ef4444', opacity: 0.8}}></div>
                   <span className="text-[9px] text-slate-300 font-semibold">SCI</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded" style={{backgroundColor: '#ec4899', opacity: 0.8}}></div>
                   <span className="text-[9px] text-slate-300 font-semibold">Bleeding</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded" style={{backgroundColor: '#8b5cf6', opacity: 0.8}}></div>
                   <span className="text-[9px] text-slate-300 font-semibold">Stroke</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded" style={{backgroundColor: '#f87171', opacity: 0.8}}></div>
                   <span className="text-[9px] text-slate-300 font-semibold">Death</span>
                 </div>
               </div>
               <div className="bg-slate-950 border border-slate-800 rounded px-6 py-4 flex gap-8 items-center justify-start">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded" style={{backgroundColor: '#f59e0b', opacity: 0.8}}></div>
                   <span className="text-[9px] text-slate-300 font-semibold">Endoleak</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded" style={{backgroundColor: '#ef4444', opacity: 0.8}}></div>
                   <span className="text-[9px] text-slate-300 font-semibold">SCI</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded" style={{backgroundColor: '#ec4899', opacity: 0.8}}></div>
                   <span className="text-[9px] text-slate-300 font-semibold">Bleeding</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded" style={{backgroundColor: '#8b5cf6', opacity: 0.8}}></div>
                   <span className="text-[9px] text-slate-300 font-semibold">Stroke</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded" style={{backgroundColor: '#f87171', opacity: 0.8}}></div>
                   <span className="text-[9px] text-slate-300 font-semibold">Death</span>
                 </div>
               </div>
             </div>
             <div className="grid grid-cols-2 gap-6 mb-8">
               <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                 <h4 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Graph 3. Complication Matrix by Procedure Type</h4>
                 <p className="text-[10px] text-slate-400 leading-relaxed">Comparative analysis of endoleak and spinal ischemia (SCI) rates stratified by procedure configuration (Branched, Modular, Fenestrated, LIFS). Enables assessment of configuration-specific complication rates and safety profiles.</p>
               </div>
               <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                 <h4 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Graph 4. Complication Matrix by Indication</h4>
                 <p className="text-[10px] text-slate-400 leading-relaxed">Comparative analysis of endoleak and spinal ischemia (SCI) rates stratified by primary indication (Aneurysm, Dissection, IMH, Ulcer, Trauma, Other). Allows risk assessment and comparison across different pathological conditions.</p>
               </div>
             </div>
             <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-6">Time vs Bleeding Risk</h3>
                   <TimeVsBleedingChart data={report.safety.timeVsBleeding} />
                </div>
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-6">Time vs Stroke Occurrence</h3>
                   <TimeVsStrokeChart data={report.safety.timeVsStroke} />
                </div>
             </div>
             <div className="grid grid-cols-2 gap-6">
               <div className="bg-slate-950 border border-slate-800 rounded px-6 py-4 flex gap-8 items-center justify-start">
                 <div className="flex items-center gap-2">
                   <line x1={0} x2={20} y1={0} y2={0} stroke="#f87171" strokeWidth="8" className="w-5 h-1" style={{display: 'inline-block'}} />
                   <span className="text-[9px] text-slate-300 font-semibold">Major Bleed</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div style={{display: 'inline-block', width: '20px', height: '8px', backgroundColor: '#22d3ee'}}></div>
                   <span className="text-[9px] text-slate-300 font-semibold">No Bleed</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div style={{display: 'inline-block', width: '20px', height: '1px', backgroundColor: '#475569'}}></div>
                   <span className="text-[9px] text-slate-300 font-semibold">Min-Max Range</span>
                 </div>
               </div>
               <div className="bg-slate-950 border border-slate-800 rounded px-6 py-4 flex gap-8 items-center justify-start">
                 <div className="flex items-center gap-2">
                   <div style={{display: 'inline-block', width: '20px', height: '8px', backgroundColor: '#fca5a5'}}></div>
                   <span className="text-[9px] text-slate-300 font-semibold">Stroke Event</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div style={{display: 'inline-block', width: '20px', height: '8px', backgroundColor: '#22d3ee'}}></div>
                   <span className="text-[9px] text-slate-300 font-semibold">No Stroke</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div style={{display: 'inline-block', width: '20px', height: '1px', backgroundColor: '#475569'}}></div>
                   <span className="text-[9px] text-slate-300 font-semibold">Min-Max Range</span>
                 </div>
               </div>
             </div>
             <div className="grid grid-cols-2 gap-6 mb-8">
               <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                 <h4 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Graph 5. Time vs Bleeding Risk</h4>
                 <p className="text-[10px] text-slate-400 leading-relaxed">Procedure duration distribution comparing patients with and without major bleeding complications (BARC ≥3). Box-and-whisker plots show median, interquartile range, and min-max procedure times for each group.</p>
               </div>
               <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                 <h4 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Graph 6. Time vs Stroke Occurrence</h4>
                 <p className="text-[10px] text-slate-400 leading-relaxed">Procedure duration distribution comparing patients with and without 30-day stroke events. Box-and-whisker plots show median, interquartile range, and min-max procedure times for each group. Helps identify if longer procedures increase stroke risk.</p>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-6">Complication Rates</h3>
                   <ComplicationRatesList data={[
                     { label: 'Przeciek Typ I', rate: 19.4, color: '#fbbf24' },
                     { label: 'Przeciek Typ III', rate: 16.1, color: '#fbbf24' },
                     { label: 'AKI (Nerki)', rate: 13.3, color: '#fb923c' },
                     { label: 'Niedokrwienie Rdzenia', rate: 11.1, color: '#f97316' },
                     { label: 'Krwawienie (BARC 3)', rate: 15.4, color: '#f87171' }
                   ]} />
                </div>
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-6">Procedure Time by Procedure Type</h3>
                   <ProceduralTimeByConfig data={report.safety.timeByConfig} />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-6 mb-8">
               <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                 <h4 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Graph 7. Complication Rates</h4>
                 <p className="text-[10px] text-slate-400 leading-relaxed">Summary complication rates ranked by frequency. Penetrating aortic ulcer (Przeciek Typ I) shows highest incidence at 19.4%, followed by Type III endoleaks (16.1%) and major bleeding (BARC ≥3) at 15.4%. Acute kidney injury and spinal ischemia also represented.</p>
               </div>
               <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                 <h4 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Graph 8. Procedure Time by Procedure Type</h4>
                 <p className="text-[10px] text-slate-400 leading-relaxed">Procedure duration distributions by procedure type using box-and-whisker plots. Center line represents median, box shows interquartile range (25-75%), and whiskers extend to min-max values. Enables comparison of procedural complexity across different procedure types.</p>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-6">Contrast Vol. vs Baseline Creatinine</h3>
                   <ContrastVsCreatinine data={report.safety.contrastVsCreatinine || []} />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-6 mb-8">
               <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                 <h4 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Graph 9. Contrast Volume vs Baseline Creatinine</h4>
                 <p className="text-[10px] text-slate-400 leading-relaxed">Scatter plot correlating contrast volume administered with baseline creatinine levels. Red points indicate acute kidney injury (AKI) events, blue points indicate no AKI. Helps identify risk factors for contrast-induced nephropathy in endovascular procedures.</p>
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
           <div className="space-y-8 animate-fade-in">
             {/* Demographics Row */}
             <div>
                <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[11px] mb-4 flex items-center"><Users className="w-4 h-4 mr-2" /> Demographics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                   <div className="bg-slate-950 p-6 rounded border border-slate-800">
                      <h4 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">Mean Age by Sex</h4>
                      <div className="flex justify-around text-center">
                        <div>
                          <div className="text-3xl font-black text-blue-400 mb-1">{report.demographics.ageBySex.Males.mean.toFixed(1)}</div>
                          <div className="text-[9px] text-slate-500 font-mono mb-2">Males (n={report.demographics.ageBySex.Males.n})</div>
                          <div className="text-[8px] text-slate-600">SD: ±{report.demographics.ageBySex.Males.sd.toFixed(1)}</div>
                        </div>
                        <div className="border-l border-slate-800"></div>
                        <div>
                          <div className="text-3xl font-black text-pink-400 mb-1">{report.demographics.ageBySex.Females.mean.toFixed(1)}</div>
                          <div className="text-[9px] text-slate-500 font-mono mb-2">Females (n={report.demographics.ageBySex.Females.n})</div>
                          <div className="text-[8px] text-slate-600">SD: ±{report.demographics.ageBySex.Females.sd.toFixed(1)}</div>
                        </div>
                      </div>
                   </div>
                   <div className="bg-slate-950 p-6 rounded border border-slate-800">
                      <h4 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">Population Summary</h4>
                      <div className="flex justify-around text-center">
                        <div>
                          <div className="text-3xl font-black text-slate-300 mb-1">{report.demographics.sex.n}</div>
                          <div className="text-[9px] text-slate-500 font-mono">Total Patients</div>
                        </div>
                        <div className="border-l border-slate-800"></div>
                        <div>
                          <div className="text-3xl font-black text-cyan-400 mb-1">{report.demographics.age.mean.toFixed(1)}</div>
                          <div className="text-[9px] text-slate-500 font-mono">Overall Mean Age</div>
                          <div className="text-[8px] text-slate-600 mt-1">SD: ±{report.demographics.age.sd.toFixed(1)}</div>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Sex by Indication Chart */}
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner mb-6">
                   <h4 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">Sex Distribution by Primary Indication</h4>
                   <SexByIndicationChart sexByIndication={report.demographics.sexByIndication} total={report.demographics.sex.n} />
                </div>
                <div className="bg-slate-900 p-4 rounded border border-slate-800 mb-8">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Graph 1. Sex Distribution by Primary Indication</h3>
                   <p className="text-slate-400 text-[11px] leading-relaxed">Grouped bar chart showing the distribution of male and female patients across each primary indication (Aneurysm, Dissection, Other). Blue bars represent males, pink bars represent females. Labels on each bar display absolute patient counts. This visualization helps identify gender-based differences in diagnosis prevalence across the three indication categories.</p>
                </div>

                {/* Indication × Sex × Age Chart */}
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner mb-6">
                   <h4 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">Mean Age by Indication & Sex (with Sample Sizes)</h4>
                   <IndicationSexAgeChart data={report.demographics.indicationBySexAge} />
                </div>
                <div className="bg-slate-900 p-4 rounded border border-slate-800 mb-8">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Graph 2. Mean Age by Indication & Sex (with Sample Sizes)</h3>
                   <p className="text-slate-400 text-[11px] leading-relaxed">Scatter plot displaying the relationship between mean age (X-axis) and patient count (Y-axis) for each indication-sex combination. The outer ring color represents indication type (Aneurysm=amber, Dissection=cyan, Other=purple), while the inner circle fill denotes sex (blue=male, pink=female). Each point is labeled with mean age and sample size (n), enabling simultaneous analysis of age distribution, gender patterns, and cohort sizes across all subgroups.</p>
                </div>
             </div>

             {/* Comorbidities Row */}
             <div>
                <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[11px] mb-4 flex items-center"><Activity className="w-4 h-4 mr-2" /> Comorbidities</h3>
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner mb-6">
                   <ComorbidityBarChart comorbidities={report.demographics.comorbidities} total={report.demographics.sex.n} />
                </div>
                <div className="bg-slate-900 p-4 rounded border border-slate-800">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Graph 3. Comorbidities Prevalence</h3>
                   <p className="text-slate-400 text-[11px] leading-relaxed">Horizontal bar chart displaying the prevalence of 21 comorbidities across the patient cohort. Bars are color-coded by condition type and sorted by frequency (highest to lowest). Each bar shows the absolute patient count and percentage of total cohort affected. This visualization enables rapid identification of the most common comorbid conditions and helps assess overall disease burden and risk profile of the study population.</p>
                </div>
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
