import React, { useState, useEffect } from 'react';
import { poseInstructions } from '../../utils/data';
import { poseImages } from '../../utils/pose_images';
import { Button } from '../ui/button';
import { Volume2, VolumeOff } from 'lucide-react';
// import './Instructions.css';

export default function Instructions({ currentPose }) {
    const [instructions, setInsntructions] = useState(poseInstructions);
    const [isPlaying, setIsPlaying] = useState(false); // To track if the speech is playing

    // Function to read instructions aloud
    const speakInstructions = (instructions) => {
        const speech = new SpeechSynthesisUtterance();
        speech.lang = 'en-US'; // Set language to English
        speech.text = instructions.join('. '); // Combine all instructions into one sentence
        speech.rate = 1; // Adjust speed of speech (1 is normal)
        speech.pitch = 1; // Adjust pitch (1 is normal)

        // Start speaking
        window.speechSynthesis.speak(speech);
    };

    // Function to stop the speech
    const stopSpeech = () => {
        window.speechSynthesis.cancel(); // Stops any ongoing speech
        setIsPlaying(false); // Update the state to indicate the speech is not playing
    };

    // Function to play the instructions
    const playSpeech = () => {
        if (instructions[currentPose]) {
            speakInstructions(instructions[currentPose]);
            setIsPlaying(true); // Update the state to indicate the speech is playing
        }
    };

    useEffect(() => {
        // When the currentPose changes, speak the instructions for that pose
        if (instructions[currentPose] && !isPlaying) {
            playSpeech();
        }
    }, [currentPose]);

    return (
        <div className="flex w-full gap-8 p-8 rounded-lg shadow-xl bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100">
            {/* Text Section with Card Styling */}
            <div className="flex-1 p-10 rounded-lg shadow-lg border border-gray-200 transform transition-all duration-300 hover:scale-105">
                <h3 className="text-lg font-semibold text-white mb-4">Instructions for {currentPose}</h3>
                <ul className="space-y-4">
                    {instructions[currentPose]?.map((instruction, index) => {
                        return (
                            <li key={index} className="text-gray-700 leading-relaxed">
                                {instruction}
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Image Section with Padding */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 rounded-lg shadow-lg border border-gray-200 transform transition-all duration-300 hover:scale-105">
                {!isPlaying && (
                    <div
                        onClick={playSpeech}
                        className='p-4'
                    // className="py-4 px-6 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 transform hover:scale-105"
                    >
                        {/* Play */}

                        <Button><Volume2 /> Play </Button>
                    </div>
                )}
                {/* Stop div */}
                {isPlaying && (
                    <div
                        onClick={stopSpeech}
                        className='p-4'
                    // className="py-4 px-6 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-300 transform hover:scale-105"
                    >
                        <Button><VolumeOff /> Stop </Button>
                    </div>
                )}
                <img
                    className="rounded-lg shadow-xl object-cover"
                    style={{ width: '400px', height: '350px' }} // Set fixed width and height
                    src={poseImages[currentPose]}
                    alt={currentPose}
                />
                {/* Play Button */}

            </div>

        </div>



    );
}
