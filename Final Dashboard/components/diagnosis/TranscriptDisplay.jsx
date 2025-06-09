import React from 'react';

const TranscriptDisplay = ({ transcript }) => {
  return (
    <>
      <h2 className="text-xl font-semibold text-slate-800 mb-4 text-center">
        Consultation Transcript
      </h2>
      <div className="flex-grow overflow-y-auto max-h-[40vh] pr-2 space-y-3 text-sm text-slate-700 mb-6 border rounded-md p-3 bg-gray-50">
        {transcript && transcript.length > 0 ? (
          transcript.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`p-3 rounded-lg max-w-[80%] ${
                  msg.role === 'user'
                    ? 'bg-indigo-100 text-indigo-900' // User message style
                    : 'bg-slate-100 text-slate-800' // Assistant message style
                }`}
              >
                <span className="font-medium block mb-1">
                  {msg.role === 'user' ? 'You' : 'Dr. Morgan'}: {/* Assuming assistant name is Dr. Morgan */}
                </span>
                {msg.message}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-slate-500">No transcript available.</p>
        )}
      </div>
    </>
  );
};

export default TranscriptDisplay;