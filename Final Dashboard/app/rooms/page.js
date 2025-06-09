import RoomsList from "@/components/rooms-list"

export default function RoomsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Rooms</h1>
      <div className="h-[calc(100vh-150px)]">
        <RoomsList />
      </div>
    </div>
  )
}
