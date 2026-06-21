import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { WhatsAppButton } from "./WhatsAppButton";
import { ScrollToTop } from "./ScrollToTop";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <div className="dark min-h-screen flex flex-col bg-background text-foreground">
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 md:pt-[72px]">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  );
}
