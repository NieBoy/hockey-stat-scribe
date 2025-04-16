
import { ReactNode } from "react";
import Navbar from "./Navbar";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container py-8">
        {children}
      </main>
      <footer className="border-t py-6 bg-background">
        <div className="container text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Hockey Stat Scribe. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
