"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Home, DollarSign, ListChecks, LogOut, Wallet, Target } from "lucide-react"; // Importar o ícone Target
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isMobile: boolean;
  onLinkClick?: () => void;
}

const Sidebar = ({ className, isMobile, onLinkClick }: SidebarProps) => {
  const { logout } = useAuth();

  const navItems = [
    {
      name: "Painel",
      href: "/",
      icon: <Home className="mr-2 h-4 w-4" />,
    },
    {
      name: "Transações",
      href: "/transactions",
      icon: <DollarSign className="mr-2 h-4 w-4" />,
    },
    {
      name: "Categorias",
      href: "/categories",
      icon: <ListChecks className="mr-2 h-4 w-4" />,
    },
    {
      name: "Orçamentos",
      href: "/budgets",
      icon: <Wallet className="mr-2 h-4 w-4" />,
    },
    {
      name: "Metas", // Novo item de navegação
      href: "/goals",
      icon: <Target className="mr-2 h-4 w-4" />, // Ícone para Metas
    },
  ];

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            GPF (Gestão Pessoal de Finanças)
          </h2>
          <div className="space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className="w-full justify-start"
                asChild
                onClick={onLinkClick}
              >
                <Link to={item.href}>
                  {item.icon}
                  {item.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
        <div className="px-3 py-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-700"
            onClick={async () => { // Make onClick async
              await logout(); // Await the logout call
              if (onLinkClick) onLinkClick();
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;