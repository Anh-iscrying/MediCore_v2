"use client";

import { useEffect, useRef, useCallback } from "react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
    ArrowUpIcon,
    PlusIcon,
    Mic,
} from "lucide-react";

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

            // Temporarily shrink to get the right scrollHeight
            textarea.style.height = `${minHeight}px`;

            // Calculate new height
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
        // Set initial height
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    // Adjust height on window resize
    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

interface Message {
    id: string;
    sender: "ai" | "user";
    text: string;
    time: string;
}


export function VercelV0Chat() {
    const [value, setValue] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 56,
        maxHeight: 200,
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages, isTyping]);

    const responses: Record<string, string> = {
        triuchung:
            "Mức nước cơ thể hiện tại của bạn là 60%, hơi thấp một chút. Đau đầu nhẹ thường là dấu hiệu của thiếu nước. Tôi khuyên bạn nên uống thêm 500ml nước ấm ngay bây giờ, nghỉ ngơi 10 phút tránh xa màn hình máy tính/điện thoại và đo lại huyết áp. Nếu triệu chứng đau kéo dài hoặc nghiêm trọng hơn, hãy liên hệ bác sĩ Rivera nhé.",
        donthuoc:
            "Đơn thuốc Paracetamol 500mg của bạn nên uống sau khi ăn no và cách nhau từ 4-6 tiếng nếu còn sốt hoặc đau đầu nhiều. Vui lòng uống đủ nước và tuân thủ liều lượng tối đa 3-4 viên mỗi ngày theo chỉ định khoa Nội tổng quát.",
        lichphuchoi:
            "Lịch tập 'Phục hồi khớp gối' của bạn được lên lịch lúc 10:30 sáng cùng bác sĩ Watson. Vui lòng khởi động kỹ khớp gối trong 5 phút trước khi bắt đầu bài tập và đồng bộ thông số qua thiết bị đo thông minh.",
        huyetap:
            "Chỉ số huyết áp và nhịp tim của bạn hôm nay đang ở mức ổn định (120/80 mmHg). Hãy tiếp tục duy trì chế độ sinh hoạt lành mạnh và theo dõi các chỉ số sinh tồn này vào mỗi buổi sáng.",
        dinhduong:
            "Theo chỉ định của bác sĩ khoa Tim mạch, bạn nên duy trì chế độ ăn ít muối (dưới 5g muối mỗi ngày), bổ sung nhiều rau xanh, hạn chế mỡ động vật và uống đủ 2 lít nước mỗi ngày."
    };

    const handleSend = (textToSend?: string) => {
        const text = textToSend !== undefined ? textToSend : value;
        if (!text.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            sender: "user",
            text: text.trim(),
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };

        setMessages(prev => [...prev, userMsg]);
        if (textToSend === undefined) {
            setValue("");
            adjustHeight(true);
        }
        setIsTyping(true);

        setTimeout(() => {
            const lowerText = text.toLowerCase();
            let reply = "Tôi đã tiếp nhận thông tin từ bạn. Tôi có thể hỗ trợ tư vấn các triệu chứng nhẹ, giải thích đơn thuốc, nhắc nhở lịch tập phục hồi khớp gối hoặc đo các chỉ số sức khỏe của bạn. Bạn cần tư vấn thêm về nội dung nào?";

            if (lowerText.includes("triệu chứng") || lowerText.includes("đau đầu") || lowerText.includes("tầm soát") || lowerText.includes("mệt")) {
                reply = responses.triuchung;
            } else if (lowerText.includes("đơn thuốc") || lowerText.includes("uống thuốc") || lowerText.includes("thuốc")) {
                reply = responses.donthuoc;
            } else if (lowerText.includes("phục hồi") || lowerText.includes("khớp gối") || lowerText.includes("lịch tập") || lowerText.includes("tập")) {
                reply = responses.lichphuchoi;
            } else if (lowerText.includes("huyết áp") || lowerText.includes("vitals") || lowerText.includes("chỉ số") || lowerText.includes("tim")) {
                reply = responses.huyetap;
            } else if (lowerText.includes("ăn") || lowerText.includes("dinh dưỡng") || lowerText.includes("chế độ") || lowerText.includes("muối")) {
                reply = responses.dinhduong;
            }

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: "ai",
                text: reply,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            };

            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1000);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleActionClick = (promptLabel: string, promptText: string) => {
        handleSend(promptText);
    };

    const actionButtonsData = [
        { label: "Tầm soát triệu chứng", text: "Tôi muốn tầm soát các triệu chứng mệt mỏi gần đây." },
        { label: "Giải thích đơn thuốc", text: "Hãy giải thích hướng dẫn sử dụng đơn thuốc của tôi." },
        { label: "Lịch tập phục hồi", text: "Tôi muốn xem lịch tập phục hồi khớp gối." },
        { label: "Đo huyết áp & Vitals", text: "Chỉ số huyết áp và nhịp tim bình thường là bao nhiêu?" },
        { label: "Chế độ ăn & Dinh dưỡng", text: "Tư vấn cho tôi chế độ ăn dinh dưỡng tốt cho huyết áp." }
    ];

    const hasMessages = messages.length > 0;

    return (
        <div className={cn(
            "flex flex-col w-full mx-auto transition-all duration-300 ease-in-out select-none h-full",
            hasMessages 
                ? "justify-between max-w-4xl min-h-0" 
                : "justify-center items-center max-w-2xl space-y-8 py-12 md:py-24"
        )}>
            {/* 1. Welcome Title (Centered Mode Only) */}
            {!hasMessages && (
                <div className="flex flex-col items-center space-y-2 text-center w-full animate-in fade-in duration-300">
                    <h1 className="text-3xl md:text-4xl font-sans font-black text-foreground tracking-tight">
                        Hôm nay bạn cần tư vấn sức khỏe gì?
                    </h1>
                </div>
            )}

            {/* 2. Chat History View (Chat Mode Only) */}
            {hasMessages && (
                <div className="flex-grow flex-1 min-h-0 w-full overflow-y-auto space-y-6 pr-2 mb-4 scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent">
                    {messages.map((msg) => {
                        const isAI = msg.sender === "ai";
                        return (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-200 w-full",
                                    isAI ? "justify-start" : "justify-end"
                                )}
                            >
                                {isAI && (
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border bg-primary/10 text-[#0e0f0c] border-primary/20">
                                        <span>AI</span>
                                    </div>
                                )}
                                <div className={cn(
                                    "flex flex-col space-y-1",
                                    isAI ? "max-w-[85%]" : "max-w-[70%] items-end"
                                )}>
                                    <div
                                        className={cn(
                                            "text-sm leading-relaxed px-4 py-2.5 rounded-2xl border font-medium",
                                            isAI
                                                ? "bg-card border-border text-foreground"
                                                : "bg-primary border-primary text-primary-foreground font-semibold"
                                        )}
                                    >
                                        {msg.text}
                                    </div>
                                    <span className="text-[9px] text-muted-foreground px-1">
                                        {msg.time}
                                    </span>
                                </div>
                                {!isAI && (
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border bg-card text-foreground border-border">
                                        <span>U</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {isTyping && (
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-[#0e0f0c] border border-primary/20 flex items-center justify-center text-xs font-bold shrink-0">
                                <span>AI</span>
                            </div>
                            <div className="bg-card border border-border px-4 py-3 rounded-2xl flex items-center gap-1.5 shadow-none">
                                <span className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}

            {/* 3. Main Chat Input Block (Wise converter style outline input) */}
            <div className="w-full space-y-4 shrink-0">
                <div className="relative bg-card rounded-xl border border-[#0e0f0c] p-1">
                    <div className="overflow-y-auto">
                        <Textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                adjustHeight();
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Hỏi bất kỳ điều gì..."
                            className={cn(
                                "w-full px-5 py-3.5",
                                "resize-none",
                                "bg-transparent",
                                "border-none",
                                "text-foreground text-base",
                                "focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                                "placeholder:text-muted-foreground placeholder:text-base",
                                "min-h-[56px]"
                            )}
                            style={{
                                overflow: "hidden",
                            }}
                        />
                    </div>

                    <div className="flex items-center justify-between px-4 pb-3 pt-2">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="p-2 hover:bg-background rounded-full transition-colors flex items-center justify-center cursor-pointer text-muted-foreground hover:text-foreground"
                                title="Đính kèm tệp"
                            >
                                <PlusIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                className="p-2 hover:bg-background rounded-full transition-colors flex items-center justify-center cursor-pointer text-muted-foreground hover:text-foreground"
                                title="Sử dụng giọng nói"
                            >
                                <Mic className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handleSend()}
                                type="button"
                                className={cn(
                                    "p-2 rounded-full transition-all flex items-center justify-center cursor-pointer",
                                    value.trim()
                                        ? "bg-primary text-primary-foreground hover:bg-[#cdffad]"
                                        : "bg-background text-muted-foreground/40"
                                )}
                                disabled={!value.trim()}
                            >
                                <ArrowUpIcon
                                    className={cn(
                                        "w-5 h-5",
                                        value.trim() ? "text-[#0e0f0c] font-bold" : "text-muted-foreground/40"
                                    )}
                                />
                                <span className="sr-only">Gửi</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4. Suggestion Buttons (Light Sage Rounded-full Chips) */}
                {!hasMessages && (
                    <div className="flex flex-wrap items-center justify-center gap-2 w-full animate-in fade-in duration-300">
                        {actionButtonsData.map((btn, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleActionClick(btn.label, btn.text)}
                                className="flex items-center gap-2 text-xs px-4 py-2 bg-card hover:bg-background rounded-full border border-border text-foreground transition-all duration-200 cursor-pointer shadow-none"
                            >
                                <span>{btn.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

