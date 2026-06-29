"use client"

import { useState, useEffect } from "react"
import {
  Play,
  Pause,
  Check,
  Heart,
  Activity,
  Flame,
  Droplet,
  Smartphone,
  ClipboardList,
  Maximize2
} from "lucide-react"
import { cn } from "@/lib/utils"

export function DashboardPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(180) // 3 mins in seconds
  const [isSaved, setIsSaved] = useState(false)
  const duration = 1200 // 20 minutes in seconds

  // Vitals controls (repurposed telemetry meters)
  const [hydration, setHydration] = useState(60) // %
  const [steps, setSteps] = useState(42) // 42% of daily steps
  const [calories, setCalories] = useState(38) // %

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isPlaying && progress < duration) {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= duration) {
            setIsPlaying(false)
            return duration
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isPlaying, progress])

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60)
    const seconds = secs % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgress(Number(e.target.value))
  }

  return (
    <footer className="h-24 bg-[#181715] border-t border-[#1f1e1b] px-6 flex items-center justify-between text-[#faf9f5] select-none z-50 shadow-lg">
      {/* Left side: Active Treatment details */}
      <div className="flex items-center gap-3 w-[30%] min-w-[200px]">
        <div className="w-14 h-14 bg-[#1f1e1b] rounded-md flex items-center justify-center border border-[#252320] relative shadow-md shrink-0">
          <Activity className="w-6 h-6 text-[#cc785c]" />
        </div>
        <div className="overflow-hidden">
          <h4 className="text-sm font-serif font-medium text-white hover:underline cursor-pointer truncate tracking-tight">
            Tập Phục hồi Khớp gối
          </h4>
          <p className="text-xs text-[#a09d96] hover:underline hover:text-white cursor-pointer truncate">
            Dr. Emily Watson
          </p>
        </div>
        <button
          onClick={() => setIsSaved(!isSaved)}
          className={cn(
            "p-2 rounded-full transition-colors shrink-0",
            isSaved ? "text-[#c64545]" : "text-[#a09d96] hover:text-[#faf9f5]"
          )}
          title="Lưu bài tập"
        >
          <Heart className={cn("w-4 h-4", isSaved && "fill-current")} />
        </button>
      </div>

      {/* Center: Session Tracker Controls */}
      <div className="flex flex-col items-center gap-2.5 w-[40%] max-w-[600px]">
        {/* Session Actions */}
        <div className="flex items-center gap-4">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#a09d96] mr-2">
            Phiên tập hiện tại:
          </span>
          
          {/* Start/Pause Session */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-4 py-1.5 bg-[#cc785c] hover:bg-[#a9583e] text-white rounded-md font-bold uppercase tracking-wider text-[10px] transition-all shadow-md cursor-pointer border border-[#cc785c]"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current text-white" />
                <span>Tạm dừng</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-white translate-x-[0.5px]" />
                <span>Bắt đầu</span>
              </>
            )}
          </button>

          {/* Mark Complete */}
          <button
            onClick={() => {
              setIsPlaying(false)
              setProgress(duration)
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#252320] border border-[#1f1e1b] hover:border-white text-[#a09d96] hover:text-white rounded-md font-bold uppercase tracking-wider text-[10px] transition-all cursor-pointer"
            title="Đánh dấu Hoàn thành"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Hoàn thành</span>
          </button>
        </div>

        {/* Telemetry Timeline Slider */}
        <div className="w-full flex items-center gap-2.5 text-[11px] text-[#a09d96] font-semibold">
          <span>{formatTime(progress)}</span>
          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min={0}
              max={duration}
              value={progress}
              onChange={handleProgressChange}
              className="w-full h-1 bg-[#252320] rounded-lg appearance-none cursor-pointer accent-white outline-none transition-all"
              style={{
                background: `linear-gradient(to right, #cc785c 0%, #cc785c ${(progress / duration) * 100}%, #252320 ${(progress / duration) * 100}%, #252320 100%)`
              }}
            />
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right side: Live Telemetry Indicator Sliders */}
      <div className="flex items-center gap-4 w-[30%] min-w-[200px] justify-end">
        {/* Hydration */}
        <div className="flex items-center gap-2" title={`Mức nước cơ thể: ${hydration}%`}>
          <Droplet className="w-4 h-4 text-[#a09d96]" />
          <div className="w-16 flex items-center">
            <input
              type="range"
              min={0}
              max={100}
              value={hydration}
              onChange={(e) => setHydration(Number(e.target.value))}
              className="w-full h-1 bg-[#252320] rounded-lg appearance-none cursor-pointer accent-white outline-none"
              style={{
                background: `linear-gradient(to right, #cc785c 0%, #cc785c ${hydration}%, #252320 ${hydration}%, #252320 100%)`
              }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2" title={`Mục tiêu bước chân: ${steps}%`}>
          <Activity className="w-4 h-4 text-[#a09d96]" />
          <div className="w-16 flex items-center">
            <input
              type="range"
              min={0}
              max={100}
              value={steps}
              onChange={(e) => setSteps(Number(e.target.value))}
              className="w-full h-1 bg-[#252320] rounded-lg appearance-none cursor-pointer accent-white outline-none"
              style={{
                background: `linear-gradient(to right, #cc785c 0%, #cc785c ${steps}%, #252320 ${steps}%, #252320 100%)`
              }}
            />
          </div>
        </div>

        {/* Calories */}
        <div className="flex items-center gap-2" title={`Lượng Calo đã đốt: ${calories}%`}>
          <Flame className="w-4 h-4 text-[#a09d96]" />
          <div className="w-16 flex items-center">
            <input
              type="range"
              min={0}
              max={100}
              value={calories}
              onChange={(e) => setCalories(Number(e.target.value))}
              className="w-full h-1 bg-[#252320] rounded-lg appearance-none cursor-pointer accent-white outline-none"
              style={{
                background: `linear-gradient(to right, #cc785c 0%, #cc785c ${calories}%, #252320 ${calories}%, #252320 100%)`
              }}
            />
          </div>
        </div>

        <div className="h-4 w-[1px] bg-[#252320]" />

        <button className="text-[#a09d96] hover:text-white transition-colors cursor-pointer" title="Đồng bộ thiết bị đo">
          <Smartphone className="w-4 h-4" />
        </button>
        <button className="text-[#a09d96] hover:text-white transition-colors cursor-pointer" title="Danh sách bài tập cần chạy">
          <ClipboardList className="w-4 h-4" />
        </button>
        <button className="text-[#a09d96] hover:text-white transition-colors cursor-pointer" title="Mở rộng">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </footer>
  )
}
