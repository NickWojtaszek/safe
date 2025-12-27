
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
  const width = 600; const height = 320; const margin = { top: 20, right: 40, bottom: 60, left: 120 }; const chartWidth = width - margin.left - margin.right; const chartHeight = height - margin.top - margin.bottom;
  const maxTime = Math.max(...data.map(d => d.timeStat?.max ?? 300), 300) * 1.1; const xScale = (val: number) => (val / maxTime) * chartWidth; const rowHeight = chartHeight / data.length;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#334155" />
      <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#334155" />
      <text x={margin.left} y={height - margin.bottom + 20} textAnchor="middle" className="text-[10px] fill-slate-500">0</text>
      <text x={margin.left + chartWidth} y={height - margin.bottom + 20} textAnchor="middle" className="text-[10px] fill-slate-500">{maxTime.toFixed(0)} min</text>
      <text x={margin.left + chartWidth/2} y={height - 5} textAnchor="middle" className="text-xs fill-slate-400 font-bold">Procedure Time (minutes)</text>
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
      <g>
        <text x={width - 200} y={margin.top + 10} className="text-[10px] fill-slate-400 font-bold">LEGEND:</text>
        <rect x={width - 200} y={margin.top + 15} width={120} height={40} fill="rgba(15, 23, 42, 0.95)" stroke="#06b6d4" strokeWidth="1" rx="3" />
        <rect x={width - 195} y={margin.top + 20} width={12} height={12} fill="#334155" />
        <text x={width - 180} y={margin.top + 28} className="text-[9px] fill-cyan-300 font-semibold">IQR (25%-75%)</text>
        <line x1={width - 195} x2={width - 183} y1={margin.top + 35} y2={margin.top + 35} stroke="#22d3ee" strokeWidth="3" />
        <text x={width - 180} y={margin.top + 40} className="text-[9px] fill-cyan-300 font-semibold">Median</text>
      </g>
    </svg>
  );
};

const getHeatmapColor = (rate: number, baseColor: string): string => {
  const intensity = Math.min(rate / 25, 1);
  const colorMap: { [key: string]: { light: string; dark: string } } = {
    endoleak: { light: '#78350f', dark: '#fbbf24' },
    sci: { light: '#7f1d1d', dark: '#fca5a5' },
    bleeding: { light: '#831843', dark: '#fbcfe8' },
    stroke: { light: '#4c1d95', dark: '#d8b4fe' },
    death: { light: '#7f1d1d', dark: '#fecaca' }
  };
  const colors = colorMap[baseColor] || { light: '#1e293b', dark: '#64748b' };
  const r = parseInt(colors.light.slice(1, 3), 16);
  const g = parseInt(colors.light.slice(3, 5), 16);
  const b = parseInt(colors.light.slice(5, 7), 16);
  const r2 = parseInt(colors.dark.slice(1, 3), 16);
  const g2 = parseInt(colors.dark.slice(3, 5), 16);
  const b2 = parseInt(colors.dark.slice(5, 7), 16);
  const nr = Math.round(r + (r2 - r) * intensity);
  const ng = Math.round(g + (g2 - g) * intensity);
  const nb = Math.round(b + (b2 - b) * intensity);
  return `rgb(${nr}, ${ng}, ${nb})`;
};

export const ComplicationMatrix: React.FC<{ data: SafetyMatrixRow[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;
  const width = 700;
  const height = Math.max(data.length * 70 + 60, 250);
  const margin = { top: 50, right: 20, bottom: 15, left: 140 };
  const cellWidth = 85;
  const cellHeight = 60;
  const complications = [
    { label: 'ENDOLEAK', key: 'endoleakRate', color: 'endoleak' },
    { label: 'SCI', key: 'sciRate', color: 'sci' },
    { label: 'BLEEDING', key: 'bleedingRate', color: 'bleeding' },
    { label: 'STROKE', key: 'strokeRate', color: 'stroke' },
    { label: 'DEATH', key: 'deathRate', color: 'death' }
  ];
  
  return (
    <svg width="100%" height="auto" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="overflow-visible">
      {complications.map((comp, i) => (
        <text key={`header-${i}`} x={margin.left + i * cellWidth + cellWidth/2} y={margin.top - 15} textAnchor="middle" className="text-[11px] fill-slate-300 uppercase font-bold tracking-wide">{comp.label}</text>
      ))}
      
      {data.map((row, i) => {
        const y = margin.top + i * cellHeight;
        return (
          <g key={i}>
            <text x={margin.left - 12} y={y + cellHeight/2 + 5} textAnchor="end" className="text-[11px] fill-slate-200 font-medium">{row.groupLabel?.split('(')[0]?.trim()}</text>
            
            {complications.map((comp, j) => {
              const x = margin.left + j * cellWidth;
              const rate = (row as any)[comp.key] ?? 0;
              const color = getHeatmapColor(rate, comp.color);
              
              return (
                <g key={`${i}-${j}`}>
                  <rect x={x} y={y} width={cellWidth - 8} height={cellHeight - 8} fill={color} rx="3" />
                  <text x={x + (cellWidth - 8)/2} y={y + cellHeight/2 + 6} textAnchor="middle" className="text-[12px] fill-white font-bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{rate.toFixed(1)}%</text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
};

export const TimeVsBleedingChart: React.FC<{ data: TimeVsBleeding[] }> = ({ data }) => {
  if (!data || data.length < 2) return null;
  const width = 360; const height = 250; const margin = { top: 20, right: 20, bottom: 60, left: 50 }; const chartHeight = height - margin.top - margin.bottom; const maxTime = Math.max(...data.map(d => d.timeStat?.max ?? 300), 300) * 1.1; const yScale = (val: number) => chartHeight - (val / maxTime) * chartHeight; const barWidth = 40;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
       <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#334155" />
       <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#334155" />
       <text x={margin.left - 5} y={height - margin.bottom} textAnchor="end" className="text-[10px] fill-slate-500">0</text>
       <text x={margin.left - 5} y={margin.top} textAnchor="end" className="text-[10px] fill-slate-500">{maxTime.toFixed(0)} min</text>
       <text x={width/2} y={height - 5} textAnchor="middle" className="text-xs fill-slate-400 font-bold">Procedure Time by Bleeding Status</text>
       {data.map((d, i) => {
         const yMed = margin.top + yScale(d.timeStat?.median ?? 0); const yQ1 = margin.top + yScale(d.timeStat?.iqr[0] ?? 0); const yQ3 = margin.top + yScale(d.timeStat?.iqr[1] ?? 0); const color = d.bleeding ? '#f87171' : '#22d3ee';
         const x = margin.left + 50 + i * 100;
         return ( <g key={i}><text x={x} y={height - margin.bottom + 15} textAnchor="middle" className="text-[10px] fill-slate-300 font-bold uppercase">{d.bleeding ? 'Major Bleed' : 'No Bleed'}</text><line x1={x} y1={margin.top + yScale(d.timeStat?.min ?? 0)} x2={x} y2={margin.top + yScale(d.timeStat?.max ?? 0)} stroke="#475569" /><line x1={x - 10} y1={margin.top + yScale(d.timeStat?.min ?? 0)} x2={x + 10} y2={margin.top + yScale(d.timeStat?.min ?? 0)} stroke="#475569" /><line x1={x - 10} y1={margin.top + yScale(d.timeStat?.max ?? 0)} x2={x + 10} y2={margin.top + yScale(d.timeStat?.max ?? 0)} stroke="#475569" /><rect x={x - barWidth/2} y={yQ3} width={barWidth} height={yQ1 - yQ3} fill={color} opacity="0.8" stroke={color} /><line x1={x - barWidth/2} y1={yMed} x2={x + barWidth/2} y2={yMed} stroke="white" strokeWidth="2" /><text x={x + barWidth/2 + 8} y={yMed + 3} className="text-[10px] fill-slate-300 font-mono">{(d.timeStat?.median ?? 0).toFixed(0)}</text></g> );
       })}
    </svg>
  );
};

export interface TimeVsEvent {
  event: boolean;
  eventLabel: string;
  timeStat: {
    median: number;
    iqr: [number, number];
    min: number;
    max: number;
  };
}

export const TimeVsStrokeChart: React.FC<{ data: TimeVsEvent[] }> = ({ data }) => {
  if (!data || data.length < 2) return null;
  const width = 360; const height = 250; const margin = { top: 20, right: 20, bottom: 60, left: 50 }; const chartHeight = height - margin.top - margin.bottom; const maxTime = Math.max(...data.map(d => d.timeStat?.max ?? 300), 300) * 1.1; const yScale = (val: number) => chartHeight - (val / maxTime) * chartHeight; const barWidth = 40;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
       <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#334155" />
       <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#334155" />
       <text x={margin.left - 5} y={height - margin.bottom} textAnchor="end" className="text-[10px] fill-slate-500">0</text>
       <text x={margin.left - 5} y={margin.top} textAnchor="end" className="text-[10px] fill-slate-500">{maxTime.toFixed(0)} min</text>
       <text x={width/2} y={height - 5} textAnchor="middle" className="text-xs fill-slate-400 font-bold">Procedure Time by Stroke Status</text>
       {data.map((d, i) => {
         const yMed = margin.top + yScale(d.timeStat?.median ?? 0); const yQ1 = margin.top + yScale(d.timeStat?.iqr[0] ?? 0); const yQ3 = margin.top + yScale(d.timeStat?.iqr[1] ?? 0); const color = d.event ? '#fca5a5' : '#22d3ee';
         const x = margin.left + 50 + i * 100;
         return ( <g key={i}><text x={x} y={height - margin.bottom + 15} textAnchor="middle" className="text-[10px] fill-slate-300 font-bold uppercase">{d.eventLabel}</text><line x1={x} y1={margin.top + yScale(d.timeStat?.min ?? 0)} x2={x} y2={margin.top + yScale(d.timeStat?.max ?? 0)} stroke="#475569" /><line x1={x - 10} y1={margin.top + yScale(d.timeStat?.min ?? 0)} x2={x + 10} y2={margin.top + yScale(d.timeStat?.min ?? 0)} stroke="#475569" /><line x1={x - 10} y1={margin.top + yScale(d.timeStat?.max ?? 0)} x2={x + 10} y2={margin.top + yScale(d.timeStat?.max ?? 0)} stroke="#475569" /><rect x={x - barWidth/2} y={yQ3} width={barWidth} height={yQ1 - yQ3} fill={color} opacity="0.8" stroke={color} /><line x1={x - barWidth/2} y1={yMed} x2={x + barWidth/2} y2={yMed} stroke="white" strokeWidth="2" /><text x={x + barWidth/2 + 8} y={yMed + 3} className="text-[10px] fill-slate-300 font-mono">{(d.timeStat?.median ?? 0).toFixed(0)}</text></g> );
       })}
    </svg>
  );
};

export const ScatterPlot: React.FC<{ points: ScatterPoint[] }> = ({ points }) => {
  if (!points || points.length === 0) return null; const xMax = Math.max(...points.map(p => p.x)) * 1.1; const yMax = Math.max(...points.map(p => p.y)) * 1.1; const width = 500; const height = 280;
  return (
    <svg width="100%" height={height + 60} viewBox={`0 0 ${width} ${height + 40}`} className="overflow-visible">
      <line x1="40" y1={height - 40} x2={width - 20} y2={height - 40} stroke="#475569" strokeWidth="1" />
      <line x1="40" y1="0" x2="40" y2={height - 40} stroke="#475569" strokeWidth="1" />
      {points.map((p, i) => ( <circle key={i} cx={40 + (p.x / xMax) * (width - 60)} cy={height - 40 - (p.y / yMax) * (height - 60)} r="4" className={`${p.group === 'AKI' ? 'fill-red-500' : 'fill-cyan-500/60'} hover:fill-white transition-colors cursor-pointer`}><title>Contrast: {p.x}ml, Creat: {p.y}μmol/L ({p.group})</title></circle> ))}
      <text x={width/2} y={height + 25} className="text-xs fill-slate-400 font-bold" textAnchor="middle">Contrast Volume (mL)</text>
      <text x="10" y={height/2 - 40} className="text-xs fill-slate-400 font-bold" textAnchor="middle" transform={`rotate(-90, 10, ${height/2 - 40})`}>Baseline Creatinine (μmol/L)</text>
      <g>
        <rect x={10} y={height - 30} width={120} height={30} fill="rgba(15, 23, 42, 0.95)" stroke="#06b6d4" strokeWidth="1" rx="3" />
        <circle cx={25} cy={height - 18} r="4" className="fill-red-500" />
        <text x={35} y={height - 14} className="text-[9px] fill-cyan-300 font-semibold">AKI Event</text>
        <circle cx={25} cy={height - 5} r="4" className="fill-cyan-500" opacity="0.6" />
        <text x={35} y={height - 1} className="text-[9px] fill-cyan-300 font-semibold">No AKI</text>
      </g>
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
  if (!data || data.length === 0) return null; const width = 560; const height = 320; const margin = { top: 20, right: 100, bottom: 50, left: 60 }; const chartWidth = width - margin.left - margin.right; const chartHeight = height - margin.top - margin.bottom; const maxRate = Math.max(...data.map(d => d.strokeRate), 5) * 1.2; const maxNihss = Math.max(...data.map(d => d.meanNihss), 5) * 1.2; const xScale = (val: number) => (val / maxRate) * chartWidth; const yScale = (val: number) => chartHeight - (val / maxNihss) * chartHeight;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#334155" />
      <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#334155" />
      <text x={margin.left + chartWidth/2} y={height - 10} textAnchor="middle" className="text-xs fill-slate-400 font-bold uppercase">Stroke Frequency (%)</text>
      <text x={20} y={margin.top + chartHeight/2} transform={`rotate(-90, 20, ${margin.top + chartHeight/2})`} textAnchor="middle" className="text-xs fill-slate-400 font-bold uppercase">Mean Severity (NIHSS)</text>
      {data.map((d, i) => {
          const x = margin.left + xScale(d.strokeRate); const y = margin.top + yScale(d.meanNihss); const r = 4 + Math.sqrt(d.n) / 2; let fill = '#94a3b8'; if (d.category === 'Anatomy') fill = '#f59e0b'; if (d.category === 'Device') fill = '#06b6d4'; if (d.category === 'Patient') fill = '#a855f7';
          return ( <g key={i}><circle cx={x} cy={y} r={r} fill={fill} opacity="0.8" stroke="white" strokeWidth="1" /><text x={x} y={y - r - 5} textAnchor="middle" className="text-[9px] fill-slate-300 font-bold">{d.groupLabel}</text></g> );
      })}
    </svg>
  );
};

export const BurdenRanking: React.FC<{ data: StrokeBurdenPoint[]; dataAll?: StrokeBurdenPoint[] }> = ({ data, dataAll }) => {
  const displayData = (dataAll && dataAll.length > 0) ? dataAll : data;
  if (!displayData || displayData.length === 0) return <div className="text-slate-500 text-xs p-4">No data available</div>;
  const sorted = [...displayData].sort((a,b) => b.strokeRate - a.strokeRate);
  const maxN = Math.max(...sorted.map(d => d.n), 1);
  const maxStroke = Math.max(...sorted.map(d => d.strokeRate), 1);
  
  return (
      <div className="flex flex-col space-y-2 h-[280px] overflow-y-auto custom-scrollbar pr-2">
          {sorted.map((d, i) => {
              const cohortPercent = (d.n / maxN) * 100;
              const strokePercent = (d.strokeRate / maxStroke) * 100;
              return (
                  <div key={i} className="group">
                      <div className="flex justify-between items-baseline mb-1">
                          <span className="text-xs font-medium text-slate-300 group-hover:text-cyan-400 transition-colors">
                              {d.groupLabel}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                              n={d.n} | {d.strokeRate?.toFixed(1)}%
                          </span>
                      </div>
                      <div className="relative w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700">
                          {/* Total patient count bar - light, semi-transparent */}
                          <div 
                              className={`absolute top-0 left-0 h-full transition-all duration-500 opacity-50 ${d.category === 'Anatomy' ? 'bg-amber-400' : d.category === 'Device' ? 'bg-cyan-400' : 'bg-violet-400'}`}
                              style={{ width: `${cohortPercent}%` }}
                              title={`Total patients in group: ${d.n}`}
                          />
                          {/* Stroke event count overlay - bright, fully opaque */}
                          <div 
                              className={`absolute top-0 left-0 h-full transition-all duration-500 font-bold border-r border-slate-800 ${d.category === 'Anatomy' ? 'bg-amber-700' : d.category === 'Device' ? 'bg-cyan-700' : 'bg-violet-700'}`}
                              style={{ width: `${strokePercent}%` }}
                              title={`Stroke rate: ${d.strokeRate?.toFixed(1)}%`}
                          />
                      </div>
                      <div className="flex justify-between mt-0.5 text-[7px] text-slate-600 font-mono">
                          <span>Cohort: {d.n} patients</span>
                          <span>Strokes: {d.strokeRate?.toFixed(1)}%</span>
                      </div>
                  </div>
              );
          })}
      </div>
  );
};

export const NihssJitterChart: React.FC<{ groupA: number[], groupB: number[], labelA: string, labelB: string, colorA: string, colorB: string, pValue?: number }> = ({ groupA, groupB, labelA, labelB, colorA, colorB, pValue }) => {
  const width = 560; const height = 300; const margin = 50;
  const allVals = [...(groupA || []), ...(groupB || [])];
  const yMax = allVals.length ? Math.max(...allVals, 25) : 25;
  const yScale = (val: number) => height - margin - (val / yMax) * (height - 2 * margin);
  const meanA = groupA?.length ? groupA.reduce((a,b)=>a+b,0)/groupA.length : 0;
  const meanB = groupB?.length ? groupB.reduce((a,b)=>a+b,0)/groupB.length : 0;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {pValue !== undefined && <text x={width - 50} y={15} textAnchor="middle" className="text-[10px] fill-slate-400 font-mono">P={pValue.toFixed(3)}</text>}
      <line x1={margin} y1={margin} x2={margin} y2={height - margin} stroke="#334155" />
      <line x1={margin} y1={height - margin} x2={width - 20} y2={height - margin} stroke="#334155" />
      <text x={margin - 5} y={yScale(0)} textAnchor="end" className="text-[10px] fill-slate-500">0</text>
      <text x={margin - 5} y={yScale(yMax/2)} textAnchor="end" className="text-[10px] fill-slate-500">{(yMax/2).toFixed(0)}</text>
      <text x={margin - 5} y={yScale(yMax)} textAnchor="end" className="text-[10px] fill-slate-500">{yMax.toFixed(0)}</text>
      <text x={20} y={margin + (height - 2*margin)/2} transform={`rotate(-90, 20, ${margin + (height - 2*margin)/2})`} textAnchor="middle" className="text-xs fill-slate-400 font-bold">NIHSS Score Distribution</text>
      <text x={width/3} y={height - 5} textAnchor="middle" className="text-[10px] fill-slate-300 font-bold">{labelA}</text>
      {(groupA || []).map((val, i) => { const jitter = (Math.random() - 0.5) * 30; return <circle key={`a-${i}`} cx={(width/3) + jitter} cy={yScale(val)} r="3" fill={colorA} opacity="0.7" />; })}
      {groupA?.length > 0 && ( <line x1={(width/3) - 20} x2={(width/3) + 20} y1={yScale(meanA)} y2={yScale(meanA)} stroke="white" strokeWidth="2" /> )}
      <text x={(width/3)*2} y={height - 5} textAnchor="middle" className="text-[10px] fill-slate-300 font-bold">{labelB}</text>
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
  const pValue = stats.pValue || 0.05;

  const width = 580; const height = 300; const margin = { top: 30, right: 100, bottom: 60, left: 50 }; const chartWidth = width - margin.left - margin.right; const chartHeight = height - margin.top - margin.bottom;
  const rates = [ epdYesCowComplete.rate, epdYesCowIncomplete.rate, epdNoCowComplete.rate, epdNoCowIncomplete.rate ];
  const maxRate = Math.max(25, ...rates) * 1.1; const yScale = (rate: number) => chartHeight - (rate / maxRate) * chartHeight;
  const groupWidth = chartWidth / 2; const barWidth = 40; const group1Center = groupWidth / 2; const group2Center = groupWidth + (groupWidth / 2);
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#334155" />
      <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#334155" />
      <text x={margin.left - 10} y={height - margin.bottom} textAnchor="end" className="text-[10px] fill-slate-500">0%</text>
      <text x={margin.left - 10} y={margin.top + yScale(maxRate)} textAnchor="end" className="text-[10px] fill-slate-500">{maxRate.toFixed(0)}%</text>
      <text x={margin.left + group1Center} y={height - 25} textAnchor="middle" className="text-xs fill-slate-300 font-bold uppercase">Complete CoW</text>
      <text x={margin.left + group2Center} y={height - 25} textAnchor="middle" className="text-xs fill-amber-400 font-bold uppercase">Incomplete CoW</text>
      <text x={margin.left + chartWidth/2} y={height - 5} textAnchor="middle" className="text-xs fill-slate-400 font-bold">EPD × Circle of Willis Interaction</text>
      <text x={width - 40} y={margin.top + 15} textAnchor="middle" className="text-[10px] fill-slate-400 font-mono">P={pValue.toFixed(3)}</text>
      <g>
        <rect x={margin.left + chartWidth - 115} y={margin.top + 5} width={110} height={60} fill="rgba(15, 23, 42, 0.8)" stroke="#475569" rx="3" />
        <rect x={margin.left + chartWidth - 110} y={margin.top + 10} width={12} height={12} fill="#06b6d4" />
        <text x={margin.left + chartWidth - 93} y={margin.top + 18} className="text-[9px] fill-slate-300">With EPD</text>
        <rect x={margin.left + chartWidth - 110} y={margin.top + 27} width={12} height={12} fill="#475569" />
        <text x={margin.left + chartWidth - 93} y={margin.top + 35} className="text-[9px] fill-slate-300">No EPD</text>
        <rect x={margin.left + chartWidth - 110} y={margin.top + 44} width={12} height={12} fill="#ef4444" />
        <text x={margin.left + chartWidth - 93} y={margin.top + 52} className="text-[9px] fill-slate-300">Inc CoW</text>
      </g>
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

export const NihssVsAnatomyChart: React.FC<{ cowComplete: number[]; cowIncomplete: number[]; pValue?: number }> = ({ cowComplete, cowIncomplete, pValue }) => {
  const width = 600;
  const height = 320;
  const margin = { top: 30, right: 40, bottom: 80, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const allScores = [...cowComplete, ...cowIncomplete].filter(v => !isNaN(v) && v > 0);
  const maxNihss = allScores.length > 0 ? Math.max(...allScores) * 1.15 : 25;
  
  const meanComplete = cowComplete.length > 0 ? cowComplete.reduce((a,b) => a+b) / cowComplete.length : 0;
  const meanIncomplete = cowIncomplete.length > 0 ? cowIncomplete.reduce((a,b) => a+b) / cowIncomplete.length : 0;

  const yScale = (val: number) => chartHeight - (val / maxNihss) * chartHeight;
  const groupWidth = chartWidth / 2;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {/* Axes */}
      <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#334155" strokeWidth="2" />
      <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#334155" strokeWidth="2" />

      {/* Y-axis labels */}
      <text x={margin.left - 10} y={height - margin.bottom + 4} textAnchor="end" className="text-[10px] fill-slate-500">0</text>
      <text x={margin.left - 10} y={margin.top + yScale(maxNihss / 2) + 4} textAnchor="end" className="text-[10px] fill-slate-500">{(maxNihss / 2).toFixed(0)}</text>
      <text x={margin.left - 10} y={margin.top + 4} textAnchor="end" className="text-[10px] fill-slate-500">{maxNihss.toFixed(0)}</text>

      {/* Y-axis label */}
      <text x={15} y={margin.top + chartHeight / 2} textAnchor="middle" className="text-xs fill-slate-400" transform={`rotate(-90, 15, ${margin.top + chartHeight / 2})`}>
        NIHSS Score
      </text>

      {/* Complete CoW group */}
      <g>
        {cowComplete.map((score, i) => {
          const x = margin.left + groupWidth / 2 - 40 + (i % 2) * 20;
          const y = margin.top + yScale(score);
          return <circle key={`complete-${i}`} cx={x} cy={y} r="3" fill="#06b6d4" opacity="0.7" />;
        })}
        {/* Mean line */}
        <line x1={margin.left + groupWidth / 2 - 50} y1={margin.top + yScale(meanComplete)} x2={margin.left + groupWidth / 2 + 50} y2={margin.top + yScale(meanComplete)} stroke="#06b6d4" strokeWidth="2" />
      </g>

      {/* Incomplete CoW group */}
      <g>
        {cowIncomplete.map((score, i) => {
          const x = margin.left + groupWidth + groupWidth / 2 - 40 + (i % 2) * 20;
          const y = margin.top + yScale(score);
          return <circle key={`incomplete-${i}`} cx={x} cy={y} r="3" fill="#f59e0b" opacity="0.7" />;
        })}
        {/* Mean line */}
        <line x1={margin.left + groupWidth + groupWidth / 2 - 50} y1={margin.top + yScale(meanIncomplete)} x2={margin.left + groupWidth + groupWidth / 2 + 50} y2={margin.top + yScale(meanIncomplete)} stroke="#f59e0b" strokeWidth="2" />
      </g>

      {/* Group labels */}
      <text x={margin.left + groupWidth / 2} y={height - margin.bottom + 25} textAnchor="middle" className="text-xs fill-slate-300 font-bold">
        Complete CoW
      </text>
      <text x={margin.left + groupWidth + groupWidth / 2} y={height - margin.bottom + 25} textAnchor="middle" className="text-xs fill-slate-300 font-bold">
        Incomplete CoW
      </text>

      {/* Legend */}
      <g>
        <rect x={margin.left + 10} y={margin.top + 5} width={200} height={30} fill="rgba(15, 23, 42, 0.8)" stroke="#475569" rx="2" />
        <circle cx={margin.left + 20} cy={margin.top + 12} r="3" fill="#06b6d4" opacity="0.7" />
        <text x={margin.left + 28} y={margin.top + 15} className="text-[9px] fill-slate-300">Individual scores</text>
        <line x1={margin.left + 20} y1={margin.top + 25} x2={margin.left + 30} y2={margin.top + 25} stroke="#999" strokeWidth="2" />
        <text x={margin.left + 38} y={margin.top + 27} className="text-[9px] fill-slate-300">Mean</text>
      </g>
    </svg>
  );
};

export const PhenotypeChart: React.FC<{ breakdown: any }> = ({ breakdown }) => {
  if (!breakdown) return null;
  const width = 560; const height = 330; const margin = { top: 40, right: 100, bottom: 70, left: 50 }; const chartWidth = width - margin.left - margin.right; const chartHeight = height - margin.top - margin.bottom;
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
       <text x={margin.left + chartWidth/2} y={height - 10} textAnchor="middle" className="text-xs fill-slate-400 font-bold">Stroke Types by Clinical Factors</text>
       {groups.map((grp, i) => {
         const x = margin.left + gap + i * (barWidth + gap); const { ischH, hemH, mixH, total } = grp.stack;
         if (total === 0) { return <text key={i} x={x + barWidth/2} y={height - margin.bottom + 20} textAnchor="middle" className="text-[10px] fill-slate-500">{grp.label}</text>; }
         const h1 = (ischH / maxTotal) * chartHeight; const h2 = (hemH / maxTotal) * chartHeight; const h3 = (mixH / maxTotal) * chartHeight;
         const y1 = height - margin.bottom - h1; const y2 = y1 - h2; const y3 = y2 - h3;
         return ( <g key={i}> <rect x={x} y={y1} width={barWidth} height={h1} fill="#22d3ee" /> <rect x={x} y={y2} width={barWidth} height={h2} fill="#f87171" /> <rect x={x} y={y3} width={barWidth} height={h3} fill="#fbbf24" /> <text x={x + barWidth/2} y={height - margin.bottom + 20} textAnchor="middle" className="text-[10px] fill-slate-300 font-bold">{grp.label}</text> <text x={x + barWidth/2} y={y3 - 5} textAnchor="middle" className="text-[10px] fill-white font-mono">{total}</text> </g> );
       })}
       <g>
         <rect x={10} y={20} width={110} height={65} fill="rgba(15, 23, 42, 0.95)" stroke="#06b6d4" strokeWidth="1" rx="3" />
         <rect x={15} y={25} width={12} height={12} fill="#22d3ee" />
         <text x={32} y={33} className="text-[9px] fill-cyan-300 font-semibold">Ischemic</text>
         <rect x={15} y={42} width={12} height={12} fill="#f87171" />
         <text x={32} y={50} className="text-[9px] fill-cyan-300 font-semibold">Hemorrhagic</text>
         <rect x={15} y={59} width={12} height={12} fill="#fbbf24" />
         <text x={32} y={67} className="text-[9px] fill-cyan-300 font-semibold">Mixed</text>
       </g>
    </svg>
  );
};

export const ForestPlot: React.FC<{ data: PredictorResult[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;
  const width = 560; const height = 300; const margin = { top: 30, right: 100, bottom: 60, left: 110 }; const chartWidth = width - margin.left - margin.right; const maxOR = 5.0; const scaleX = (val: number) => { const clamped = Math.max(0, Math.min(val, maxOR)); return (clamped / maxOR) * chartWidth; };
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
       <text x={margin.left + chartWidth/2} y={height - 10} textAnchor="middle" className="text-xs fill-slate-400 font-bold">Odds Ratio (with 95% CI)</text>
       <line x1={margin.left + scaleX(1)} y1={margin.top} x2={margin.left + scaleX(1)} y2={height - margin.bottom - 20} stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
       <line x1={margin.left} y1={height - margin.bottom - 20} x2={width - margin.right} y2={height - margin.bottom - 20} stroke="#334155" />
       <text x={margin.left + scaleX(1)} y={height - margin.bottom - 5} textAnchor="middle" className="text-[9px] fill-slate-500">OR=1</text>
       <g>
         <rect x={10} y={20} width={130} height={50} fill="rgba(15, 23, 42, 0.95)" stroke="#06b6d4" strokeWidth="1" rx="3" />
         <line x1={15} x2={30} y1={32} y2={32} stroke="#f87171" strokeWidth="1.5" />
         <circle cx={22.5} cy={32} r="4" fill="#f87171" />
         <text x={40} y={36} className="text-[9px] fill-cyan-300 font-semibold">Risk Factor</text>
         <line x1={15} x2={30} y1={52} y2={52} stroke="#22d3ee" strokeWidth="1.5" />
         <circle cx={22.5} cy={52} r="4" fill="#22d3ee" />
         <text x={40} y={56} className="text-[9px] fill-cyan-300 font-semibold">Protective</text>
       </g>
       {data.map((pred, i) => {
          const y = margin.top + (i * 40) + 20; const xVal = margin.left + scaleX(pred.oddsRatio || 0); const xLow = margin.left + scaleX(pred.orCiLow || 0); const xHigh = margin.left + scaleX(pred.orCiHigh || 0); const color = (pred.pValue || 1) < 0.05 ? ((pred.oddsRatio || 1) > 1 ? '#f87171' : '#22d3ee') : '#64748b';
          return ( <g key={i}><text x={margin.left - 10} y={y + 4} textAnchor="end" className="text-xs fill-slate-300 font-medium">{pred.variable}</text><line x1={xLow} y1={y} x2={xHigh} y2={y} stroke={color} strokeWidth="1.5" /><circle cx={xVal} cy={y} r="4" fill={color} /><text x={Math.min(xHigh + 10, width - 10)} y={y + 4} className="text-[10px] fill-slate-500 font-mono">{(pred.oddsRatio || 0).toFixed(2)}</text></g> );
       })}
    </svg>
  );
};

export const RiskRateChart: React.FC<{ data: PredictorResult[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;
  const width = 560; const height = 300; const margin = { top: 30, right: 100, bottom: 70, left: 50 }; const chartWidth = width - margin.left - margin.right; const chartHeight = height - margin.top - margin.bottom; const maxRate = Math.max(...data.map(d => Math.max(d.presentStrokeRate || 0, d.absentStrokeRate || 0)), 10) * 1.1; const yScale = (rate: number) => chartHeight - (rate / maxRate) * chartHeight; const barW = 20; const gap = (chartWidth - (data.length * barW * 2)) / (data.length + 1);
  return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom - 20} stroke="#334155" />
          <line x1={margin.left} y1={height - margin.bottom - 20} x2={width - margin.right} y2={height - margin.bottom - 20} stroke="#334155" />
          <text x={margin.left + chartWidth/2} y={height - 10} textAnchor="middle" className="text-xs fill-slate-400 font-bold">Stroke Rate by Predictor Status</text>
          <g>
            <rect x={10} y={20} width={130} height={35} fill="rgba(15, 23, 42, 0.95)" stroke="#06b6d4" strokeWidth="1" rx="3" />
            <rect x={15} y={25} width={12} height={12} fill="#f87171" opacity="0.9" />
            <text x={32} y={33} className="text-[9px] fill-cyan-300 font-semibold">Factor Present</text>
            <rect x={15} y={42} width={12} height={12} fill="#334155" />
            <text x={32} y={50} className="text-[9px] fill-cyan-300 font-semibold">Factor Absent</text>
          </g>
          {data.map((d, i) => {
              const groupX = margin.left + gap + i * (barW * 2 + gap);
              return ( <g key={i}><rect x={groupX} y={margin.top + yScale(d.presentStrokeRate || 0)} width={barW} height={chartHeight - yScale(d.presentStrokeRate || 0)} fill="#f87171" opacity="0.9" /><rect x={groupX + barW} y={margin.top + yScale(d.absentStrokeRate || 0)} width={barW} height={chartHeight - yScale(d.absentStrokeRate || 0)} fill="#334155" /><text x={groupX + barW} y={height - margin.bottom + 15} textAnchor="middle" className="text-[9px] fill-slate-400">{d.variable?.split(' ')[0]}</text></g> );
          })}
      </svg>
  );
};

export const SexByIndicationChart: React.FC<{ sexByIndication: Record<string, { Males: number; Females: number }>; total: number }> = ({ sexByIndication, total }) => {
  const width = 700;
  const height = 380;
  const margin = { top: 40, right: 60, bottom: 100, left: 50 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const indications = Object.keys(sexByIndication) as Array<keyof typeof sexByIndication>;
  const maxCount = Math.max(...indications.flatMap(ind => [sexByIndication[ind].Males, sexByIndication[ind].Females]), 1) * 1.1;
  
  const barGroupWidth = chartWidth / indications.length;
  const barWidth = 35;
  const yScale = (val: number) => chartHeight - (val / maxCount) * chartHeight;

  const colors = {
    Aneurysm: { bg: '#f59e0b', maleBar: '#3b82f6', femaleBar: '#ec4899' },
    Dissection: { bg: '#06b6d4', maleBar: '#3b82f6', femaleBar: '#ec4899' },
    Other: { bg: '#8b5cf6', maleBar: '#3b82f6', femaleBar: '#ec4899' }
  };

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#334155" />
      <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#334155" />
      
      {indications.map((indication, idx) => {
        const groupX = margin.left + idx * barGroupWidth + barGroupWidth / 2;
        const maleCount = sexByIndication[indication].Males;
        const femaleCount = sexByIndication[indication].Females;
        const maleX = groupX - barWidth - 8;
        const femaleX = groupX + 8;
        const maleY = margin.top + yScale(maleCount);
        const femaleY = margin.top + yScale(femaleCount);
        const maleHeight = chartHeight - yScale(maleCount);
        const femaleHeight = chartHeight - yScale(femaleCount);

        return (
          <g key={indication}>
            {/* Indication label background */}
            <rect x={groupX - barGroupWidth/2} y={margin.top - 25} width={barGroupWidth} height={20} fill={colors[indication].bg} opacity="0.15" rx="2" />
            
            {/* Male bar */}
            <rect x={maleX} y={maleY} width={barWidth} height={maleHeight} fill={colors[indication].maleBar} opacity="0.8" rx="2" />
            <text x={maleX + barWidth/2} y={maleY - 5} textAnchor="middle" className="text-xs fill-slate-300 font-bold">{maleCount}</text>
            
            {/* Female bar */}
            <rect x={femaleX} y={femaleY} width={barWidth} height={femaleHeight} fill={colors[indication].femaleBar} opacity="0.8" rx="2" />
            <text x={femaleX + barWidth/2} y={femaleY - 5} textAnchor="middle" className="text-xs fill-slate-300 font-bold">{femaleCount}</text>
            
            {/* Indication label */}
            <text x={groupX} y={height - margin.bottom + 20} textAnchor="middle" className="text-xs fill-slate-300 font-bold">{indication}</text>
          </g>
        );
      })}

      {/* Legend - Single row at bottom */}
      <g>
        <text x={55} y={height - 20} className="text-[8px] fill-slate-500 uppercase font-bold">Sex:</text>
        <rect x={105} y={height - 27} width={12} height={12} fill="#3b82f6" opacity="0.8" />
        <text x={122} y={height - 15} className="text-[8px] fill-slate-300">Males</text>
        
        <rect x={195} y={height - 27} width={12} height={12} fill="#ec4899" opacity="0.8" />
        <text x={212} y={height - 15} className="text-[8px] fill-slate-300">Females</text>
      </g>

      {/* Y-axis labels */}
      <text x={margin.left - 10} y={height - margin.bottom} textAnchor="end" className="text-[10px] fill-slate-500">0</text>
      <text x={margin.left - 10} y={margin.top + yScale(maxCount/2)} textAnchor="end" className="text-[10px] fill-slate-500">{(maxCount/2).toFixed(0)}</text>
      <text x={margin.left - 10} y={margin.top} textAnchor="end" className="text-[10px] fill-slate-500">{maxCount.toFixed(0)}</text>
    </svg>
  );
};

export const IndicationSexAgeChart: React.FC<{ data: Array<{ indication: string; sex: 'M' | 'F'; meanAge: number; count: number }> }> = ({ data }) => {
  const width = 700;
  const height = 380;
  const margin = { top: 40, right: 60, bottom: 140, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Filter data with count > 0
  const filteredData = data.filter(d => d.count > 0);
  
  const minAge = Math.min(...filteredData.map(d => d.meanAge), 30);
  const maxAge = Math.max(...filteredData.map(d => d.meanAge), 80);
  const minCount = 0;
  const maxCount = Math.max(...filteredData.map(d => d.count), 10) * 1.2;

  const xScale = (age: number) => margin.left + ((age - minAge) / (maxAge - minAge)) * chartWidth;
  const yScale = (count: number) => margin.top + chartHeight - (count / maxCount) * chartHeight;

  const indicationColors: Record<string, string> = {
    Aneurysm: '#f59e0b',
    Dissection: '#06b6d4',
    Other: '#8b5cf6'
  };

  const sexColors = { M: '#3b82f6', F: '#ec4899' };

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {/* Grid lines */}
      <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#334155" strokeWidth="2" />
      <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#334155" strokeWidth="2" />

      {/* Axis labels */}
      <text x={margin.left + chartWidth/2} y={height - 105} textAnchor="middle" className="text-xs fill-slate-400 font-bold">Mean Age (years)</text>
      <text x={25} y={margin.top + chartHeight/2} textAnchor="middle" className="text-xs fill-slate-400 font-bold" transform={`rotate(-90, 25, ${margin.top + chartHeight/2})`}>Patient Count</text>

      {/* Scatter points */}
      {filteredData.map((point, idx) => {
        const cx = xScale(point.meanAge);
        const cy = yScale(point.count);
        const r = 6;
        const borderColor = indicationColors[point.indication] || '#64748b';
        const fillColor = sexColors[point.sex] || '#94a3b8';

        return (
          <g key={idx}>
            {/* Outer ring (indication) */}
            <circle cx={cx} cy={cy} r={r + 2} fill="none" stroke={borderColor} strokeWidth="2" opacity="0.6" />
            {/* Inner circle (sex) */}
            <circle cx={cx} cy={cy} r={r} fill={fillColor} opacity="0.8" />
            {/* Label */}
            <text x={cx} y={cy - 12} textAnchor="middle" className="text-[9px] fill-slate-300 font-bold">{point.meanAge.toFixed(1)}y</text>
            <text x={cx} y={cy + 18} textAnchor="middle" className="text-[8px] fill-slate-400 font-mono">n={point.count}</text>
          </g>
        );
      })}

      {/* X-axis labels */}
      <text x={xScale(minAge)} y={height - margin.bottom + 20} textAnchor="middle" className="text-[10px] fill-slate-500">{minAge.toFixed(0)}</text>
      <text x={xScale((minAge + maxAge) / 2)} y={height - margin.bottom + 20} textAnchor="middle" className="text-[10px] fill-slate-500">{((minAge + maxAge) / 2).toFixed(0)}</text>
      <text x={xScale(maxAge)} y={height - margin.bottom + 20} textAnchor="middle" className="text-[10px] fill-slate-500">{maxAge.toFixed(0)}</text>

      {/* Y-axis labels */}
      <text x={margin.left - 10} y={height - margin.bottom + 4} textAnchor="end" className="text-[10px] fill-slate-500">0</text>
      <text x={margin.left - 10} y={margin.top + chartHeight/2 + 4} textAnchor="end" className="text-[10px] fill-slate-500">{(maxCount/2).toFixed(0)}</text>
      <text x={margin.left - 10} y={margin.top + 4} textAnchor="end" className="text-[10px] fill-slate-500">{maxCount.toFixed(0)}</text>

      {/* Legend - Single row at bottom */}
      <g>
        <text x={55} y={height - 25} className="text-[8px] fill-slate-500 uppercase font-bold">Indication (Ring):</text>
        <circle cx={175} cy={height - 31} r="4" fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.6" />
        <text x={185} y={height - 27} className="text-[8px] fill-slate-300">Aneurysm</text>
        
        <circle cx={280} cy={height - 31} r="4" fill="none" stroke="#06b6d4" strokeWidth="2" opacity="0.6" />
        <text x={290} y={height - 27} className="text-[8px] fill-slate-300">Dissection</text>
        
        <circle cx={375} cy={height - 31} r="4" fill="none" stroke="#8b5cf6" strokeWidth="2" opacity="0.6" />
        <text x={385} y={height - 27} className="text-[8px] fill-slate-300">Other</text>
        
        <text x={445} y={height - 25} className="text-[8px] fill-slate-500 uppercase font-bold">Sex (Fill):</text>
        <circle cx={555} cy={height - 31} r="4" fill="#3b82f6" opacity="0.8" />
        <text x={565} y={height - 27} className="text-[8px] fill-slate-300">Male</text>
        
        <circle cx={625} cy={height - 31} r="4" fill="#ec4899" opacity="0.8" />
        <text x={635} y={height - 27} className="text-[8px] fill-slate-300">Female</text>
      </g>
    </svg>
  );
};

export const ComorbidityBarChart: React.FC<{ comorbidities: Record<string, number>; total: number }> = ({ comorbidities, total }) => {
  const comorbidityLabels: Record<string, { label: string; color: string }> = {
    htn: { label: 'Hypertension', color: '#ef4444' },
    cad: { label: 'Coronary Artery Disease', color: '#f97316' },
    mi_history: { label: 'Prior MI', color: '#fb923c' },
    heart_failure_nyha: { label: 'Heart Failure', color: '#fbbf24' },
    afib: { label: 'Atrial Fibrillation', color: '#a855f7' },
    prev_cardio_sx: { label: 'Prior Cardio Sx', color: '#d946ef' },
    pfo_history: { label: 'PFO', color: '#ec4899' },
    other_shunt: { label: 'Other Shunt', color: '#f43f5e' },
    pad: { label: 'PAD', color: '#ca8a04' },
    stroke_isch: { label: 'Prior Ischemic Stroke', color: '#06b6d4' },
    stroke_hem: { label: 'Prior Hemorrhagic Stroke', color: '#0891b2' },
    stroke_tia: { label: 'Prior TIA', color: '#06b6d4' },
    carotid_stenosis_gt50: { label: 'Carotid Stenosis', color: '#14b8a6' },
    cea_stent_history: { label: 'CEA/Stent History', color: '#0d9488' },
    cognitive_impairment: { label: 'Cognitive Impairment', color: '#059669' },
    dm: { label: 'Diabetes Mellitus', color: '#eab308' },
    copd: { label: 'COPD', color: '#84cc16' },
    chronic_kidney: { label: 'Chronic Kidney Disease', color: '#22c55e' },
    dialysis: { label: 'Dialysis', color: '#16a34a' },
    connective_tissue_disease: { label: 'Connective Tissue Disease', color: '#3b82f6' },
    active_cancer: { label: 'Active Cancer', color: '#1e40af' }
  };

  // Get all available comorbidities with counts
  const allItems = Object.entries(comorbidities).map(([key, count]) => ({
    key,
    label: comorbidityLabels[key]?.label || key,
    count,
    percentage: total > 0 ? ((count / total) * 100) : 0,
    color: comorbidityLabels[key]?.color || '#64748b'
  }));

  // Filter to items with data and sort by prevalence
  const items = allItems
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);

  if (items.length === 0) {
    return <div className="text-slate-500 text-xs text-center py-8">No comorbidities recorded</div>;
  }

  const maxCount = Math.max(...items.map(i => i.count), 1);
  const width = 900;
  const height = Math.max(items.length * 26 + 60, 200);
  const margin = { top: 30, right: 100, bottom: 20, left: 180 };
  const chartWidth = width - margin.left - margin.right;
  const barHeight = 20;
  const xScale = (val: number) => (val / maxCount) * chartWidth;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#334155" />
      <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#334155" />
      <text x={margin.left + chartWidth/2} y={height - 2} textAnchor="middle" className="text-xs fill-slate-400 font-bold">Patient Count</text>
      {items.map((item, i) => {
        const y = margin.top + i * 26 + 13;
        const barWidth = xScale(item.count);
        return (
          <g key={item.key}>
            <text x={margin.left - 10} y={y + 4} textAnchor="end" className="text-xs fill-slate-300 font-medium">{item.label}</text>
            <rect x={margin.left} y={y - barHeight/2} width={barWidth} height={barHeight} fill={item.color} opacity="0.8" rx="3" />
            <text x={margin.left + barWidth + 8} y={y + 5} className="text-sm fill-slate-300 font-mono font-bold">{item.count}</text>
            <text x={margin.left + barWidth + 55} y={y + 5} className="text-xs fill-slate-500 font-mono">({item.percentage.toFixed(1)}%)</text>
          </g>
        );
      })}
    </svg>
  );
};

export const StrokeTypeDistribution: React.FC<{ strokeTypes: Array<{ label: string; males: number; females: number; color: string }> }> = ({ strokeTypes }) => {
  const total = strokeTypes.reduce((sum, st) => sum + st.males + st.females, 0);
  const width = 500;
  const height = 280;
  const margin = { top: 40, right: 40, bottom: 60, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const maxCount = Math.max(...strokeTypes.flatMap(st => [st.males, st.females]), 1) * 1.15;
  const barWidth = 30;
  const groupSpacing = chartWidth / strokeTypes.length;
  const groupCenter = groupSpacing / 2;

  const yScale = (val: number) => chartHeight - (val / maxCount) * chartHeight;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {/* Axes */}
      <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#334155" strokeWidth="2" />
      <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#334155" strokeWidth="2" />

      {/* Bars */}
      {strokeTypes.map((st, idx) => {
        const groupX = margin.left + idx * groupSpacing + groupCenter;
        const maleX = groupX - barWidth - 5;
        const femaleX = groupX + 5;

        const maleHeight = chartHeight - yScale(st.males);
        const femaleHeight = chartHeight - yScale(st.females);
        
        const maleY = margin.top + yScale(st.males);
        const femaleY = margin.top + yScale(st.females);

        return (
          <g key={idx}>
            {/* Male bar */}
            <rect x={maleX} y={maleY} width={barWidth} height={maleHeight} fill="#3b82f6" opacity="0.85" rx="2" />
            <text x={maleX + barWidth / 2} y={maleY - 5} textAnchor="middle" className="text-xs fill-slate-300 font-bold font-mono">
              {st.males}
            </text>
            
            {/* Female bar */}
            <rect x={femaleX} y={femaleY} width={barWidth} height={femaleHeight} fill="#ec4899" opacity="0.85" rx="2" />
            <text x={femaleX + barWidth / 2} y={femaleY - 5} textAnchor="middle" className="text-xs fill-slate-300 font-bold font-mono">
              {st.females}
            </text>

            {/* Category label */}
            <text x={groupX} y={height - margin.bottom + 20} textAnchor="middle" className="text-xs fill-slate-300 font-bold">
              {st.label}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <g>
        <rect x={margin.left + barWidth} y={margin.top - 25} width={120} height={20} fill="#3b82f6" opacity="0.2" rx="2" />
        <rect x={margin.left + barWidth + 65} y={margin.top - 25} width={120} height={20} fill="#ec4899" opacity="0.2" rx="2" />
        
        <text x={margin.left + barWidth + 3} y={margin.top - 12} className="text-[10px] fill-slate-300 font-bold">Male</text>
        <text x={margin.left + barWidth + 68} y={margin.top - 12} className="text-[10px] fill-slate-300 font-bold">Female</text>
      </g>

      {/* Y-axis labels */}
      <text x={margin.left - 10} y={height - margin.bottom + 4} textAnchor="end" className="text-[10px] fill-slate-500">
        0
      </text>
      <text x={margin.left - 10} y={margin.top + yScale(maxCount / 2) + 4} textAnchor="end" className="text-[10px] fill-slate-500">
        {(maxCount / 2).toFixed(0)}
      </text>
      <text x={margin.left - 10} y={margin.top + 4} textAnchor="end" className="text-[10px] fill-slate-500">
        {maxCount.toFixed(0)}
      </text>

      {/* Y-axis label */}
      <text x={20} y={margin.top + chartHeight / 2} textAnchor="middle" className="text-xs fill-slate-400 font-bold" transform={`rotate(-90, 20, ${margin.top + chartHeight / 2})`}>
        Patient Count
      </text>

      {/* X-axis label */}
      <text x={margin.left + chartWidth / 2} y={height - 5} textAnchor="middle" className="text-xs fill-slate-400 font-bold">
        Stroke Type
      </text>

      {/* Total label */}
      <text x={width - margin.right - 10} y={margin.top + 15} textAnchor="end" className="text-[11px] fill-slate-400 font-bold">
        Total Events: {total}
      </text>
    </svg>
  );
};

export const StrokeSeverityCard: React.FC<{ meanNihss: number; maxNihss: number }> = ({ meanNihss, maxNihss }) => {
  return (
    <div className="flex flex-col gap-8 h-full justify-between">
      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col items-center justify-center py-6">
          <div className="text-5xl font-bold text-cyan-400 font-mono">{meanNihss.toFixed(1)}</div>
          <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mt-3">Mean Score</div>
        </div>
        <div className="flex flex-col items-center justify-center py-6 border-l border-slate-700">
          <div className="text-5xl font-bold text-orange-400 font-mono">{maxNihss}</div>
          <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mt-3">Max Recorded</div>
        </div>
      </div>
      <div className="bg-slate-800/50 border border-slate-700 p-4 rounded mb-4">
        <p className="text-[10px] text-slate-400 leading-relaxed">
          <strong>NIHSS:</strong> National Institutes of Health Stroke Scale (0-42 range). Each point increase represents greater neurological impairment.
        </p>
      </div>
    </div>
  );
};
export const ProtectiveEfficacyCard: React.FC<{ withEpd: { n: number; rate: number }; noEpd: { n: number; rate: number }; pValue: number }> = ({ withEpd, noEpd, pValue }) => {
  const isSignificant = pValue < 0.05;
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-5">
        <div className="flex items-start gap-4">
          <div className="pt-1">
            <div className="w-20 h-4 bg-cyan-500 rounded shadow-lg shadow-cyan-500/20"></div>
          </div>
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-wide font-black text-cyan-400 mb-1">With EPD</div>
            <div className="text-sm font-bold text-white">{withEpd.rate.toFixed(1)}%</div>
            <div className="text-[10px] text-slate-500 font-mono">n = {withEpd.n} patients</div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="pt-1">
            <div className="w-20 h-4 bg-slate-600 rounded"></div>
          </div>
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-wide font-black text-slate-400 mb-1">No EPD</div>
            <div className="text-sm font-bold text-white">{noEpd.rate.toFixed(1)}%</div>
            <div className="text-[10px] text-slate-500 font-mono">n = {noEpd.n} patients</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 p-3 rounded">
        <p className="text-[10px] text-slate-400 flex items-start gap-2">
          <span className="text-slate-500 mt-0.5">ⓘ</span>
          <span>{isSignificant ? 'Difference is statistically significant (p < 0.05).' : 'Difference not statistically significant.'}</span>
        </p>
      </div>
    </div>
  );
};

export const AnatomicalRiskCard: React.FC<{ incompleteCow: { n: number; rate: number }; completeCow: { n: number; rate: number }; pValue: number }> = ({ incompleteCow, completeCow, pValue }) => {
  const isSignificant = pValue < 0.05;
  return (
    <div className="flex flex-col gap-6">

      <div className="space-y-5">
        <div className="flex items-start gap-4">
          <div className="pt-1">
            <div className="w-20 h-4 bg-amber-500 rounded shadow-lg shadow-amber-500/20"></div>
          </div>
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-wide font-black text-amber-400 mb-1">Incomplete CoW</div>
            <div className="text-sm font-bold text-white">{incompleteCow.rate.toFixed(1)}%</div>
            <div className="text-[10px] text-slate-500 font-mono">n = {incompleteCow.n} patients</div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="pt-1">
            <div className="w-20 h-4 bg-teal-600 rounded"></div>
          </div>
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-wide font-black text-teal-400 mb-1">Complete CoW</div>
            <div className="text-sm font-bold text-white">{completeCow.rate.toFixed(1)}%</div>
            <div className="text-[10px] text-slate-500 font-mono">n = {completeCow.n} patients</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 p-3 rounded">
        <p className="text-[10px] text-slate-400 flex items-start gap-2">
          <span className="text-slate-500 mt-0.5">ⓘ</span>
          <span>{isSignificant ? 'Difference is statistically significant (p < 0.05).' : 'Difference not statistically significant.'}</span>
        </p>
      </div>
    </div>
  );
};

export interface ComplicationRate {
  label: string;
  rate: number;
  color: string;
}

export const ComplicationRatesList: React.FC<{ data: ComplicationRate[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;
  const sorted = [...data].sort((a, b) => b.rate - a.rate);
  const maxRate = Math.max(...sorted.map(d => d.rate), 50);
  
  return (
    <svg width="100%" height="auto" viewBox="0 0 600 300" preserveAspectRatio="xMidYMid meet" className="overflow-visible">
      {sorted.map((item, i) => {
        const y = 40 + i * 45;
        const barWidth = (item.rate / maxRate) * 450;
        
        return (
          <g key={i}>
            <text x={15} y={y + 12} className="text-[11px] fill-slate-300 font-medium" textAnchor="start">{item.label}</text>
            <rect x={200} y={y - 2} width={barWidth} height={20} fill={item.color} rx="2" opacity="0.85" />
            <text x={210 + barWidth} y={y + 12} className="text-[12px] fill-white font-bold" textAnchor="start">{item.rate.toFixed(1)}%</text>
          </g>
        );
      })}
    </svg>
  );
};

export const ProceduralTimeByConfig: React.FC<{ data: TimeByConfig[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;
  const width = 600;
  const height = Math.max(data.length * 70 + 60, 250);
  const margin = { top: 40, right: 50, bottom: 20, left: 150 };
  const chartWidth = width - margin.left - margin.right;
  const maxTime = Math.max(...data.map(d => d.timeStat?.max ?? 0), 330) * 1.1;
  const xScale = (val: number) => (val / maxTime) * chartWidth;
  
  return (
    <svg width="100%" height="auto" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="overflow-visible">
      <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#334155" />
      <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#334155" />
      
      <text x={margin.left - 10} y={height - margin.bottom + 18} textAnchor="end" className="text-[10px] fill-slate-500">0</text>
      <text x={width - margin.right} y={height - margin.bottom + 18} textAnchor="start" className="text-[10px] fill-slate-500">{maxTime.toFixed(0)} min</text>
      
      {data.map((d, i) => {
        const y = margin.top + i * ((height - margin.top - margin.bottom) / data.length) + ((height - margin.top - margin.bottom) / data.length) / 2;
        const xMin = margin.left + xScale(d.timeStat?.min ?? 0);
        const xQ1 = margin.left + xScale(d.timeStat?.iqr[0] ?? 0);
        const xMedian = margin.left + xScale(d.timeStat?.median ?? 0);
        const xQ3 = margin.left + xScale(d.timeStat?.iqr[1] ?? 0);
        const xMax = margin.left + xScale(d.timeStat?.max ?? 0);
        
        return (
          <g key={i}>
            <text x={margin.left - 12} y={y + 5} textAnchor="end" className="text-[11px] fill-slate-300 font-bold uppercase">{d.config}</text>
            <line x1={xMin} y1={y - 1} x2={xQ1} y2={y - 1} stroke="#475569" strokeWidth="2" />
            <rect x={xQ1} y={y - 12} width={Math.max(xQ3 - xQ1, 4)} height={24} fill="#475569" rx="3" stroke="#64748b" strokeWidth="1" />
            <line x1={xMedian} y1={y - 14} x2={xMedian} y2={y + 14} stroke="#22d3ee" strokeWidth="3" />
            <line x1={xQ3} y1={y - 1} x2={xMax} y2={y - 1} stroke="#475569" strokeWidth="2" />
          </g>
        );
      })}
    </svg>
  );
};

export const ContrastVsCreatinine: React.FC<{ data: ScatterPoint[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;
  const width = 600;
  const height = 400;
  const margin = { top: 30, right: 40, bottom: 50, left: 70 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  const maxX = Math.max(...data.map(d => d.x), 500) * 1.1;
  const maxY = Math.max(...data.map(d => d.y), 2) * 1.1;
  
  const xScale = (val: number) => (val / maxX) * chartWidth;
  const yScale = (val: number) => chartHeight - (val / maxY) * chartHeight;
  
  return (
    <svg width="100%" height="auto" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="overflow-visible">
      <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#334155" />
      <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#334155" />
      
      <text x={margin.left} y={height - margin.bottom + 35} textAnchor="middle" className="text-[10px] fill-slate-400 font-bold">Contrast Volume (mL)</text>
      <text x={20} y={height / 2} textAnchor="middle" className="text-[10px] fill-slate-400 font-bold" transform={`rotate(-90 20 ${height/2})`}>Baseline Creatinine</text>
      
      {data.map((point, i) => {
        const x = margin.left + xScale(point.x);
        const y = margin.top + yScale(point.y);
        const color = point.group === 'aki' ? '#ef4444' : '#06b6d4';
        
        return (
          <circle key={i} cx={x} cy={y} r="4" fill={color} opacity="0.8" className="drop-shadow-lg" />
        );
      })}
    </svg>
  );
};