import { MessageCircle } from "lucide-react";
import { getWhatsAppUrl } from "@/config/site";

export function WhatsAppButton() {
  return (
    <a
      href={getWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-16 md:bottom-6 right-4 md:right-6 z-50 flex items-center gap-2 bg-[#25A866] hover:bg-[#1E8A52] text-white p-3.5 md:px-4 md:py-3 rounded-full shadow-elevated hover:scale-105 transition-all duration-300"
      aria-label="Contact on WhatsApp"
    >
      <MessageCircle className="h-6 w-6 md:h-5 md:w-5" />
      <span className="hidden md:inline text-sm font-medium">WhatsApp</span>
    </a>
  );
}
