interface BookingSuccessToastProps {
  message: string | null
  title?: string
  variant?: "success" | "danger"
}

export function BookingSuccessToast({ message, title = "Đặt lịch thành công", variant = "success" }: BookingSuccessToastProps) {
  if (!message) return null

  const titleColor = variant === "danger" ? "text-[#c64545]" : "text-[#2f7d46]"
  const borderColor = variant === "danger" ? "border-[#c64545]/20" : "border-[#5db872]/20"

  return (
    <div className={`fixed top-6 right-6 z-50 rounded-xl border ${borderColor} bg-[#efe9de] px-5 py-4 shadow-xl`}>
      <div className="flex items-center gap-3">
        <div>
          <p className={`text-sm font-bold ${titleColor}`}>{title}</p>
          {message !== title && (
            <p className="text-xs text-[#6c6a64]">{message}</p>
          )}
        </div>
      </div>
    </div>
  )
}
