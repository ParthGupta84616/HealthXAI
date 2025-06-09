"use client"

import Image from "next/image"
import { User, Calendar, Bot, Mic } from "lucide-react"

export default function MedicalImageCard() {
  return (
    <div className="relative bg-[#E6EEF9] rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-full hover:shadow-md transition-shadow">
      <Image
        src="https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg"
        alt="Medical background"
        className="absolute inset-0 w-full h-full object-cover"
        width={400}
        height={300}
        priority
      />
      <div className="relative p-5 backdrop-blur-md bg-white/70 h-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-medium text-lg text-gray-900">Dashboard Overview</h3>
            <p className="text-gray-500 text-sm">Your Personal Medical Assistant</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50/80 backdrop-blur-sm flex items-center justify-center text-blue-600">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Profile</p>
              <p className="text-sm font-medium">Customizable user avatar</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50/80 backdrop-blur-sm flex items-center justify-center text-blue-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Schedule</p>
              <p className="text-sm font-medium">Daily task management</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50/80 backdrop-blur-sm flex items-center justify-center text-blue-600">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Assistant</p>
              <p className="text-sm font-medium">Smart task management AI</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50/80 backdrop-blur-sm flex items-center justify-center text-blue-600">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Voice Agent</p>
              <p className="text-sm font-medium">Medical voice assistant</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
