export default function CameraPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-black">Camera View</h1>
      <div className="bg-blue-50 rounded-2xl overflow-hidden shadow-md border border-blue-100">
        <div className="aspect-video bg-blue-100 relative overflow-hidden">
          <img
            src="/placeholder.svg?height=400&width=1200"
            alt="Living Room Camera"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <div className="bg-[#DFDCD2] backdrop-blur-sm text-black px-3 py-1.5 rounded-full text-sm font-medium shadow">
              23°C
            </div>
            <div className="bg-[#DFDCD2] backdrop-blur-sm text-black px-3 py-1.5 rounded-full text-sm font-medium shadow">
              45% Humidity
            </div>
            <div className="bg-[#DFDCD2] backdrop-blur-sm text-black px-3 py-1.5 rounded-full text-sm font-medium shadow">
              1.2kW
            </div>
            <div className="bg-[#DFDCD2] backdrop-blur-sm text-black px-3 py-1.5 rounded-full text-sm font-medium shadow">
              Battery 85%
            </div>
          </div>
        </div>
        <div className="p-6 bg-[#A9ACB6]">
          <h2 className="font-semibold text-2xl text-black mb-2">Living Room Camera</h2>
          <p className="text-gray-500">Live feed from your living room security camera.</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-[#D1D3D7] p-4 rounded-xl border border-blue-100 shadow-sm">
              <p className="text-sm text-black mb-1">Resolution</p>
              <p className="font-medium text-black">1080p HD</p>
            </div>
            <div className="bg-[#D1D3D7] p-4 rounded-xl border border-blue-100 shadow-sm">
              <p className="text-sm text-black mb-1">Frame Rate</p>
              <p className="font-medium text-black">30 FPS</p>
            </div>
            <div className="bg-[#D1D3D7] p-4 rounded-xl border border-blue-100 shadow-sm">
              <p className="text-sm text-black mb-1">Night Vision</p>
              <p className="font-medium text-black">Enabled</p>
            </div>
            <div className="bg-[#D1D3D7] p-4 rounded-xl border border-blue-100 shadow-sm">
              <p className="text-sm text-black mb-1">Motion Detection</p>
              <p className="font-medium text-black">Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
