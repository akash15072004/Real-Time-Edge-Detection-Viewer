import React, { useEffect, useRef, useState } from "react"
import { applyCannyEdgeDetection } from "../utils/edgeDetection"
import { FrameStats } from "../App"

interface EdgeDetectionViewerProps {
  originalImage: string | null
  processedImage: string | null
  onProcessComplete: (processed: string, stats: Partial<FrameStats>) => void
  onProcessingStart: () => void
}

type ViewMode = "original" | "processed" | "split"

const EdgeDetectionViewer: React.FC<EdgeDetectionViewerProps> = ({
  originalImage,
  processedImage,
  onProcessComplete,
  onProcessingStart
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("original")
  const [lowThreshold, setLowThreshold] = useState(50)
  const [highThreshold, setHighThreshold] = useState(150)
  const [isAutoProcessing, setIsAutoProcessing] = useState(false)
  const [useWebGL, setUseWebGL] = useState(false)
  const [glEffect, setGlEffect] = useState<"grayscale" | "edge" | "invert">("edge")

  const processImage = async () => {
    if (!originalImage || !canvasRef.current) return

    onProcessingStart()
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const startTime = performance.now()
      let processed: HTMLCanvasElement
      let renderMode = "Canvas 2D"
      
      if (useWebGL) {
        // WebGL rendering (GPU-accelerated)
        import("../utils/webglRenderer").then(({ renderWithWebGL }) => {
          processed = document.createElement("canvas")
          renderWithWebGL(processed, canvas, glEffect)
          
          const endTime = performance.now()
          const processingTime = endTime - startTime
          renderMode = "WebGL (GPU)"
          
          const processedDataUrl = processed.toDataURL("image/png")
          
          onProcessComplete(processedDataUrl, {
            resolution: `${img.width}x${img.height}`,
            processingTime: Math.round(processingTime),
            fps: Math.round(1000 / processingTime),
            renderMode
          })
        })
      } else {
        // Canvas 2D rendering (CPU)
        processed = applyCannyEdgeDetection(canvas, lowThreshold, highThreshold)
        const endTime = performance.now()
        const processingTime = endTime - startTime

        const processedDataUrl = processed.toDataURL("image/png")
        
        onProcessComplete(processedDataUrl, {
          resolution: `${img.width}x${img.height}`,
          processingTime: Math.round(processingTime),
          fps: Math.round(1000 / processingTime),
          renderMode
        })
      }
    }
    img.src = originalImage
  }

  useEffect(() => {
    if (isAutoProcessing && originalImage) {
      processImage()
    }
  }, [lowThreshold, highThreshold, isAutoProcessing])

  const renderCanvas = () => {
    if (!canvasRef.current || !originalImage) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      if (viewMode === "original") {
        ctx.drawImage(img, 0, 0)
      } else if (viewMode === "processed" && processedImage) {
        const processedImg = new Image()
        processedImg.onload = () => {
          ctx.drawImage(processedImg, 0, 0)
        }
        processedImg.src = processedImage
      } else if (viewMode === "split" && processedImage) {
        const halfWidth = canvas.width / 2
        ctx.drawImage(img, 0, 0, halfWidth, canvas.height, 0, 0, halfWidth, canvas.height)
        
        const processedImg = new Image()
        processedImg.onload = () => {
          ctx.drawImage(processedImg, halfWidth, 0, halfWidth, canvas.height, halfWidth, 0, halfWidth, canvas.height)
          
          // Draw divider line
          ctx.strokeStyle = "#5343FF"
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(halfWidth, 0)
          ctx.lineTo(halfWidth, canvas.height)
          ctx.stroke()
        }
        processedImg.src = processedImage
      }
    }
    img.src = originalImage
  }

  useEffect(() => {
    renderCanvas()
  }, [viewMode, originalImage, processedImage])

  return (
    <div className="rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-white/10 bg-black/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("original")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === "original"
                  ? "bg-[#5343FF] text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              Original
            </button>
            <button
              onClick={() => setViewMode("processed")}
              disabled={!processedImage}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === "processed"
                  ? "bg-[#5343FF] text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              Processed
            </button>
            <button
              onClick={() => setViewMode("split")}
              disabled={!processedImage}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                viewMode === "split"
                  ? "bg-[#5343FF] text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              Split View
            </button>
          </div>

          <button
            onClick={processImage}
            disabled={!originalImage}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#5343FF] to-[#7B68FF] hover:from-[#6454FF] hover:to-[#8B78FF] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-[#5343FF]/20"
          >
            Process Image
          </button>
        </div>
      </div>

      {/* Canvas Display */}
      <div className="relative bg-[#0B0919] min-h-[400px] flex items-center justify-center p-6">
        {originalImage ? (
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-[600px] rounded-lg shadow-2xl"
          />
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeOpacity="0.3" strokeWidth="2"/>
                <circle cx="8.5" cy="8.5" r="1.5" fill="white" fillOpacity="0.3"/>
                <path d="M21 15L16 10L5 21" stroke="white" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-white/60 text-lg mb-2">No image loaded</p>
            <p className="text-white/40 text-sm">Upload an image to start edge detection</p>
          </div>
        )}
      </div>

      {/* Controls */}
      {originalImage && (
        <div className="border-t border-white/10 bg-black/20 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Detection Parameters</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAutoProcessing}
                onChange={(e) => setIsAutoProcessing(e.target.checked)}
                className="w-4 h-4 rounded bg-white/10 border-white/20 text-[#5343FF] focus:ring-[#5343FF] focus:ring-offset-0"
              />
              <span className="text-white/80 text-sm">Auto-process</span>
            </label>
          </div>

          <div className="space-y-4">
            {/* Render Mode Selection */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <label className="flex items-center justify-between cursor-pointer mb-3">
                <span className="text-white/80 text-sm font-medium">Use WebGL Rendering</span>
                <input
                  type="checkbox"
                  checked={useWebGL}
                  onChange={(e) => setUseWebGL(e.target.checked)}
                  className="w-4 h-4 rounded bg-white/10 border-white/20 text-[#5343FF] focus:ring-[#5343FF] focus:ring-offset-0"
                />
              </label>
              
              {useWebGL && (
                <div>
                  <label className="text-white/80 text-xs font-medium block mb-2">WebGL Effect</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setGlEffect("grayscale")}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        glEffect === "grayscale"
                          ? "bg-[#5343FF] text-white"
                          : "bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      Grayscale
                    </button>
                    <button
                      onClick={() => setGlEffect("edge")}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        glEffect === "edge"
                          ? "bg-[#5343FF] text-white"
                          : "bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      Edge
                    </button>
                    <button
                      onClick={() => setGlEffect("invert")}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        glEffect === "invert"
                          ? "bg-[#5343FF] text-white"
                          : "bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      Invert
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {!useWebGL && (
              <>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-white/80 text-sm font-medium">Low Threshold</label>
                <span className="text-[#5343FF] text-sm font-mono">{lowThreshold}</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={lowThreshold}
                onChange={(e) => setLowThreshold(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#5343FF] [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-white/80 text-sm font-medium">High Threshold</label>
                <span className="text-[#5343FF] text-sm font-mono">{highThreshold}</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={highThreshold}
                onChange={(e) => setHighThreshold(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#5343FF] [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default EdgeDetectionViewer
