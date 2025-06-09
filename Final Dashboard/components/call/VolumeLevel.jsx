import React from "react";

const numBars = 10;

const VolumeLevel = ({ volume }) => {
  // Format volume to 2 decimal places
  const formattedVolume = volume.toFixed(2);

  return (
    // Use white background, rounded corners, padding, and shadow consistent with the theme
    <div className="p-4 bg-white rounded-2xl shadow-md shadow-slate-200">
      {/* Use theme text colors and font weight */}
      <div className="text-slate-800 font-medium mb-2 text-sm">
        <p>Volume Level</p>
      </div>
      {/* Adjust bar styling */}
      <div className="flex items-center mb-2"> 
        {Array.from({ length: numBars }, (_, i) => (
          <div
            key={i}
            // Use smaller bars, rounded-full, adjusted margin, and theme colors
            className={`w-1.5 h-4 mx-0.5 rounded-full transition-colors duration-150 ${
              i / numBars < volume ? "bg-indigo-500" : "bg-slate-200" // Use indigo for active, slate for inactive
            }`}
          />
        ))}
        {/* Display formatted volume value with theme styling */}
        <div className="ml-3 text-slate-600 text-sm font-mono">{formattedVolume}</div>
      </div>
    </div>
  );
};

export default VolumeLevel;