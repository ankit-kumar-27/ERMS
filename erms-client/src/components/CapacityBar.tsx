interface CapacityBarProps {
  value: number;
  label?: string;
}

const CapacityBar: React.FC<CapacityBarProps> = ({ value, label }) => {
  return (
    <div className="w-full">
      {label && <div className="mb-1 text-xs text-gray-700 font-medium">{label}</div>}
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className={`h-4 rounded-full ${
            value < 70
              ? 'bg-green-500'
              : value < 90
              ? 'bg-yellow-400'
              : 'bg-red-500'
          }`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
      <div className="text-xs text-gray-600 mt-1">{value}% allocated</div>
    </div>
  );
};

export default CapacityBar; 