"use client"

import { useState } from "react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

interface VitalData {
  time: string
  heartRate: number
  oxygen: number
  temperature: number
}

const mockData: VitalData[] = [
  { time: "08:00", heartRate: 72, oxygen: 98, temperature: 36.6 },
  { time: "09:00", heartRate: 78, oxygen: 99, temperature: 36.7 },
  { time: "10:00", heartRate: 85, oxygen: 97, temperature: 36.8 },
  { time: "11:00", heartRate: 92, oxygen: 98, temperature: 36.9 },
  { time: "12:00", heartRate: 76, oxygen: 98, temperature: 36.7 },
  { time: "13:00", heartRate: 74, oxygen: 99, temperature: 36.6 },
  { time: "14:00", heartRate: 80, oxygen: 98, temperature: 36.7 },
  { time: "15:00", heartRate: 82, oxygen: 97, temperature: 36.8 },
  { time: "16:00", heartRate: 88, oxygen: 98, temperature: 36.9 },
  { time: "17:00", heartRate: 75, oxygen: 99, temperature: 36.7 },
  { time: "18:00", heartRate: 70, oxygen: 98, temperature: 36.6 },
  { time: "19:00", heartRate: 72, oxygen: 99, temperature: 36.5 }
]

type MetricType = "heartRate" | "oxygen" | "temperature"

export function DashboardVitalsChart() {
  const [activeMetric, setActiveMetric] = useState<MetricType>("heartRate")

  const configs = {
    heartRate: {
      title: "Nhịp tim",
      color: "#cc785c", // Coral
      bgGradient: "rgba(204, 120, 92, 0.1)",
      unit: "bpm",
      minY: 60,
      maxY: 100,
      description: "Nhịp tim lúc nghỉ TB: 78 bpm"
    },
    oxygen: {
      title: "Nồng độ Oxy (SpO2)",
      color: "#5db8a6", // Teal
      bgGradient: "rgba(93, 184, 166, 0.1)",
      unit: "%",
      minY: 95,
      maxY: 100,
      description: "Phạm vi đo hôm nay: 97% - 99%"
    },
    temperature: {
      title: "Nhiệt độ cơ thể",
      color: "#e8a55a", // Amber
      bgGradient: "rgba(232, 165, 90, 0.1)",
      unit: "°C",
      minY: 36,
      maxY: 38,
      description: "Nhiệt độ hiện tại: 36.5 °C"
    }
  }

  const current = configs[activeMetric]

  return (
    <div className="bg-[#181715] border border-[#1f1e1b] p-6 rounded-lg shadow-md transition-colors select-none h-full flex flex-col justify-between">
      {/* Title & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-serif font-medium text-white uppercase tracking-wider mb-1">
            Chỉ số sinh tồn
          </h3>
          <p className="text-xs text-[#a09d96]">Theo dõi các chỉ số sinh học</p>
        </div>

        {/* Tab buttons */}
        <div className="flex gap-2 bg-[#252320] p-1 rounded-md border border-[#1f1e1b]">
          {(Object.keys(configs) as MetricType[]).map((key) => {
            const isActive = activeMetric === key
            const config = configs[key]
            return (
              <button
                key={key}
                onClick={() => setActiveMetric(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                  isActive ? "bg-white text-black" : "text-[#a09d96] hover:text-white"
                }`}
              >
                <span>{config.title}</span>
              </button>
            )}
          )}
        </div>
      </div>

      {/* Primary Telemetry Display */}
      <div className="grid grid-cols-2 gap-4 mb-4 bg-[#252320] p-4 rounded-lg border border-[#1f1e1b]">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-[10px] text-[#a09d96] uppercase tracking-wider block font-bold">
              {current.title}
            </span>
            <span className="text-2xl font-bold text-white">
              {mockData[mockData.length - 1][activeMetric]}
              <span className="text-xs text-[#a09d96] font-medium ml-1">{current.unit}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-center text-right">
          <span className="text-[10px] text-[#a09d96] uppercase tracking-wider font-bold block">
            Trạng thái
          </span>
          <span className="text-xs font-bold text-[#5db8a6] flex items-center gap-1 justify-end">
            <span className="w-1.5 h-1.5 bg-[#5db8a6] rounded-full animate-ping" />
            Bình thường
          </span>
        </div>
      </div>

      {/* Line Chart Area */}
      <div className="flex-1 min-h-[160px] w-full text-xs font-semibold">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={current.color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={current.color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#252320" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#8e8b82"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#8e8b82"
              fontSize={10}
              domain={[current.minY, current.maxY]}
              tickLine={false}
              axisLine={false}
              dx={-5}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#181715",
                border: "1px solid #252320",
                borderRadius: "8px",
                color: "#faf9f5",
                fontSize: "11px",
                fontWeight: "bold",
                boxShadow: "0px 4px 12px rgba(0,0,0,0.5)"
              }}
              formatter={(value) => [`${value} ${current.unit}`, current.title]}
              labelStyle={{ color: "#a0a0a0", fontSize: "10px" }}
            />
              <Area
              type="monotone"
              dataKey={activeMetric}
              stroke={current.color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#gradient-${activeMetric})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-3 border-t border-[#252320] text-center">
        <span className="text-[10px] text-[#a09d96] font-bold uppercase tracking-wider">
          {current.description}
        </span>
      </div>
    </div>
  )
}
