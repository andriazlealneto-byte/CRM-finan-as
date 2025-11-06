"use client";

import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { MadeWithDyad } from "./made-with-dyad";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle"; // Import ThemeToggle

const Layout = () => {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const handleLinkClick = () => {
    if (isMobile) {
      setIsSheetOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {isMobile ? (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar isMobile={isMobile} onLinkClick={handleLinkClick} />
            <div className="absolute bottom-4 left-4">
              <ThemeToggle />
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <aside className="w-64 border-r bg-sidebar text-sidebar-foreground flex flex-col">
          <Sidebar isMobile={isMobile} />
          <div className="mt-auto p-4 border-t border-sidebar-border">
            <ThemeToggle />
          </div>
        </aside>
      )}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 p-8 pt-16 sm:pt-8">
          <Outlet />
        </div>
        <MadeWithDyad />
      </main>
    </div>
  );
};

export default Layout;