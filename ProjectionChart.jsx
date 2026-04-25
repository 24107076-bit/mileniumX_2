import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, ReferenceLine, ReferenceDot
} from 'recharts';
import { useSimulation } from '../context/SimulationContext';

const formatCurrency = (value) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
  if (value < 0) return `-₹${Math.abs(value).toLocaleString()}`;
  return `₹${value.toLocaleString()}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--bg-panel)', padding: '12px', border: '1px solid var(--border-light)', borderRadius: '8px', backdropFilter: 'blur(8px)' }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Age {label}</p>
        <p style={{ margin: 0, color: 'var(--accent-blue)' }}>
          Net Worth: {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function ProjectionChart() {
  const { simulationResult, monteCarloData, monteCarloEnabled, params } = useSimulation();
  const [zoom, setZoom] = useState('full'); // '5', '10', 'full'
  const [graphType, setGraphType] = useState('area'); // 'area', 'bar'

  const data = monteCarloEnabled ? monteCarloData : simulationResult.timeline;

  const filteredData = useMemo(() => {
    if (zoom === 'full') return data;
    const currentAge = params.currentAge;
    const endAge = zoom === '5' ? currentAge + 5 : currentAge + 10;
    return data.filter(d => d.age >= currentAge && d.age <= endAge);
  }, [data, zoom, params.currentAge]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '450px' }}>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={`btn ${graphType === 'area' ? 'primary' : ''}`} onClick={() => setGraphType('area')}>Area Graph</button>
          <button className={`btn ${graphType === 'bar' ? 'primary' : ''}`} onClick={() => setGraphType('bar')}>Bar Graph</button>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={`btn ${zoom === '5' ? 'primary' : ''}`} onClick={() => setZoom('5')}>5-Year</button>
          <button className={`btn ${zoom === '10' ? 'primary' : ''}`} onClick={() => setZoom('10')}>10-Year</button>
          <button className={`btn ${zoom === 'full' ? 'primary' : ''}`} onClick={() => setZoom('full')}>Full Life</button>
        </div>
      </div>

      <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
        <ResponsiveContainer>
          {graphType === 'area' ? (
          <AreaChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="age" stroke="#a1a1aa" tickFormatter={(tick) => `${tick}`} />
            <YAxis stroke="#a1a1aa" tickFormatter={formatCurrency} />
            <RechartsTooltip content={<CustomTooltip />} />
            
            {monteCarloEnabled ? (
              <>
                <Area type="monotone" dataKey="nw_MC_Plus30" stroke="rgba(74, 222, 128, 0.4)" fill="none" />
                <Area type="monotone" dataKey="nw_MC_Plus20" stroke="rgba(74, 222, 128, 0.6)" fill="none" />
                <Area type="monotone" dataKey="nw_MC_Plus10" stroke="rgba(74, 222, 128, 0.8)" fill="none" />
                
                <Area type="monotone" dataKey="nw_MC_Plus-10" stroke="rgba(245, 158, 11, 0.8)" fill="none" />
                <Area type="monotone" dataKey="nw_MC_Plus-20" stroke="rgba(245, 158, 11, 0.6)" fill="none" />
                <Area type="monotone" dataKey="nw_MC_Plus-30" stroke="rgba(245, 158, 11, 0.4)" fill="none" />
                
                <Area type="monotone" dataKey="netWorth" stroke="var(--accent-blue)" fillOpacity={1} fill="url(#colorNetWorth)" strokeWidth={3} />
              </>
            ) : (
              <Area type="monotone" dataKey="netWorth" stroke="var(--accent-blue)" fillOpacity={1} fill="url(#colorNetWorth)" strokeWidth={3} />
            )}

            {!monteCarloEnabled && params.milestones.map(m => {
                if (m.age >= filteredData[0].age && m.age <= filteredData[filteredData.length - 1].age) {
                    const pt = filteredData.find(d => d.age === m.age);
                    return (
                        <ReferenceDot 
                            key={m.id} x={m.age} y={pt ? pt.netWorth : 0} r={6} 
                            fill={simulationResult.trackedShortfalls[m.id] > 0 ? "var(--accent-amber)" : "var(--accent-primary)"}
                            stroke="white" 
                        />
                    );
                }
                return null;
            })}
          </AreaChart>
          ) : (
          <BarChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="age" stroke="#a1a1aa" tickFormatter={(tick) => `${tick}`} />
            <YAxis stroke="#a1a1aa" tickFormatter={formatCurrency} />
            <RechartsTooltip content={<CustomTooltip />} />
            
            <Bar dataKey="netWorth" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} />
          </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
