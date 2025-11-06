"use client";

import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { MadeWithDyad } from "./made-with-dyad";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import UserAvatar from "./UserAvatar"; // Importar UserAvatar
import { ThemeToggle } from "./ThemeToggle"; // Importar ThemeToggle
import { useTransactionContext } from "@/context/TransactionContext"; // Importar o contexto de transações
import { toast } from "sonner"; // Importar toast do sonner
import { differenceInDays, parseISO, addDays } from "date-fns"; // Importar utilitários de data

const Layout = () => {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const { userProfile } = useTransactionContext(); // Obter userProfile

  const handleLinkClick = () => {
    if (isMobile) {
      setIsSheetOpen(false);
    }
  };

  // NEW: Grace period warning effect
  React.useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let toastId: string | number | undefined;

    const showGracePeriodWarning = () => {
      if (userProfile && userProfile.is_premium && userProfile.grace_period_start_date) {
        const gracePeriodStartDate = parseISO(userProfile.grace_period_start_date);
        const gracePeriodEndDate = addDays(gracePeriodStartDate, 7); // 7 days grace period
        const daysRemaining = differenceInDays(gracePeriodEndDate, new Date());

        if (daysRemaining >= 0) {
          const message = `Sua assinatura expirou! Você tem ${daysRemaining} dia(s) restantes no período de carência. Após isso, o acesso premium será revogado.`;
          if (toastId) {
            toast.dismiss(toastId); // Dismiss previous toast if exists
          }
          toastId = toast.warning(message, {
            duration: 120 * 1000, // Show for 2 minutes
            id: "grace-period-warning",
            action: {
              label: "Gerenciar Assinatura",
              onClick: () => window.location.href = "/app/subscription-details", // Usar window.location.href para navegação fora do router context
            },
          });
        } else {
          // Grace period is over, but userProfile.is_premium is still true.
          // This case should be handled by TransactionContext's useEffect,
          // which will set is_premium to false.
          // If for some reason it's not, we stop showing the toast.
          if (toastId) {
            toast.dismiss(toastId);
            toastId = undefined;
          }
        }
      } else {
        // Not in grace period, ensure no toast is showing
        if (toastId) {
          toast.dismiss(toastId);
          toastId = undefined;
        }
      }
    };

    // Start interval only if userProfile is loaded and potentially in grace period
    if (userProfile && userProfile.is_premium && userProfile.grace_period_start_date) {
      showGracePeriodWarning(); // Show immediately
      intervalId = setInterval(showGracePeriodWarning, 120 * 1000); // Every 2 minutes
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (toastId) toast.dismiss(toastId);
    };
  }, [userProfile]); // Depend on userProfile to react to changes

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
          </SheetContent>
        </Sheet>
      ) : (
        <aside className="w-64 border-r bg-sidebar text-sidebar-foreground flex flex-col">
          <Sidebar isMobile={isMobile} />
        </aside>
      )}
      <main className="flex-1 flex flex-col">
        <header className="flex justify-end items-center p-4 pb-0 gap-4"> {/* Adicionado items-center e gap-4 */}
          <ThemeToggle /> {/* Adicionar ThemeToggle aqui */}
          <UserAvatar /> {/* Avatar no canto superior direito */}
        </header>
        <div className="flex-1 p-8 pt-4 sm:pt-4"> {/* Ajustar padding-top para acomodar o avatar */}
          <Outlet />
        </div>
        <MadeWithDyad />
      </main>
    </div>
  );
};

export default Layout;