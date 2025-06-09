
import React from "react";

interface StatusChipProps {
  value: string;
  label: string;
  className?: string;
}

const StatusChip: React.FC<StatusChipProps> = ({ value, label, className }) => {
  return (
    <div className={`status-chip ${className} text-center`}>
      <div className="font-bold text-black text-lg">{value}</div>
      <div className="text-gray-500 text-base">{label}</div>
    </div>
  );
};

export default StatusChip;
