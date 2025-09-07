interface ProgressBarProps {
  current: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
}

export const ProgressBar = ({ 
  current, 
  max, 
  label, 
  showPercentage = true,
  color = 'bg-nigeria-green' 
}: ProgressBarProps) => {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{label}</span>
          {showPercentage && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className={`${color} h-3 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        >
          <div className="h-full bg-white/20 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};