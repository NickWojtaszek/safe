
import { AnalysisReport } from './statisticsEngine';

// Anthropic API client initialization for browser
const getAi = () => {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || '';
  
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    throw new Error('Anthropic API key not configured. Set VITE_ANTHROPIC_API_KEY in .env.local');
  }
  
  return {
    async callApi(prompt: string, maxTokens: number = 1024): Promise<string> {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: maxTokens,
            messages: [{ role: 'user', content: prompt }]
          })
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.content?.[0];
        
        if (content?.type === 'text') {
          return content.text;
        }
        
        return "No output from API.";
      } catch (error) {
        console.error('API call failed:', error);
        throw error;
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

