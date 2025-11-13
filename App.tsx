import React, { useState } from "react"
import ImageUploader from "./components/ImageUploader"
import EdgeDetectionViewer from "./components/EdgeDetectionViewer"
import StatsPanel from "./components/StatsPanel"

export interface FrameStats {
  fps: number
  resolution: string
  processingTime: number
  algorithm: string
  renderMode: string
}

function App() {
  const [imageData, setImageData] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [stats, setStats] = useState<FrameStats>({
    fps: 0,
    resolution: "0x0",
    processingTime: 0,
    algorithm: "Canny Edge Detection",
    renderMode: "Canvas 2D"
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLiveMode, setIsLiveMode] = useState(false)

  const handleImageUpload = (dataUrl: string) => {
    setImageData(dataUrl)
    setProcessedImage(null)
    setIsLiveMode(false)
  }

  const handleWebcamFrame = (dataUrl: string) => {
    if (isLiveMode) {
      setImageData(dataUrl)
    }
  }

  const handleProcessedImage = (processed: string, processingStats: Partial<FrameStats>) => {
    setProcessedImage(processed)
    setStats(prev => ({ ...prev, ...processingStats }))
    setIsProcessing(false)
  }

  const handleProcessingStart = () => {
    setIsProcessing(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0919] via-[#1a1333] to-[#0B0919]">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#5343FF] to-[#7B68FF] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 8L12 12L20 8L12 4Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 12L12 16L20 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 16L12 20L20 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Edge Detection Viewer</h1>
              <p className="text-xs text-white/60">OpenCV-C++ Web Interface Demo</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#5343FF]/10 border border-[#5343FF]/20">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-sm text-white/80">Active</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upload & Stats */}
          <div className="lg:col-span-1 space-y-6">
            <ImageUploader 
              onImageUpload={handleImageUpload} 
              onWebcamFrame={handleWebcamFrame}
            />
            
            {/* Live Processing Toggle */}
            <div className="rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm p-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#5343FF]/20 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="#5343FF" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="3" fill="#5343FF"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Live Processing</p>
                    <p className="text-white/60 text-xs">Auto-process camera frames</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isLiveMode}
                  onChange={(e) => setIsLiveMode(e.target.checked)}
                  className="w-5 h-5 rounded bg-white/10 border-white/20 text-[#5343FF] focus:ring-[#5343FF] focus:ring-offset-0"
                />
              </label>
            </div>
            
            <StatsPanel stats={stats} isProcessing={isProcessing} />
          </div>

          {/* Right Column - Viewer */}
          <div className="lg:col-span-2">
            <EdgeDetectionViewer
              originalImage={imageData}
              processedImage={processedImage}
              onProcessComplete={handleProcessedImage}
              onProcessingStart={handleProcessingStart}
            />
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#5343FF]/10 to-transparent border border-[#5343FF]/20 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-[#5343FF]/20 flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.7 6.3C15.1 5.9 15.1 5.3 14.7 4.9C14.3 4.5 13.7 4.5 13.3 4.9L8.3 9.9C7.9 10.3 7.9 10.9 8.3 11.3L13.3 16.3C13.7 16.7 14.3 16.7 14.7 16.3C15.1 15.9 15.1 15.3 14.7 14.9L10.8 11L14.7 6.3Z" fill="#5343FF"/>
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Webcam Integration</h3>
            <p className="text-white/60 text-sm">Real-time camera feed processing simulating Android Camera API with live frame capture</p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 10V3L4 14H11V21L20 10H13Z" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">WebGL Rendering</h3>
            <p className="text-white/60 text-sm">GPU-accelerated rendering with GLSL shaders simulating OpenGL ES 2.0 texture processing</p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#f59e0b" strokeWidth="2"/>
                <path d="M12 6V12L16 14" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">TypeScript Architecture</h3>
            <p className="text-white/60 text-sm">Modular design with strong typing, demonstrating clean code practices</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-xl mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/60 text-sm">
              Web-based edge detection demo • Camera API + Canvas + WebGL • TypeScript Architecture
            </p>
            <div className="flex items-center gap-4 text-xs text-white/40">
              <span>Tech Stack: React, TypeScript, Tailwind CSS, WebGL, MediaStream API</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
