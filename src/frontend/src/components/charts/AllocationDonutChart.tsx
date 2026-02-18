interface Allocation {
  asset: string;
  value: number;
}

interface AllocationDonutChartProps {
  allocations: Allocation[];
  totalValue: number;
}

export default function AllocationDonutChart({ allocations, totalValue }: AllocationDonutChartProps) {
  const size = 240;
  const strokeWidth = 40;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const centerX = size / 2;
  const centerY = size / 2;

  const colors = [
    'oklch(var(--chart-1))',
    'oklch(var(--chart-2))',
    'oklch(var(--chart-3))',
    'oklch(var(--chart-4))',
    'oklch(var(--chart-5))',
  ];

  let currentOffset = 0;

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="oklch(var(--muted))"
          strokeWidth={strokeWidth}
        />
        
        {allocations.map((allocation, index) => {
          const percentage = allocation.value / totalValue;
          const strokeDasharray = `${circumference * percentage} ${circumference}`;
          const strokeDashoffset = -currentOffset;
          currentOffset += circumference * percentage;

          return (
            <circle
              key={allocation.asset}
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke={colors[index % colors.length]}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300"
            />
          );
        })}
      </svg>
    </div>
  );
}
