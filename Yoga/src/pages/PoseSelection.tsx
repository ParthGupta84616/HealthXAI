import React from 'react';
import { useNavigate } from 'react-router-dom';
import DropDown from '../components/DropDown/DropDown';
import Instructions from '../components/Instrctions/Instructions';
import { poseImages } from '../utils/pose_images';
import { Button } from '@/components/ui/button';
import './Yoga.css';

const poseList = [
  'Tree', 'Chair', 'Cobra', 'Warrior', 'Dog',
  'Shoulderstand', 'Traingle'
];

function PoseSelection() {
  const navigate = useNavigate();
  const [selectedPose, setSelectedPose] = React.useState('Tree');

  const startYoga = () => {
    // Navigate to training page with the selected pose
    navigate(`/training/${selectedPose}`);
  };

  return (
    <div className="yoga-container p-6 bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">Yoga Pose AI Trainer</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Perfect your yoga poses with real-time AI feedback. Select a pose, follow the guidelines, 
            and receive instant analysis on your form and performance.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Pose selection */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">
              Select Your Pose
            </h2>
            <DropDown
              poseList={poseList}
              currentPose={selectedPose}
              setCurrentPose={setSelectedPose}
            />
            <Button
              onClick={startYoga}
              className="w-full mt-6 text-lg bg-indigo-600 text-white font-semibold py-4 px-6 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-all duration-300"
            >
              Start Pose Detection
            </Button>
          </div>
          
          {/* Center column - Pose preview */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg flex flex-col items-center">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2 w-full text-center">
              Pose Preview
            </h2>
            <div className="flex-grow flex items-center justify-center">
              <img 
                src={poseImages[selectedPose]} 
                alt={`${selectedPose} pose`} 
                className="max-h-72 object-contain" 
              />
            </div>
            <div className="mt-4 bg-gray-700 rounded-lg px-4 py-2 text-center w-full">
              <span className="text-xl font-bold text-white">{selectedPose} Pose</span>
            </div>
          </div>
          
          {/* Right column - Instructions */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">
              Instructions
            </h2>
            <Instructions currentPose={selectedPose} />
            
            <div className="mt-6 bg-indigo-900/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">How it works</h3>
              <ul className="text-gray-300 list-disc pl-5 space-y-1">
                <li>Position yourself in front of the camera</li>
                <li>Follow the pose instructions and example image</li>
                <li>The skeleton overlay will turn green when your pose is correct</li>
                <li>Use the Training button to measure your performance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PoseSelection;