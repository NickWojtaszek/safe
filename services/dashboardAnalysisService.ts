import { AnalysisReport } from './statisticsEngine';

// Claude API client via backend proxy
const getAi = () => {
  return {
    async callApi(prompt: string, maxTokens: number = 1024): Promise<string> {
      try {
        const response = await fetch('/api/claude', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt,
            maxTokens
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          const errorMsg = errorData.details || errorData.error;
          console.error(`API error (${response.status}):`, errorMsg);
          throw new Error(`API Error ${response.status}: ${response.statusText}\n${errorMsg}`);
        }

        const data = await response.json();
        
        if (data.text) {
          return data.text;
        }
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        return "No text output from API.";
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('API call failed:', errorMsg);
        throw new Error(`Analysis failed: ${errorMsg}`);
      }
    }
  };
};

export interface TabAnalysis {
  tabId: string;
  tabLabel: string;
  analysis: string;
  timestamp: number;
}

export interface AggregatedAnalysis {
  tabAnalyses: TabAnalysis[];
  synthesizedInsights: string;
  timestamp: number;
}

/**
 * Generate AI analysis for a specific analytics tab
 */
export const generateTabAnalysis = async (
  report: AnalysisReport,
  tabId: string,
  tabData?: any
): Promise<string> => {
  const ai = getAi();
  
  let prompt = '';
  
  switch (tabId) {
    case 'desc':
      prompt = `
Analyze the demographics of this medical study cohort:
- Total Patients: ${report.totalRecords}
- Age: Mean=${report.demographics?.age?.mean?.toFixed(1) || 'N/A'} years, SD=${report.demographics?.age?.sd?.toFixed(1) || 'N/A'}
- Male: ${((report.demographics?.sex?.counts?.Males || 0) / report.totalRecords * 100).toFixed(1)}%
- Female: ${((report.demographics?.sex?.counts?.Females || 0) / report.totalRecords * 100).toFixed(1)}%
- Comorbidities: HTN=${((report.demographics?.comorbidities?.htn || 0) / report.totalRecords * 100).toFixed(1)}%, DM=${((report.demographics?.comorbidities?.dm || 0) / report.totalRecords * 100).toFixed(1)}%, CKD=${((report.demographics?.comorbidities?.chronic_kidney || 0) / report.totalRecords * 100).toFixed(1)}%, HF=${((report.demographics?.comorbidities?.heart_failure_nyha || 0) / report.totalRecords * 100).toFixed(1)}%

Provide a concise clinical summary of the demographic profile, highlighting key characteristics and any notable patterns.`;
      break;

    case 'baseline':
      prompt = `
Analyze baseline clinical characteristics of this cohort:
- Indication Breakdown: ${report.demographics?.indication?.counts ? `Aneurysm=${((report.demographics.indication.counts.Aneurysm || 0) / report.totalRecords * 100).toFixed(1)}%, Dissection=${((report.demographics.indication.counts.Dissection || 0) / report.totalRecords * 100).toFixed(1)}%, Other=${((report.demographics.indication.counts.Other || 0) / report.totalRecords * 100).toFixed(1)}%` : 'N/A'}
- Prior Ischemic Stroke: ${((report.demographics?.comorbidities?.stroke_isch || 0) / report.totalRecords * 100).toFixed(1)}%
- Prior TIA: ${((report.demographics?.comorbidities?.stroke_tia || 0) / report.totalRecords * 100).toFixed(1)}%
- Atrial Fibrillation: ${((report.demographics?.comorbidities?.afib || 0) / report.totalRecords * 100).toFixed(1)}%
- Carotid Stenosis >50%: ${((report.demographics?.comorbidities?.carotid_stenosis_gt50 || 0) / report.totalRecords * 100).toFixed(1)}%

Summarize the baseline presentation, noting clinical implications for patient selection and risk stratification.`;
      break;

    case 'anatomy':
      prompt = `
Analyze the vascular anatomy findings in this cohort:
- Aneurysm Presentations: ${report.demographics?.indication?.counts?.Aneurysm || 0} cases (${((report.demographics?.indication?.counts?.Aneurysm || 0) / report.totalRecords * 100).toFixed(1)}%)
- Dissection Presentations: ${report.demographics?.indication?.counts?.Dissection || 0} cases (${((report.demographics?.indication?.counts?.Dissection || 0) / report.totalRecords * 100).toFixed(1)}%)
- Other Indications: ${report.demographics?.indication?.counts?.Other || 0} cases (${((report.demographics?.indication?.counts?.Other || 0) / report.totalRecords * 100).toFixed(1)}%)
- Carotid Stenosis: ${((report.demographics?.comorbidities?.carotid_stenosis_gt50 || 0) / report.totalRecords * 100).toFixed(1)}%
- Prior CEA/Stent: ${((report.demographics?.comorbidities?.cea_stent_history || 0) / report.totalRecords * 100).toFixed(1)}%
- PAD History: ${((report.demographics?.comorbidities?.pad || 0) / report.totalRecords * 100).toFixed(1)}%

Discuss the anatomical distribution and implications for procedure planning and risk assessment.`;
      break;

    case 'pathology':
      prompt = `
Analyze device and pathology characteristics from study records:
- Total Cases: N=${report.totalRecords}
- Connective Tissue Disease: ${((report.demographics?.comorbidities?.connective_tissue_disease || 0) / report.totalRecords * 100).toFixed(1)}%
- Active Cancer History: ${((report.demographics?.comorbidities?.active_cancer || 0) / report.totalRecords * 100).toFixed(1)}%

This cohort includes cases across multiple indication types. Summarize the pathological characteristics and device utilization patterns relevant to procedure outcomes and safety.`;
      break;

    case 'neuro':
      prompt = `
Analyze neurological outcomes:
- 30-Day Stroke Rate: ${report.primaryOutcome?.stroke?.rate?.toFixed(1) || 0}% (95% CI: ${report.primaryOutcome?.stroke?.ciLow?.toFixed(1) || 0}-${report.primaryOutcome?.stroke?.ciHigh?.toFixed(1) || 0})
- Stroke Cases: ${report.primaryOutcome?.stroke?.count || 0} out of ${report.primaryOutcome?.stroke?.total || report.totalRecords}
- Average NIHSS Score: ${report.neuro?.avgNihss?.toFixed(1) || 'N/A'}
- Max NIHSS Observed: ${report.neuro?.maxNihss || 'N/A'}
- EPD Status: With EPD: ${report.neuro?.epdStats?.withEpd?.n || 0} (${(report.neuro?.epdStats?.withEpd?.rate || 0).toFixed(1)}%), Without EPD: ${report.neuro?.epdStats?.noEpd?.n || 0} (${(report.neuro?.epdStats?.noEpd?.rate || 0).toFixed(1)}%)
- Circle of Willis: Complete: ${report.neuro?.cowStats?.complete?.n || 0} (${(report.neuro?.cowStats?.complete?.rate || 0).toFixed(1)}%), Incomplete: ${report.neuro?.cowStats?.incomplete?.n || 0} (${(report.neuro?.cowStats?.incomplete?.rate || 0).toFixed(1)}%)

Interpret the neurological outcomes, discussing stroke rates and their clinical significance.`;
      break;

    case 'safety':
      prompt = `
Analyze safety outcomes:
- 30-Day Mortality: ${report.primaryOutcome?.death?.rate?.toFixed(1) || 0}% (95% CI: ${report.primaryOutcome?.death?.ciLow?.toFixed(1) || 0}-${report.primaryOutcome?.death?.ciHigh?.toFixed(1) || 0})
- Mortality Cases: ${report.primaryOutcome?.death?.count || 0} out of ${report.primaryOutcome?.death?.total || report.totalRecords}
- Complications Reported: ${report.safety?.complications?.length || 0} types tracked
${report.safety?.complications?.slice(0, 5)?.map((c: any) => `  - ${c.label}: ${c.rate.toFixed(1)}%`).join('\n') || ''}
- Time-Related Analysis: ${report.safety?.timeByConfig?.length || 0} procedure duration subgroups
- Safety Matrix Rows: ${report.safety?.safetyMatrix?.length || 0} subgroup combinations analyzed

Evaluate the safety profile and identify potential risk factors for adverse events.`;
      break;

    case 'survival':
      prompt = `
Analyze survival and follow-up outcomes:
- 30-Day Mortality: ${report.primaryOutcome?.death?.rate?.toFixed(1) || 0}%
- Stroke-Free Survival at 30 Days: ${(100 - (report.primaryOutcome?.stroke?.rate || 0)).toFixed(1)}%
- Combined Stroke/Death Rate: ${((report.primaryOutcome?.stroke?.rate || 0) + (report.primaryOutcome?.death?.rate || 0)).toFixed(1)}%
- Survival Curves Available: ${Object.keys(report.survival || {}).filter(k => k !== 'overall' && Array.isArray(report.survival[k as keyof typeof report.survival]) && report.survival[k as keyof typeof report.survival].length > 0).length} stratified analyses
- Kaplan-Meier Data: ${report.survival?.overall?.length || 0} timepoints tracked

Discuss survival patterns, freedom from adverse events, and long-term prognostic implications.`;
      break;

    case 'uni':
      prompt = `
Analyze univariate predictors of stroke:
Top Predictors:
${report.univariate.slice(0, 10).map((pred: any) => 
  `- ${pred.name}: OR=${pred.oddsRatio.toFixed(2)}, p=${pred.pValue.toFixed(3)}`
).join('\n')}

Identify significant risk factors and protective factors that predict adverse neurological outcomes.`;
      break;

    case 'predict':
      prompt = `
Analyze the risk prediction model:
- Baseline Stroke Rate: ${report.primaryOutcome?.stroke?.rate || 0}%
- Top Risk Factors: ${report.univariate.slice(0, 5).map((p: any) => p.name).join(', ')}
- Model includes ${report.univariate.length} univariate predictors
- Type: Data-derived non-parametric model

Discuss the predictive value and clinical application of the risk model, noting its derivation and validation status.`;
      break;

    default:
      prompt = `Provide a brief summary of the clinical findings for this tab.`;
  }

  return ai.callApi(prompt, 1024);
};

/**
 * Analyze all tabs and aggregate insights
 */
export const analyzeAllTabs = async (
  report: AnalysisReport,
  tabsToAnalyze: string[] = ['desc', 'baseline', 'anatomy', 'pathology', 'neuro', 'safety', 'survival', 'uni', 'predict']
): Promise<TabAnalysis[]> => {
  const analyses: TabAnalysis[] = [];
  
  const tabLabels: Record<string, string> = {
    desc: 'Demographics',
    baseline: 'Baseline Data',
    anatomy: 'Vascular Anatomy',
    pathology: 'Pathology & Device',
    neuro: 'Neurology',
    safety: 'Safety',
    survival: 'Survival',
    uni: 'Univariate Analysis',
    predict: 'Risk Prediction'
  };

  for (const tabId of tabsToAnalyze) {
    try {
      const analysis = await generateTabAnalysis(report, tabId);
      analyses.push({
        tabId,
        tabLabel: tabLabels[tabId] || tabId,
        analysis,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error(`Failed to analyze tab ${tabId}:`, error);
      analyses.push({
        tabId,
        tabLabel: tabLabels[tabId] || tabId,
        analysis: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now()
      });
    }
  }

  return analyses;
};

/**
 * Generate a question answering response based on aggregated analyses and study data
 */
export const answerStudyQuestion = async (
  report: AnalysisReport,
  question: string,
  tabAnalyses: TabAnalysis[]
): Promise<string> => {
  const ai = getAi();

  const analysisContext = tabAnalyses
    .map(ta => `### ${ta.tabLabel}\n${ta.analysis}`)
    .join('\n\n');

  const prompt = `
You are an expert biostatistician and clinical researcher analyzing study data.

STUDY CONTEXT:
- Total Cohort: N=${report.totalRecords}
- Primary Outcome: 30-Day Stroke Rate = ${report.primaryOutcome?.stroke?.rate?.toFixed(1) || 0}% (95% CI: ${report.primaryOutcome?.stroke?.ciLow?.toFixed(1) || 0}-${report.primaryOutcome?.stroke?.ciHigh?.toFixed(1) || 0})
- Safety: 30-Day Mortality = ${report.primaryOutcome?.death?.rate?.toFixed(1) || 0}%
- Demographics: Mean Age=${report.demographics?.age?.mean?.toFixed(1) || 'N/A'} years, Male=${((report.demographics?.sex?.counts?.Males || 0) / report.totalRecords * 100).toFixed(1)}%

AGGREGATED TAB ANALYSES:
${analysisContext}

KEY UNIVARIATE PREDICTORS:
${report.univariate.slice(0, 5).map((pred: any) => 
  `- ${pred.name}: OR=${pred.oddsRatio.toFixed(2)}, p=${pred.pValue.toFixed(3)}`
).join('\n')}

USER QUESTION: ${question}

Provide a comprehensive, evidence-based answer that:
1. Directly addresses the question using available study data
2. References specific statistics from the analyses above
3. Provides clinical context and implications
4. Notes any limitations or uncertainties
5. Suggests follow-up analyses if relevant

Answer in markdown format.`;

  return ai.callApi(prompt, 2048);
};

/**
 * Generate comprehensive dashboard synthesis
 */
export const generateDashboardSynthesis = async (
  report: AnalysisReport,
  tabAnalyses: TabAnalysis[]
): Promise<string> => {
  const ai = getAi();

  const analysisContext = tabAnalyses
    .map(ta => `### ${ta.tabLabel}\n${ta.analysis}`)
    .join('\n\n');

  const prompt = `
As an expert clinical researcher, synthesize the following comprehensive analysis of a medical study into a cohesive executive summary:

STUDY OVERVIEW:
- Cohort Size: N=${report.totalRecords}
- Primary Outcome: 30-Day Stroke = ${report.primaryOutcome?.stroke?.rate?.toFixed(1) || 0}% (95% CI: ${report.primaryOutcome?.stroke?.ciLow?.toFixed(1) || 0}-${report.primaryOutcome?.stroke?.ciHigh?.toFixed(1) || 0})
- Safety: Mortality = ${report.primaryOutcome?.death?.rate?.toFixed(1) || 0}%
- Key Indication: ${report.demographics?.indication?.counts ? `Aneurysm=${((report.demographics.indication.counts.Aneurysm || 0) / report.totalRecords * 100).toFixed(1)}%, Dissection=${((report.demographics.indication.counts.Dissection || 0) / report.totalRecords * 100).toFixed(1)}%` : 'Multiple'}

DETAILED ANALYSES BY DOMAIN:
${analysisContext}

RISK PROFILE:
Top Risk Factors: ${report.univariate.slice(0, 3).map((p: any) => p.name).join(', ')}

Create a 2-3 paragraph executive summary that:
1. Highlights key clinical findings and outcomes
2. Synthesizes insights across all analytical domains
3. Identifies critical patterns and relationships
4. Provides actionable clinical interpretation
5. Notes important implications for practice

Use markdown formatting with emphasis on key statistics.`;

  return ai.callApi(prompt, 1500);
};
