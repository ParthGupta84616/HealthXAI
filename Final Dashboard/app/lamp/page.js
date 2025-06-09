"use client"

import { useState } from "react"
import { Lightbulb, Clock } from "lucide-react"

export default function LampPage() {
  const [isOn, setIsOn] = useState(true)
  const [brightness, setBrightness] = useState(65)
  const [colorTemp, setColorTemp] = useState(4000)

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Smart Lamp</h1>

      <div className="bg-blue-300 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="font-medium text-xl text-gray-900">Living Room Lamp</h2>
              <p className="text-gray-500">Connected via WiFi</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={isOn} onChange={() => setIsOn(!isOn)} />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-blue-300 after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className={`w-5 h-5 ${isOn ? "text-amber-500" : "text-gray-400"}`} />
                    <span className="font-medium">Brightness</span>
                  </div>
                  <span className="text-sm font-medium">{brightness}%</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(Number.parseInt(e.target.value))}
                  disabled={!isOn}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className={`w-5 h-5 ${isOn ? "text-amber-500" : "text-gray-400"}`} />
                    <span className="font-medium">Color Temperature</span>
                  </div>
                  <span className="text-sm font-medium">{colorTemp}K</span>
                </div>

                <input
                  type="range"
                  min="2700"
                  max="6500"
                  step="100"
                  value={colorTemp}
                  onChange={(e) => setColorTemp(Number.parseInt(e.target.value))}
                  disabled={!isOn}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />

                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Warm</span>
                  <span>Cool</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-medium text-lg text-gray-900 mb-4">Schedules</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-300 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">Morning</p>
                      <p className="text-sm text-gray-500">7:00 AM - 65%</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-blue-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-300 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">Evening</p>
                      <p className="text-sm text-gray-500">6:30 PM - 40%</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-blue-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                <button className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors mt-4">
                  Add Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
