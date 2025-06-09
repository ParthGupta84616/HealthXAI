import React from "react";
import { motion } from "framer-motion"; // Import motion for animation

const AssistantSpeechIndicator = ({ isSpeaking }) => {
  return (
    // Use white background, rounded corners, padding, and shadow consistent with the theme
    <div className="p-4 bg-white rounded-2xl shadow-md shadow-slate-200 flex items-center">
      {/* Animated indicator dot */}
      <motion.div
        className="w-3 h-3 mr-3 rounded-full" // Smaller size, rounded-full, increased margin
        animate={{
          backgroundColor: isSpeaking ? "#6366f1" : "#cbd5e1", // indigo-500 for speaking, slate-300 for not speaking
          scale: isSpeaking ? [1, 1.4, 1] : 1, // Pulse animation when speaking
          opacity: isSpeaking ? [0.7, 1, 0.7] : 0.7, // Opacity pulse when speaking
        }}
        transition={{
          scale: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
          backgroundColor: { duration: 0.3 }, // Faster color transition
        }}
      />
      {/* Use theme text colors and font weight */}
      <p className="text-slate-600 m-0 text-sm font-medium"> {/* slate-600, text-sm, font-medium */}
        {isSpeaking ? "Assistant speaking" : "Assistant idle"} {/* Changed text for clarity */}
      </p>
    </div>
  );
};

export default AssistantSpeechIndicator;