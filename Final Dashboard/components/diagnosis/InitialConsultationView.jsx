import React from 'react';
import Button from '@/components/base/Button'; // Assuming Button is in src/components/base

const InitialConsultationView = ({ onStartCall, connecting, vapiInitialized }) => {
  console.log(`[InitialConsultationView Render] connecting: ${connecting}, vapiInitialized: ${vapiInitialized}, calculated disabled: ${connecting || !vapiInitialized}`);
  return (
    <>
      <h1 className="mb-5 text-indigo-700 text-3xl sm:text-4xl font-semibold text-center">
        Symptom Assessment Assistant
      </h1>
      <div className="flex flex-col items-center gap-5 text-center w-full min-h-[150px]">
        <p className="max-w-md text-base sm:text-lg text-slate-600 mb-2.5">
          Discuss your symptoms with our AI assistant. The assistant will ask
          questions to gather information about your symptoms.
        </p>
        <Button
          label="Start Consultation"
          onClick={onStartCall}
          isLoading={connecting}
          disabled={connecting || !vapiInitialized} // Disable if connecting or Vapi not ready
          className="px-8 py-3 rounded-full bg-indigo-600 text-black hover:bg-indigo-700 transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>
      {/* Note: Error message and Docs link are rendered in the parent ConsultationCard */}
    </>
  );
};

export default InitialConsultationView;