import React, { useRef, useState, useEffect } from "react"

interface ImageUploaderProps {
  onImageUpload: (dataUrl: string) => void
  onWebcamFrame?: (dataUrl: string) => void
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, onWebcamFrame }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string>("")
  const [isWebcamActive, setIsWebcamActive] = useState(false)
  const [webcamError, setWebcamError] = useState<string | null>(null)

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onImageUpload(result)
        setFileName(file.name)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const loadSampleImage = () => {
    // Create a sample image for demo purposes
    const canvas = document.createElement("canvas")
    canvas.width = 640
    canvas.height = 480
    const ctx = canvas.getContext("2d")
    
    if (ctx) {
      // Create a gradient background
      const gradient = ctx.createLinearGradient(0, 0, 640, 480)
      gradient.addColorStop(0, "#1a1333")
      gradient.addColorStop(1, "#5343FF")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 640, 480)
      
      // Draw some shapes for edge detection
      ctx.fillStyle = "white"
      ctx.fillRect(100, 100, 200, 200)
      
      ctx.beginPath()
      ctx.arc(450, 240, 100, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.fillRect(200, 350, 250, 80)
      
      const dataUrl = canvas.toDataURL("image/png")
      onImageUpload(dataUrl)
      setFileName("sample-image.png")
    }
  }

  const startWebcam = async () => {
    try {
      setWebcamError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsWebcamActive(true)
        setFileName("Webcam Feed")
      }
    } catch (error) {
      setWebcamError("Camera access denied or unavailable")
      console.error("Webcam error:", error)
    }
  }

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
      setIsWebcamActive(false)
      setFileName("")
    }
  }

  const captureWebcamFrame = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext("2d")
      
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        const dataUrl = canvas.toDataURL("image/png")
        onImageUpload(dataUrl)
      }
    }
  }

  useEffect(() => {
    let frameInterval: number | null = null
    
    if (isWebcamActive && videoRef.current && onWebcamFrame) {
      frameInterval = window.setInterval(() => {
        if (videoRef.current) {
          const canvas = document.createElement("canvas")
          canvas.width = videoRef.current.videoWidth
          canvas.height = videoRef.current.videoHeight
          const ctx = canvas.getContext("2d")
          
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0)
            const dataUrl = canvas.toDataURL("image/png")
            onWebcamFrame(dataUrl)
          }
        }
      }, 100) // 10 FPS
    }
    
    return () => {
      if (frameInterval) clearInterval(frameInterval)
    }
  }, [isWebcamActive, onWebcamFrame])

  useEffect(() => {
    return () => {
      stopWebcam()
    }
  }, [])

  return (
    <div className="rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm p-6">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#5343FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17 8L12 3L7 8" stroke="#5343FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 3V15" stroke="#5343FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Upload Image
      </h2>

      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragging
            ? "border-[#5343FF] bg-[#5343FF]/10"
            : "border-white/20 hover:border-white/40"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#5343FF]/20 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#5343FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 8L12 3L7 8" stroke="#5343FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 3V15" stroke="#5343FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div>
            <p className="text-white font-medium mb-1">
              {isDragging ? "Drop image here" : "Drag & drop an image"}
            </p>
            <p className="text-white/60 text-sm">or click to browse</p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2.5 rounded-lg bg-[#5343FF] hover:bg-[#6454FF] text-white font-medium transition-colors duration-200"
          >
            Browse Files
          </button>
        </div>
      </div>

      {fileName && (
        <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#5343FF]/20 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#5343FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2V8H20" stroke="#5343FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{fileName}</p>
            <p className="text-white/60 text-xs">Ready for processing</p>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        <button
          onClick={loadSampleImage}
          className="w-full px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-sm font-medium border border-white/10 transition-colors duration-200"
        >
          Load Sample Image
        </button>
        
        <div className="flex gap-2">
          {!isWebcamActive ? (
            <button
              onClick={startWebcam}
              className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm font-medium border border-emerald-500/30 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Start Camera
            </button>
          ) : (
            <>
              <button
                onClick={captureWebcamFrame}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#5343FF]/20 hover:bg-[#5343FF]/30 text-[#5343FF] text-sm font-medium border border-[#5343FF]/30 transition-colors duration-200"
              >
                Capture Frame
              </button>
              <button
                onClick={stopWebcam}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium border border-red-500/30 transition-colors duration-200"
              >
                Stop Camera
              </button>
            </>
          )}
        </div>
        
        {webcamError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {webcamError}
          </div>
        )}
      </div>

      {/* Hidden webcam video */}
      <video
        ref={videoRef}
        className="hidden"
        autoPlay
        playsInline
        muted
      />
    </div>
  )
}

export default ImageUploader
