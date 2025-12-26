
import React from 'react';
import { 
  SurvivalCurve, 
  SurvivalPoint, 
  TimeByConfig, 
  SafetyMatrixRow, 
  TimeVsBleeding, 
  ScatterPoint, 
  StrokeTypeCounts, 
  StrokeBurdenPoint, 
  PredictorResult 
} from '../services/statisticsEngine';

// --- CHART COMPONENTS ---

export const MultiLineKmChart: React.FC<{ curves: SurvivalCurve[] }> = ({ curves }) => {
  const width = 800; const height = 400; const xScale = width / 30;
  const getPath = (points: SurvivalPoint[]) => {
      if (!points || points.length === 0) return "";
      let d = `M 0 ${height - (points[0].survivingProportion * height)}`;
      points.forEach((pt, i) => {
          const x = pt.day * xScale;
          const y = height - (pt.survivingProportion * height);
          if (i > 0) {
              const prevPt = points[i-1];
              const prevY = height - (prevPt.survivingProportion * height);
              d += ` L ${x} ${prevY} L ${x} ${y}`;
          } else {
              d += ` L ${x} ${y}`;
          }
      });
      const lastPt = points[points.length - 1];
      if (lastPt.day < 30) {
          d += ` L ${30 * xScale} ${height - (lastPt.survivingProportion * height)}`;
      }
      return d;
  };
  return (
      <div className="bg-slate-950 p-6 rounded border border-slate-800 relative h-96">
          <div className="w-full h-full relative">
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs font-mono text-slate-500 pointer-events-none z-10"><span>1.0</span><span>0.75</span><span>0.50</span><span>0.25</span><span>0.0</span></div>
              <div className="absolute left-10 right-0 top-2 bottom-6 border-l border-b border-slate-700">
                  <div className="absolute top-1/4 left-0 right-0 border-t border-slate-800/50 border-dashed"></div>
                  <div className="absolute top-2/4 left-0 right-0 border-t border-slate-800/50 border-dashed"></div>
                  <div className="absolute top-3/4 left-0 right-0 border-t border-slate-800/50 border-dashed"></div>
                  <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                      {(curves || []).map(curve => (
                          <path key={curve.id} d={getPath(curve.data)} fill="none" stroke={curve.color} strokeWidth="3" vectorEffect="non-scaling-stroke" className="drop-shadow-md" />
                      ))}
                  </svg>
              </div>
              <div className="absolute left-10 right-0 bottom-0 flex justify-between text-xs font-mono text-slate-500"><span>Day 0</span><span>Day 10</span><span>Day 20</span><span>Day 30</span></div>
              <div className="absolute top-4 right-4 bg-slate-900/90 border border-slate-700 p-3 rounded shadow-lg backdrop-blur-sm">
                  {(curves || []).map(curve => (
                      <div key={curve.id} className="flex items-center space-x-2 mb-1 last:mb-0">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: curve.color }}></div>
                          <span className="text-xs font-bold text-slate-300">{curve.label}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({(curve.data[curve.data.length-1]?.survivingProportion * 100 || 0).toFixed(1)}%)</span>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );
};

export const TimeByDeviceChart: React.FC<{ data: TimeByConfig[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;
  const width = 600; const height = 280; const margin = { top: 20, right: 40, bottom: 40, left: 120 }; const chartWidth = width - margin.left - margin.right; const chartHeight = height - margin.top - margin.bottom;
  const maxTime = Math.max(...data.map(d => d.timeStat?.max ?? 300), 300) * 1.1; const xScale = (val: number) => (val / maxTime) * chartWidth; const rowHeight = chartHeight / data.length;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#334155" />
      <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#334155" />
      <text x={margin.left} y={height - margin.bottom + 20} textAnchor="middle" className="text-[10px] fill-slate-500">0</text>
      <text x={margin.left + chartWidth} y={height - margin.bottom + 20} textAnchor="middle" className="text-[10px] fill-slate-500">{maxTime.toFixed(0)} min</text>
      {data.map((d, i) => {
        const y = margin.top + i * rowHeight + rowHeight/2; const xMedian = margin.left + xScale(d.timeStat?.median ?? 0); const xQ1 = margin.left + xScale(d.timeStat?.iqr[0] ?? 0); const xQ3 = margin.left + xScale(d.timeStat?.iqr[1] ?? 0);
        return (
          <g key={i}>
            <text x={margin.left - 15} y={y + 4} textAnchor="end" className="text-xs fill-slate-300 font-bold">{d.config?.toUpperCase()}</text>
            <rect x={xQ1} y={y - 8} width={xQ3 - xQ1} height={16} fill="#334155" rx="2" stroke="#475569" />
            <line x1={xMedian} y1={y - 12} x2={xMedian} y2={y + 12} stroke="#22d3ee" strokeWidth="3" />
          </g>
        );
      })}
    </svg>
  );
};

export const ComplicationMatrix: React.FC<{ data: SafetyMatrixRow[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;
  const width = 500; const height = data.length * 50 + 40; const margin = { top: 40, right: 20, bottom: 10, left: 160 }; const maxEndoleak = 20; const maxSci = 10;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <text x={margin.left + 50} y={margin.top - 15} textAnchor="middle" className="text-[10px] fill-slate-400 uppercase font-bold">Endoleak I/III</text>
      <text x={margin.left + 150} y={margin.top - 15} textAnchor="middle" className="text-[10px] fill-slate-400 uppercase font-bold">Spinal Ischemia</text>
      {data.map((row, i) => {
        const y = margin.top + i * 50;
        return (
          <g key={i}>
            <text x={margin.left - 15} y={y + 20} textAnchor="end" className="text-xs fill-slate-300 font-medium">{row.groupLabel?.split('(')[0]}</text>
            <text x={margin.left - 15} y={y + 32} textAnchor="end" className="text-[9px] fill-slate-500 font-mono">({row.groupLabel?.split('(')[1]}</text>
            <rect x={margin.left} y={y} width={100} height={40} fill="#f59e0b" fillOpacity={Math.min((row.endoleakRate ?? 0) / maxEndoleak, 1) * 0.8 + 0.1} rx="4" />
            <text x={margin.left + 50} y={y + 24} textAnchor="middle" className="text-sm fill-white font-bold shadow-black drop-shadow-md">{(row.endoleakRate ?? 0).toFixed(1)}%</text>
            <rect x={margin.left + 110} y={y} width={100} height={40} fill="#ef4444" fillOpacity={Math.min((row.sciRate ?? 0) / maxSci, 1) * 0.8 + 0.1} rx="4" />
            <text x={margin.left + 160} y={y + 24} textAnchor="middle" className="text-sm fill-white font-bold shadow-black drop-shadow-md">{(row.sciRate ?? 0).toFixed(1)}%</text>
          </g>
        );
      })}
    </svg>
  );
};

export const TimeVsBleedingChart: React.FC<{ data: TimeVsBleeding[] }> = ({ data }) => {
  if (!data || data.length < 2) return null;
  const width = 300; const height = 200; const margin = { top: 20, right: 20, bottom: 40, left: 50 }; const chartHeight = height - margin.top - margin.bottom; const maxTime = Math.max(...data.map(d => d.timeStat?.max ?? 300), 300) * 1.1; const yScale = (val: number) => chartHeight - (val / maxTime) * chartHeight; const barWidth = 40;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
       <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#334155" />
       <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#334155" />
       <text x={margin.left - 5} y={height - margin.bottom} textAnchor="end" className="text-[10px] fill-slate-500">0</text>
       <text x={margin.left - 5} y={margin.top} textAnchor="end" className="text-[10px] fill-slate-500">{maxTime.toFixed(0)} min</text>
       {data.map((d, i) => {
         const yMed = margin.top + yScale(d.timeStat?.median ?? 0); const yQ1 = margin.top + yScale(d.timeStat?.iqr[0] ?? 0); const yQ3 = margin.top + yScale(d.timeStat?.iqr[1] ?? 0); const color = d.bleeding ? '#f87171' : '#22d3ee';
         const x = margin.left + 50 + i * 100;
         return ( <g key={i}><text x={x} y={height - margin.bottom + 15} textAnchor="middle" className="text-[10px] fill-slate-300 font-bold uppercase">{d.bleeding ? 'Major Bleed' : 'No Bleed'}</text><line x1={x} y1={margin.top + yScale(d.timeStat?.min ?? 0)} x2={x} y2={margin.top + yScale(d.timeStat?.max ?? 0)} stroke="#475569" /><line x1={x - 10} y1={margin.top + yScale(d.timeStat?.min ?? 0)} x2={x + 10} y2={margin.top + yScale(d.timeStat?.min ?? 0)} stroke="#475569" /><line x1={x - 10} y1={margin.top + yScale(d.timeStat?.max ?? 0)} x2={x + 10} y2={margin.top + yScale(d.timeStat?.max ?? 0)} stroke="#475569" /><rect x={x - barWidth/2} y={yQ3} width={barWidth} height={yQ1 - yQ3} fill={color} opacity="0.8" stroke={color} /><line x1={x - barWidth/2} y1={yMed} x2={x + barWidth/2} y2={yMed} stroke="white" strokeWidth="2" /><text x={x + barWidth/2 + 8} y={yMed + 3} className="text-[10px] fill-slate-300 font-mono">{(d.timeStat?.median ?? 0).toFixed(0)}</text></g> );
       })}
    </svg>
  );
};

export const ScatterPlot: React.FC<{ points: ScatterPoint[] }> = ({ points }) => {
  if (!points || points.length === 0) return null; const xMax = Math.max(...points.map(p => p.x)) * 1.1; const yMax = Math.max(...points.map(p => p.y)) * 1.1; const width = 400; const height = 200;
  return (
    <svg width="100%" height={250} viewBox={`0 0 ${width} ${height + 20}`} className="overflow-visible">
      <line x1="0" y1={height} x2={width} y2={height} stroke="#475569" strokeWidth="1" />
      <line x1="0" y1="0" x2="0" y2={height} stroke="#475569" strokeWidth="1" />
      {points.map((p, i) => ( <circle key={i} cx={(p.x / xMax) * width} cy={height - (p.y / yMax) * height} r="4" className={`${p.group === 'AKI' ? 'fill-red-500' : 'fill-cyan-500/60'} hover:fill-white transition-colors cursor-pointer`}><title>Contrast: {p.x}ml, Creat: {p.y}μmol/L ({p.group})</title></circle> ))}
      <text x={width/2} y={height + 20} className="text-[10px] fill-slate-500" textAnchor="middle">Contrast Volume (mL)</text>
      <text x="-10" y={height/2} className="text-[10px] fill-slate-500" textAnchor="middle" transform={`rotate(-90, -10, ${height/2})`}>Baseline Creatinine</text>
    </svg>
  );
};

export const DonutChart: React.FC<{ data: { label: string; count: number; color: string }[] }> = ({ data }) => {
  const filtered = (data || []).filter(d => d.count > 0); const total = filtered.reduce((a, b) => a + b.count, 0); if (total === 0) return <div className="text-slate-500 text-xs text-center py-8">No Stroke Events</div>; let cumulativePercent = 0; const size = 100; const center = size / 2; const radius = 40; const circumference = 2 * Math.PI * radius;
  return (
    <div className="flex items-center space-x-6">
      <div className="relative w-32 h-32"><svg viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">{filtered.map((slice, i) => { const percent = slice.count / total; const dashArray = percent * circumference; const offset = cumulativePercent * circumference; cumulativePercent += percent; return (<circle key={i} cx={center} cy={center} r={radius} fill="none" stroke={slice.color} strokeWidth="15" strokeDasharray={`${dashArray} ${circumference}`} strokeDashoffset={-offset} />); })}</svg><div className="absolute inset-0 flex items-center justify-center flex-col"><span className="text-xl font-bold text-white">{total}</span><span className="text-[10px] text-slate-500 uppercase">Events</span></div></div>
      <div className="space-y-2">{filtered.map((slice, i) => (<div key={i} className="flex items-center text-xs"><span className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: slice.color }}></span><span className="text-slate-300 mr-2">{slice.label}</span><span className="font-mono text-slate-500">{slice.count} ({Math.round((slice.count/total)*100)}%)</span></div>))}</div>
    </div>
  );
};

export const BurdenMatrix: React.FC<{ data: StrokeBurdenPoint[] }> = ({ data }) => {
  if (!data || data.length === 0) return null; const width = 500; const height = 280; const margin = { top: 20, right: 20, bottom: 40, left: 50 }; const chartWidth = width - margin.left - margin.right; const chartHeight = height - margin.top - margin.bottom; const maxRate = Math.max(...data.map(d => d.strokeRate), 5) * 1.2; const maxNihss = Math.max(...data.map(d => d.meanNihss), 5) * 1.2; const xScale = (val: number) => (val / maxRate) * chartWidth; const yScale = (val: number) => chartHeight - (val / maxNihss) * chartHeight;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#334155" />
      <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#334155" />
      <text x={margin.left + chartWidth/2} y={height - 5} textAnchor="middle" className="text-[10px] fill-slate-500 font-bold uppercase">Stroke Frequency (%)</text>
      <text x={15} y={margin.top + chartHeight/2} transform={`rotate(-90, 15, ${margin.top + chartHeight/2})`} textAnchor="middle" className="text-[10px] fill-slate-500 font-bold uppercase">Mean Severity (NIHSS)</text>
      {data.map((d, i) => {
          const x = margin.left + xScale(d.strokeRate); const y = margin.top + yScale(d.meanNihss); const r = 4 + Math.sqrt(d.n) / 2; let fill = '#94a3b8'; if (d.category === 'Anatomy') fill = '#f59e0b'; if (d.category === 'Device') fill = '#06b6d4'; if (d.category === 'Patient') fill = '#a855f7';
          return ( <g key={i}><circle cx={x} cy={y} r={r} fill={fill} opacity="0.8" stroke="white" strokeWidth="1" /><text x={x} y={y - r - 5} textAnchor="middle" className="text-[9px] fill-slate-300 font-bold">{d.groupLabel}</text></g> );
      })}
    </svg>
  );
};

export const BurdenRanking: React.FC<{ data: StrokeBurdenPoint[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;
  const sorted = [...data].sort((a,b) => b.compositeScore - a.compositeScore);
  const maxVal = Math.max(...sorted.map(d => d.compositeScore), 0.1);
  return (
      <div className="flex flex-col space-y-3 h-[250px] overflow-y-auto custom-scrollbar pr-2">
          {sorted.map((d, i) => (
              <div key={i} className="group">
                  <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-medium text-slate-300 group-hover:text-cyan-400 transition-colors">
                          {d.groupLabel}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                          {d.compositeScore?.toFixed(2)}
                      </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div 
                          className={`h-full rounded-full transition-all duration-500 ${d.category === 'Anatomy' ? 'bg-amber-500' : d.category === 'Device' ? 'bg-cyan-500' : 'bg-purple-500'}`}
                          style={{ width: `${((d.compositeScore || 0) / maxVal) * 100}%` }}
                      />
                  </div>
              </div>
          ))}
      </div>
  );
};

export const NihssJitterChart: React.FC<{ groupA: number[], groupB: number[], labelA: string, labelB: string, colorA: string, colorB: string }> = ({ groupA, groupB, labelA, labelB, colorA, colorB }) => {
  const width = 300; const height = 180; const margin = 30;
  const allVals = [...(groupA || []), ...(groupB || [])];
  const yMax = allVals.length ? Math.max(...allVals, 25) : 25;
  const yScale = (val: number) => height - margin - (val / yMax) * (height - 2 * margin);
  const meanA = groupA?.length ? groupA.reduce((a,b)=>a+b,0)/groupA.length : 0;
  const meanB = groupB?.length ? groupB.reduce((a,b)=>a+b,0)/groupB.length : 0;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <line x1={margin} y1={margin} x2={margin} y2={height - margin} stroke="#334155" />
      <line x1={margin} y1={height - margin} x2={width} y2={height - margin} stroke="#334155" />
      <text x={margin - 5} y={yScale(0)} textAnchor="end" className="text-[10px] fill-slate-500">0</text>
      <text x={margin - 5} y={yScale(yMax/2)} textAnchor="end" className="text-[10px] fill-slate-500">{(yMax/2).toFixed(0)}</text>
      <text x={margin - 5} y={yScale(yMax)} textAnchor="end" className="text-[10px] fill-slate-500">{yMax.toFixed(0)}</text>
      <text x={margin + 10} y={margin - 10} className="text-[10px] fill-slate-500 font-bold">NIHSS Score</text>
      <text x={width/3} y={height - 5} textAnchor="middle" className="text-[10px] fill-slate-400 font-bold">{labelA}</text>
      {(groupA || []).map((val, i) => { const jitter = (Math.random() - 0.5) * 30; return <circle key={`a-${i}`} cx={(width/3) + jitter} cy={yScale(val)} r="3" fill={colorA} opacity="0.7" />; })}
      {groupA?.length > 0 && ( <line x1={(width/3) - 20} x2={(width/3) + 20} y1={yScale(meanA)} y2={yScale(meanA)} stroke="white" strokeWidth="2" /> )}
      <text x={(width/3)*2} y={height - 5} textAnchor="middle" className="text-[10px] fill-slate-400 font-bold">{labelB}</text>
      {(groupB || []).map((val, i) => { const jitter = (Math.random() - 0.5) * 30; return <circle key={`b-${i}`} cx={((width/3)*2) + jitter} cy={yScale(val)} r="3" fill={colorB} opacity="0.7" />; })}
       {groupB?.length > 0 && ( <line x1={((width/3)*2) - 20} x2={((width/3)*2) + 20} y1={yScale(meanB)} y2={yScale(meanB)} stroke="white" strokeWidth="2" /> )}
    </svg>
  );
};

export const InteractionChart: React.FC<{ stats: any }> = ({ stats }) => {
  if (!stats) return null;
  const epdYesCowComplete = stats.epdYesCowComplete || { n: 0, rate: 0 };
  const epdYesCowIncomplete = stats.epdYesCowIncomplete || { n: 0, rate: 0 };
  const epdNoCowComplete = stats.epdNoCowComplete || { n: 0, rate: 0 };
  const epdNoCowIncomplete = stats.epdNoCowIncomplete || { n: 0, rate: 0 };

  const width = 500; const height = 250; const margin = { top: 30, right: 30, bottom: 40, left: 40 }; const chartWidth = width - margin.left - margin.right; const chartHeight = height - margin.top - margin.bottom;
  const rates = [ epdYesCowComplete.rate, epdYesCowIncomplete.rate, epdNoCowComplete.rate, epdNoCowIncomplete.rate ];
  const maxRate = Math.max(25, ...rates) * 1.1; const yScale = (rate: number) => chartHeight - (rate / maxRate) * chartHeight;
  const groupWidth = chartWidth / 2; const barWidth = 40; const group1Center = groupWidth / 2; const group2Center = groupWidth + (groupWidth / 2);
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#334155" />
      <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#334155" />
      <text x={margin.left - 10} y={height - margin.bottom} textAnchor="end" className="text-[10px] fill-slate-500">0%</text>
      <text x={margin.left - 10} y={margin.top + yScale(maxRate)} textAnchor="end" className="text-[10px] fill-slate-500">{maxRate.toFixed(0)}%</text>
      <text x={margin.left + group1Center} y={height - 10} textAnchor="middle" className="text-xs fill-slate-300 font-bold uppercase">Complete CoW</text>
      <text x={margin.left + group2Center} y={height - 10} textAnchor="middle" className="text-xs fill-amber-400 font-bold uppercase">Incomplete CoW</text>
      <rect x={margin.left + group1Center - barWidth - 5} y={margin.top + yScale(epdYesCowComplete.rate)} width={barWidth} height={chartHeight - yScale(epdYesCowComplete.rate)} fill="#06b6d4" />
      <text x={margin.left + group1Center - barWidth/2 - 5} y={margin.top + yScale(epdYesCowComplete.rate) - 5} textAnchor="middle" className="text-[10px] fill-cyan-400 font-bold">{epdYesCowComplete.rate.toFixed(1)}%</text>
      <rect x={margin.left + group1Center + 5} y={margin.top + yScale(epdNoCowComplete.rate)} width={barWidth} height={chartHeight - yScale(epdNoCowComplete.rate)} fill="#475569" />
      <text x={margin.left + group1Center + barWidth/2 + 5} y={margin.top + yScale(epdNoCowComplete.rate) - 5} textAnchor="middle" className="text-[10px] fill-slate-400 font-bold">{epdNoCowComplete.rate.toFixed(1)}%</text>
      <rect x={margin.left + group2Center - barWidth - 5} y={margin.top + yScale(epdYesCowIncomplete.rate)} width={barWidth} height={chartHeight - yScale(epdYesCowIncomplete.rate)} fill="#06b6d4" />
      <text x={margin.left + group2Center - barWidth/2 - 5} y={margin.top + yScale(epdYesCowIncomplete.rate) - 5} textAnchor="middle" className="text-[10px] fill-cyan-400 font-bold">{epdYesCowIncomplete.rate.toFixed(1)}%</text>
      <rect x={margin.left + group2Center + 5} y={margin.top + yScale(epdNoCowIncomplete.rate)} width={barWidth} height={chartHeight - yScale(epdNoCowIncomplete.rate)} fill="#ef4444" />
      <text x={margin.left + group2Center + barWidth/2 + 5} y={margin.top + yScale(epdNoCowIncomplete.rate) - 5} textAnchor="middle" className="text-[10px] fill-red-400 font-bold">{epdNoCowIncomplete.rate.toFixed(1)}%</text>
    </svg>
  );
};

export const PhenotypeChart: React.FC<{ breakdown: any }> = ({ breakdown }) => {
  if (!breakdown) return null;
  const width = 500; const height = 280; const margin = { top: 40, right: 30, bottom: 50, left: 40 }; const chartWidth = width - margin.left - margin.right; const chartHeight = height - margin.top - margin.bottom;
  const getStack = (data: StrokeTypeCounts | undefined) => { 
    if (!data) return { ischH: 0, hemH: 0, mixH: 0, total: 0 };
    const total = (data.isch || 0) + (data.hem || 0) + (data.mix || 0); 
    return { ischH: data.isch || 0, hemH: data.hem || 0, mixH: data.mix || 0, total }; 
  };
  const stacks = [ 
    getStack(breakdown.epdYes), 
    getStack(breakdown.epdNo), 
    getStack(breakdown.cowComplete), 
    getStack(breakdown.cowIncomplete) 
  ];
  const maxTotal = Math.max(...stacks.map(s => s.total), 5); const yScale = (val: number) => chartHeight - (val / maxTotal) * chartHeight;
  const barWidth = 40; const gap = (chartWidth - (4 * barWidth)) / 5;
  const groups = [ { label: 'With EPD', stack: stacks[0] }, { label: 'No EPD', stack: stacks[1] }, { label: 'Comp CoW', stack: stacks[2] }, { label: 'Inc CoW', stack: stacks[3] } ];
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
       <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#334155" />
       <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#334155" />
       {groups.map((grp, i) => {
         const x = margin.left + gap + i * (barWidth + gap); const { ischH, hemH, mixH, total } = grp.stack;
         if (total === 0) { return <text key={i} x={x + barWidth/2} y={height - margin.bottom + 15} textAnchor="middle" className="text-[10px] fill-slate-500">{grp.label}</text>; }
         const h1 = (ischH / maxTotal) * chartHeight; const h2 = (hemH / maxTotal) * chartHeight; const h3 = (mixH / maxTotal) * chartHeight;
         const y1 = height - margin.bottom - h1; const y2 = y1 - h2; const y3 = y2 - h3;
         return ( <g key={i}> <rect x={x} y={y1} width={barWidth} height={h1} fill="#22d3ee" /> <rect x={x} y={y2} width={barWidth} height={h2} fill="#f87171" /> <rect x={x} y={y3} width={barWidth} height={h3} fill="#fbbf24" /> <text x={x + barWidth/2} y={height - margin.bottom + 15} textAnchor="middle" className="text-[10px] fill-slate-300 font-bold">{grp.label}</text> <text x={x + barWidth/2} y={y3 - 5} textAnchor="middle" className="text-[10px] fill-white font-mono">{total}</text> </g> );
       })}
    </svg>
  );
};

export const ForestPlot: React.FC<{ data: PredictorResult[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;
  const width = 500; const height = 250; const margin = { top: 30, right: 30, bottom: 40, left: 100 }; const chartWidth = width - margin.left - margin.right; const maxOR = 5.0; const scaleX = (val: number) => { const clamped = Math.max(0, Math.min(val, maxOR)); return (clamped / maxOR) * chartWidth; };
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
       <line x1={margin.left + scaleX(1)} y1={margin.top} x2={margin.left + scaleX(1)} y2={height - margin.bottom} stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
       <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#334155" />
       {data.map((pred, i) => {
          const y = margin.top + (i * 40) + 20; const xVal = margin.left + scaleX(pred.oddsRatio || 0); const xLow = margin.left + scaleX(pred.orCiLow || 0); const xHigh = margin.left + scaleX(pred.orCiHigh || 0); const color = (pred.pValue || 1) < 0.05 ? ((pred.oddsRatio || 1) > 1 ? '#f87171' : '#22d3ee') : '#64748b';
          return ( <g key={i}><text x={margin.left - 10} y={y + 4} textAnchor="end" className="text-xs fill-slate-300 font-medium">{pred.variable}</text><line x1={xLow} y1={y} x2={xHigh} y2={y} stroke={color} strokeWidth="1.5" /><circle cx={xVal} cy={y} r="4" fill={color} /><text x={Math.min(xHigh + 10, width - 10)} y={y + 4} className="text-[10px] fill-slate-500 font-mono">{(pred.oddsRatio || 0).toFixed(2)}</text></g> );
       })}
    </svg>
  );
};

export const RiskRateChart: React.FC<{ data: PredictorResult[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;
  const width = 500; const height = 250; const margin = { top: 30, right: 30, bottom: 40, left: 40 }; const chartWidth = width - margin.left - margin.right; const chartHeight = height - margin.top - margin.bottom; const maxRate = Math.max(...data.map(d => Math.max(d.presentStrokeRate || 0, d.absentStrokeRate || 0)), 10) * 1.1; const yScale = (rate: number) => chartHeight - (rate / maxRate) * chartHeight; const barW = 20; const gap = (chartWidth - (data.length * barW * 2)) / (data.length + 1);
  return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#334155" />
          <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#334155" />
          {data.map((d, i) => {
              const groupX = margin.left + gap + i * (barW * 2 + gap);
              return ( <g key={i}><rect x={groupX} y={margin.top + yScale(d.presentStrokeRate || 0)} width={barW} height={chartHeight - yScale(d.presentStrokeRate || 0)} fill="#f87171" opacity="0.9" /><rect x={groupX + barW} y={margin.top + yScale(d.absentStrokeRate || 0)} width={barW} height={chartHeight - yScale(d.absentStrokeRate || 0)} fill="#334155" /><text x={groupX + barW} y={height - margin.bottom + 15} textAnchor="middle" className="text-[9px] fill-slate-400">{d.variable?.split(' ')[0]}</text></g> );
          })}
      </svg>
  );
};
