"use client"

import { useState } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle } from "lucide-react"

export default function MusicPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(35)
  const [volume, setVolume] = useState(70)

  const songs = [
    { id: 1, title: "Midnight City", artist: "M83", album: "Hurry Up, We're Dreaming", duration: "4:03", active: true },
    { id: 2, title: "Redbone", artist: "Childish Gambino", album: "Awaken, My Love!", duration: "5:27", active: false },
    { id: 3, title: "Electric Feel", artist: "MGMT", album: "Oracular Spectacular", duration: "3:49", active: false },
    {
      id: 4,
      title: "Tame Impala",
      artist: "The Less I Know The Better",
      album: "Currents",
      duration: "3:38",
      active: false,
    },
    { id: 5, title: "Starboy", artist: "The Weeknd", album: "Starboy", duration: "3:50", active: false },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Music Player</h1>

      <div className="bg-[#E7E6E9] rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-48 h-48 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0">
              <img
                src="https://consequence.net/wp-content/uploads/2011/10/m83.jpg"
                alt="Album Cover"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 text-center md:text-left">
              <h2 className="font-medium text-2xl text-gray-900">Midnight City</h2>
              <p className="text-gray-500 text-lg">M83 - Hurry Up, We're Dreaming</p>

              <div className="mt-6 max-w-md mx-auto md:mx-0">
                <div className="relative w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-black rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>1:24</span>
                  <span>4:03</span>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-8 mt-6">
                <button className="text-gray-500 hover:text-gray-700">
                  <Shuffle className="w-5 h-5" />
                </button>
                <button className="text-gray-500 hover:text-gray-700">
                  <SkipBack className="w-6 h-6" />
                </button>
                <button
                  className="w-12 h-12 rounded-full bg-[#111523] text-white flex items-center justify-center hover:bg-gray-950"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </button>
                <button className="text-gray-500 hover:text-gray-700">
                  <SkipForward className="w-6 h-6" />
                </button>
                <button className="text-gray-500 hover:text-gray-700">
                  <Repeat className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3 mt-6 max-w-xs mx-auto md:mx-0">
                <Volume2 className="w-5 h-5 text-gray-500" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number.parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-black"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#E7E6E9] rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <div className="p-4">
          <h3 className="font-medium text-lg text-gray-900 mb-4">Queue</h3>
          <ul className="divide-y divide-gray-100">
            {songs.map((song) => (
              <li key={song.id} className={`py-3 px-2 ${song.active ? "bg-white rounded-xl" : ""}`}>
                <div className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      song.active ? "bg-black text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {song.active ? <Play className="w-4 h-4" /> : song.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${song.active ? "text-black" : "text-gray-700"}`}>
                      {song.title}
                    </p>
                    <p className={`text-sm truncate ${song.active ? "text-amber-700" : "text-gray-500"}`}>
                      {song.artist}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">{song.duration}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
