"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Home, DollarSign, ListChecks, LogOut, Wallet, Target, BookOpen, CreditCard, User, Repeat, Brain, CalendarCheck } from "lucide-react"; // Importar novos ícones
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useTransactionContext } from "@/context/TransactionContext"; // Importar o contexto de transações

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isMobile: boolean;
  onLinkClick?: () => void;
}

const Sidebar = ({ className, isMobile, onLinkClick }: SidebarProps) => {
  const { logout } = useAuth();
  const { userProfile } = useTransactionContext();

  const navItems = [
    {
      name: "Painel",
      href: "/app",
      icon: <Home className="mr-2 h-4 w-4" />,
      show: true, // Painel sempre visível
    },
    {
      name: "Transações",
      href: "/app/transactions",
      icon: <DollarSign className="mr-2 h-4 w-4" />,
      show: true, // Transações sempre visíveis
    },
    {
      name: "Categorias",
      href: "/app/categories",
      icon: <ListChecks className="mr-2 h-4 w-4" />,
      show: true, // Categorias sempre visíveis
    },
    {
      name: "Orçamentos",
      href: "/app/budgets",
      icon: <Wallet className="mr-2 h-4 w-4" />,
      show: userProfile?.show_budgets ?? true,
    },
    {
      name: "Metas",
      href: "/app/goals",
      icon: <Target className="mr-2 h-4 w-4" />,
      show: userProfile?.show_goals ?? true,
    },
    {
      name: "Dívidas",
      href: "/app/debts",
      icon: <CreditCard className="mr-2 h-4 w-4" />,
      show: userProfile?.show_debts ?? true,
    },
    {
      name: "Assinaturas",
      href: "/app/subscriptions",
      icon: <Repeat className="mr-2 h-4 w-4" />,
      show: userProfile?.show_subscriptions ?? true, // Controla a visibilidade das assinaturas externas
    },
    // REMOVIDO: Análise Comportamental
    {
      name: "Reflexão Mensal",
      href: "/app/monthly-review",
      icon: <CalendarCheck className="mr-2 h-4 w-4" />,
      show: userProfile?.show_monthly_review ?? true,
    },
    // REMOVIDO: Perfil do menu lateral, agora acessível apenas pelo avatar
    // {
    //   name: "Perfil",
    //   href: "/app/profile",
    //   icon: <User className="mr-2 h-4 w-4" />,
    //   show: true, 
    // },
  ];

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            GPF (Gestão Pessoal de Finanças)
          </h2>
          <div className="space-y-1">
            {navItems.filter(item => item.show).map((item) => (
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
            onClick={async () => {
              await logout();
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