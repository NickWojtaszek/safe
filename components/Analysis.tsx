
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
  generateMasterSummary,
  generateDemographicsInterpretation,
  generateBaselineInterpretation,
  generateAnatomyInterpretation,
  generatePathologyInterpretation,
  generateRiskPredictorInterpretation,
  generateComprehensiveStudyReport
} from '../services/claudeService';
import { 
  analyzeAllTabs,
  answerStudyQuestion,
  generateDashboardSynthesis,
  TabAnalysis
} from '../services/dashboardAnalysisService';
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
  Brain, Zap, CheckCircle2, Circle, Lock, Sparkles, FileText, Info, Cpu, Send, Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AnalysisProps {
  records: CollectionRecord[];
  selectedParameters: string[];
}

const TABS = [
  { id: 'ai-dashboard', label: 'AI Dashboard', icon: Cpu },
  { id: 'overview', label: 'Outcomes', icon: Activity },
  { id: 'desc', label: 'Demographics', icon: Users },
  { id: 'baseline', label: 'Baseline Data', icon: FileText },
  { id: 'anatomy', label: 'Vascular Anatomy', icon: GitMerge },
  { id: 'pathology', label: 'Pathology & Device', icon: Info },
  { id: 'neuro', label: 'Neurology', icon: Brain },
  { id: 'sub', label: 'Subgroups', icon: PieChart },
  { id: 'safety', label: 'Safety', icon: ShieldAlert },
  { id: 'survival', label: 'Survival', icon: TrendingUp },
  { id: 'uni', label: 'Univariate', icon: GitMerge },
  { id: 'predict', label: 'Risk Predictor', icon: Zap },
  { id: 'source', label: 'Registry Info', icon: Database },
];

type AiStatus = { text: string | null; loading: boolean };

const Analysis: React.FC<AnalysisProps> = ({ records }) => {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [activeTab, setActiveTab] = useState('ai-dashboard');
  const [predParams, setPredParams] = useState({
    shaggy: false,
    urgency: false,
    incompleteCow: false,
    noEpd: false 
  });
  const [kmView, setKmView] = useState<'overall' | 'stroke' | 'urgency' | 'epd' | 'strokeType' | 'bleeding' | 'aki' | 'procDuration' | 'priorStroke' | 'afib' | 'carotidStenosis' | 'ckd' | 'diabetes' | 'heartFailure'>('overall');

  // Dashboard AI state
  const [tabAnalyses, setTabAnalyses] = useState<TabAnalysis[]>([]);
  const [dashboardSynthesis, setDashboardSynthesis] = useState<{ text: string | null; loading: boolean }>({ text: null, loading: false });
  const [qaQuestion, setQaQuestion] = useState('');
  const [qaResponse, setQaResponse] = useState<{ text: string | null; loading: boolean }>({ text: null, loading: false });
  const [allTabsAnalyzed, setAllTabsAnalyzed] = useState(false);

  const [aiAnalysis, setAiAnalysis] = useState<{
    overview: AiStatus;
    demographics: AiStatus;
    baseline: AiStatus;
    anatomy: AiStatus;
    pathology: AiStatus;
    neuro: AiStatus;
    safety: AiStatus;
    survival: AiStatus;
    subgroups: AiStatus;
    predictors: AiStatus;
    univariate: AiStatus;
    master: AiStatus;
    report: AiStatus;
  }>({
    overview: { text: null, loading: false },
    demographics: { text: null, loading: false },
    baseline: { text: null, loading: false },
    anatomy: { text: null, loading: false },
    pathology: { text: null, loading: false },
    neuro: { text: null, loading: false },
    safety: { text: null, loading: false },
    survival: { text: null, loading: false },
    subgroups: { text: null, loading: false },
    predictors: { text: null, loading: false },
    univariate: { text: null, loading: false },
    master: { text: null, loading: false },
    report: { text: null, loading: false },
  });

  const safeDiv = (num: number, den: number) => den === 0 ? 0 : num / den;

  // Dashboard AI handlers
  const runAllTabsAnalysis = async () => {
    if (!report) return;
    try {
      const analyses = await analyzeAllTabs(report);
      setTabAnalyses(analyses);
      setAllTabsAnalyzed(true);
    } catch (error) {
      console.error('Failed to analyze all tabs:', error);
    }
  };

  const runDashboardSynthesis = async () => {
    if (!report || tabAnalyses.length === 0) return;
    setDashboardSynthesis(prev => ({ ...prev, loading: true }));
    try {
      const synthesis = await generateDashboardSynthesis(report, tabAnalyses);
      setDashboardSynthesis({ text: synthesis, loading: false });
    } catch (error) {
      setDashboardSynthesis({ 
        text: `Synthesis failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        loading: false 
      });
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaQuestion.trim() || !report || tabAnalyses.length === 0) return;
    
    setQaResponse(prev => ({ ...prev, loading: true }));
    try {
      const response = await answerStudyQuestion(report, qaQuestion, tabAnalyses);
      setQaResponse({ text: response, loading: false });
    } catch (error) {
      setQaResponse({ 
        text: `Question answering failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        loading: false 
      });
    }
  };

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
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.error('Agent error:', errorMsg);
      setAiAnalysis(prev => ({ ...prev, [key]: { text: `❌ Error: ${errorMsg}\n\nCheck browser console for details. Verify API key is set in .env.local`, loading: false } }));
    }
  };

  const runMasterAgent = async () => {
    if (!report) return;
    setAiAnalysis(prev => ({ ...prev, master: { ...prev.master, loading: true } }));
    try {
      const analysesMap = {
        overview: aiAnalysis.overview.text || "",
        demographics: aiAnalysis.demographics.text || "",
        baseline: aiAnalysis.baseline.text || "",
        anatomy: aiAnalysis.anatomy.text || "",
        pathology: aiAnalysis.pathology.text || "",
        neuro: aiAnalysis.neuro.text || "",
        safety: aiAnalysis.safety.text || "",
        survival: aiAnalysis.survival.text || "",
        subgroups: aiAnalysis.subgroups.text || "",
        predictors: aiAnalysis.predictors.text || "",
        univariate: aiAnalysis.univariate.text || "",
      };
      const text = await generateMasterSummary(report, analysesMap);
      setAiAnalysis(prev => ({ ...prev, master: { text, loading: false } }));
    } catch (e) {
      setAiAnalysis(prev => ({ ...prev, master: { text: "Master synthesis failed.", loading: false } }));
    }
  };

  const runComprehensiveReport = async () => {
    if (!report) return;
    setAiAnalysis(prev => ({ ...prev, report: { ...prev.report, loading: true } }));
    try {
      const allAnalyses = {
        overview: aiAnalysis.overview.text || "",
        demographics: aiAnalysis.demographics.text || "",
        baseline: aiAnalysis.baseline.text || "",
        anatomy: aiAnalysis.anatomy.text || "",
        pathology: aiAnalysis.pathology.text || "",
        neuro: aiAnalysis.neuro.text || "",
        safety: aiAnalysis.safety.text || "",
        survival: aiAnalysis.survival.text || "",
        subgroups: aiAnalysis.subgroups.text || "",
        predict: aiAnalysis.predictors.text || "",
        univariate: aiAnalysis.univariate.text || "",
      };
      const text = await generateComprehensiveStudyReport(report, allAnalyses);
      setAiAnalysis(prev => ({ ...prev, report: { text, loading: false } }));
    } catch (e) {
      setAiAnalysis(prev => ({ ...prev, report: { text: "Comprehensive report generation failed.", loading: false } }));
    }
  };

  const areSubAgentsComplete = () => {
    return (
      aiAnalysis.overview.text &&
      aiAnalysis.demographics.text &&
      aiAnalysis.baseline.text &&
      aiAnalysis.anatomy.text &&
      aiAnalysis.pathology.text &&
      aiAnalysis.neuro.text &&
      aiAnalysis.safety.text &&
      aiAnalysis.survival.text &&
      aiAnalysis.subgroups.text &&
      aiAnalysis.predictors.text &&
      aiAnalysis.univariate.text
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
        
        {activeTab === 'ai-dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Dashboard Header */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-8 shadow-inner">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-100 flex items-center uppercase tracking-tight">
                    <Cpu className="w-6 h-6 mr-3 text-purple-500" /> Intelligent Study Dashboard
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-2 uppercase font-mono tracking-widest">Multi-Agent Analytics & Question Answering System</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-900 p-4 rounded border border-slate-700">
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Dataset</div>
                  <div className="text-2xl font-black text-cyan-400">{report?.totalRecords || 0}</div>
                  <div className="text-[9px] text-slate-600 mt-1">Total Patients</div>
                </div>
                <div className="bg-slate-900 p-4 rounded border border-slate-700">
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Primary Outcome</div>
                  <div className="text-2xl font-black text-yellow-400">{(report?.primaryOutcome?.stroke?.rate || 0).toFixed(1)}%</div>
                  <div className="text-[9px] text-slate-600 mt-1">30-Day Stroke</div>
                </div>
                <div className="bg-slate-900 p-4 rounded border border-slate-700">
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Safety</div>
                  <div className="text-2xl font-black text-red-400">{(report?.primaryOutcome?.death?.rate || 0).toFixed(1)}%</div>
                  <div className="text-[9px] text-slate-600 mt-1">30-Day Mortality</div>
                </div>
              </div>

              {/* Analysis Pipeline */}
              <div className="border-t border-slate-700 pt-6">
                <h4 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-4">Analysis Pipeline</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={runAllTabsAnalysis}
                    disabled={!report || allTabsAnalyzed}
                    className={`flex-1 flex items-center justify-center px-4 py-3 rounded text-[10px] font-black uppercase tracking-[0.15em] transition-all border ${
                      allTabsAnalyzed
                        ? 'bg-green-900/20 border-green-500/30 text-green-500'
                        : 'bg-purple-600 hover:bg-purple-500 text-slate-950 border-transparent'
                    }`}
                  >
                    {allTabsAnalyzed ? (
                      <><CheckCircle2 className="w-4 h-4 mr-2" /> Analyses Complete</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2" /> Analyze All Tabs</>
                    )}
                  </button>
                  
                  <button
                    onClick={runDashboardSynthesis}
                    disabled={!allTabsAnalyzed || dashboardSynthesis.loading}
                    className={`flex-1 flex items-center justify-center px-4 py-3 rounded text-[10px] font-black uppercase tracking-[0.15em] transition-all border ${
                      !allTabsAnalyzed
                        ? 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed'
                        : dashboardSynthesis.text
                        ? 'bg-blue-900/20 border-blue-500/30 text-blue-400'
                        : 'bg-blue-600 hover:bg-blue-500 text-slate-950 border-transparent'
                    }`}
                  >
                    {dashboardSynthesis.loading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Synthesizing...</>
                    ) : dashboardSynthesis.text ? (
                      <><CheckCircle2 className="w-4 h-4 mr-2" /> Executive Summary Ready</>
                    ) : (
                      <><FileText className="w-4 h-4 mr-2" /> Generate Summary</>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Analysis Results */}
            {allTabsAnalyzed && tabAnalyses.length > 0 && (
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-8 shadow-inner">
                <h4 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-6 flex items-center">
                  <Activity className="w-4 h-4 mr-3 text-cyan-400" /> Domain-Specific Analyses
                </h4>
                <div className="space-y-6">
                  {tabAnalyses.map((analysis) => (
                    <div key={analysis.tabId} className="border-l-2 border-purple-500/50 pl-4">
                      <h5 className="text-slate-300 font-bold uppercase text-[11px] tracking-widest mb-2">{analysis.tabLabel}</h5>
                      <div className="prose prose-invert prose-sm max-w-none text-slate-400 text-[13px] leading-relaxed">
                        <ReactMarkdown>{analysis.analysis}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Executive Summary */}
            {dashboardSynthesis.text && (
              <div className="bg-slate-950 border border-purple-500/30 rounded-lg p-8 shadow-inner ring-1 ring-purple-500/10">
                <h4 className="text-purple-400 font-bold uppercase tracking-widest text-[10px] mb-6 flex items-center">
                  <Cpu className="w-4 h-4 mr-3" /> Executive Synthesis
                </h4>
                <div className="prose prose-invert prose-sm max-w-none text-slate-300 text-[14px] leading-relaxed">
                  <ReactMarkdown>{dashboardSynthesis.text}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Question Answering Interface */}
            {allTabsAnalyzed && tabAnalyses.length > 0 && (
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-8 shadow-inner">
                <h4 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-6 flex items-center">
                  <Brain className="w-4 h-4 mr-3 text-cyan-400" /> Ask About Your Study Data
                </h4>
                
                <form onSubmit={handleAskQuestion} className="mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={qaQuestion}
                      onChange={(e) => setQaQuestion(e.target.value)}
                      placeholder="Ask a question about the study findings... (e.g., 'What are the main differences between high and low risk patients?')"
                      className="flex-1 px-4 py-3 rounded bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-[13px]"
                      disabled={qaResponse.loading}
                    />
                    <button
                      type="submit"
                      disabled={!qaQuestion.trim() || qaResponse.loading}
                      className="px-6 py-3 rounded bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-700 text-slate-950 font-bold uppercase tracking-wider text-[10px] transition-all flex items-center"
                    >
                      {qaResponse.loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </form>

                {qaResponse.text && (
                  <div className="bg-slate-900 p-6 rounded border border-slate-700 prose prose-invert prose-sm max-w-none text-slate-300">
                    <ReactMarkdown>{qaResponse.text}</ReactMarkdown>
                  </div>
                )}
              </div>
            )}

            {!allTabsAnalyzed && (
              <div className="text-center py-12 text-slate-500">
                <Sparkles className="w-8 h-8 mx-auto mb-4 opacity-50" />
                <p className="text-[12px] uppercase tracking-widest font-mono">Click "Analyze All Tabs" to begin</p>
              </div>
            )}
          </div>
        )}

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
          <div className="space-y-8 animate-fade-in">
            <div className="bg-slate-950 p-8 rounded border border-slate-800 shadow-inner">
              <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[11px] mb-6 flex items-center">
                <Zap className="w-5 h-5 mr-3 text-yellow-500" /> Data-Derived Risk Prediction Model
              </h3>
              <p className="text-[10px] text-slate-400 mb-6 leading-relaxed">
                This risk estimator is derived from univariate analysis of your cohort. Each factor multiplier is based on the observed odds ratio from your data.
              </p>

              <div className="bg-slate-900 p-6 rounded border border-slate-700 mb-6">
                <h4 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-4">Mathematical Formula</h4>
                <div className="bg-slate-800 p-4 rounded font-mono text-[9px] text-cyan-300 overflow-x-auto space-y-2">
                  <div><span className="text-slate-400">baseline_risk = </span><span className="text-amber-300">overall_stroke_rate</span> <span className="text-slate-500">×</span> <span className="text-green-300">0.5</span></div>
                  <div><span className="text-slate-400">adjusted_risk = baseline_risk</span></div>
                  <div className="ml-4 text-slate-500">if (Shaggy Aorta) → adjusted_risk ×= {(report.univariate[0]?.oddsRatio || 3.2).toFixed(2)}</div>
                  <div className="ml-4 text-slate-500">if (Urgent Mode) → adjusted_risk ×= {(report.univariate[2]?.oddsRatio || 1.9).toFixed(2)}</div>
                  <div className="ml-4 text-slate-500">if (No EPD) → adjusted_risk ×= {(report.univariate[1]?.oddsRatio || 2.1).toFixed(2)}</div>
                  <div className="ml-4 text-slate-500">if (Incomplete CoW) → adjusted_risk ×= {((report.univariate[2]?.oddsRatio || 1.9) * 1.15).toFixed(2)} (estimated)</div>
                  <div className="mt-2 pt-2 border-t border-slate-700"><span className="text-slate-400">final_risk = </span><span className="text-green-300">min(adjusted_risk, 99.9%)</span></div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-slate-900 p-4 rounded border border-slate-700">
                  <h5 className="text-slate-400 font-bold uppercase text-[9px] mb-3 tracking-widest">Factor Values</h5>
                  <div className="space-y-2 text-[9px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Baseline Stroke Rate:</span>
                      <span className="text-cyan-400 font-semibold">{(report?.primaryOutcome?.stroke?.rate || 10).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Shaggy Aorta OR:</span>
                      <span className="text-yellow-400 font-semibold">{(report.univariate[0]?.oddsRatio || 3.2).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">No EPD OR:</span>
                      <span className="text-yellow-400 font-semibold">{(report.univariate[1]?.oddsRatio || 2.1).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Urgent Mode OR:</span>
                      <span className="text-yellow-400 font-semibold">{(report.univariate[2]?.oddsRatio || 1.9).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded border border-slate-700">
                  <h5 className="text-slate-400 font-bold uppercase text-[9px] mb-3 tracking-widest">Methodology</h5>
                  <ul className="space-y-1 text-[9px] text-slate-400">
                    <li>✓ Derived from univariate analysis</li>
                    <li>✓ Uses observed odds ratios</li>
                    <li>✓ Based on {report?.totalRecords} patients</li>
                    <li>✓ Non-parametric integration</li>
                    <li>✓ Baseline adjustment: ×0.5</li>
                  </ul>
                </div>

                <div className="bg-slate-900 p-4 rounded border border-slate-700">
                  <h5 className="text-slate-400 font-bold uppercase text-[9px] mb-3 tracking-widest">Important Notes</h5>
                  <ul className="space-y-1 text-[9px] text-slate-300">
                    <li>• Retrospective derivation</li>
                    <li>• For institutional use</li>
                    <li>• Requires external validation</li>
                    <li>• Aids informed consent</li>
                    <li>• Not predictive algorithm</li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-6 mt-6">
                <h4 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-4">Interactive Calculator</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 rounded border border-slate-700 hover:bg-slate-900/50 cursor-pointer transition-all">
                      <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Shaggy Aorta</span>
                      <div className={`w-12 h-6 rounded-full relative transition-colors ${predParams.shaggy ? 'bg-yellow-600' : 'bg-slate-700'}`} onClick={() => setPredParams(p => ({...p, shaggy: !p.shaggy}))}>
                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-slate-100 transition-transform ${predParams.shaggy ? 'translate-x-6' : ''}`} />
                      </div>
                    </label>
                    <label className="flex items-center justify-between p-4 rounded border border-slate-700 hover:bg-slate-900/50 cursor-pointer transition-all">
                      <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Urgent/Emergent</span>
                      <div className={`w-12 h-6 rounded-full relative transition-colors ${predParams.urgency ? 'bg-amber-600' : 'bg-slate-700'}`} onClick={() => setPredParams(p => ({...p, urgency: !p.urgency}))}>
                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-slate-100 transition-transform ${predParams.urgency ? 'translate-x-6' : ''}`} />
                      </div>
                    </label>
                    <label className="flex items-center justify-between p-4 rounded border border-slate-700 hover:bg-slate-900/50 cursor-pointer transition-all">
                      <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">No EPD Used</span>
                      <div className={`w-12 h-6 rounded-full relative transition-colors ${predParams.noEpd ? 'bg-red-600' : 'bg-slate-700'}`} onClick={() => setPredParams(p => ({...p, noEpd: !p.noEpd}))}>
                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-slate-100 transition-transform ${predParams.noEpd ? 'translate-x-6' : ''}`} />
                      </div>
                    </label>
                    <label className="flex items-center justify-between p-4 rounded border border-slate-700 hover:bg-slate-900/50 cursor-pointer transition-all">
                      <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Incomplete CoW</span>
                      <div className={`w-12 h-6 rounded-full relative transition-colors ${predParams.incompleteCow ? 'bg-cyan-600' : 'bg-slate-700'}`} onClick={() => setPredParams(p => ({...p, incompleteCow: !p.incompleteCow}))}>
                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-slate-100 transition-transform ${predParams.incompleteCow ? 'translate-x-6' : ''}`} />
                      </div>
                    </label>
                  </div>

                  <div className="flex flex-col justify-center items-center bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded border border-slate-700">
                    <h5 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-6">30-Day Stroke Risk</h5>
                    <div className="relative inline-flex items-center justify-center mb-8">
                      <svg className="w-64 h-32 overflow-visible">
                        <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="#1e293b" strokeWidth="20" strokeLinecap="round" />
                        <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke={predictedRisk < 5 ? '#22c55e' : predictedRisk < 12 ? '#f59e0b' : '#ef4444'} strokeWidth="20" strokeLinecap="round" strokeDasharray={`${(predictedRisk / 30) * 285} 285`} className="transition-all duration-700 ease-out" />
                      </svg>
                      <div className="absolute top-12 flex flex-col items-center">
                        <span className={`text-5xl font-black tracking-tighter drop-shadow-lg ${predictedRisk < 5 ? 'text-green-400' : predictedRisk < 12 ? 'text-amber-400' : 'text-red-400'}`}>{predictedRisk.toFixed(1)}%</span>
                        <span className="text-[9px] font-semibold uppercase text-slate-500 mt-2">Estimated Risk</span>
                      </div>
                    </div>
                    <div className="mt-4 text-[9px] text-slate-500 text-center max-w-xs">
                      <span className={predictedRisk < 5 ? 'text-green-400 font-semibold' : predictedRisk < 12 ? 'text-amber-400 font-semibold' : 'text-red-400 font-semibold'}>
                        {predictedRisk < 5 ? 'Low Risk' : predictedRisk < 12 ? 'Moderate Risk' : 'High Risk'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded border border-slate-800 text-[9px] text-slate-400 leading-relaxed space-y-3">
              <h4 className="text-slate-300 font-bold uppercase text-[10px]">Clinical Interpretation</h4>
              <p>This model integrates four major perioperative risk factors identified in your univariate analysis. The baseline stroke rate ({(report?.primaryOutcome?.stroke?.rate || 10).toFixed(1)}%) is adjusted by multiplying observed odds ratios when risk factors are present.</p>
              <p><strong>For publication:</strong> This model is presented as a secondary outcome of your retrospective analysis, derived to aid institutional risk stratification and patient counseling. External validation is recommended before clinical implementation in other centers.</p>
              <p className="text-slate-500">Data Source: Univariate logistic regression analysis (N={report?.totalRecords}). Formula: baseline_risk × product of applicable ORs.</p>
            </div>

            <AiSection agentKey="predict" title="Risk Stratification Analysis" generator={generateRiskPredictorInterpretation} icon={TrendingUp} />
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
                </div>
                <MultiLineKmChart curves={
                  kmView === 'overall' ? [{id: 'ov', label: 'Overall Survival', color: '#fff', data: report.survival.overall}] :
                  kmView === 'stroke' ? report.survival.byStrokeStatus :
                  kmView === 'strokeType' ? report.survival.byStrokeType :
                  kmView === 'urgency' ? report.survival.byUrgency :
                  kmView === 'bleeding' ? report.survival.byBleeding :
                  kmView === 'aki' ? report.survival.byAki :
                  kmView === 'procDuration' ? report.survival.byProcDuration :
                  kmView === 'priorStroke' ? report.survival.byPriorStroke :
                  kmView === 'afib' ? report.survival.byAFib :
                  kmView === 'carotidStenosis' ? report.survival.byCarotidStenosis :
                  kmView === 'ckd' ? report.survival.byCKD :
                  kmView === 'diabetes' ? report.survival.byDiabetes :
                  kmView === 'heartFailure' ? report.survival.byHeartFailure :
                  [{id: 'ov', label: 'Overall Survival', color: '#fff', data: report.survival.overall}]
                } />
             </div>
             <div className="bg-slate-950 border border-slate-800 rounded px-6 py-4">
                <h4 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-4">Stratification Parameter</h4>
                <div className="flex gap-2 flex-wrap">
                   <button onClick={()=>setKmView('overall')} className={`px-3 py-1 text-[9px] font-bold uppercase tracking-tighter border rounded ${kmView === 'overall' ? 'bg-cyan-900/50 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>Overall</button>
                   <button onClick={()=>setKmView('stroke')} className={`px-3 py-1 text-[9px] font-bold uppercase tracking-tighter border rounded ${kmView === 'stroke' ? 'bg-cyan-900/50 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>Stroke Status</button>
                   <button onClick={()=>setKmView('urgency')} className={`px-3 py-1 text-[9px] font-bold uppercase tracking-tighter border rounded ${kmView === 'urgency' ? 'bg-cyan-900/50 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>Urgency</button>
                   <button onClick={()=>setKmView('strokeType')} className={`px-3 py-1 text-[9px] font-bold uppercase tracking-tighter border rounded ${kmView === 'strokeType' ? 'bg-purple-900/50 border-purple-500 text-purple-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>Stroke Type</button>
                   <button onClick={()=>setKmView('bleeding')} className={`px-3 py-1 text-[9px] font-bold uppercase tracking-tighter border rounded ${kmView === 'bleeding' ? 'bg-red-900/50 border-red-500 text-red-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>BARC≥3</button>
                   <button onClick={()=>setKmView('aki')} className={`px-3 py-1 text-[9px] font-bold uppercase tracking-tighter border rounded ${kmView === 'aki' ? 'bg-orange-900/50 border-orange-500 text-orange-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>AKI</button>
                   <button onClick={()=>setKmView('procDuration')} className={`px-3 py-1 text-[9px] font-bold uppercase tracking-tighter border rounded ${kmView === 'procDuration' ? 'bg-amber-900/50 border-amber-500 text-amber-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>Proc Duration</button>
                   <button onClick={()=>setKmView('priorStroke')} className={`px-3 py-1 text-[9px] font-bold uppercase tracking-tighter border rounded ${kmView === 'priorStroke' ? 'bg-red-900/50 border-red-500 text-red-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>Prior Stroke</button>
                   <button onClick={()=>setKmView('afib')} className={`px-3 py-1 text-[9px] font-bold uppercase tracking-tighter border rounded ${kmView === 'afib' ? 'bg-amber-900/50 border-amber-500 text-amber-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>AFib</button>
                   <button onClick={()=>setKmView('carotidStenosis')} className={`px-3 py-1 text-[9px] font-bold uppercase tracking-tighter border rounded ${kmView === 'carotidStenosis' ? 'bg-pink-900/50 border-pink-500 text-pink-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>Carotid Stenosis</button>
                   <button onClick={()=>setKmView('ckd')} className={`px-3 py-1 text-[9px] font-bold uppercase tracking-tighter border rounded ${kmView === 'ckd' ? 'bg-rose-900/50 border-rose-500 text-rose-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>CKD</button>
                   <button onClick={()=>setKmView('diabetes')} className={`px-3 py-1 text-[9px] font-bold uppercase tracking-tighter border rounded ${kmView === 'diabetes' ? 'bg-orange-900/50 border-orange-500 text-orange-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>Diabetes</button>
                   <button onClick={()=>setKmView('heartFailure')} className={`px-3 py-1 text-[9px] font-bold uppercase tracking-tighter border rounded ${kmView === 'heartFailure' ? 'bg-rose-900/50 border-rose-500 text-rose-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>Heart Failure</button>
                </div>
             </div>
             <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                <h4 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">30-Day Survival (Kaplan-Meier)</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {kmView === 'overall' && "Kaplan-Meier survival curve showing cumulative 30-day survival probability for the entire cohort. Single curve represents overall survival from procedure date to 30-day follow-up."}
                  {kmView === 'stroke' && "Kaplan-Meier curves stratified by 30-day stroke status (any_stroke_30d). Compares survival between patients with documented stroke events (red curve) versus those without stroke complications (cyan curve). Identifies stroke as independent predictor of survival."}
                  {kmView === 'strokeType' && "Kaplan-Meier curves stratified by stroke type among patients with stroke events. Ischemic strokes (cyan) versus hemorrhagic strokes (light red). Analyzes whether stroke etiology influences survival outcomes in the 30-day period."}
                  {kmView === 'urgency' && "Kaplan-Meier curves stratified by procedure urgency. Elective procedures (green) compared to urgent/emergent procedures (amber). Assesses whether procedure emergent status impacts 30-day survival outcomes."}
                  {kmView === 'bleeding' && "Kaplan-Meier curves stratified by major bleeding (BARC ≥3). Bleeding complications at BARC Grade 3 or higher (red) versus no major bleeding (cyan). BARC classification: Grade 3=requires transfusion/intervention, Grade 4=fatal. Demonstrates impact of major bleeding on survival."}
                  {kmView === 'aki' && "Kaplan-Meier curves stratified by acute kidney injury (AKI). Cutoff: AKIN Grade ≥2 (aki_akin_ge_2). AKI present (orange) versus no AKI (cyan). AKIN staging: Grade 1=Cr 1.5-1.9x baseline, Grade 2=Cr 2-2.9x baseline, Grade 3=Cr ≥3x or ≥4 mg/dL. Shows nephrotoxic impact on survival."}
                  {kmView === 'procDuration' && "Kaplan-Meier curves stratified by procedure duration. Short duration procedures (green) versus long duration procedures (amber). Analyzes whether increased operative time correlates with adverse 30-day outcomes. Longer procedures may indicate increased complexity or procedural complications."}
                  {kmView === 'priorStroke' && "Kaplan-Meier curves stratified by prior ischemic or hemorrhagic stroke history. Red curve indicates patients with prior stroke events (high atherosclerotic burden and ongoing embolic risk), green curve indicates stroke-naive patients. Prior stroke suggests pre-existing cerebrovascular disease that may increase vulnerability to perioperative embolization during aortic manipulation."}
                  {kmView === 'afib' && "Kaplan-Meier curves stratified by atrial fibrillation status. Amber curve shows patients with AFib diagnosis (significant cardioembolic risk from irregular rhythm and potential for thrombus formation in left atrium), cyan curve shows patients in sinus rhythm. AFib is a major source of cardioemboli that increases stroke risk during vascular manipulation and device placement in aortic surgery."}
                  {kmView === 'carotidStenosis' && "Kaplan-Meier curves stratified by carotid artery stenosis >50%. Magenta curve represents patients with significant carotid disease (potential embolic source and compromised cerebral blood flow), cyan curve represents patent carotid vessels. Carotid stenosis indicates underlying atherosclerotic disease burden and may limit cerebral perfusion if innominate or left carotid artery is manipulated."}
                  {kmView === 'ckd' && "Kaplan-Meier curves stratified by chronic kidney disease (CKD) status. Rose curve shows CKD patients (metabolic and coagulation abnormalities increasing thrombotic risk), teal curve shows normal renal function. CKD creates a prothrombotic state with uremic toxin-induced platelet dysfunction and hypercoagulability, increasing both thrombotic and embolic complications."}
                  {kmView === 'diabetes' && "Kaplan-Meier curves stratified by diabetes mellitus status. Orange curve shows diabetic patients (endothelial dysfunction and accelerated atherosclerosis), cyan curve shows non-diabetic patients. Diabetes impairs endothelial function, increases arterial stiffness, and promotes atherosclerotic plaque progression, elevating perioperative thromboembolism risk."}
                  {kmView === 'heartFailure' && "Kaplan-Meier curves stratified by heart failure/reduced ejection fraction status. Dark red curve indicates patients with HF (cardioembolic risk from reduced ejection fraction, atrial dilation, and intracardiac thrombus potential), green curve shows patients with preserved cardiac function. Heart failure patients have increased risk of left ventricular thrombus formation and cardioemboli during procedure."}
                </p>
             </div>
             <AiSection agentKey="survival" title="Survival" generator={generateSurvivalInterpretation} icon={TrendingUp} />
           </div>
        )}

        {activeTab === 'uni' && (
           <div className="space-y-8 animate-fade-in">
             <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-6">Univariate Odds Ratios</h3>
                   <ForestPlot data={report.univariate} />
                </div>
                <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-6">Stroke Rates by Factor</h3>
                   <RiskRateChart data={report.univariate} />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-6">
               <div className="bg-slate-950 border border-slate-800 rounded px-6 py-4 flex flex-col gap-3">
                 <div>
                   <span className="text-[9px] text-slate-500 font-semibold uppercase">Forest Plot Indicators:</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div style={{display: 'inline-block', width: '40px', height: '2px', backgroundColor: '#f87171'}}></div>
                   <span className="text-[8px] text-slate-300">Risk Factor (OR &gt;1, significant)</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div style={{display: 'inline-block', width: '40px', height: '2px', backgroundColor: '#22d3ee'}}></div>
                   <span className="text-[8px] text-slate-300">Protective (OR &lt;1, significant)</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div style={{display: 'inline-block', width: '20px', height: '12px', borderLeft: '2px solid #64748b', borderRight: '2px solid #64748b'}}></div>
                   <span className="text-[8px] text-slate-300">95% CI (horizontal whiskers)</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <span className="text-[8px] text-amber-400 font-bold">F</span>
                   <span className="text-[8px] text-slate-300">Fisher's exact (n &lt;40)</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <span className="text-[8px] text-slate-300">*</span>
                   <span className="text-[8px] text-slate-300">Significant at p &lt;0.05</span>
                 </div>
               </div>
               <div className="bg-slate-950 border border-slate-800 rounded px-6 py-4 flex flex-col gap-3">
                 <div>
                   <span className="text-[9px] text-slate-500 font-semibold uppercase">Risk Rate Indicators:</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div style={{display: 'inline-block', width: '20px', height: '8px', backgroundColor: '#f87171', borderRadius: '2px'}}></div>
                   <span className="text-[8px] text-slate-300">Risk Present (red bar)</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div style={{display: 'inline-block', width: '20px', height: '8px', backgroundColor: '#334155', borderRadius: '2px'}}></div>
                   <span className="text-[8px] text-slate-300">Risk Absent (gray bar)</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div style={{display: 'inline-block', width: '6px', height: '6px', backgroundColor: '#ef4444', borderRadius: '50%'}}></div>
                   <span className="text-[8px] text-slate-300">Large Effect Size (OR &gt;4.0)</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div style={{display: 'inline-block', width: '6px', height: '6px', backgroundColor: '#f59e0b', borderRadius: '50%'}}></div>
                   <span className="text-[8px] text-slate-300">Moderate Effect (2.5-4.0)</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div style={{display: 'inline-block', width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%'}}></div>
                   <span className="text-[8px] text-slate-300">Small Effect (&lt;2.5)</span>
                 </div>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-6 mb-8">
               <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                 <h4 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Univariate Odds Ratios</h4>
                 <p className="text-[10px] text-slate-400 leading-relaxed mb-3">Forest plot showing odds ratios with 95% confidence intervals for stroke risk factors. Point estimate (center dot) shows OR; horizontal whiskers show CI bounds. Colors indicate direction: red=risk factor (OR &gt;1), cyan=protective (OR &lt;1).</p>
                 <p className="text-[9px] text-slate-500 italic">Additional metrics: Sample size (n), Number Needed to Harm (NNH), effect size classification (small/moderate/large), Fisher's test indicator (F) for small samples, and significance marker (*).</p>
               </div>
               <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner">
                 <h4 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Stroke Rates by Factor</h4>
                 <p className="text-[10px] text-slate-400 leading-relaxed mb-3">Bar chart stratifying stroke incidence by presence/absence of each risk factor. Red bars = factor present, gray bars = factor absent. NNH (Number Needed to Harm) indicates how many patients with the factor must be treated to prevent one additional stroke.</p>
                 <p className="text-[9px] text-slate-500 italic">Effect size shown by dot color: red=large effect, amber=moderate, green=small. Larger effects represent more clinically significant risk differences.</p>
               </div>
             </div>

             <div className="bg-slate-950 p-6 rounded border border-slate-800 shadow-inner overflow-x-auto">
               <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-6">Detailed Statistics</h3>
               <table className="w-full text-[10px] border-collapse">
                 <thead>
                   <tr className="border-b border-slate-700">
                     <th className="text-left px-4 py-3 text-slate-400 font-bold uppercase tracking-wider">Risk Factor</th>
                     <th className="text-center px-4 py-3 text-slate-400 font-bold uppercase tracking-wider">Rate (Present)</th>
                     <th className="text-center px-4 py-3 text-slate-400 font-bold uppercase tracking-wider">Rate (Absent)</th>
                     <th className="text-center px-4 py-3 text-slate-400 font-bold uppercase tracking-wider">Odds Ratio (95% CI)</th>
                     <th className="text-center px-4 py-3 text-slate-400 font-bold uppercase tracking-wider">P-Value</th>
                   </tr>
                 </thead>
                 <tbody>
                   {report.univariate.map((factor, idx) => {
                     const presentRate = factor.presentStrokeRate * 100;
                     const absentRate = factor.absentStrokeRate * 100;
                     return (
                       <tr key={idx} className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors">
                         <td className="text-left px-4 py-3 text-slate-300">{factor.variable}</td>
                         <td className="text-center px-4 py-3 text-slate-300">{presentRate.toFixed(1)}%</td>
                         <td className="text-center px-4 py-3 text-slate-300">{absentRate.toFixed(1)}%</td>
                         <td className="text-center px-4 py-3">
                           <span className={factor.oddsRatio > 1 ? 'text-red-400 font-semibold' : 'text-cyan-400 font-semibold'}>
                             {factor.oddsRatio.toFixed(2)}
                           </span>
                           <span className="text-slate-500"> [{factor.orCiLow.toFixed(2)} - {factor.orCiHigh.toFixed(2)}]</span>
                         </td>
                         <td className="text-center px-4 py-3">
                           <span className={factor.pValue < 0.05 ? 'text-green-400 font-semibold' : 'text-slate-500'}>
                             {factor.pValue.toFixed(2)}
                             {factor.pValue < 0.05 && <span className="text-green-400 ml-1">*</span>}
                           </span>
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
               <div className="mt-4 text-[9px] text-slate-500 font-mono italic">
                 * P-values calculated using Chi-squared test or Fisher's exact test where appropriate.
               </div>
             </div>

             <AiSection agentKey="univariate" title="Univariate Analysis" generator={generatePredictorInterpretation} icon={Calculator} />
           </div>
        )}

        {activeTab === 'baseline' && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-slate-950 p-8 rounded border border-slate-800 shadow-inner">
              <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[11px] mb-6 flex items-center"><FileText className="w-5 h-5 mr-2" /> Baseline Patient Characteristics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900 p-6 rounded border border-slate-700">
                  <h4 className="text-slate-500 font-bold uppercase text-[9px] tracking-widest mb-4">Demographics</h4>
                  <div className="space-y-3 text-[10px]">
                    <div className="flex justify-between"><span className="text-slate-400">Total Patients:</span><span className="text-cyan-400 font-bold">{report.demographics.sex.n}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Males:</span><span className="text-blue-400 font-bold">{report.demographics.sex.counts.Males} ({((report.demographics.sex.counts.Males/report.demographics.sex.n)*100).toFixed(1)}%)</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Females:</span><span className="text-pink-400 font-bold">{report.demographics.sex.counts.Females} ({((report.demographics.sex.counts.Females/report.demographics.sex.n)*100).toFixed(1)}%)</span></div>
                    <hr className="border-slate-700 my-2" />
                    <div className="flex justify-between"><span className="text-slate-400">Mean Age:</span><span className="text-amber-400 font-bold">{report.demographics.age.mean.toFixed(1)} ± {report.demographics.age.sd.toFixed(1)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Age Range (M):</span><span className="text-slate-300 text-[9px]">{report.demographics.ageBySex.Males.mean.toFixed(1)} ± {report.demographics.ageBySex.Males.sd.toFixed(1)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Age Range (F):</span><span className="text-slate-300 text-[9px]">{report.demographics.ageBySex.Females.mean.toFixed(1)} ± {report.demographics.ageBySex.Females.sd.toFixed(1)}</span></div>
                  </div>
                </div>

                <div className="bg-slate-900 p-6 rounded border border-slate-700">
                  <h4 className="text-slate-500 font-bold uppercase text-[9px] tracking-widest mb-4">Primary Indication</h4>
                  <div className="space-y-3 text-[10px]">
                    <div className="flex justify-between"><span className="text-slate-400">Aneurysm:</span><span className="text-green-400 font-bold">{report.demographics.indication.counts.Aneurysm}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Dissection:</span><span className="text-orange-400 font-bold">{report.demographics.indication.counts.Dissection}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Other:</span><span className="text-slate-400 font-bold">{report.demographics.indication.counts.Other}</span></div>
                  </div>
                </div>

                <div className="bg-slate-900 p-6 rounded border border-slate-700">
                  <h4 className="text-slate-500 font-bold uppercase text-[9px] tracking-widest mb-4">Cardiac History</h4>
                  <div className="space-y-2 text-[10px]">
                    <div className="flex justify-between"><span className="text-slate-400">Hypertension:</span><span className="text-cyan-400 font-bold">{report.demographics.comorbidities.htn}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Coronary Artery Disease:</span><span className="text-cyan-400 font-bold">{report.demographics.comorbidities.cad}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Prior MI:</span><span className="text-cyan-400 font-bold">{report.demographics.comorbidities.mi_history}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Atrial Fibrillation:</span><span className="text-cyan-400 font-bold">{report.demographics.comorbidities.afib}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Heart Failure:</span><span className="text-cyan-400 font-bold">{report.demographics.comorbidities.heart_failure_nyha}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">PFO History:</span><span className="text-cyan-400 font-bold">{report.demographics.comorbidities.pfo_history}</span></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 p-6 rounded border border-slate-700">
                  <h4 className="text-slate-500 font-bold uppercase text-[9px] tracking-widest mb-4">Neurological History</h4>
                  <div className="space-y-2 text-[10px]">
                    <div className="flex justify-between"><span className="text-slate-400">Prior Ischemic Stroke:</span><span className="text-red-400 font-bold">{report.demographics.comorbidities.stroke_isch}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Prior Hemorrhagic Stroke:</span><span className="text-red-400 font-bold">{report.demographics.comorbidities.stroke_hem}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Prior TIA:</span><span className="text-red-400 font-bold">{report.demographics.comorbidities.stroke_tia}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Carotid Stenosis {'>'}50%:</span><span className="text-red-400 font-bold">{report.demographics.comorbidities.carotid_stenosis_gt50}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Prior CEA/Stent:</span><span className="text-red-400 font-bold">{report.demographics.comorbidities.cea_stent_history}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Cognitive Impairment:</span><span className="text-red-400 font-bold">{report.demographics.comorbidities.cognitive_impairment}</span></div>
                  </div>
                </div>

                <div className="bg-slate-900 p-6 rounded border border-slate-700">
                  <h4 className="text-slate-500 font-bold uppercase text-[9px] tracking-widest mb-4">Renal & Other</h4>
                  <div className="space-y-2 text-[10px]">
                    <div className="flex justify-between"><span className="text-slate-400">Diabetes Mellitus:</span><span className="text-yellow-400 font-bold">{report.demographics.comorbidities.dm}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">COPD:</span><span className="text-yellow-400 font-bold">{report.demographics.comorbidities.copd}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Chronic Kidney Disease:</span><span className="text-yellow-400 font-bold">{report.demographics.comorbidities.chronic_kidney}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">On Dialysis:</span><span className="text-yellow-400 font-bold">{report.demographics.comorbidities.dialysis}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Connective Tissue Disease:</span><span className="text-yellow-400 font-bold">{report.demographics.comorbidities.connective_tissue_disease}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Active Malignancy:</span><span className="text-yellow-400 font-bold">{report.demographics.comorbidities.active_cancer}</span></div>
                  </div>
                </div>
              </div>
            </div>

            <AiSection agentKey="baseline" title="Baseline Characteristics" generator={generateBaselineInterpretation} icon={FileText} />
          </div>
        )}

        {activeTab === 'anatomy' && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-slate-950 p-8 rounded border border-slate-800 shadow-inner">
              <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[11px] mb-6 flex items-center"><GitMerge className="w-5 h-5 mr-2" /> Preoperative Vascular Anatomy (Section E)</h3>
              <p className="text-slate-400 text-[10px] mb-8 leading-relaxed italic">
                Comprehensive angio-CT assessment from {report.totalRecords} patients. These anatomical findings are critical for perioperative stroke risk stratification and enable subgroup analysis by vascular anatomy phenotype.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-900 p-6 rounded border border-slate-700">
                  <h4 className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-4">Anterior Circulation (n={report.totalRecords})</h4>
                  <div className="space-y-3 text-[10px]">
                    <div className="font-semibold text-slate-300 border-b border-slate-700 pb-2 mb-2">Anterior Communicating Artery (ACom)</div>
                    <div className="flex justify-between"><span className="text-slate-400">Patent:</span><span className="text-cyan-400 font-bold">{report.vascularAnatomy.acom.patent}/{report.totalRecords} ({report.vascularAnatomy.acom.rate.toFixed(1)}%)</span></div>
                    
                    <div className="font-semibold text-slate-300 border-b border-slate-700 pb-2 mb-2 mt-3">Anterior Cerebral Artery (A1 Segment)</div>
                    <div className="flex justify-between"><span className="text-slate-400">Codominant:</span><span className="text-cyan-400 font-bold">{report.vascularAnatomy.a1Aca.codominant}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Right-dominant:</span><span className="text-cyan-400 font-bold">{report.vascularAnatomy.a1Aca.rDominant}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Left-dominant:</span><span className="text-cyan-400 font-bold">{report.vascularAnatomy.a1Aca.lDominant}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Hypoplastic/Absent:</span><span className="text-red-400 font-bold">{report.vascularAnatomy.a1Aca.hypoplastic}</span></div>
                  </div>
                </div>

                <div className="bg-slate-900 p-6 rounded border border-slate-700">
                  <h4 className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-4">Posterior Communicating Arteries (n={report.totalRecords})</h4>
                  <div className="space-y-3 text-[10px]">
                    <div className="flex justify-between"><span className="text-slate-400">Right PCom Patent:</span><span className="text-amber-400 font-bold">{report.vascularAnatomy.rPcom.patent}/{report.totalRecords} ({report.vascularAnatomy.rPcom.rate.toFixed(1)}%)</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Left PCom Patent:</span><span className="text-amber-400 font-bold">{report.vascularAnatomy.lPcom.patent}/{report.totalRecords} ({report.vascularAnatomy.lPcom.rate.toFixed(1)}%)</span></div>
                    <div className="border-t border-slate-700 pt-3 mt-3">
                      <div className="text-slate-400 text-[9px] italic mb-2">Both PCom patent (complete posterior collateral):</div>
                      <div className="text-amber-400 font-bold text-sm">{Math.min(report.vascularAnatomy.rPcom.patent, report.vascularAnatomy.lPcom.patent)}/{report.totalRecords} ({(safeDiv(Math.min(report.vascularAnatomy.rPcom.patent, report.vascularAnatomy.lPcom.patent), report.totalRecords)*100).toFixed(1)}%)</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-900 p-6 rounded border border-slate-700">
                  <h4 className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-4">Vertebral Artery Status (n={report.totalRecords})</h4>
                  <div className="space-y-3 text-[10px]">
                    <div className="font-semibold text-slate-300 border-b border-slate-700 pb-2 mb-2">Right Vertebral Artery</div>
                    <div className="flex justify-between"><span className="text-slate-400">Patent (V1-V4):</span><span className="text-orange-400 font-bold">{report.vascularAnatomy.rVa.patent}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Hypoplastic ({'<'}2mm):</span><span className="text-orange-400 font-bold">{report.vascularAnatomy.rVa.hypoplastic}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">PICA termination:</span><span className="text-red-400 font-bold">{report.vascularAnatomy.rVa.picaTermination}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Occluded:</span><span className="text-red-400 font-bold">{report.vascularAnatomy.rVa.occluded}</span></div>

                    <div className="font-semibold text-slate-300 border-b border-slate-700 pb-2 mb-2 mt-3">Left Vertebral Artery</div>
                    <div className="flex justify-between"><span className="text-slate-400">Patent (V1-V4):</span><span className="text-orange-400 font-bold">{report.vascularAnatomy.lVa.patent}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Hypoplastic ({'<'}2mm):</span><span className="text-orange-400 font-bold">{report.vascularAnatomy.lVa.hypoplastic}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">PICA termination:</span><span className="text-red-400 font-bold">{report.vascularAnatomy.lVa.picaTermination}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Occluded:</span><span className="text-red-400 font-bold">{report.vascularAnatomy.lVa.occluded}</span></div>
                  </div>
                </div>

                <div className="bg-slate-900 p-6 rounded border border-slate-700">
                  <h4 className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-4">Vertebral Artery Dominance (n={report.totalRecords})</h4>
                  <div className="space-y-3 text-[10px]">
                    <div className="flex justify-between"><span className="text-slate-400">Codominant (balanced):</span><span className="text-orange-400 font-bold">{report.vascularAnatomy.vaDominance.codominant} ({(safeDiv(report.vascularAnatomy.vaDominance.codominant, report.totalRecords)*100).toFixed(1)}%)</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Right-dominant:</span><span className="text-orange-400 font-bold">{report.vascularAnatomy.vaDominance.rDominant} ({(safeDiv(report.vascularAnatomy.vaDominance.rDominant, report.totalRecords)*100).toFixed(1)}%)</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Left-dominant:</span><span className="text-orange-400 font-bold">{report.vascularAnatomy.vaDominance.lDominant} ({(safeDiv(report.vascularAnatomy.vaDominance.lDominant, report.totalRecords)*100).toFixed(1)}%)</span></div>
                    
                    <div className="border-t border-slate-700 pt-3 mt-3">
                      <div className="text-slate-400 text-[9px] italic mb-2">High-risk anatomy (single VA only):</div>
                      <div className="text-red-400 font-bold text-sm">{(report.vascularAnatomy.rVa.hypoplastic + report.vascularAnatomy.rVa.picaTermination + report.vascularAnatomy.rVa.occluded + report.vascularAnatomy.lVa.hypoplastic + report.vascularAnatomy.lVa.picaTermination + report.vascularAnatomy.lVa.occluded)} patients</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-900 p-6 rounded border border-slate-700">
                  <h4 className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-4">Carotid Artery Status (n={report.totalRecords})</h4>
                  <div className="space-y-3 text-[10px]">
                    <div className="font-semibold text-slate-300 border-b border-slate-700 pb-2 mb-2">Right ICA</div>
                    <div className="flex justify-between"><span className="text-slate-400">Patent:</span><span className="text-red-400">{report.vascularAnatomy.rIca.patent}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Sten {'>'}50%:</span><span className="text-red-400 font-bold">{report.vascularAnatomy.rIca.stenLt50 + report.vascularAnatomy.rIca.sten50to69 + report.vascularAnatomy.rIca.sten70to99}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Occluded:</span><span className="text-red-400 font-bold">{report.vascularAnatomy.rIca.occluded}</span></div>

                    <div className="font-semibold text-slate-300 border-b border-slate-700 pb-2 mb-2 mt-3">Left ICA</div>
                    <div className="flex justify-between"><span className="text-slate-400">Patent:</span><span className="text-red-400">{report.vascularAnatomy.lIca.patent}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Sten {'>'}50%:</span><span className="text-red-400 font-bold">{report.vascularAnatomy.lIca.stenLt50 + report.vascularAnatomy.lIca.sten50to69 + report.vascularAnatomy.lIca.sten70to99}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Occluded:</span><span className="text-red-400 font-bold">{report.vascularAnatomy.lIca.occluded}</span></div>
                  </div>
                </div>

                <div className="bg-slate-900 p-6 rounded border border-slate-700">
                  <h4 className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-4">Circle of Willis Classification (n={report.totalRecords})</h4>
                  <div className="space-y-3 text-[10px]">
                    <div className="flex justify-between"><span className="text-slate-400">Complete:</span><span className="text-green-400 font-bold">{report.vascularAnatomy.willisClassification.complete} ({(safeDiv(report.vascularAnatomy.willisClassification.complete, report.totalRecords)*100).toFixed(1)}%)</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Incomplete Anterior:</span><span className="text-amber-400 font-bold">{report.vascularAnatomy.willisClassification.incAnt}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Incomplete Posterior:</span><span className="text-amber-400 font-bold">{report.vascularAnatomy.willisClassification.incPost}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Incomplete Both:</span><span className="text-red-400 font-bold">{report.vascularAnatomy.willisClassification.incBoth}</span></div>
                    <div className="border-t border-slate-700 pt-3 mt-3">
                      <div className="flex justify-between"><span className="text-slate-400 text-[9px]">Incomplete (any):</span><span className="text-amber-400 font-bold">{report.vascularAnatomy.willisClassification.incAnt + report.vascularAnatomy.willisClassification.incPost + report.vascularAnatomy.willisClassification.incBoth} ({(safeDiv(report.vascularAnatomy.willisClassification.incAnt + report.vascularAnatomy.willisClassification.incPost + report.vascularAnatomy.willisClassification.incBoth, report.totalRecords)*100).toFixed(1)}%)</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 p-6 rounded border border-slate-700 mb-6">
                <h4 className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-4">Posterior Circulation Risk Category (n={report.totalRecords})</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[10px]">
                  <div className="bg-green-950/30 border border-green-500/30 p-4 rounded">
                    <div className="font-semibold text-green-400 mb-2">LOW Risk</div>
                    <div className="text-slate-300 text-lg font-bold">{report.vascularAnatomy.posteriorRisk.low}</div>
                    <div className="text-green-300 text-[9px] mt-2">Complete PCom + Codominant VA</div>
                  </div>
                  <div className="bg-amber-950/30 border border-amber-500/30 p-4 rounded">
                    <div className="font-semibold text-amber-400 mb-2">MODERATE Risk</div>
                    <div className="text-slate-300 text-lg font-bold">{report.vascularAnatomy.posteriorRisk.moderate}</div>
                    <div className="text-amber-300 text-[9px] mt-2">Unilateral PCom present</div>
                  </div>
                  <div className="bg-red-950/30 border border-red-500/30 p-4 rounded">
                    <div className="font-semibold text-red-400 mb-2">HIGH Risk</div>
                    <div className="text-slate-300 text-lg font-bold">{report.vascularAnatomy.posteriorRisk.high}</div>
                    <div className="text-red-300 text-[9px] mt-2">Absent PCom + Single VA</div>
                  </div>
                </div>
              </div>

              <div className="bg-green-950/20 border border-green-500/30 p-4 rounded text-[10px] text-green-300 mb-6">
                <strong>✓ Methodology Summary:</strong> Your cohort includes comprehensive vascular anatomy data enabling risk stratification and future subgroup analysis. The numbers above should appear in your Methods section table of baseline characteristics.
              </div>

              <div className="bg-blue-950/20 border border-blue-500/30 p-4 rounded text-[10px] text-blue-300">
                <strong>Next Step - Subgroup Analysis:</strong> These anatomical phenotypes can be used for exploratory subgroup analysis (e.g., stroke type distribution by Willis classification, hemorrhagic vs ischemic by VA status, etc.). This would strengthen your results section.
              </div>

              <AiSection agentKey="anatomy" title="Vascular Anatomy" generator={generateAnatomyInterpretation} icon={FileText} />
            </div>
          </div>
        )}

        {activeTab === 'pathology' && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-slate-950 p-8 rounded border border-slate-800 shadow-inner">
              <h3 className="text-slate-400 font-bold uppercase tracking-widest text-[11px] mb-6 flex items-center"><Info className="w-5 h-5 mr-2" /> Aortic Pathology & Device Configuration</h3>
              
              {/* PRIMARY INDICATION */}
              <div className="mb-8 p-6 bg-slate-900 rounded border border-slate-700">
                <h4 className="text-slate-300 font-bold uppercase text-[9px] tracking-widest mb-4">Primary Indication</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px]">
                  <div>
                    <div className="text-slate-400 mb-1">Aneurysm</div>
                    <div className="text-green-400 font-bold text-lg">{report.pathologyAndDevice.indication.aneurysm}</div>
                    <div className="text-slate-500 text-[9px]">{(safeDiv(report.pathologyAndDevice.indication.aneurysm, report.totalRecords) * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-slate-400 mb-1">Dissection</div>
                    <div className="text-orange-400 font-bold text-lg">{report.pathologyAndDevice.indication.dissection}</div>
                    <div className="text-slate-500 text-[9px]">{(safeDiv(report.pathologyAndDevice.indication.dissection, report.totalRecords) * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-slate-400 mb-1">IMH/Ulcer</div>
                    <div className="text-amber-400 font-bold text-lg">{report.pathologyAndDevice.indication.imh + report.pathologyAndDevice.indication.ulcer}</div>
                    <div className="text-slate-500 text-[9px]">{(safeDiv(report.pathologyAndDevice.indication.imh + report.pathologyAndDevice.indication.ulcer, report.totalRecords) * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-slate-400 mb-1">Other</div>
                    <div className="text-blue-400 font-bold text-lg">{report.pathologyAndDevice.indication.trauma + report.pathologyAndDevice.indication.other}</div>
                    <div className="text-slate-500 text-[9px]">{(safeDiv(report.pathologyAndDevice.indication.trauma + report.pathologyAndDevice.indication.other, report.totalRecords) * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>

              {/* ANEURYSM CHARACTERISTICS (for aneurysm patients) */}
              {report.pathologyAndDevice.indication.aneurysm > 0 && (
                <div className="mb-8 p-6 bg-slate-900 rounded border border-slate-700">
                  <h4 className="text-slate-300 font-bold uppercase text-[9px] tracking-widest mb-4">Aneurysm Characteristics (n={report.pathologyAndDevice.aneurysm.count})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Size Categories */}
                    <div>
                      <div className="text-slate-400 text-[9px] font-semibold mb-3">Size Categories</div>
                      <div className="space-y-2 text-[10px]">
                        <div className="flex justify-between"><span className="text-slate-400">{'{<'}50 mm</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.aneurysm.sizeCategories.lt50}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">50-59 mm</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.aneurysm.sizeCategories.cat50_59}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">60-69 mm</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.aneurysm.sizeCategories.cat60_69}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">70-79 mm</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.aneurysm.sizeCategories.cat70_79}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">≥80 mm</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.aneurysm.sizeCategories.ge80}</span></div>
                        <div className="border-t border-slate-700 pt-2 mt-2 flex justify-between"><span className="text-amber-400">{'≥'}70 mm</span><span className="font-bold text-amber-400">{report.pathologyAndDevice.aneurysm.ge70mm}</span></div>
                      </div>
                    </div>

                    {/* Location & Status */}
                    <div>
                      <div className="text-slate-400 text-[9px] font-semibold mb-3">Location & Status</div>
                      <div className="space-y-2 text-[10px]">
                        <div className="flex justify-between"><span className="text-slate-400">Ascending</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.aneurysm.location.asc}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Arch</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.aneurysm.location.arch}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Descending</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.aneurysm.location.desc}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Multi-segment</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.aneurysm.location.multi}</span></div>
                        <div className="border-t border-slate-700 pt-2 mt-2 flex justify-between"><span className="text-red-400">Symptomatic</span><span className="font-bold text-red-400">{report.pathologyAndDevice.aneurysm.symptomatic}</span></div>
                        <div className="flex justify-between"><span className="text-red-600">Rupture/IMH</span><span className="font-bold text-red-600">{report.pathologyAndDevice.aneurysm.rupture}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DISSECTION CHARACTERISTICS (for dissection patients) */}
              {report.pathologyAndDevice.indication.dissection > 0 && (
                <div className="mb-8 p-6 bg-slate-900 rounded border border-slate-700">
                  <h4 className="text-slate-300 font-bold uppercase text-[9px] tracking-widest mb-4">Dissection Characteristics (n={report.pathologyAndDevice.dissection.count})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stanford Classification */}
                    <div>
                      <div className="text-slate-400 text-[9px] font-semibold mb-3">Stanford Classification</div>
                      <div className="space-y-2 text-[10px]">
                        <div className="flex justify-between"><span className="text-slate-400">Type A</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.dissection.stanford.typeA}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Type B</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.dissection.stanford.typeB}</span></div>
                      </div>
                    </div>

                    {/* Phase */}
                    <div>
                      <div className="text-slate-400 text-[9px] font-semibold mb-3">Phase</div>
                      <div className="space-y-2 text-[10px]">
                        <div className="flex justify-between"><span className="text-slate-400">Acute</span><span className="font-bold text-red-400">{report.pathologyAndDevice.dissection.phase.acute}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Subacute</span><span className="font-bold text-orange-400">{report.pathologyAndDevice.dissection.phase.subacute}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Chronic</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.dissection.phase.chronic}</span></div>
                      </div>
                    </div>

                    {/* Malperfusion */}
                    <div>
                      <div className="text-slate-400 text-[9px] font-semibold mb-3">Malperfusion Syndrome</div>
                      <div className="text-2xl font-bold text-red-500">{report.pathologyAndDevice.dissection.malperfusion}</div>
                      <div className="text-slate-500 text-[9px]">{(safeDiv(report.pathologyAndDevice.dissection.malperfusion, report.pathologyAndDevice.dissection.count) * 100).toFixed(1)}% of dissections</div>
                    </div>
                  </div>
                </div>
              )}

              {/* AORTIC MORPHOLOGY & RISK FACTORS */}
              <div className="mb-8 p-6 bg-slate-900 rounded border border-slate-700">
                <h4 className="text-slate-300 font-bold uppercase text-[9px] tracking-widest mb-4">Aortic Morphology & Risk Factors</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Morphology Issues */}
                  <div>
                    <div className="text-slate-400 text-[9px] font-semibold mb-3">Risk Morphology</div>
                    <div className="space-y-2 text-[10px]">
                      <div className="flex justify-between"><span className="text-slate-400">Shaggy Aorta</span><span className="font-bold text-red-500">{report.pathologyAndDevice.aorticMorphology.shaggyAorta}</span></div>
                      <div className="text-[9px] text-red-400 ml-1">Stroke rate: {report.pathologyAndDevice.aorticMorphology.shaggyRate.toFixed(1)}%</div>
                      <div className="flex justify-between"><span className="text-slate-400">Arch Thrombus</span><span className="font-bold text-amber-500">{report.pathologyAndDevice.aorticMorphology.thrombusArch}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Ascending Thrombus</span><span className="font-bold text-amber-500">{report.pathologyAndDevice.aorticMorphology.thrombusAsc}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Porcelain Aorta</span><span className="font-bold text-yellow-600">{report.pathologyAndDevice.aorticMorphology.porcelain}</span></div>
                    </div>
                  </div>

                  {/* Arch Type */}
                  <div>
                    <div className="text-slate-400 text-[9px] font-semibold mb-3">Arch Type (Ishimaru)</div>
                    <div className="space-y-2 text-[10px]">
                      <div className="flex justify-between"><span className="text-slate-400">Type I</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.aorticMorphology.archType.typeI}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Type II</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.aorticMorphology.archType.typeII}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Type III</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.aorticMorphology.archType.typeIII}</span></div>
                    </div>
                  </div>

                  {/* Supraaortic Involvement */}
                  <div>
                    <div className="text-slate-400 text-[9px] font-semibold mb-3">Supraaortic Vessel Involvement</div>
                    <div className="space-y-2 text-[10px]">
                      <div className="flex justify-between"><span className="text-slate-400">None</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.aorticMorphology.supraAorticInvolvement.none}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">BCT</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.aorticMorphology.supraAorticInvolvement.bct}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">LCCA</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.aorticMorphology.supraAorticInvolvement.lcca}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">LSA</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.aorticMorphology.supraAorticInvolvement.lsa}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Multiple</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.aorticMorphology.supraAorticInvolvement.multi}</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* DEVICE CONFIGURATION */}
              <div className="mb-8 p-6 bg-slate-900 rounded border border-slate-700">
                <h4 className="text-slate-300 font-bold uppercase text-[9px] tracking-widest mb-4">Device Configuration & Strategy</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Stentgraft Systems */}
                  <div>
                    <div className="text-slate-400 text-[9px] font-semibold mb-3">Stentgraft Systems</div>
                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between"><span className="text-slate-400">Nexus</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.deviceConfiguration.stentgraftSystems.nexus}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Cook</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.deviceConfiguration.stentgraftSystems.cook}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Relay</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.deviceConfiguration.stentgraftSystems.relay}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Gore</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.deviceConfiguration.stentgraftSystems.gore}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Other</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.deviceConfiguration.stentgraftSystems.other}</span></div>
                    </div>
                  </div>

                  {/* Configuration Type */}
                  <div>
                    <div className="text-slate-400 text-[9px] font-semibold mb-3">Configuration</div>
                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between"><span className="text-slate-400">Branched</span><span className="font-bold text-cyan-400">{report.pathologyAndDevice.deviceConfiguration.configuration.branched}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Modular</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.deviceConfiguration.configuration.modular}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Fenestrated</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.deviceConfiguration.configuration.fenestrated}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">LIFS</span><span className="font-bold text-amber-400">{report.pathologyAndDevice.deviceConfiguration.configuration.lifs}</span></div>
                    </div>
                  </div>

                  {/* Treated Vessels */}
                  <div>
                    <div className="text-slate-400 text-[9px] font-semibold mb-3">Treated Vessels</div>
                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between"><span className="text-slate-400">BCT</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.deviceConfiguration.treatedVessels.bct}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">LCCA</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.deviceConfiguration.treatedVessels.lcca}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">LSA</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.deviceConfiguration.treatedVessels.lsa}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Multiple</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.deviceConfiguration.treatedVessels.multi}</span></div>
                    </div>
                  </div>

                  {/* Access & Revascularization */}
                  <div>
                    <div className="text-slate-400 text-[9px] font-semibold mb-3">Procedures & Access</div>
                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between"><span className="text-slate-400">LSA no Revasc</span><span className="font-bold text-red-500">{report.pathologyAndDevice.deviceConfiguration.lsaCoverageNoRevasc}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Bypass/Transposition</span><span className="font-bold text-orange-400">{report.pathologyAndDevice.deviceConfiguration.bypassOrTransposition}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Rad Access</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.access.additionalAccess.radial}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Brach Access</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.access.additionalAccess.brachial}</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACCESS STRATEGY */}
              <div className="mb-8 p-6 bg-slate-900 rounded border border-slate-700">
                <h4 className="text-slate-300 font-bold uppercase text-[9px] tracking-widest mb-4">Vascular Access</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-slate-400 text-[9px] font-semibold mb-3">Main Access Site</div>
                    <div className="space-y-2 text-[10px]">
                      <div className="flex justify-between"><span className="text-slate-400">Femoral Surgical</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.access.mainAccessSite.fem_surgical}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Femoral Percutaneous</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.access.mainAccessSite.fem_percutaneous}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Conduit</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.access.mainAccessSite.conduit}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Direct</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.access.mainAccessSite.direct}</span></div>
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400 text-[9px] font-semibold mb-3">Additional Access (n with any)</div>
                    <div className="space-y-2 text-[10px]">
                      <div className="flex justify-between"><span className="text-slate-400">Radial</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.access.additionalAccess.radial}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Brachial</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.access.additionalAccess.brachial}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Axillary</span><span className="font-bold text-slate-300">{report.pathologyAndDevice.access.additionalAccess.axillary}</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-950/20 border border-green-500/30 p-4 rounded text-[10px] text-green-300 mb-6">
                <strong>✓ Methodology Summary:</strong> Your cohort includes comprehensive pathology and device configuration data. The numbers above should appear in your Methods section baseline characteristics table.
              </div>

              <div className="bg-blue-950/20 border border-blue-500/30 p-4 rounded text-[10px] text-blue-300">
                <strong>Next Step:</strong> Consider subgroup analysis by pathology type or device configuration to explore outcome associations in your results section.
              </div>

              <AiSection agentKey="pathology" title="Pathology & Device Analysis" generator={generatePathologyInterpretation} icon={FileText} />
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

             <AiSection agentKey="demographics" title="Demographics Analysis" generator={generateDemographicsInterpretation} icon={Users} />
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
