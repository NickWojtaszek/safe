
import { GoogleGenAI } from "@google/genai";
import { AnalysisReport } from './statisticsEngine';

// Initialization of GoogleGenAI as per guidelines
const getAi = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
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
  // Using gemini-3-flash-preview as per the guidelines for basic tasks
  const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
  return response.text || "No output.";
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
  const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
  return response.text || "No output.";
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
    - Highlight 'Shaggy Aorta' and 'Urgency' impact.
  `;
  const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
  return response.text || "No output.";
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
  const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
  return response.text || "No output.";
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
  const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
  return response.text || "No output.";
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
  const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
  return response.text || "No output.";
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
  const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: prompt });
  return response.text || "No output.";
};
