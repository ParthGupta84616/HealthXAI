import CameraView from "@/components/camera-view"
import RoomsList from "@/components/rooms-list"
import MedicalImageCard from "@/components/vacuum-card"
import MusicCard from "@/components/music-card"
import VoiceAgentCard from "@/components/lamp-card"
import Page from "./consultant/page"
import VoiceAgentCard1 from "./consultant/page"

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      <div className="lg:col-span-2 space-y-6">
        <CameraView />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MedicalImageCard />
          <VoiceAgentCard />
        </div>
      </div>
      <div className="lg:col-span-1 space-y-6">
        <RoomsList />
        <VoiceAgentCard1 />
      </div>
    </div>
  )
}
