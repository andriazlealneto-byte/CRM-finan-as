"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, CalendarClock, ShoppingBag, Utensils, Target } from "lucide-react"; // Import new icons
import { useTransactionContext } from "@/context/TransactionContext"; // Import the context hook
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Progress } from "@/components/ui/progress"; // Import Progress component
import DashboardCharts from "@/components/DashboardCharts"; // Import DashboardCharts
import FinancialAssistant from "@/components/FinancialAssistant"; // Import FinancialAssistant

const Index = () => {
  const {
    totalBalance,
    totalIncome,
    totalExpenses,
    futureExpenses,
    miscExpensesLimit,
    currentMiscExpenses,
    foodExpensesLimit,
    currentFoodExpenses,
    goals, // Obter metas do contexto
  } = useTransactionContext();

  const miscProgress = (currentMiscExpenses / miscExpensesLimit) * 100;
  const foodProgress = (currentFoodExpenses / foodExpensesLimit) * 100;

  const getProgressBarColor = (progress: number) => {
    if (progress >= 100) return "bg-red-500";
    if (progress >= 80) return "bg-yellow-500";
    return "bg-primary";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Painel</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R${totalBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Seu saldo atual.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R${totalIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total de receitas registradas.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total de despesas registradas.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Futuros</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{futureExpenses.length}</div>
            <p className="text-xs text-muted-foreground">
              {futureExpenses.length === 1 ? "gasto futuro pendente" : "gastos futuros pendentes"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas Ativas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.filter(g => g.current_amount < g.target_amount && new Date(g.due_date) >= new Date()).length}</div>
            <p className="text-xs text-muted-foreground">
              {goals.filter(g => g.current_amount < g.target_amount && new Date(g.due_date) >= new Date()).length === 1 ? "meta ativa" : "metas ativas"}
            </p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Orçamentos Atuais</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Bestas</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R${currentMiscExpenses.toFixed(2)} / R${miscExpensesLimit.toFixed(2)}</div>
            <Progress value={miscProgress} className="mt-2" indicatorClassName={getProgressBarColor(miscProgress)} />
            <p className="text-xs text-muted-foreground mt-1">
              {miscProgress > 100 ? "Limite excedido!" : `${(miscExpensesLimit - currentMiscExpenses).toFixed(2)} restantes`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos com Comida</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R${currentFoodExpenses.toFixed(2)} / R${foodExpensesLimit.toFixed(2)}</div>
            <Progress value={foodProgress} className="mt-2" indicatorClassName={getProgressBarColor(foodProgress)} />
            <p className="text-xs text-muted-foreground mt-1">
              {foodProgress > 100 ? "Limite excedido!" : `${(foodExpensesLimit - currentFoodExpenses).toFixed(2)} restantes`}
            </p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Análise de Gastos</h2>
      <DashboardCharts />

      <FinancialAssistant /> {/* Novo componente do assistente financeiro */}

      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nenhuma atividade recente ainda. Adicione algumas transações!</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;