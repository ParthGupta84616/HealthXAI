"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Volume2, Share, Clock, Activity, Wand2 } from "lucide-react"
import { useVapiCall } from "@/hooks/useVapiCall"
import VoiceOrb from "@/components/ActiveCallDetail"
import Button from "@/components/base/Button"
import { redirect } from "next/navigation"

const formatTasksForPrompt = (tasks) => {
  if (!tasks || tasks.length === 0) return "[]"
  return JSON.stringify(tasks, null, 2)
}

export default function VoiceAgentCard1() {
  const [tasks, setTasks] = useState([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [tasksError, setTasksError] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [processSuccess, setProcessSuccess] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const wasCallActiveRef = useRef(false);

  const fetchTasks = async () => {
    setTasksLoading(true)
    try {
      const response = await fetch('/api/task')
      if (!response.ok) throw new Error(`Failed to fetch tasks: ${response.status}`)
      const data = await response.json()
      setTasks(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching tasks:", error)
      setTasksError(error.message)
    } finally {
      setTasksLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Effect to reload page when call ends


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
  } = useVapiCall(dynamicAssistantOptions)

  const handleEndCallAndProcessTranscript = useCallback(async () => {
    setIsSubmitting(true)
    setProcessSuccess(false)
    const currentTranscript = transcript
    endCall()
    

    try {
      const response = await fetch('/api/process-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: currentTranscript }),
      })

      if (response.ok) {
        await fetchTasks()
        setProcessSuccess(true)
        window.location.reload()
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }, [transcript, endCall])

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  }

  const isCallActive = connected || connecting

  const vapiReady = isClient && !!vapiInstance && !tasksLoading

  return (
    <div className="block" onClick={(e) => isCallActive && e.preventDefault()}>
      <div className="relative bg-gradient-to-br from-[#1a1f2e] to-[#2C3440] rounded-2xl overflow-hidden shadow-lg border border-gray-800/50 h-[450px] hover:shadow-xl transition-all duration-300 group">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/8867374/pexels-photo-8867374.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center opacity-20 group-hover:opacity-25 transition-opacity duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="relative p-6 h-full backdrop-blur-sm">
          {/* Show card content only when call is not active */}
          {!isCallActive && (
            <>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Wand2 className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-medium text-xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      Personal AI Powered Assistant
                    </h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {tasksLoading ? "Loading tasks..." : `${tasks.length} tasks scheduled`}
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    Your Healthcare Assistant
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    if (vapiReady && !isCallActive) startCall()
                  }}
                  className="rounded-full p-4 transition-all transform hover:scale-105 bg-gray-800/80 text-gray-300 hover:bg-emerald-500/20 hover:text-emerald-400"
                  disabled={!vapiReady}
                >
                  <Mic className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-5 mt-8">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Voice Models</p>
                    <p className="text-sm font-semibold text-white">English</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Accuracy</p>
                    <p className="text-sm font-semibold text-white">80%</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Avg. Session</p>
                    <p className="text-sm font-semibold text-white">3 mins</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Share className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Assistant Connect</p>
                    <p className="text-sm font-semibold text-white">Enabled</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Show call interface when call is active */}
          {isCallActive && (
            <div className="flex flex-col items-center justify-center h-full">
              {connected && (
                <VoiceOrb
                  assistantIsSpeaking={assistantIsSpeaking}
                  volumeLevel={volumeLevel}
                  onEndCallClick={handleEndCallAndProcessTranscript}
                />
              )}
              {connecting && !connected && (
                <div className="text-white font-medium">
                  <div className="animate-spin w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full mb-3 mx-auto" />
                  Connecting...
                </div>
              )}
              {isSubmitting && (
                <div className="text-emerald-400 text-sm mt-4 animate-pulse">
                  Processing transcript...
                </div>
              )}
            </div>
          )}

          {showPublicKeyInvalidMessage && (
            <div className="mt-4 px-4 py-3 bg-red-500/20 border border-red-500/20 text-red-300 rounded-xl text-sm text-center backdrop-blur-sm">
              Please check your Vapi Public Key in .env settings.
            </div>
          )}

          {error && (
            <div className="mt-4 px-4 py-3 bg-red-500/20 border border-red-500/20 text-red-300 rounded-xl text-sm text-center backdrop-blur-sm">
              Error: {error.message || "An unknown error occurred."}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}