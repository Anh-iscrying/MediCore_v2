import { MedicalAiChat } from "@/components/ui/medical-ai-chat"

export default function AIAssistantPage() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col p-4 md:p-6 overflow-hidden">
      <MedicalAiChat />
    </div>
  )
}
