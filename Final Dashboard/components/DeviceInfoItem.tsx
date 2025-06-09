
import React from "react";
import { LucideIcon } from "lucide-react";

interface DeviceInfoItemProps {
  icon: LucideIcon;
  value: string;
  label: string;
}

const DeviceInfoItem: React.FC<DeviceInfoItemProps> = ({ icon: Icon, value, label }) => {
  return (
    <div className="flex items-center space-x-3 bg-[#d8d4d4] backdrop-blur-sm rounded-full py-1 px-2">
      <div className="flex items-center justify-center bg-gray-100 rounded-full p-2">
        <Icon size={16} className="text-gray-600" />
      </div>
      <div>
        <div className="font-bold text-black">{value}</div>
        <div className="text-gray-500 text-xs font-sans">{label}</div>
      </div>
    </div>
  );
};

export default DeviceInfoItem;
