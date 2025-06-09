"use client";
import { useState, useEffect, useCallback } from "react";
import jsPDF from "jspdf";
// Import the hook and new components
import { useVapiCall } from "@/hooks/useVapiCall";
import ConsultationCard from "@/components/diagnosis/ConsultationCard"; 
// Removed TranscriptReportModal import if not used
import Card2 from "@/components/Cards/Card2";
import Card3 from "@/components/Cards/Card3";
import Card4 from "@/components/Cards/Card4";
import Card5 from "@/components/Cards/Card5";

// Define the two language codes
const LANGUAGES = {
  ENGLISH: "en-US",
  HINDI: "hi",
};

const Page = () => {
  const [isClient, setIsClient] = useState(false);
  // State to track the selected language code
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES.ENGLISH); 

  // Determine the language code for the system prompt (e.g., 'en' or 'hi')
  const promptLanguage = selectedLanguage === LANGUAGES.HINDI ? 'hi' : 'en';

  // Create assistant options that use the selected language
  const assistantOptions = {
    name: "Dr. Morgan",
    firstMessage:
      selectedLanguage === LANGUAGES.HINDI
        ? "नमस्ते, मैं डॉ. मॉर्गन हूँ। आपकी स्वास्थ्य स्थिति को समझने के लिए मैं कुछ संक्षिप्त प्रश्न पूछूंगा। कृपया अपना नाम बताएं?" 
        : "Hello, I'm Dr. Morgan. I'll ask a few brief questions to understand your health condition. Could you please tell me your name?",
    transcriber: {
      provider: "deepgram",
      model: "base",
      language: selectedLanguage,
    },
    voice: {
      provider: "openai",
      voiceId: "alloy", 
    },
    model: {
      provider: "openai",
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are Dr. Morgan, an AI healthcare assistant engaging with a user in a test environment.
  You should respond in the ${promptLanguage} language.
  
  CONVERSATION INSTRUCTIONS:
  Keep the consultation focused and efficient by collecting only essential information:
  
  1) Collect these specific pieces of information in this order:
     - Name
     - Height and weight
     - Any previous medical conditions or medications they're taking
     - Current symptoms or health issue they're experiencing
     - Family history of diseases (especially related to their current concerns)
  
  2) After collecting this information, provide:
     - A brief summary of what they've shared
     - 1-2 possible conditions that could explain their symptoms
     - Simple next steps they should consider
     - Basic self-care recommendations
  
  Communication guidelines:
  - Be warm but efficient
  - Ask one question at a time
  - Use simple, clear language
  - Don't ask for unnecessary details
  - Keep your responses concise (2-3 sentences when possible)
  
  This is a voice conversation, so brevity is important. Move through the questions methodically but don't rush the patient.`,
        },
      ],
    },
  };

  // Use the custom hook to manage Vapi state and interactions
  const {
    vapiInstance,
    connecting,
    connected,
    assistantIsSpeaking,
    volumeLevel,
    transcript,
    showPublicKeyInvalidMessage,
    startCall,
    endCall,
    error // Make sure error state is returned from the hook
  } = useVapiCall(assistantOptions);

  // Helper variable for call state
  const isCallActive = connecting || connected;

  // Toggle language function
  const toggleLanguage = () => {
    if (!isCallActive) {
      const nextLang = selectedLanguage === LANGUAGES.ENGLISH ? LANGUAGES.HINDI : LANGUAGES.ENGLISH;
      setSelectedLanguage(nextLang);
      console.log(
        `Language toggled to ${
          nextLang === LANGUAGES.HINDI ? "Hindi (hi-IN)" : "English (en-US)"
        }`
      );
    } else {
      alert("Please end the current conversation before changing language.");
    }
  };




  

  // State for report generation
  const [report, setReport] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Define generateReportApiCall *before* the useEffect that uses it
  const generateReportApiCall = useCallback(async (finalTranscript) => {
    // Your existing implementation
    if (!finalTranscript || finalTranscript.length === 0) return null;

    setIsGeneratingReport(true);
    setReport("");
    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: finalTranscript }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      setReport(data.report);
      return data.report;
    } catch (error) {
      console.error("[Page Client] Failed to fetch or generate report:", error);
      setReport(`Failed to generate report: ${error.message}`);
      return `Failed to generate report: ${error.message}`;
    } finally {
      setIsGeneratingReport(false);
    }
  }, []);
  
  
  
  
  
  // Empty dependency array if it doesn't depend on component state/props

  // Define downloadReportAsPDF (can also be moved up)
  const downloadReportAsPDF = useCallback(
    (reportText, fileName = "medical-report.pdf") => {
      // Your existing implementation
      if (!reportText) {
        console.error("No report text available to download.");
        return;
      }
      try {
        const doc = new jsPDF();
        const pageHeight =
          doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const pageWidth =
          doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
        const margin = 15;
        const maxLineWidth = pageWidth - margin * 2;
        const lineHeight = 7;
        let y = margin;
        doc.setFontSize(16);
        doc.text("Medical Consultation Summary", pageWidth / 2, y, {
          align: "center",
        });
        y += lineHeight * 2;
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(reportText, maxLineWidth);
        lines.forEach((line) => {
          if (y + lineHeight > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += lineHeight;
        });
        doc.save(fileName);
        console.log("PDF download initiated.");
      } catch (error) {
        console.error("Error generating PDF:", error);
      }
    },
    []
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Effect to trigger report generation when the call ends and transcript is available
  useEffect(() => {
    const wasConnected = sessionStorage.getItem("wasConnected") === "true";

    if (wasConnected && !connected && transcript.length > 0) {
      console.log(
        "[Page Effect] Call ended with transcript. Generating report..."
      );
      generateReportApiCall(transcript); // Now generateReportApiCall is defined above
    }

    sessionStorage.setItem("wasConnected", connected ? "true" : "false"); // Store as string

    // Cleanup function for session storage
    return () => {
      if (!connected) {
        sessionStorage.removeItem("wasConnected");
      }
    };
  }, [connected, transcript, generateReportApiCall]); // Dependency array is now valid


  // Determine if Vapi is ready *on the client*
  const vapiReady = isClient && !!vapiInstance;

  // Enhanced card styling
  const cardStyle =
    "bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300";
  const topCardMinHeight = "min-h-[250px]";
 
  return (
    <div className="flex flex-col gap-3 p-12 md:p-12 min-h-screen  w-full overflow-x-hidden">
      <div className="flex gap-4 w-full">
        {/* Top Left Card Container */}
        <div className={`${cardStyle} ${topCardMinHeight} w-7/12 flex flex-col`}> 
          {isClient ? (
            <>
              {/* Language Toggle Button - Placed inside the top-left card */}
              <div className="w-full flex justify-end items-center space-x-2">
                 <span className="text-sm font-medium text-gray-700">
                   Language: {selectedLanguage === LANGUAGES.ENGLISH ? "English" : "हिन्दी"}
                 </span>
                 <button
                   onClick={toggleLanguage}
                   disabled={isCallActive}
                   title={isCallActive ? "End the current call to change language" : `Switch to ${selectedLanguage === LANGUAGES.ENGLISH ? "Hindi" : "English"}`}
                   className={`px-4 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                     isCallActive
                       ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                       : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                   }`}
                 >
                   Switch to {selectedLanguage === LANGUAGES.ENGLISH ? "हिन्दी" : "English"}
                 </button>
              </div>
              
              {/* Consultation Card Component */}
              <div className="flex-grow flex items-center justify-center"> 
                <ConsultationCard
                  connecting={connecting}
                  connected={connected}
                  assistantIsSpeaking={assistantIsSpeaking}
                  volumeLevel={volumeLevel}
                  showPublicKeyInvalidMessage={showPublicKeyInvalidMessage}
                  vapiInitialized={vapiReady}
                  onStartCall={startCall}
                  onEndCall={endCall}
                />
              </div>
              {/* Display Vapi Error if exists */}
              {error && (
                 <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                   <strong>Error:</strong> {error.message || "An unknown error occurred."}
                 </div>
              )}
            </>
          ) : (
            // Loading Skeleton
            <div className="flex flex-col items-center justify-center h-full"> 
              <div className="animate-pulse flex flex-col items-center">
                <div className="rounded-full bg-slate-200 h-16 w-16 mb-4"></div>
                <div className="h-6 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              </div>
            </div>
          )}
        </div>

        {/* Top Right Card (Transcript) */}
        <Card2 transcript={transcript} />
      </div>

      {/* Bottom Row */}
      <div className="flex gap-4 w-full">
        <div className="flex gap-4 w-2/3">
          <Card3 />
          <Card4 />
        </div>

        <Card5
          transcript={transcript}
          generateReportApiCall={generateReportApiCall}
          downloadReportAsPDF={downloadReportAsPDF}
          conversationActive={isCallActive} 
          report={report}
          isGeneratingReport={isGeneratingReport}
        />
      </div>
    </div>
  );
};

export default Page;