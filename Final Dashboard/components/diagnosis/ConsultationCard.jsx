import React from 'react';
import InitialConsultationView from './InitialConsultationView';
import ActiveCallView from './ActiveCallView';
import PleaseSetYourPublicKeyMessage from './PleaseSetYourPublicKeyMessage';
import ReturnToDocsLink from './ReturnToDocsLink';

const ConsultationCard = ({
  connecting,
  connected,
  assistantIsSpeaking,
  volumeLevel,
  showPublicKeyInvalidMessage,
  vapiInitialized,
  onStartCall,
  onEndCall,
}) => {
  const isCallActive = connecting || connected;

  return (
    <div
      className="relative z-10 w-full max-w-xl mx-auto p-8 rounded-2xl bg-transparent backdrop-blur-sm flex flex-col items-center min-h-[150px]"
    >

      {!isCallActive ? (
        // --- Initial Content ---
        <div
          className="flex flex-col items-center text-center w-full"
        >
          <InitialConsultationView
            onStartCall={onStartCall}
            connecting={connecting}
            vapiInitialized={vapiInitialized}
          />
          {showPublicKeyInvalidMessage && (
            <PleaseSetYourPublicKeyMessage isDiagnosisPage={true} />
          )}
        </div>
      ) : (
        // --- Active Call Content (Connecting or Connected) ---
        <div
          className="flex flex-col items-center justify-center w-full h-full flex-grow"
        >
          <ActiveCallView
            connecting={connecting}
            connected={connected}
            assistantIsSpeaking={assistantIsSpeaking}
            volumeLevel={volumeLevel}
            onEndCall={onEndCall}
          />
        </div>
      )}
    </div>
  );
};

export default ConsultationCard;