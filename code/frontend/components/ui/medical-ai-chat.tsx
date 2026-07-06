"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import { sendAiChat, sendAiChatWithImages, type AiChatMessage } from "@/lib/ai-chat";
import {
    ArrowUpIcon,
    ImageIcon,
    Mic,
    PlusIcon,
    X,
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

interface MessageImage {
    id: string;
    name: string;
    mimeType: string;
    size: number;
    previewUrl: string;
}

interface SelectedImage extends MessageImage {
    file: File;
}

interface Message {
    id: string;
    sender: "ai" | "user";
    text: string;
    time: string;
    images?: MessageImage[];
}

const MAX_IMAGES_PER_MESSAGE = 3;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const IMAGE_ONLY_MESSAGE = "Hãy mô tả ảnh này và tư vấn ở mức tham khảo y tế an toàn.";

const createMessageId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const getErrorMessage = (error: unknown) => {
    if (error instanceof ApiError) {
        if (error.status === 401 || error.status === 403) {
            return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
        }
        if (error.status === 400) {
            return error.message;
        }
        return "AI đang bận. Vui lòng thử lại sau.";
    }

    return "AI đang bận. Vui lòng thử lại sau.";
};

const formatBytes = (bytes: number) => {
    if (bytes < 1024 * 1024) {
        return `${Math.max(1, Math.round(bytes / 1024))}KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

const parseBoldAndArrows = (text: string): React.ReactNode[] => {
    const cleanText = text.replace(/->/g, "→");
    const parts = cleanText.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
        if (index % 2 === 1) {
            return (
                <strong key={index} className="font-bold">
                    {part}
                </strong>
            );
        }
        return part;
    });
};

const renderMessageText = (text: string): React.ReactNode => {
    if (!text) return null;

    const lines = text.split("\n");
    const renderedElements: React.ReactNode[] = [];
    let currentListItems: { type: "ordered" | "unordered"; content: React.ReactNode; key: number }[] = [];

    const flushList = (key: number) => {
        if (currentListItems.length > 0) {
            const listType = currentListItems[0].type;
            if (listType === "unordered") {
                renderedElements.push(
                    <ul key={`ul-${key}`} className="list-disc pl-5 my-1 space-y-0.5">
                        {currentListItems.map((item) => (
                            <li key={item.key} className="text-sm leading-relaxed">
                                {item.content}
                            </li>
                        ))}
                    </ul>
                );
            } else {
                renderedElements.push(
                    <ol key={`ol-${key}`} className="list-decimal pl-5 my-1 space-y-0.5">
                        {currentListItems.map((item) => (
                            <li key={item.key} className="text-sm leading-relaxed">
                                {item.content}
                            </li>
                        ))}
                    </ol>
                );
            }
            currentListItems = [];
        }
    };

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) {
            flushList(index);
            renderedElements.push(<div key={`empty-${index}`} className="h-2" />);
            return;
        }

        // Check for unordered list: starts with "- " or "* "
        const unorderedMatch = line.match(/^(\s*)[-*]\s+(.*)$/);
        if (unorderedMatch) {
            const content = parseBoldAndArrows(unorderedMatch[2]);
            currentListItems.push({ type: "unordered", content, key: index });
            return;
        }

        // Check for ordered list: starts with "1. ", "2. ", etc.
        const orderedMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);
        if (orderedMatch) {
            const content = parseBoldAndArrows(orderedMatch[2]);
            currentListItems.push({ type: "ordered", content, key: index });
            return;
        }

        // If it's a regular line, flush any active list first
        flushList(index);

        // Check if the entire trimmed line is a bold heading (e.g. "**Title:**" or "**Title**")
        const headerMatch = trimmed.match(/^\*\*(.*)\*\*$/);
        if (headerMatch) {
            renderedElements.push(
                <p key={`header-${index}`} className="font-bold text-sm mt-3 mb-1 first:mt-0">
                    {parseBoldAndArrows(headerMatch[1])}
                </p>
            );
        } else {
            renderedElements.push(
                <p key={`p-${index}`} className="text-sm leading-relaxed">
                    {parseBoldAndArrows(line)}
                </p>
            );
        }
    });

    // Flush any remaining list items at the end
    flushList(lines.length);

    return <div className="space-y-1">{renderedElements}</div>;
};

export function MedicalAiChat() {
    const [value, setValue] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const previewUrlsRef = useRef<Set<string>>(new Set());

    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 56,
        maxHeight: 200,
    });

    useEffect(() => {
        return () => {
            previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
            previewUrlsRef.current.clear();
        };
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages, isTyping]);

    const buildHistory = (currentMessages: Message[]): AiChatMessage[] => {
        return currentMessages.slice(-10).map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text,
        }));
    };

    const handleImageSelect = (files: FileList | File[] | null) => {
        if (!files || files.length === 0) return;

        setUploadError(null);
        const nextImages: SelectedImage[] = [];
        const remainingSlots = MAX_IMAGES_PER_MESSAGE - selectedImages.length;
        if (remainingSlots <= 0) {
            setUploadError(`Mỗi tin nhắn chỉ được đính kèm tối đa ${MAX_IMAGES_PER_MESSAGE} ảnh.`);
            return;
        }

        for (const file of Array.from(files).slice(0, remainingSlots)) {
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                setUploadError("Chỉ hỗ trợ ảnh PNG, JPEG hoặc WebP.");
                continue;
            }
            if (file.size > MAX_IMAGE_BYTES) {
                setUploadError("Mỗi ảnh không được vượt quá 5MB.");
                continue;
            }

            const previewUrl = URL.createObjectURL(file);
            previewUrlsRef.current.add(previewUrl);
            nextImages.push({
                id: createMessageId(),
                name: file.name,
                mimeType: file.type,
                size: file.size,
                previewUrl,
                file,
            });
        }

        if (Array.from(files).length > remainingSlots) {
            setUploadError(`Chỉ thêm tối đa ${MAX_IMAGES_PER_MESSAGE} ảnh cho mỗi tin nhắn.`);
        }

        if (nextImages.length > 0) {
            setSelectedImages(prev => [...prev, ...nextImages]);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeSelectedImage = (id: string) => {
        setSelectedImages(prev => {
            const target = prev.find(image => image.id === id);
            if (target) {
                URL.revokeObjectURL(target.previewUrl);
                previewUrlsRef.current.delete(target.previewUrl);
            }
            return prev.filter(image => image.id !== id);
        });
    };

    const handleSend = async (textToSend?: string) => {
        if (isTyping) return;

        const text = textToSend !== undefined ? textToSend : value;
        const imagesToSend = textToSend === undefined ? selectedImages : [];
        const trimmedText = text.trim();
        if (!trimmedText && imagesToSend.length === 0) return;

        setUploadError(null);
        const history = buildHistory(messages);
        const displayText = trimmedText || `Đã gửi ${imagesToSend.length} ảnh`;
        const messageForApi = trimmedText || IMAGE_ONLY_MESSAGE;
        const messageImages: MessageImage[] = imagesToSend.map(({ file: _file, ...image }) => image);
        const userMsg: Message = {
            id: createMessageId(),
            sender: "user",
            text: displayText,
            time: getCurrentTime(),
            images: messageImages,
        };

        setMessages(prev => [...prev, userMsg]);
        if (textToSend === undefined) {
            setValue("");
            setSelectedImages([]);
            adjustHeight(true);
        }
        setIsTyping(true);

        try {
            const response = imagesToSend.length > 0
                ? await sendAiChatWithImages({
                    message: messageForApi,
                    history,
                    images: imagesToSend.map(image => image.file),
                })
                : await sendAiChat({
                    message: userMsg.text,
                    history,
                });

            const aiMsg: Message = {
                id: createMessageId(),
                sender: "ai",
                text: response.reply,
                time: getCurrentTime()
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            const aiMsg: Message = {
                id: createMessageId(),
                sender: "ai",
                text: getErrorMessage(error),
                time: getCurrentTime()
            };

            setMessages(prev => [...prev, aiMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void handleSend();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const items = e.clipboardData.items;
        const pastedFiles: File[] = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.startsWith("image/")) {
                const file = item.getAsFile();
                if (file) {
                    pastedFiles.push(file);
                }
            }
        }
        if (pastedFiles.length > 0) {
            e.preventDefault();
            handleImageSelect(pastedFiles);
        }
    };

    const handleActionClick = (promptText: string) => {
        void handleSend(promptText);
    };

    const actionButtonsData = [
        { label: "Tầm soát triệu chứng", text: "Tôi muốn tầm soát các triệu chứng mệt mỏi gần đây." },
        { label: "Giải thích thông tin thuốc", text: "Tôi muốn hiểu cách đọc hướng dẫn sử dụng thuốc và những lưu ý an toàn." },
        { label: "Khi nào cần đi khám?", text: "Khi nào tôi nên đặt lịch khám thay vì tự theo dõi tại nhà?" },
        { label: "Dinh dưỡng & huyết áp", text: "Tư vấn cho tôi chế độ ăn dinh dưỡng tốt cho huyết áp." },
        { label: "Chuẩn bị trước buổi khám", text: "Tôi nên chuẩn bị thông tin gì trước khi đi khám?" }
    ];

    const hasMessages = messages.length > 0;
    const canSend = (value.trim().length > 0 || selectedImages.length > 0) && !isTyping;

    return (
        <div className={cn(
            "flex flex-col w-full mx-auto transition-all duration-300 ease-in-out select-none h-full relative pb-6 md:pb-8",
            hasMessages
                ? "justify-between max-w-4xl min-h-0"
                : "justify-center items-center max-w-2xl space-y-8 py-12 md:py-24"
        )}>
            {/* 1. Welcome Title (Centered Mode Only) */}
            {!hasMessages && (
                <div className="flex flex-col items-center space-y-2 text-center w-full animate-in fade-in duration-300">
                    <h1 className="text-3xl md:text-4xl font-sans font-black text-foreground tracking-tight">
                        hôm nay bạn cảm thấy thế nào?
                    </h1>
                </div>
            )}

            {/* 2. Chat History View (Chat Mode Only) */}
            {hasMessages && (
                <div className="flex-grow flex-1 min-h-0 w-full overflow-y-auto space-y-6 pr-2 mb-4 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                                            "text-sm leading-relaxed px-4 py-2.5 rounded-2xl border font-medium whitespace-pre-wrap space-y-3",
                                            isAI
                                                ? "bg-card border-border text-foreground"
                                                : "bg-primary border-primary text-primary-foreground font-semibold"
                                        )}
                                    >
                                        {msg.images && msg.images.length > 0 && (
                                            <div className="grid grid-cols-2 gap-2">
                                                {msg.images.map(image => (
                                                    <img
                                                        key={image.id}
                                                        src={image.previewUrl}
                                                        alt={image.name}
                                                        className="h-28 w-28 rounded-xl object-cover border border-black/10 bg-background"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        <div>{renderMessageText(msg.text)}</div>
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
                    {selectedImages.length > 0 && (
                        <div className="flex flex-wrap gap-2 px-4 pt-3">
                            {selectedImages.map(image => (
                                <div key={image.id} className="relative group rounded-xl border border-border bg-background p-1">
                                    <img
                                        src={image.previewUrl}
                                        alt={image.name}
                                        className="h-20 w-20 rounded-lg object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeSelectedImage(image.id)}
                                        disabled={isTyping}
                                        className="absolute -right-2 -top-2 rounded-full bg-foreground text-background p-1 shadow-sm disabled:opacity-50"
                                        title="Xóa ảnh"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                    <div className="mt-1 max-w-20 truncate text-[9px] text-muted-foreground">
                                        {formatBytes(image.size)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {uploadError && (
                        <p className="px-5 pt-3 text-xs font-semibold text-red-600">
                            {uploadError}
                        </p>
                    )}
                    <div className="overflow-y-auto">
                        <Textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                adjustHeight();
                            }}
                            onKeyDown={handleKeyDown}
                            onPaste={handlePaste}
                            placeholder="Hỏi bất kỳ điều gì hoặc đính kèm ảnh..."
                            disabled={isTyping}
                            className={cn(
                                "w-full px-5 py-3.5",
                                "resize-none",
                                "bg-transparent",
                                "border-none",
                                "text-foreground text-base",
                                "focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                                "placeholder:text-muted-foreground placeholder:text-base",
                                "min-h-[56px]",
                                isTyping && "opacity-70"
                            )}
                            style={{
                                overflow: "hidden",
                            }}
                        />
                    </div>

                    <div className="flex items-center justify-between px-4 pb-3 pt-2">
                        <div className="flex items-center gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                multiple
                                className="hidden"
                                onChange={(event) => handleImageSelect(event.target.files)}
                            />
                            <button
                                type="button"
                                className={cn(
                                    "p-2 rounded-full transition-colors flex items-center justify-center cursor-pointer",
                                    isTyping
                                        ? "text-muted-foreground/40 cursor-not-allowed"
                                        : "text-muted-foreground hover:bg-background hover:text-foreground"
                                )}
                                title="Đính kèm ảnh"
                                disabled={isTyping}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <PlusIcon className="w-5 h-5" />
                            </button>
                            {selectedImages.length > 0 && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                                    <ImageIcon className="h-3.5 w-3.5" />
                                    {selectedImages.length}/{MAX_IMAGES_PER_MESSAGE}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                className="p-2 rounded-full transition-colors flex items-center justify-center text-muted-foreground/40 cursor-not-allowed"
                                title="Giọng nói sẽ được hỗ trợ sau"
                                disabled
                            >
                                <Mic className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => void handleSend()}
                                type="button"
                                className={cn(
                                    "p-2 rounded-full transition-all flex items-center justify-center cursor-pointer",
                                    canSend
                                        ? "bg-primary text-primary-foreground hover:bg-[#cdffad]"
                                        : "bg-background text-muted-foreground/40 cursor-not-allowed"
                                )}
                                disabled={!canSend}
                            >
                                <ArrowUpIcon
                                    className={cn(
                                        "w-5 h-5",
                                        canSend ? "text-[#0e0f0c] font-bold" : "text-muted-foreground/40"
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
                                onClick={() => handleActionClick(btn.text)}
                                disabled={isTyping}
                                className="flex items-center gap-2 text-xs px-4 py-2 bg-card hover:bg-background rounded-full border border-border text-foreground transition-all duration-200 cursor-pointer shadow-none disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <span>{btn.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* 5. Fixed Disclaimer at the bottom */}
            <p className="absolute bottom-1 md:bottom-2 left-1/2 -translate-x-1/2 w-full text-center text-[10px] md:text-[11px] font-semibold text-muted-foreground/60 leading-normal pointer-events-none">
                AI chỉ hỗ trợ tham khảo, không thay thế bác sĩ hoặc chỉ định y khoa trực tiếp.
            </p>
        </div>
    );
}
