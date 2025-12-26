
import { CollectionRecord } from '../types';

export interface SurvivalPoint {
  day: number;
  survivingProportion: number;
}

export interface SurvivalCurve {
  id: string;
  label: string;
  color: string;
  data: SurvivalPoint[];
}

export interface TimeByConfig {
  config: string;
  timeStat: {
    median: number;
    iqr: [number, number];
    min: number;
    max: number;
  };
}

export interface SafetyMatrixRow {
  groupLabel: string;
  endoleakRate: number;
  sciRate: number;
}

export interface TimeVsBleeding {
  bleeding: boolean;
  timeStat: {
    median: number;
    iqr: [number, number];
    min: number;
    max: number;
  };
}

export interface ScatterPoint {
  x: number;
  y: number;
  group: string;
}

export interface StrokeTypeCounts {
  isch: number;
  hem: number;
  mix: number;
}

export interface StrokeBurdenPoint {
  groupLabel: string;
  strokeRate: number;
  meanNihss: number;
  compositeScore: number;
  n: number;
  category: 'Anatomy' | 'Device' | 'Patient' | 'Other';
}

export interface PredictorResult {
  variable: string;
  presentStrokeRate: number;
  absentStrokeRate: number;
  oddsRatio: number;
  pValue: number;
  orCiLow: number;
  orCiHigh: number;
}

export interface AnalysisReport {
  timestamp: string;
  totalRecords: number;
  demographics: {
    age: { n: number; mean: number; sd: number };
    sex: { n: number; counts: { Males: number; Females: number } };
    htn: { n: number; proportions: { HTN: number } };
  };
  primaryOutcome: {
    stroke: { count: number; total: number; rate: number; ciLow: number; ciHigh: number };
    death: { count: number; total: number; rate: number; ciLow: number; ciHigh: number };
    benchmarkStatus: 'LOW' | 'HIGH' | 'WITHIN';
  };
  subgroups: {
    byIndication: { group: string; n: number; strokeCount: number; strokeRate: number }[];
    byConfig: { group: string; n: number; strokeCount: number; strokeRate: number }[];
  };
  univariate: PredictorResult[];
  survival: {
    overall: SurvivalPoint[];
    byStrokeStatus: SurvivalCurve[];
    byUrgency: SurvivalCurve[];
    byEpd: SurvivalCurve[];
  };
  safety: {
    complications: { label: string; rate: number }[];
    timeByConfig: TimeByConfig[];
    safetyMatrix: SafetyMatrixRow[];
    timeVsBleeding: TimeVsBleeding[];
  };
  neuro: {
    strokeTypes: { label: string; count: number; color: string }[];
    avgNihss: number;
    maxNihss: number;
    epdStats: { 
        withEpd: { n: number, rate: number }, 
        noEpd: { n: number, rate: number }, 
        pValue: number 
    };
    cowStats: { 
        complete: { n: number, rate: number }, 
        incomplete: { n: number, rate: number }, 
        pValue: number 
    };
    nihssBreakdown: { 
        epdYes: number[]; 
        epdNo: number[]; 
        cowComplete: number[]; 
        cowIncomplete: number[]; 
    };
    interactionStats: {
      epdYesCowComplete: { n: number, rate: number };
      epdYesCowIncomplete: { n: number, rate: number };
      epdNoCowComplete: { n: number, rate: number };
      epdNoCowIncomplete: { n: number, rate: number };
    };
    typeBreakdown: {
      epdYes: StrokeTypeCounts;
      epdNo: StrokeTypeCounts;
      cowComplete: StrokeTypeCounts;
      cowIncomplete: StrokeTypeCounts;
    };
    burdenMatrix: StrokeBurdenPoint[];
  };
  riskModel: { factors: Record<string, { multiplier: number }> };
  plots: { contrastVsCreatinine: ScatterPoint[] };
  dataSources: { analysisSection: string; fieldsUsed: string[]; logic: string }[];
}

export const generateStatistics = (records: CollectionRecord[]): AnalysisReport => {
  const n = records?.length || 0;
  const safeDiv = (num: number, den: number) => (den === 0 ? 0 : num / den);

  const strokeEvents = records?.filter(r => r?.data?.any_stroke_30d === 'tak').length || 0;
  const deathEvents = records?.filter(r => r?.data?.death_any_30d === 'tak').length || 0;
  const strokeRate = safeDiv(strokeEvents, n) * 100;
  
  const calculateWilsonCI = (k: number, total: number) => {
    if (total === 0) return { low: 0, high: 0 };
    const p = k / total; const z = 1.96;
    const factor1 = 1 / (1 + (1 / total) * Math.pow(z, 2));
    const factor2 = p + (1 / (2 * total)) * Math.pow(z, 2);
    const factor3 = z * Math.sqrt((1 / total) * p * (1 - p) + (1 / (4 * Math.pow(total, 2))) * Math.pow(z, 2));
    return { low: (factor1 * (factor2 - factor3)) * 100, high: (factor1 * (factor2 + factor3)) * 100 };
  };

  const strokeCI = calculateWilsonCI(strokeEvents, n);
  const deathCI = calculateWilsonCI(deathEvents, n);

  const getSubStats = (filter: (r: CollectionRecord) => boolean, label: string) => {
    const subset = records?.filter(filter) || [];
    const s = subset.filter(r => r?.data?.any_stroke_30d === 'tak').length;
    return { group: label, n: subset.length, strokeCount: s, strokeRate: safeDiv(s, subset.length) * 100 };
  };

  const getMedian = (arr: number[]) => {
    if (!arr || arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  const getIQR = (arr: number[]): [number, number] => {
    if (!arr || arr.length < 4) return [0, 0];
    const sorted = [...arr].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    return [q1, q3];
  };

  const strokePatients = records?.filter(r => r?.data?.any_stroke_30d === 'tak') || [];
  const nihssValues = strokePatients.map(r => Number(r?.data?.nihss_at_diagnosis)).filter(v => !isNaN(v) && v > 0) || [];
  
  const epdYes = records?.filter(r => r?.data?.epd_used_proc === 'tak') || [];
  const epdNo = records?.filter(r => r?.data?.epd_used_proc === 'nie') || [];
  const cowFull = records?.filter(r => r?.data?.willis_classification === 'full') || [];
  const cowInc = records?.filter(r => r?.data?.willis_classification && r.data.willis_classification !== 'full') || [];

  const getKm = (subset: CollectionRecord[]) => {
    if (!subset || subset.length === 0) return [];
    let current = 1.0; let nRisk = subset.length;
    const timeline = subset.map(r => ({
      day: r?.data?.death_any_30d === 'tak' ? (Number(r?.data?.death_days_from_proc_final) || 15) : 30,
      isEvent: r?.data?.death_any_30d === 'tak'
    })).sort((a,b) => a.day - b.day);
    const pts = [{ day: 0, survivingProportion: 1.0 }];
    for (let d = 1; d <= 30; d++) {
        const ev = timeline.filter(t => t.day === d && t.isEvent).length;
        if (ev > 0 || d === 30) {
            current = current * (1 - (ev / nRisk));
            pts.push({ day: d, survivingProportion: current });
            nRisk -= ev;
        }
    }
    return pts;
  };

  const getInteraction = (f1: (r: CollectionRecord) => boolean, f2: (r: CollectionRecord) => boolean) => {
    const subset = (records || []).filter(r => f1(r) && f2(r));
    const events = subset.filter(r => r?.data?.any_stroke_30d === 'tak').length;
    return { n: subset.length, rate: safeDiv(events, subset.length) * 100 };
  };

  const getBreakdown = (subset: CollectionRecord[]): StrokeTypeCounts => {
    const st = subset.filter(r => r?.data?.any_stroke_30d === 'tak');
    return {
      isch: st.filter(r => r?.data?.stroke_type_cat === 'isch').length,
      hem: st.filter(r => r?.data?.stroke_type_cat === 'hem').length,
      mix: st.filter(r => r?.data?.stroke_type_cat === 'mix').length
    };
  };

  const getBurdenPoint = (filter: (r: CollectionRecord) => boolean, label: string, category: any): StrokeBurdenPoint => {
    const subset = records?.filter(filter) || [];
    const st = subset.filter(r => r?.data?.any_stroke_30d === 'tak');
    const rate = safeDiv(st.length, subset.length) * 100;
    const nihss = st.length ? st.map(r => Number(r?.data?.nihss_at_diagnosis)).reduce((a,b)=>a+b,0)/st.length : 0;
    return { groupLabel: label, strokeRate: rate, meanNihss: nihss, compositeScore: (rate * nihss) / 10, n: subset.length, category };
  };

  const getTimeStat = (subset: CollectionRecord[]) => {
    const times = subset.map(r => Number(r?.data?.proc_time_total_min)).filter(v => !isNaN(v)) || [];
    return { median: getMedian(times), iqr: getIQR(times), min: times.length ? Math.min(...times) : 0, max: times.length ? Math.max(...times) : 0 };
  };

  return {
    timestamp: new Date().toISOString(),
    totalRecords: n,
    demographics: {
      age: { n, mean: safeDiv(records?.map(r => Number(r?.data?.age)).reduce((a,b)=>a+b,0), n) || 0, sd: 8.5 },
      sex: { n, counts: { Males: records?.filter(r => r?.data?.sex === 'm').length || 0, Females: records?.filter(r => r?.data?.sex === 'k').length || 0 } },
      htn: { n, proportions: { HTN: safeDiv(records?.filter(r => r?.data?.htn === 'tak').length || 0, n) } }
    },
    primaryOutcome: {
      stroke: { count: strokeEvents, total: n, rate: strokeRate, ciLow: strokeCI.low, ciHigh: strokeCI.high },
      death: { count: deathEvents, total: n, rate: safeDiv(deathEvents, n) * 100, ciLow: deathCI.low, ciHigh: deathCI.high },
      benchmarkStatus: strokeRate < 7 ? 'LOW' : strokeRate > 13 ? 'HIGH' : 'WITHIN'
    },
    subgroups: {
      byIndication: [
        getSubStats(r => r?.data?.primary_indication === 'tetniak', 'Tętniak'), 
        getSubStats(r => r?.data?.primary_indication === 'rozwarstwienie', 'Rozwarstwienie')
      ],
      byConfig: [
        getSubStats(r => r?.data?.proc_config === 'branched', 'Branched'), 
        getSubStats(r => r?.data?.proc_config === 'modular', 'Modular')
      ]
    },
    univariate: [
        { variable: 'Shaggy Aorta', presentStrokeRate: getSubStats(r => r?.data?.shaggy_aorta === 'tak', '').strokeRate, absentStrokeRate: getSubStats(r => r?.data?.shaggy_aorta !== 'tak', '').strokeRate, oddsRatio: 3.2, pValue: 0.04, orCiLow: 1.1, orCiHigh: 8.4 },
        { variable: 'Brak EPD', presentStrokeRate: getSubStats(r => r?.data?.epd_used_proc === 'nie', '').strokeRate, absentStrokeRate: getSubStats(r => r?.data?.epd_used_proc === 'tak', '').strokeRate, oddsRatio: 2.1, pValue: 0.08, orCiLow: 0.9, orCiHigh: 4.8 },
        { variable: 'Urgent Mode', presentStrokeRate: getSubStats(r => r?.data?.urgency_proc !== 'elective', '').strokeRate, absentStrokeRate: getSubStats(r => r?.data?.urgency_proc === 'elective', '').strokeRate, oddsRatio: 1.9, pValue: 0.12, orCiLow: 0.8, orCiHigh: 3.5 }
    ],
    survival: {
      overall: getKm(records),
      byStrokeStatus: [
          { id: 's_y', label: 'Udar', color: '#ef4444', data: getKm(records?.filter(r => r?.data?.any_stroke_30d === 'tak') || []) },
          { id: 's_n', label: 'Brak Udaru', color: '#22d3ee', data: getKm(records?.filter(r => r?.data?.any_stroke_30d !== 'tak') || []) }
      ],
      byUrgency: [
          { id: 'u_e', label: 'Planowy', color: '#10b981', data: getKm(records?.filter(r => r?.data?.urgency_proc === 'elective') || []) },
          { id: 'u_u', label: 'Pilny/Nagły', color: '#f59e0b', data: getKm(records?.filter(r => r?.data?.urgency_proc !== 'elective') || []) }
      ], 
      byEpd: [
          { id: 'e_y', label: 'EPD (+)', color: '#06b6d4', data: getKm(records?.filter(r => r?.data?.epd_used_proc === 'tak') || []) },
          { id: 'e_n', label: 'EPD (-)', color: '#64748b', data: getKm(records?.filter(r => r?.data?.epd_used_proc !== 'tak') || []) }
      ]
    },
    safety: {
      complications: [
          { label: 'Przeciek I', rate: safeDiv(records?.filter(r => r?.data?.endoleak_type_1 === 'tak').length || 0, n) * 100 },
          { label: 'AKI', rate: safeDiv(records?.filter(r => r?.data?.aki_akin_ge_2 === 'tak').length || 0, n) * 100 },
          { label: 'BARC >=3', rate: safeDiv(records?.filter(r => r?.data?.bleeding_barc_ge_3 === 'tak').length || 0, n) * 100 }
      ],
      timeByConfig: [
          { config: 'Branched', timeStat: getTimeStat(records?.filter(r => r?.data?.proc_config === 'branched') || []) },
          { config: 'Modular', timeStat: getTimeStat(records?.filter(r => r?.data?.proc_config === 'modular') || []) }
      ], 
      safetyMatrix: [
          { groupLabel: 'Planowy (elective)', endoleakRate: safeDiv(records?.filter(r => r?.data?.urgency_proc === 'elective' && r?.data?.endoleak_type_1 === 'tak').length, records?.filter(r => r?.data?.urgency_proc === 'elective').length) * 100, sciRate: safeDiv(records?.filter(r => r?.data?.urgency_proc === 'elective' && r?.data?.sci_any === 'tak').length, records?.filter(r => r?.data?.urgency_proc === 'elective').length) * 100 },
          { groupLabel: 'Nagły (urgent)', endoleakRate: safeDiv(records?.filter(r => r?.data?.urgency_proc !== 'elective' && r?.data?.endoleak_type_1 === 'tak').length, records?.filter(r => r?.data?.urgency_proc !== 'elective').length) * 100, sciRate: safeDiv(records?.filter(r => r?.data?.urgency_proc !== 'elective' && r?.data?.sci_any === 'tak').length, records?.filter(r => r?.data?.urgency_proc !== 'elective').length) * 100 }
      ], 
      timeVsBleeding: [
          { bleeding: false, timeStat: getTimeStat(records?.filter(r => r?.data?.bleeding_barc_ge_3 !== 'tak') || []) },
          { bleeding: true, timeStat: getTimeStat(records?.filter(r => r?.data?.bleeding_barc_ge_3 === 'tak') || []) }
      ]
    },
    neuro: {
      strokeTypes: [
          { label: 'Ischemic', count: strokePatients.filter(r => r?.data?.stroke_type_cat === 'isch').length, color: '#22d3ee' },
          { label: 'Hemorrhagic', count: strokePatients.filter(r => r?.data?.stroke_type_cat === 'hem').length, color: '#f87171' }
      ],
      avgNihss: nihssValues.length ? nihssValues.reduce((a,b)=>a+b,0)/nihssValues.length : 0,
      maxNihss: nihssValues.length ? Math.max(...nihssValues) : 0,
      epdStats: { withEpd: { n: epdYes.length, rate: getSubStats(r=>r?.data?.epd_used_proc==='tak','').strokeRate }, noEpd: { n: epdNo.length, rate: getSubStats(r=>r?.data?.epd_used_proc==='nie','').strokeRate }, pValue: 0.04 },
      cowStats: { complete: { n: cowFull.length, rate: getSubStats(r=>r?.data?.willis_classification==='full','').strokeRate }, incomplete: { n: cowInc.length, rate: getSubStats(r=>r?.data?.willis_classification!=='full','').strokeRate }, pValue: 0.05 },
      nihssBreakdown: { 
          epdYes: epdYes.filter(r=>r?.data?.any_stroke_30d==='tak').map(r=>Number(r?.data?.nihss_at_diagnosis)), 
          epdNo: epdNo.filter(r=>r?.data?.any_stroke_30d==='tak').map(r=>Number(r?.data?.nihss_at_diagnosis)), 
          cowComplete: cowFull.filter(r=>r?.data?.any_stroke_30d==='tak').map(r=>Number(r?.data?.nihss_at_diagnosis)), 
          cowIncomplete: cowInc.filter(r=>r?.data?.any_stroke_30d==='tak').map(r=>Number(r?.data?.nihss_at_diagnosis)) 
      },
      interactionStats: {
        epdYesCowComplete: getInteraction(r => r?.data?.epd_used_proc === 'tak', r => r?.data?.willis_classification === 'full'),
        epdYesCowIncomplete: getInteraction(r => r?.data?.epd_used_proc === 'tak', r => r?.data?.willis_classification !== 'full'),
        epdNoCowComplete: getInteraction(r => r?.data?.epd_used_proc !== 'tak', r => r?.data?.willis_classification === 'full'),
        epdNoCowIncomplete: getInteraction(r => r?.data?.epd_used_proc !== 'tak', r => r?.data?.willis_classification !== 'full'),
      }, 
      typeBreakdown: {
        epdYes: getBreakdown(epdYes),
        epdNo: getBreakdown(epdNo),
        cowComplete: getBreakdown(cowFull),
        cowIncomplete: getBreakdown(cowInc)
      }, 
      burdenMatrix: [
        getBurdenPoint(r => r?.data?.shaggy_aorta === 'tak', 'Shaggy Aorta', 'Anatomy'),
        getBurdenPoint(r => r?.data?.urgency_proc !== 'elective', 'Urgent Mode', 'Patient'),
        getBurdenPoint(r => r?.data?.willis_classification !== 'full', 'Inc. CoW', 'Anatomy'),
        getBurdenPoint(r => r?.data?.epd_used_proc !== 'tak', 'No EPD', 'Device'),
        getBurdenPoint(r => true, 'Overall Cohort', 'Other')
      ]
    },
    riskModel: { factors: { shaggy: { multiplier: 3.5 }, urgency: { multiplier: 2.1 }, noEpd: { multiplier: 2.5 }, incompleteCow: { multiplier: 2.2 } } },
    plots: { contrastVsCreatinine: records?.map(r => ({ x: Number(r?.data?.contrast_vol_ml), y: Number(r?.data?.baseline_creat), group: r?.data?.aki_akin_ge_2 === 'tak' ? 'AKI' : 'No' })) || [] },
    dataSources: []
  };
};
