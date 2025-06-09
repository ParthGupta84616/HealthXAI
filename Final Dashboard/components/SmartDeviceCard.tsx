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

const AVATARS: Avatar[] = [
  { src: "/male_child.svg", gender: "male", age: "child" },
  { src: "/male_teenager.svg", gender: "male", age: "teenager" },
  { src: "/male_old.svg", gender: "male", age: "old" },
  { src: "/female_child.svg", gender: "female", age: "child" },
  { src: "/female_teenager.svg", gender: "female", age: "teenager" },
  { src: "/female_old.svg", gender: "female", age: "old" },
];

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
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar>(() =>
    AVATARS.find(avatar => avatar.gender === initialGender && avatar.age === initialAge) || AVATARS[0]
  );

  useEffect(() => {
    const heightInMeters = height / 100;
    const calculatedBmi = weight / (heightInMeters * heightInMeters);
    setBmi(parseFloat(calculatedBmi.toFixed(1)));

    const ratio = height / weight;
    setHwRatio(parseFloat(ratio.toFixed(2)));
  }, [height, weight]);

  const handleAvatarSelect = (avatar: Avatar) => {
    setSelectedAvatar(avatar);
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
        <Switch className="mt-1" defaultChecked />
      </div>

      <div className="relative mb-4 flex justify-center">
        <div className="absolute left-10 top-16 z-10 rounded-none">
          <StatusChip value={workoutCompletion} label="Workout completion" />
        </div>
        <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
          <DialogTrigger asChild>
            <div className="health-stats mx-auto my-4 text-center cursor-pointer group">
              <img
                src={selectedAvatar.src}
                alt="Health Avatar"
                className="h-72 object-contain mx-auto"
              />
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Choose Your Avatar</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-6 py-4">
              {AVATARS.map((avatar) => (
                <div
                  key={`${avatar.gender}-${avatar.age}`}
                  className={cn(
                    "relative cursor-pointer group",
                    "transition-all duration-200 ease-in-out",
                    "hover:scale-105"
                  )}
                  onClick={() => handleAvatarSelect(avatar)}
                >
                  <div className="relative">
                    <img
                      src={avatar.src}
                      alt={`${avatar.gender} ${avatar.age} avatar`}
                      className="w-full h-32 object-contain"
                    />
                    <div className={cn(
                      "absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2",
                      "w-6 h-6 rounded-full border-2",
                      "flex items-center justify-center",
                      "transition-colors duration-200",
                      selectedAvatar === avatar
                        ? "bg-blue-500 border-blue-600"
                        : "bg-white border-gray-300"
                    )}>
                      {selectedAvatar === avatar && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                  <p className="text-center mt-4 text-sm font-medium">
                    {avatar.gender.charAt(0).toUpperCase() + avatar.gender.slice(1)} {avatar.age}
                  </p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>


        <div className="absolute right-10 top-40 z-10">
          <StatusChip value={routineCompletion} label="Routine completion" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 relative z-10">
        <DeviceInfoItem
          icon={Activity}
          value={`${bmi}`}
          label="BMI"
        />
        <Dialog>
          <DialogTrigger asChild>
            <div className="cursor-pointer">
              <DeviceInfoItem
                icon={Ruler}
                value={`${hwRatio}`}
                label="H/W Ratio"
              />
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update Health Metrics</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="height" className="text-sm font-medium text-gray-700">Height (cm)</label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="weight" className="text-sm font-medium text-gray-700">Weight (kg)</label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="h-9"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="button">
                Update
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <DeviceInfoItem
          icon={Activity}
          value={`${bmi}`}
          label="BMI"
        />
      </div>
    </div>
  );
};

export default SmartDeviceCard;