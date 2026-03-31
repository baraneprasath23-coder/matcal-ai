import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import * as math from 'mathjs';

interface FunctionPlotterProps {
  expression: string;
  range?: [number, number];
  points?: number;
}

export const FunctionPlotter: React.FC<FunctionPlotterProps> = ({ 
  expression, 
  range = [-10, 10], 
  points = 100 
}) => {
  const data = useMemo(() => {
    const plotData = [];
    const step = (range[1] - range[0]) / points;
    
    // Clean expression: remove 'y =' or 'f(x) =' if present
    const cleanExpr = expression.replace(/^[yf]\(x\)\s*=\s*/, '').replace(/^y\s*=\s*/, '');

    try {
      const node = math.parse(cleanExpr);
      const code = node.compile();

      for (let x = range[0]; x <= range[1]; x += step) {
        try {
          const y = code.evaluate({ x });
          if (typeof y === 'number' && isFinite(y)) {
            plotData.push({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
          }
        } catch (e) {
          // Skip points where function is undefined
        }
      }
    } catch (e) {
      console.error('Failed to parse expression:', cleanExpr);
    }
    
    return plotData;
  }, [expression, range, points]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-white/40 text-sm italic">
        Invalid function or no data points
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px] bg-black/20 rounded-2xl p-4 border border-white/5">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="x" 
            stroke="rgba(255,255,255,0.3)" 
            fontSize={10}
            tickFormatter={(val) => val.toString()}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.3)" 
            fontSize={10}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#151619', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            itemStyle={{ color: '#3b82f6' }}
            cursor={{ stroke: 'rgba(59, 130, 246, 0.2)', strokeWidth: 2 }}
          />
          <ReferenceLine x={0} stroke="rgba(255,255,255,0.2)" />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
          <Line 
            type="monotone" 
            dataKey="y" 
            stroke="#3b82f6" 
            strokeWidth={2} 
            dot={false}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
