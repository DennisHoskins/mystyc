import React, { useMemo } from 'react';

interface Planet {
  sign: string;
  degrees: number;
  absoluteDegrees: number;
}

interface ChartData {
  planets: {
    [key: string]: Planet;
  };
  houses?: number[];
  size?: number;
}

interface StarChartProps {
  data: ChartData | null | undefined;
  showAspects?: boolean;
  showHouses?: boolean;
}

export default function StarChart({ data, showAspects = true, showHouses = true }: StarChartProps) {
  const chartSize = data?.size || 400;
  const center = chartSize / 2;
  const outerRadius = chartSize * 0.45;
  const innerRadius = chartSize * 0.3;

  // const icon = getZodiacIcon("Pisces", "w-4 h-4 text-white");
  
  const planetSymbols: { [key: string]: string } = {
    Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
    Jupiter: '♃', Saturn: '♄', Rising: 'AC', Uranus: '♅', 
    Neptune: '♆', Pluto: '♇'
  };

  const planetColors: { [key: string]: string } = {
    Sun: '#ffd700', Moon: '#c0c0c0', Mercury: '#87ceeb', 
    Venus: '#ff69b4', Mars: '#ff4500', Jupiter: '#daa520',
    Saturn: '#696969', Rising: '#800080', Uranus: '#4fc3f7',
    Neptune: '#26c6da', Pluto: '#8e24aa'
  };

  const zodiacSigns = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
  const signColors = ['#ff6b6b', '#51cf66', '#74c0fc', '#69db7c', '#ffd43b', '#74c0fc', 
                     '#ff8cc8', '#51cf66', '#845ef7', '#ffd43b', '#74c0fc', '#69db7c'];

  const calculateAspect = (deg1: number, deg2: number): { type: string; color: string; dash: string } | null => {
    const diff = Math.abs(deg1 - deg2);
    const angle = Math.min(diff, 360 - diff);
    
    if (Math.abs(angle - 0) <= 8) return { type: 'Conjunction', color: '#ff6b6b', dash: 'none' };
    if (Math.abs(angle - 60) <= 6) return { type: 'Sextile', color: '#51cf66', dash: 'none' };
    if (Math.abs(angle - 90) <= 8) return { type: 'Square', color: '#ff8787', dash: '5,5' };
    if (Math.abs(angle - 120) <= 8) return { type: 'Trine', color: '#339af0', dash: 'none' };
    if (Math.abs(angle - 180) <= 8) return { type: 'Opposition', color: '#f76707', dash: '10,5' };
    
    return null;
  };

  const aspects = useMemo(() => {
    if (!showAspects) return [];
    
    const aspectLines: Array<{
      x1: number; y1: number; x2: number; y2: number;
      aspect: { type: string; color: string; dash: string };
      planets: [string, string];
    }> = [];
    
    const planetEntries = data && Object.entries(data.planets);
    if (planetEntries) {
      for (let i = 0; i < planetEntries.length; i++) {
        for (let j = i + 1; j < planetEntries.length; j++) {
          const [planet1, data1] = planetEntries[i];
          const [planet2, data2] = planetEntries[j];
          
          const aspect = calculateAspect(data1.absoluteDegrees, data2.absoluteDegrees);
          if (aspect) {
            const angle1 = (data1.absoluteDegrees - 90) * Math.PI / 180;
            const angle2 = (data2.absoluteDegrees - 90) * Math.PI / 180;
            
            aspectLines.push({
              x1: center + Math.cos(angle1) * innerRadius,
              y1: center + Math.sin(angle1) * innerRadius,
              x2: center + Math.cos(angle2) * innerRadius,
              y2: center + Math.sin(angle2) * innerRadius,
              aspect,
              planets: [planet1, planet2]
            });
          }
        }
      }
    }
    return aspectLines;
  }, [data, showAspects, center, innerRadius]);

  return (
    <div className="relative">
      <svg width={chartSize} height={chartSize} className="drop-shadow-lg">
        
        {/* Background */}
        <circle cx={center} cy={center} r={outerRadius} fill="none" />
        
        {/* Outer circle */}
        <circle cx={center} cy={center} r={outerRadius} fill="none" stroke="#333" strokeWidth="2" />
        
        {/* Inner circle */}
        <circle cx={center} cy={center} r={innerRadius} fill="none" stroke="#666" strokeWidth="1" />
        
        {/* Zodiac signs */}
        {zodiacSigns.map((sign, i) => {
          const angle = (i * 30 - 90) * Math.PI / 180;
          const radius = outerRadius - 25;
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;
          
          return (
            <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="20" fill={signColors[i]} fontFamily="Arial" fontWeight="bold">
              {sign}
            </text>
          );
        })}
        
        {/* House lines */}
        {showHouses && data?.houses?.map((cusp, i) => {
          const angle = (cusp - 90) * Math.PI / 180;
          const x1 = center + Math.cos(angle) * innerRadius;
          const y1 = center + Math.sin(angle) * innerRadius;
          const x2 = center + Math.cos(angle) * outerRadius;
          const y2 = center + Math.sin(angle) * outerRadius;
          
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#999" strokeWidth="1" opacity="0.7" />
              <text x={x1 + (x2-x1)*0.1} y={y1 + (y2-y1)*0.1} fontSize="10" fill="#666">{i + 1}</text>
            </g>
          );
        })}
        
        {/* Aspects */}
        {aspects.map((aspect, i) => (
          <line key={i}
                x1={aspect.x1} y1={aspect.y1} x2={aspect.x2} y2={aspect.y2}
                stroke={aspect.aspect.color} strokeWidth="2" opacity="0.6"
                strokeDasharray={aspect.aspect.dash}
               />
        ))}
        
        {/* Planets */}
        {data && Object.entries(data.planets).map(([planet, planetData]) => {
          const angle = (planetData.absoluteDegrees - 90) * Math.PI / 180;
          const radius = outerRadius - 45;
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;
          
          return (
            <g key={planet}>
              
              {/* Planet circle */}
              <circle cx={x} cy={y} fill={planetColors[planet] || '#333'} />
              
              {/* Planet symbol */}
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
                    fontSize={"14"} 
                    fill="white" fontWeight="bold">
                {planetSymbols[planet] || planet.charAt(0)}
              </text>
              
              {/* Degree label */}
              <text x={x} y={y + 30} textAnchor="middle" fontSize="10" fill="#444">
                {Math.round(planetData.degrees)}°
              </text>
              
              {/* Sign label */}
              <text x={x} y={y + 42} textAnchor="middle" fontSize="9" fill="#666">
                {planetData.sign}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
