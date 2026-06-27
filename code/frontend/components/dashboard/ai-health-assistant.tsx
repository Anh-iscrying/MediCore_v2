"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Sparkles, X, Paperclip, ArrowUp, PlusIcon } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface Message {
  sender: "ai" | "patient"
  text: string
  time: string
}

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;

      const newHeight = Math.max(
        minHeight,
        Math.min(
          textarea.scrollHeight,
          maxHeight ?? Number.POSITIVE_INFINITY
        )
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

export function AIHealthAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Xin chào Alexander! Tôi là Trợ lý Sức khỏe AI của bạn. Tôi đã xem xét các chỉ số hôm nay của bạn: thời gian ngủ (7.5 giờ) và lượng nước cơ thể (60%). Tôi có thể giúp gì cho các triệu chứng hoặc kế hoạch điều trị của bạn hôm nay?",
      time: "10:30 AM"
    }
  ])
  const [inputText, setInputText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 40,
    maxHeight: 120,
  })

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isTyping, isOpen])

  const responses: Record<string, string> = {
    headache:
      "Mức nước cơ thể hiện tại của bạn là 60%, hơi thấp một chút. Đau đầu nhẹ thường là dấu hiệu của thiếu nước. Tôi khuyên bạn nên uống thêm 500ml nước ấm ngay bây giờ, nghỉ ngơi 10 phút tránh xa màn hình máy tính/điện thoại và đo lại huyết áp. Nếu triệu chứng đau kéo dài hoặc nghiêm trọng hơn, hãy liên hệ bác sĩ Rivera nhé.",
    sleep:
      "Thời gian ngủ 7.5 giờ là rất tốt, tuy nhiên chỉ số ngủ sâu của bạn hôm qua hơi thấp. Để chuẩn bị cho giấc ngủ tối nay ngon hơn, bạn có thể thực hiện bài tập 'Thở sâu Giảm Căng thẳng' trong danh sách bài tập đã lưu vào lúc 9:30 tối.",
    workout:
      "Nhịp tim trung bình sáng nay của bạn là 78 bpm. Bạn đủ điều kiện để thực hiện bài tập 'Tập Phục hồi Khớp gối' lúc 10:30 sáng cùng bác sĩ Watson. Hãy nhớ nhấn 'Bắt đầu' trên thanh đồng bộ chỉ số dưới cùng để lưu lại thời gian tập nhé.",
    default:
      "Tôi đã ghi nhận câu hỏi của bạn. Hãy nhớ thực hiện đầy đủ lịch trình thuốc, đo các chỉ số sinh tồn đều đặn và liên hệ ngay với bác sĩ Jenkins nếu bạn cảm thấy tức ngực, khó thở hoặc đánh trống ngực."
  }

  const executeSend = () => {
    if (!inputText.trim()) return

    const patientMsg = inputText.trim()
    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    setMessages((prev) => [
      ...prev,
      { sender: "patient", text: patientMsg, time: currentTime }
    ])
    setInputText("")
    adjustHeight(true)
    setIsTyping(true)

    // Simulate AI response analysis delay
    setTimeout(() => {
      let replyText = responses.default

      const lowerMsg = patientMsg.toLowerCase()
      if (lowerMsg.includes("đầu") || lowerMsg.includes("đau") || lowerMsg.includes("headache") || lowerMsg.includes("mệt")) {
        replyText = responses.headache
      } else if (lowerMsg.includes("ngủ") || lowerMsg.includes("mất ngủ") || lowerMsg.includes("sleep")) {
        replyText = responses.sleep
      } else if (lowerMsg.includes("tập") || lowerMsg.includes("thể dục") || lowerMsg.includes("vận động") || lowerMsg.includes("gối")) {
        replyText = responses.workout
      }

      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: replyText, time: currentTime }
      ])
      setIsTyping(false)
    }, 1200)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      executeSend()
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-[#cc785c] text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer relative group border border-[#cc785c] hover:bg-[#a9583e] animate-bounce"
          style={{ animationDuration: "3s" }}
          title="Trò chuyện với Trợ lý AI"
        >
          <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#c64545] rounded-full border-2 border-background flex items-center justify-center text-[9px] font-black text-white">1</span>
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      <div className="w-[360px] max-w-[calc(100vw-2rem)] h-[450px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 select-none animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header Info */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[8px] font-bold uppercase tracking-widest text-[#cc785c] bg-[#cc785c]/10 px-2 py-0.5 rounded-full w-max border border-[#cc785c]/20">
                Trợ lý sức khỏe AI
              </span>
              <h3 className="text-xs font-medium text-foreground mt-1">Hỏi đáp & Tư vấn Sức khỏe</h3>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-background">
          {messages.map((msg, index) => {
            const isAI = msg.sender === "ai"
            return (
              <div
                key={index}
                className={`flex items-start gap-2.5 ${!isAI && "flex-row-reverse"}`}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 border",
                    isAI
                      ? "bg-[#cc785c] text-white border-[#cc785c]"
                      : "bg-card text-foreground border-border"
                  )}
                >
                  {isAI ? "AI" : "U"}
                </div>

                {/* Message Box */}
                <div className="flex flex-col max-w-[80%]">
                  <div
                    className={cn(
                      "p-3 rounded-2xl text-[11px] font-medium leading-relaxed shadow-sm border",
                      isAI
                        ? "bg-card text-foreground rounded-tl-none border-border"
                        : "bg-[#cc785c] text-white rounded-tr-none border-[#cc785c] font-medium"
                    )}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[8px] text-muted-foreground mt-1 px-1 self-end font-semibold">
                    {msg.time}
                  </span>
                </div>
              </div>
            )
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#cc785c] border border-[#cc785c] text-white flex items-center justify-center text-[9px] font-black">
                AI
              </div>
              <div className="bg-card p-3 rounded-2xl rounded-tl-none border border-border flex items-center gap-1.5 py-4">
                <span className="w-1.5 h-1.5 bg-[#cc785c] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-[#cc785c] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-[#cc785c] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input using v0 Style */}
        <div className="p-3 border-t border-border bg-card">
          <div className="relative bg-background rounded-xl border border-border">
            <div className="overflow-y-auto">
              <Textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value)
                  adjustHeight()
                }}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi: 'Bị đau đầu', 'Lịch tập'..."
                className={cn(
                  "w-full px-3 py-2",
                  "resize-none",
                  "bg-transparent",
                  "border-none",
                  "text-foreground text-xs",
                  "focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                  "placeholder:text-muted-foreground placeholder:text-xs",
                  "min-h-[40px]"
                )}
                style={{
                  overflow: "hidden",
                }}
              />
            </div>

            <div className="flex items-center justify-between px-3 py-1.5 border-t border-border">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="p-1 hover:bg-card rounded transition-colors flex items-center gap-0.5 cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="px-1.5 py-0.5 rounded text-[10px] text-muted-foreground transition-colors border border-dashed border-border hover:bg-card flex items-center justify-between gap-0.5 cursor-pointer"
                >
                  <PlusIcon className="w-3 h-3" />
                  Bệnh án
                </button>
                <button
                  onClick={executeSend}
                  type="button"
                  disabled={!inputText.trim()}
                  className={cn(
                    "px-1 py-1 rounded text-xs transition-colors border flex items-center justify-between gap-0.5 cursor-pointer",
                    inputText.trim()
                      ? "bg-[#cc785c] border-[#cc785c] text-white font-semibold hover:bg-[#a9583e]"
                      : "border-border text-muted-foreground/50 hover:bg-card"
                  )}
                >
                  <ArrowUp className={cn("w-3.5 h-3.5", inputText.trim() ? "text-white" : "text-muted-foreground/30")} />
                  <span className="sr-only">Gửi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toggle Button when opened */}
      <button
        onClick={() => setIsOpen(false)}
        className="w-14 h-14 rounded-full bg-card text-foreground shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer border border-border hover:bg-muted animate-in fade-in zoom-in-50 duration-200"
        title="Đóng chat"
      >
        <X className="w-6 h-6 text-foreground" />
      </button>
    </div>
  )
}

