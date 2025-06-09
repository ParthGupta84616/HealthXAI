import React, { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import StatusChip from "./StatusChip";
import DeviceInfoItem from "./DeviceInfoItem";
import { ChevronDown, Activity, Ruler, Pencil, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { cn } from "@/lib/utils";


interface SmartDeviceCardProps {
  deviceName: string;
  deviceType: string;
  workoutCompletion: string;
  routineCompletion: string;
  height?: number;
  weight?: number;
  gender: "male" | "female";
  age: "child" | "teenager" | "old";
}

interface Avatar {
  src: string;
  gender: "male" | "female";
  age: "child" | "teenager" | "old";
}


const SmartDeviceCard: React.FC<SmartDeviceCardProps> = ({
  deviceName,
  deviceType,
  workoutCompletion,
  routineCompletion,
  height: initialHeight,
  weight: initialWeight,
  gender: initialGender,
  age: initialAge,
}) => {
  const [height, setHeight] = useState<number>(initialHeight || 170);
  const [weight, setWeight] = useState<number>(initialWeight || 70);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState<boolean>(false);
  const [bmi, setBmi] = useState<number>(0);
  const [hwRatio, setHwRatio] = useState<number>(0);

  useEffect(() => {
    const heightInMeters = height / 100;
    const calculatedBmi = weight / (heightInMeters * heightInMeters);
    setBmi(parseFloat(calculatedBmi.toFixed(1)));

    const ratio = height / weight;
    setHwRatio(parseFloat(ratio.toFixed(2)));
  }, [height, weight]);

  const handleAvatarSelect = (avatar: Avatar) => {
    setAvatarDialogOpen(false); // Close the dialog
  };


  return (
    <div className="device-card p-6 pt-4 w-full max-w-4xl mx-auto relative bg-[#e7e7e9] rounded-xl">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="text-left">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-black">{deviceName}</h2>
            <ChevronDown className="ml-1 h-5 w-5 text-black" />
          </div>
          <p className="text-gray-500 text-sm">{deviceType}</p>
        </div>
      </div>

      <div className="relative mb-4 flex justify-center">
        <div className="absolute left-10 top-16 z-10 rounded-none">
          <StatusChip value={workoutCompletion} label="Workout completion" />
        </div>
        <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
          <DialogTrigger asChild>
            <div className="health-stats mx-auto my-4 text-center cursor-pointer group">
              <img
                src="/doctor.png"
                alt="Health Avatar"
                className="h-80 object-contain mx-auto"
              />
            </div>
          </DialogTrigger>

        </Dialog>


        <div className="absolute right-10 top-40 z-10">
          <StatusChip value={routineCompletion} label="Routine completion" />
        </div>
      </div>

    </div>
  );
};

export default SmartDeviceCard;