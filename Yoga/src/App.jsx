import React from 'react';
import { poseImages } from '../../utils/pose_images';
// import './DropDown.css';
import { ThemeProvider } from 'styled-components';

export default function PoseSelector({ poseList, currentPose, setCurrentPose }) {
  const handleSelectPose = (pose) => {
    setCurrentPose(pose);
  };

  return (
    <ThemeProvider theme="light">
      <div className="flex gap-4 overflow-x-auto px-2 rounded-lg items-center py-2">
        {poseList.map((pose) => (
          <div
            key={pose}
            onClick={() => handleSelectPose(pose)}
            className={`cursor-pointer flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200 ${currentPose === pose
                ? 'bg-gray-100 text-black shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-gray-200 shadow-sm'
              }`}
          >
            <div className="w-20 h-20 flex items-center justify-center rounded-full border-2 border-gray-200 bg-white">
              <img
                src={poseImages[pose]}
                alt={pose}
                style={{ width: '150px', height: '100px' }}
                className="object-contain"
              />
            </div>
            <p className="text-sm font-medium">{pose}</p>
          </div>
        ))}
      </div>
    </ThemeProvider>
  );
}