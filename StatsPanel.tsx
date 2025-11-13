import React from "react"
import { FrameStats } from "../App"

interface StatsPanelProps {
  stats: FrameStats
  isProcessing: boolean
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats, isProcessing }) => {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3V21H21" stroke="#5343FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 16L12 11L16 15L21 10" stroke="#5343FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Performance Stats
        </h2>
        {isProcessing && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#5343FF] animate-pulse"></div>
            <span className="text-xs text-white/60">Processing...</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* FPS */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#5343FF]/10 to-transparent border border-[#5343FF]/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Frames Per Second</span>
            <div className="px-2 py-1 rounded bg-[#5343FF]/20 text-[#5343FF] text-xs font-mono">
              FPS
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{stats.fps}</span>
            <span className="text-white/40 text-sm">fps</span>
          </div>
        </div>

        {/* Resolution */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Resolution</span>
            <div className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-mono">
              RES
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats.resolution}</span>
            <span className="text-white/40 text-sm">px</span>
          </div>
        </div>

        {/* Processing Time */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Processing Time</span>
            <div className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-xs font-mono">
              TIME
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats.processingTime}</span>
            <span className="text-white/40 text-sm">ms</span>
          </div>
        </div>

        {/* Algorithm */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Algorithm</span>
            <div className="px-2 py-1 rounded bg-violet-500/20 text-violet-400 text-xs font-mono">
              ALGO
            </div>
          </div>
          <span className="text-sm font-medium text-white">{stats.algorithm}</span>
        </div>

        {/* Render Mode */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Render Mode</span>
            <div className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-mono">
              GPU
            </div>
          </div>
          <span className="text-sm font-medium text-white">{stats.renderMode}</span>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#5343FF" strokeWidth="2"/>
              <path d="M12 16V12" stroke="#5343FF" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="8" r="1" fill="#5343FF"/>
            </svg>
          </div>
          <div>
            <p className="text-white/80 text-xs font-medium mb-1">Real-time Metrics</p>
            <p className="text-white/50 text-xs leading-relaxed">
              Performance stats are measured during processing. WebGL (GPU) rendering typically achieves 3-5x faster speeds than Canvas 2D (CPU) for the same operations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsPanel
