import { useState, useEffect, useCallback, useRef } from "react";
import Vapi from "@vapi-ai/web";
import { isPublicKeyMissingError } from "@/utils/index"; // Assuming you have this utility

export const useVapiCall = (assistantOptions) => {
  const [vapiInstance, setVapiInstance] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [transcript, setTranscript] = useState([]);
  const [error, setError] = useState(null);
  const [showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage] = useState(false);
  const transcriptRef = useRef([]); // Use ref for transcript accumulation

  // --- Event Handlers ---

  const handleCallStart = useCallback(() => {
    console.log("[Vapi Hook Event] Call started.");
    setConnecting(false);
    setConnected(true);
    setError(null); // Clear errors on successful start
    transcriptRef.current = []; // Reset transcript on new call
    setTranscript([]); // Clear UI transcript
  }, []);

  const handleCallEnd = useCallback(() => {
    console.log("[Vapi Hook Event] Call ended.");
    setConnecting(false);
    setConnected(false);
    setAssistantIsSpeaking(false);
    setVolumeLevel(0);
    // Transcript state is already updated by handleMessage
  }, []);

  const handleSpeechStart = useCallback(() => {
    setAssistantIsSpeaking(true);
  }, []);

  const handleSpeechEnd = useCallback(() => {
    setAssistantIsSpeaking(false);
  }, []);

  const handleVolumeLevel = useCallback((level) => {
    setVolumeLevel(level);
  }, []);

  const handleMessage = useCallback((message) => {
    // Accumulate transcript using ref
    if (message.type === "transcript" && message.transcript) {
      const newEntry = {
        role: message.role, // 'user' or 'assistant'
        text: message.transcript,
        type: message.transcriptType, // 'partial' or 'final'
        timestamp: new Date(),
      };

      if (message.transcriptType === "final") {
        // Replace the last partial for the same role or add new final
        const lastIndex = transcriptRef.current.length - 1;
        if (
          lastIndex >= 0 &&
          transcriptRef.current[lastIndex].role === newEntry.role &&
          transcriptRef.current[lastIndex].type === "partial"
        ) {
          transcriptRef.current[lastIndex] = newEntry; // Replace last partial
        } else {
          transcriptRef.current.push(newEntry); // Add new final
        }
      } else {
        // Add or replace last partial for the same role
        const lastIndex = transcriptRef.current.length - 1;
         if (
          lastIndex >= 0 &&
          transcriptRef.current[lastIndex].role === newEntry.role &&
          transcriptRef.current[lastIndex].type === "partial"
        ) {
           transcriptRef.current[lastIndex] = newEntry; // Update last partial
         } else {
           transcriptRef.current.push(newEntry); // Add new partial
         }
      }
      // Update state with the current ref value
      setTranscript([...transcriptRef.current]);
    }
    // Handle other message types if needed
  }, []);

  // ...existing code...
  const handleError = useCallback(async (err) => { // Make the handler async
    let specificError = err; // Default to the original error
    let errorMessage = "An unspecified Vapi error occurred.";

    const errorString = String(err) || '';
  const stackString = new Error().stack || '';
  const isMeetingEndedError = 
    errorString.includes('Meeting') || 
    errorString.includes('meeting') || 
    stackString.includes('Meeting has ended');

    // 1. Check for null/undefined or empty object FIRST
    if (!err || (typeof err === 'object' && Object.keys(err).length === 0 && err.constructor === Object)) {
      console.warn("[Vapi Hook Event] Received an empty error object:", err);
      
      if (isMeetingEndedError) {
        errorMessage = "Meeting has ended. Please try again.";
      } else {
        errorMessage = "An unspecified Vapi error occurred. Check assistant configuration.";
      }
      specificError = new Error(errorMessage);
    }
    // 2. THEN check if it's an HTTP Response error
    else if (err instanceof Response) {
      console.error("[Vapi Hook Event] HTTP error response received:", err);
      // Check if body is already used (less likely needed now but safe)
      if (err.bodyUsed) {
         console.warn("[Vapi Hook Event] Error response body already used.");
         errorMessage = `HTTP ${err.status} ${err.statusText || 'Error'} from ${err.url} (Body already read)`;
         specificError = new Error(errorMessage);
         specificError.response = err;
      } else {
        errorMessage = `HTTP ${err.status} ${err.statusText || 'Error'} from ${err.url}`;
        try {
          const errorBody = await err.json(); // Now safer to call
          console.error("[Vapi Hook Event] Parsed error body:", errorBody);
          if (errorBody && errorBody.message) {
            errorMessage = Array.isArray(errorBody.message) ? errorBody.message.join(', ') : errorBody.message;
          } else if (errorBody && errorBody.error) {
            errorMessage = errorBody.error;
          }
          specificError = new Error(errorMessage);
          specificError.response = err;
          specificError.body = errorBody;
        } catch (parseError) {
          console.error("[Vapi Hook Event] Failed to parse error response body:", parseError);
          // Use the errorMessage derived from status/statusText
          specificError = new Error(errorMessage);
          specificError.response = err;
        }
      }
    }
    // 3. Handle other types of errors
    else {
      console.error("[Vapi Hook Event] Non-HTTP, non-empty error triggered:", err);
      if (isMeetingEndedError) {
        errorMessage = "Meeting has ended. Please try again.";
      } else {
        errorMessage = err.message || "An unknown error occurred.";
      }

      specificError = new Error(errorMessage);
    
    // Copy any additional properties from the original error
    if (typeof err === 'object') {
      Object.keys(err).forEach(key => {
        specificError[key] = err[key];
      });
    }
    }

    specificError.userMessage = errorMessage;

    setError(specificError); // Store the potentially more specific error object
    setConnecting(false);
    setConnected(false);

    // Keep the public key check (though less likely relevant for this specific error)
    const publicKeyInvalid = isPublicKeyMissingError({ vapiError: specificError }); // Check against the processed error
    if (publicKeyInvalid) {
      console.log("[Vapi Hook Error Check] Public key invalid error detected (or related auth issue).");
      setShowPublicKeyInvalidMessage(true);
      setTimeout(() => setShowPublicKeyInvalidMessage(false), 3000);
    } else {
       // Log the final derived error message
       console.log(`[Vapi Hook Error Check] Vapi error occurred: ${errorMessage}`);
    }
  }, []);
// ...existing code...


  // --- Effects ---

  useEffect(() => {
    console.log("[Vapi Hook] Initializing Vapi...");
    const key = process.env.NEXT_PUBLIC_VAPI_API_KEY;
    if (!key) {
      console.error("VAPI Public Key is missing. Set NEXT_PUBLIC_VAPI_API_KEY environment variable.");
      handleError(new Error("VAPI Public Key is missing."));
      return;
    }
    const vapi = new Vapi(key);
    setVapiInstance(vapi);

    // Setup listeners
    vapi.on('call-start', handleCallStart);
    vapi.on('call-end', handleCallEnd);
    vapi.on('speech-start', handleSpeechStart);
    vapi.on('speech-end', handleSpeechEnd);
    vapi.on('volume-level', handleVolumeLevel);
    vapi.on('message', handleMessage);
    vapi.on('error', handleError);

    // Cleanup function
    return () => {
      console.log("[Vapi Hook] Cleaning up Vapi instance and listeners.");
      vapi.stop();
      vapi.off('call-start', handleCallStart);
      vapi.off('call-end', handleCallEnd);
      vapi.off('speech-start', handleSpeechStart);
      vapi.off('speech-end', handleSpeechEnd);
      vapi.off('volume-level', handleVolumeLevel);
      vapi.off('message', handleMessage);
      vapi.off('error', handleError);
      setVapiInstance(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Keep empty: Initialize Vapi instance only once on mount

  // --- Actions ---

  const startCall = useCallback(async () => {
    if (!vapiInstance) {
      console.error("[Vapi Hook] Attempted to start call before Vapi instance was ready.");
      handleError(new Error("Vapi not initialized"));
      return;
    }
    setConnecting(true);
    setError(null);
    setShowPublicKeyInvalidMessage(false);

    // ***** Log the options being used right before starting the call *****
    console.log("[Vapi Hook] Starting call with options:", JSON.stringify(assistantOptions, null, 2));

    try {
      // Ensure assistantOptions is not undefined or null, though it should have defaults
      if (!assistantOptions) {
         throw new Error("Assistant options are missing.");
      }
      await vapiInstance.start(assistantOptions);
    } catch (err) {
      console.error("[Vapi Hook] Error caught during vapiInstance.start():", err);
      // Manually call handleError if the 'error' event doesn't fire for start() rejections
      // It seems it might not, based on the stack trace showing the error originating from Vapi.start
      handleError(err);
    }
  }, [vapiInstance, assistantOptions, handleError]); // Keep assistantOptions dependency

  const endCall = useCallback(() => {
    if (vapiInstance) {
      vapiInstance.stop();
    }
    // State updates are handled by the 'call-end' event via handleCallEnd
  }, [vapiInstance]);

  // --- Return Value ---

  return {
    vapiInstance,
    connecting,
    connected,
    assistantIsSpeaking,
    volumeLevel,
    transcript,
    error, // Expose the error state
    showPublicKeyInvalidMessage,
    startCall,
    endCall,
  };
};