import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ActivityChartProps {
  data: { date: string, value: number }[];
  type?: "sleep" | "water" | "activity";
}

export function ActivityChart({ data, type = "activity" }: ActivityChartProps) {
  const getGradientColor = () => {
    switch(type) {
      case "sleep": return "#8b5cf6";
      case "water": return "#0ea5e9";
      default: return "#06b6d4";
    }
  };

  const color = getGradientColor();

  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="rgba(255,255,255,0.3)" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.3)" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(13, 25, 48, 0.9)', 
              borderColor: 'rgba(0, 242, 255, 0.2)',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#fff'
            }}
            itemStyle={{ color: '#00f2ff' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            fillOpacity={1} 
            fill="url(#colorValue)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
