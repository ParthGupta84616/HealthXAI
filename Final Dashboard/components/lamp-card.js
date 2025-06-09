"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Mic, Volume2, Share, Clock, Activity } from "lucide-react"

export default function VoiceAgentCard() {
  const [isListening, setIsListening] = useState(false)

  return (
    <Link href="/voice-agent" className="block">
      <div className="relative bg-[#2C3440] rounded-2xl overflow-hidden shadow-sm border border-gray-800 h-full hover:shadow-md transition-shadow">
        <Image
          src="https://images.pexels.com/photos/7089629/pexels-photo-7089629.jpeg"
          alt="Voice assistant background"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          width={400}
          height={300}
          priority
        />
        <div className="relative p-5 backdrop-blur-sm bg-black/30 h-full">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-medium text-lg text-white">Medical Voice Agent</h3>
              <p className="text-gray-300 text-sm">AI Assistant ready</p>
            </div>
            <button 
              onClick={(e) => {
                e.preventDefault()
                setIsListening(!isListening)
              }}
              className={`rounded-full p-3 transition-all ${
                isListening 
                  ? "bg-emerald-500/90 text-white animate-pulse" 
                  : "bg-gray-700/50 text-gray-300"
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-800/50 backdrop-blur-sm flex items-center justify-center text-emerald-400">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Voice Models</p>
                <p className="text-sm font-medium text-white">English / Hindi</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-800/50 backdrop-blur-sm flex items-center justify-center text-emerald-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Accuracy</p>
                <p className="text-sm font-medium text-white">98.5%</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-800/50 backdrop-blur-sm flex items-center justify-center text-emerald-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Avg. Session</p>
                <p className="text-sm font-medium text-white">4.5 mins</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-800/50 backdrop-blur-sm flex items-center justify-center text-emerald-400">
                <Share className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Doctor Connect</p>
                <p className="text-sm font-medium text-white">Enabled</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}