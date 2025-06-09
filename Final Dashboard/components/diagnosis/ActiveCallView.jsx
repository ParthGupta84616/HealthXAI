import React from 'react';
import VoiceOrb from '@/components/ActiveCallDetail'; // Assuming VoiceOrb is in src/components/ActiveCallDetail

const ActiveCallView = ({
  connecting,
  connected,
  assistantIsSpeaking,
  volumeLevel,
  onEndCall,
}) => {
  return (
    <>
      {connecting && !connected && (
        // Connecting Indicator
        <div className="text-slate-700 font-medium text-lg animate-pulse p-10">
          Connecting...
        </div>
      )}
      {connected && (
        // VoiceOrb when connected
        <VoiceOrb
          assistantIsSpeaking={assistantIsSpeaking}
          volumeLevel={volumeLevel}
          onEndCallClick={onEndCall} // Pass the endCall function from props
        />
      )}
      {/* You could add other elements here if needed during an active call */}
    </>
  );
};

export default ActiveCallView;