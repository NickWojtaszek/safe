
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
        console.log('API Response:', data);
        
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

export const generateInterpretation = async (report: AnalysisReport): Promise<string> => {
  const ai = getAi();
  const prompt = `
    You are a Senior Medical Statistician. Interpret the Primary Outcomes for "SAFE-ARCH".
    
    DATA:
    ${JSON.stringify(report.primaryOutcome, null, 2)}
    ${JSON.stringify(report.demographics, null, 2)}

    INSTRUCTIONS:
    - Focus ONLY on Stroke Rate, Mortality, and Demographics.
    - Compare Stroke Rate to ESO Benchmark (7-13%).
    - Brief, professional medical style.
  `;
  return ai.callApi(prompt, 1024);
};

export const generateNeuroInterpretation = async (report: AnalysisReport): Promise<string> => {
  const ai = getAi();
  const prompt = `
    You are a Neuro-Vascular Specialist. Analyze this data.

    DATA:
    ${JSON.stringify(report.neuro, null, 2)}

    INSTRUCTIONS:
    - Assess Efficacy of Embolic Protection (EPD) based on p-value and rates.
    - Analyze the Stroke Burden Matrix scores.
    - Comment on Anatomical Risks (Circle of Willis).
    - Provide a clinical recommendation.
  `;
  return ai.callApi(prompt, 1024);
};

export const generatePredictorInterpretation = async (report: AnalysisReport): Promise<string> => {
  const ai = getAi();
  const prompt = `
    You are a Risk Modeler. Analyze univariate predictors for Stroke.

    DATA:
    ${JSON.stringify(report.univariate, null, 2)}

    INSTRUCTIONS:
    - Identify significant predictors (P < 0.05).
    - Discuss Odds Ratios (OR).
    - Highlight key risk factors and their impact.
  `;
  return ai.callApi(prompt, 1024);
};

export const generateSafetyInterpretation = async (report: AnalysisReport): Promise<string> => {
  const ai = getAi();
  const prompt = `
    You are a Safety Monitoring Board Member. Analyze procedural safety.

    DATA:
    ${JSON.stringify(report.safety, null, 2)}

    INSTRUCTIONS:
    - Review complications (Endoleak, SCI, AKI, Bleeding).
    - Correlate Procedure Time/Contrast with complications if data suggests.
    - Comment on the 'Safety Matrix' (Device vs Complication).
    - Is the safety profile acceptable?
  `;
  return ai.callApi(prompt, 1024);
};

export const generateSurvivalInterpretation = async (report: AnalysisReport): Promise<string> => {
  const ai = getAi();
  const prompt = `
    You are a Survival Analyst. Interpret Kaplan-Meier data (30-day).

    DATA:
    ${JSON.stringify(report.survival, null, 2)}

    INSTRUCTIONS:
    - Report survival rates at Day 10, 20, 30.
    - Compare survival between Stroke vs No-Stroke groups.
    - Compare Urgent vs Elective.
    - Is there significant early attrition?
  `;
  return ai.callApi(prompt, 1024);
};

export const generateSubgroupInterpretation = async (report: AnalysisReport): Promise<string> => {
  const ai = getAi();
  const prompt = `
    You are a Clinical Trial Investigator. Analyze Subgroups.

    DATA:
    ${JSON.stringify(report.subgroups, null, 2)}

    INSTRUCTIONS:
    - Compare Aneurysm vs Dissection outcomes.
    - Compare Device Configurations (Branched vs Fenestrated vs Chimney).
    - Identify the highest risk subgroup.
  `;
  return ai.callApi(prompt, 1024);
};

export const generateMasterSummary = async (report: AnalysisReport, analyses: Record<string, string>): Promise<string> => {
  const ai = getAi();
  const prompt = `
    You are the Principal Investigator for the SAFE-ARCH trial. 
    Synthesize a Final Executive Summary based on the specific agent reports below.

    PRIMARY OUTCOMES: ${analyses.overview}
    NEUROLOGICAL: ${analyses.neuro}
    SAFETY: ${analyses.safety}
    SURVIVAL: ${analyses.survival}
    SUBGROUPS: ${analyses.subgroups}
    PREDICTORS: ${analyses.predictors}

    INSTRUCTIONS:
    1. **Trial Verdict**: Declare if the procedure is safe and effective based on the aggregate data.
    2. **Key Findings**: Synthesize the most important points from Neuro, Safety, and Survival.
    3. **Risk Profile**: Define the ideal patient profile vs. the high-risk profile based on Predictors and Subgroups.
    4. **Final Recommendation**: Should protocol changes be made (e.g., mandatory EPD for certain groups)?

    Format as a formal Medical Journal Abstract (Results & Conclusion).
  `;
  return ai.callApi(prompt, 2048);
};

export const generateDemographicsInterpretation = async (report: AnalysisReport): Promise<string> => {
  const ai = getAi();
  const prompt = `
    You are a Clinical Epidemiologist. Analyze the demographic composition of the SAFE-ARCH cohort.

    DATA:
    ${JSON.stringify(report.demographics, null, 2)}

    INSTRUCTIONS:
    - Summarize patient age, gender, and comorbidity burden.
    - Comment on the representativeness of the cohort.
    - Identify any demographic risk factors that may affect outcomes.
    - Assess the balance of comorbidities across the population.
  `;
  return ai.callApi(prompt, 1024);
};

export const generateBaselineInterpretation = async (report: AnalysisReport): Promise<string> => {
  const ai = getAi();
  const prompt = `
    You are a Clinical Cardiologist specializing in vascular disease. Analyze baseline patient characteristics and comorbidity burden.

    DATA:
    ${JSON.stringify(report.baseline, null, 2)}
    ${JSON.stringify(report.comorbidities, null, 2)}

    INSTRUCTIONS:
    - Assess the overall comorbidity burden (Charlson index equivalent).
    - Identify the most prevalent baseline conditions (CAD, HTN, DM, CKD, etc.).
    - Comment on cardiopulmonary fitness and operative risk.
    - Discuss how these baseline factors may impact procedural outcomes.
  `;
  return ai.callApi(prompt, 1024);
};

export const generateAnatomyInterpretation = async (report: AnalysisReport): Promise<string> => {
  const ai = getAi();
  const prompt = `
    You are a Vascular Interventionist with expertise in aortic anatomy. Analyze preoperative vascular anatomy findings.

    DATA:
    ${JSON.stringify(report.vascularAnatomy, null, 2)}

    INSTRUCTIONS:
    - Assess Circle of Willis completeness and posterior circulation risk.
    - Comment on vertebral artery patency and dominance patterns.
    - Evaluate carotid artery status (stenosis, occlusion risk).
    - Identify anatomical high-risk features (hypoplastic VA, incomplete CoW, etc.).
    - Discuss implications for device selection and embolic protection strategy.
  `;
  return ai.callApi(prompt, 1024);
};

export const generatePathologyInterpretation = async (report: AnalysisReport): Promise<string> => {
  const ai = getAi();
  const prompt = `
    You are an Aortic Surgeon. Analyze device selection, implantation details, and pathological findings.

    DATA:
    ${JSON.stringify(report.pathology, null, 2)}
    ${JSON.stringify(report.deviceSelection, null, 2)}

    INSTRUCTIONS:
    - Summarize device types used (Branched, Fenestrated, Chimney) and their frequency.
    - Comment on implantation technical aspects (approach, operative time, intraoperative events).
    - Analyze pathological findings (aneurysm extent, dissection characteristics, coverage needs).
    - Discuss how device choice relates to anatomical findings and baseline risk factors.
  `;
  return ai.callApi(prompt, 1024);
};

export const generateRiskPredictorInterpretation = async (report: AnalysisReport): Promise<string> => {
  const ai = getAi();
  const prompt = `
    You are a Biostatistician specializing in risk stratification. Analyze predictive models for adverse events.

    DATA:
    ${JSON.stringify(report.univariate, null, 2)}

    INSTRUCTIONS:
    - Identify the strongest univariate predictors of stroke and mortality.
    - Calculate relative risk ratios and 95% confidence intervals for top predictors.
    - Develop a risk stratification schema (Low/Moderate/High risk groups).
    - Recommend which patient populations should receive enhanced monitoring or intervention.
  `;
  return ai.callApi(prompt, 1024);
};

export const generateComprehensiveStudyReport = async (report: AnalysisReport, allAnalyses: Record<string, string>): Promise<string> => {
  const ai = getAi();
  const prompt = `
    You are the Lead Investigator for the SAFE-ARCH trial. Write a comprehensive study report synthesizing all analyses.

    INDIVIDUAL ANALYSES:
    Overview: ${allAnalyses.overview}
    Demographics: ${allAnalyses.demographics}
    Baseline Characteristics: ${allAnalyses.baseline}
    Vascular Anatomy: ${allAnalyses.anatomy}
    Device & Pathology: ${allAnalyses.pathology}
    Neurological Outcomes: ${allAnalyses.neuro}
    Safety Profile: ${allAnalyses.safety}
    Survival Analysis: ${allAnalyses.survival}
    Subgroup Analysis: ${allAnalyses.subgroups}
    Risk Predictors: ${allAnalyses.predict}

    INSTRUCTIONS:
    Write a 1500-2000 word comprehensive report including:
    1. **Executive Summary** (200 words): Key findings and clinical significance
    2. **Patient Population** (200 words): Demographics, baselines, and cohort representativeness
    3. **Anatomical Assessment** (200 words): Vascular findings and risk stratification
    4. **Procedure & Device Strategy** (200 words): Technical approach and device selection rationale
    5. **Clinical Outcomes** (300 words): Primary endpoints, neurological complications, mortality
    6. **Safety Profile** (200 words): Adverse events, complication patterns, risk factors
    7. **Risk Stratification** (200 words): High-risk populations and predictive models
    8. **Conclusions & Recommendations** (200 words): Overall trial success, clinical implications, future directions

    Format professionally for medical journal submission.
  `;
  return ai.callApi(prompt, 2048);
};

