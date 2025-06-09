"use client";
import { useEffect, useState, useCallback, useMemo } from "react"; // Add useMemo
import VoiceOrb from "@/components/ActiveCallDetail";
import Button from "@/components/base/Button";
import { motion, AnimatePresence } from "framer-motion";
// --- Import the hook ---
import { useVapiCall } from "@/hooks/useVapiCall"; 

// Helper function to format tasks for the prompt
const formatTasksForPrompt = (tasks) => {
  if (!tasks || tasks.length === 0) {
    return "[]";
  }
  return JSON.stringify(tasks, null, 2);
};

const Page = () => {
  // State for tasks
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState(null);

  // Function to fetch tasks - defined outside useEffect so we can reuse it
  const fetchTasks = async () => {
    setTasksLoading(true);
    try {
      const response = await fetch('/api/task');
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.status}`);
      }
      const data = await response.json();
      console.log("This is the data", data);
      // Set tasks directly from the array response
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasksError(error.message);
    } finally {
      setTasksLoading(false);
    }
  };

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Add a separate effect to log when tasks state changes
  useEffect(() => {
    console.log("Tasks state updated:", tasks);
  }, [tasks]);
  
  // Create dynamic assistant options with fetched tasks
  const dynamicAssistantOptions = useMemo(() => ({
    name: "Dr. Harper",
    firstMessage: `Hi Sanskar! It's Dr. Harper, your personal health assistant. I can help manage your health tasks for today. What would you like to know about your schedule, or would you like to update any tasks?`,
    transcriber: {
      provider: "deepgram",
      model: "nova-2",
      language: "en-US",
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
          content: `You are Dr. Harper, a friendly and personable AI health assistant for Sanskar. Your primary role is to help Sanskar manage their scheduled health-related tasks for the day.

You have access to Sanskar's list of tasks. Each task has an hour, a purpose, and a status (done or not done).

SCHEDULED TASKS:
${formatTasksForPrompt(tasks)}

Your responsibilities include:
- Reminding Sanskar about upcoming tasks.
- Answering questions about the tasks.
- Helping Sanskar mark tasks as completed.
- Providing encouragement and motivation related to completing the tasks.
- Discussing adjustments to the schedule if needed.
- Creating new tasks or updating existing ones as requested.

IMPORTANT INSTRUCTIONS FOR TASK MANAGEMENT:

1. CREATING TASKS:
   When Sanskar wants to add a new task, clearly note the hour and purpose.
   Example: "I'll add a new task for yoga at 5:00 PM."

2. UPDATING TASKS:
   When updating an existing task, always mention both the original task and the updated details.
   Example: "I'll update your lunch task from 'Prepare and eat a healthy lunch' to 'Salad with grilled chicken' at 12:00 PM."

3. MARKING TASKS COMPLETE:
   When marking tasks as complete, clearly confirm this.
   Example: "I've marked your morning walk as completed. Great job!"

4. FINAL SUMMARY:
   Before ending the conversation, ALWAYS provide a clear summary section using exactly this format:

   "TASK SUMMARY:
   - NEW TASK: [Hour] - [Purpose]
   - UPDATED TASK: Original '[Original Purpose]' changed to '[New Purpose]' at [Hour]
   - COMPLETED: [Hour] - [Purpose]"

   If no tasks were modified, state: "TASK SUMMARY: No tasks were created or modified during this session."

This format is crucial for the system to correctly process task changes after the conversation.

Maintain a supportive, friendly, and encouraging tone throughout. Focus on managing Sanskar's daily health schedule effectively. Avoid giving specific medical advice beyond the scope of the scheduled tasks.`,
        },
      ],
    },
  }), [tasks]);

  // --- Use the hook to manage Vapi state with dynamic options ---
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
    error
  } = useVapiCall(dynamicAssistantOptions);

  // State to manage loading state during transcript submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processSuccess, setProcessSuccess] = useState(false);

  // Function to process and send the transcript
  const handleEndCallAndProcessTranscript = useCallback(async () => {
    setIsSubmitting(true);
    setProcessSuccess(false);
    console.log("Ending call and processing transcript...");
    
    // Capture the transcript before ending the call
    const currentTranscript = transcript;
    console.log("Final Transcript:", currentTranscript);
    
    // End the call first to ensure voice connection is properly closed
    endCall();
    
    try {
      // Send the transcript to the backend API
      const response = await fetch('/api/process-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: currentTranscript }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error processing transcript:", errorData);
        // You could set an error state here to display in the UI
        // setProcessingError(errorData.error || "Failed to process transcript");
      } else {
        const result = await response.json();
        console.log("Transcript processed successfully:", result);
        
        // Always refresh tasks after processing, even if taskCount is 0
        // This ensures we have the latest data
        try {
          // Refresh the tasks to show the updated list
          const tasksResponse = await fetch('/api/task');
          if (tasksResponse.ok) {
            const tasksData = await tasksResponse.json();
            // Fixed: expect an array directly, not a tasks property
            setTasks(Array.isArray(tasksData) ? tasksData : []);
            console.log("Tasks refreshed successfully:", tasksData);
            setProcessSuccess(true);
          }
        } catch (refreshError) {
          console.error("Error refreshing tasks:", refreshError);
        }
      }
    } catch (error) {
      console.error("Network error sending transcript:", error);
      // You could set a network error state here
      // setProcessingError("Network error - please check your connection");
    } finally {
      setIsSubmitting(false);
    }
  }, [transcript, endCall]); // setTasks doesn't need to be a dependency


  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  };

  const isCallActive = connected || connecting;

  // Add a check for client-side rendering if the hook relies on it
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Update vapiReady to also check if tasks are loaded
  const vapiReady = isClient && !!vapiInstance && !tasksLoading;
  
  return (
    <main className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
      {/* Container for the initial content card */}
      <div
        className={`
          relative z-10
          w-full max-w-xl
          mx-auto p-6 rounded-2xl bg-white
          shadow-md shadow-slate-200
          transition-opacity duration-300
          ${isCallActive ? 'opacity-50 pointer-events-none' : 'opacity-100'}
        `}
      >
        <h1 className="text-3xl sm:text-4xl font-semibold text-center text-slate-800 mb-6">
          Your Personal Health Assistant
        </h1>
        <div className="flex flex-col items-center gap-6 text-center w-full min-h-[150px]">
          <p className="text-base sm:text-lg text-slate-600 max-w-md">
            Connect with your personal health assistant who knows your diet, exercise routine, and health goals.
          </p>
          
          {/* Display tasks count when loaded */}
          {!tasksLoading && tasks.length > 0 && (
            <p className="text-sm text-slate-600">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} in your schedule
            </p>
          )}
          
          {/* Show loading state for tasks */}
          {tasksLoading && (
            <p className="text-sm text-slate-500">Loading your tasks...</p>
          )}
          
          {/* Show task error if there is one */}
          {tasksError && (
            <div className="text-sm text-red-500">
              Error loading tasks: {tasksError}
            </div>
          )}
          
          {/* Show success message after processing transcript */}
          {processSuccess && (
            <div className="text-sm text-green-600 py-1 px-3 bg-green-50 rounded-full">
              Conversation processed successfully!
            </div>
          )}
          
          <Button
            label="Start Conversation"
            onClick={startCall}
            isLoading={connecting && !connected}
            disabled={connecting || connected || !vapiReady}
            className="px-6 py-3 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          />
          
          {!vapiReady && isClient && !tasksLoading && (
            <p className="text-xs text-slate-500 mt-2">Initializing...</p>
          )}
        </div>
        {/* Use showPublicKeyInvalidMessage from the hook */}
        {showPublicKeyInvalidMessage && <PleaseSetYourPublicKeyMessage />}
         {/* Display Vapi Error if exists */}
         {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
              <strong>Error:</strong> {error.message || "An unknown error occurred."}
            </div>
         )}
      </div>

      {/* Call Modal - Remains fixed relative to viewport */}
      <AnimatePresence>
        {isCallActive && (
          <motion.div
            key="call-modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
          >
            {/* Inner Card */}
            <div className="relative w-full max-w-2xl p-6 rounded-2xl shadow-xl bg-white/70 border border-white/30">
              {/* Content inside the modal */}
              <div className="relative min-h-[450px] flex flex-col justify-center items-center">
                {connected && (
                  <VoiceOrb
                    assistantIsSpeaking={assistantIsSpeaking}
                    volumeLevel={volumeLevel}
                    // Use the new handler for the button click
                    onEndCallClick={handleEndCallAndProcessTranscript}
                  />
                )}
                {/* Display submitting state */}
                {isSubmitting && (
                   <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-slate-600 font-medium">
                     Processing transcript...
                   </div>
                )}
                {connecting && !connected && (
                  <div className="text-slate-700 font-medium text-lg">Connecting...</div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

const PleaseSetYourPublicKeyMessage = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="mt-4 px-4 py-3 bg-red-100 text-red-700 rounded-xl shadow-sm text-sm text-center"
  >
    Is your Vapi Public Key missing? Please check your <code>.env</code> settings.
  </motion.div>
);

const ReturnToDocsLink = () => (
  <a
    href="https://docs.vapi.ai"
    target="_blank"
    rel="noopener noreferrer"
    className="block mt-6 text-center text-sm text-slate-500 hover:text-slate-700 transition-colors duration-200"
  >
    {/* Return to Vapi Docs */}
  </a>
);

export default Page;