"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, CalendarClock, ShoppingBag, Utensils, Target, ArrowUp, ArrowDown } from "lucide-react"; // Import new icons
import { useTransactionContext } from "@/context/TransactionContext"; // Import the context hook
import { format, subMonths, startOfMonth, endOfMonth, parseISO, differenceInMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Progress } from "@/components/ui/progress"; // Import Progress component
import DashboardCharts from "@/components/DashboardCharts"; // Import DashboardCharts
import { cn } from "@/lib/utils"; // Importar a função cn

// Função para calcular o valor futuro de uma série de pagamentos (anuidade)
const calculateFutureValue = (
  currentInvestments: number,
  monthlyContribution: number,
  annualReturnRate: number,
  months: number
) => {
  const monthlyRate = annualReturnRate / 100 / 12;
  let futureValue = currentInvestments;

  if (monthlyRate === 0) {
    futureValue += monthlyContribution * months;
  } else {
    futureValue = currentInvestments * Math.pow(1 + monthlyRate, months) +
                  monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  }
  return futureValue;
};

const Index = () => {
  const {
    transactions, // Adicionado para cálculo do comparativo
    totalBalance,
    totalIncome,
    totalExpenses,
    futureExpenses,
    miscExpensesLimit,
    currentMiscExpenses,
    foodExpensesLimit,
    currentFoodExpenses,
    goals, // Obter metas do contexto
    debts, // Obter dívidas do contexto
    subscriptions, // Obter assinaturas do contexto
    userProfile, // Obter perfil do usuário para visibilidade
  } = useTransactionContext();

  const miscProgress = (currentMiscExpenses / miscExpensesLimit) * 100;
  const foodProgress = (currentFoodExpenses / foodExpensesLimit) * 100;

  const getProgressBarColor = (progress: number) => {
    if (progress >= 100) return "bg-red-500";
    if (progress >= 80) return "bg-yellow-500";
    return "bg-primary";
  };

  // Cálculo do comparativo de gastos mensais
  const currentMonth = new Date();
  const previousMonth = subMonths(currentMonth, 1);

  const currentMonthExpenses = transactions
    .filter(t => t.type === "expense" && parseISO(t.date).getMonth() === currentMonth.getMonth() && parseISO(t.date).getFullYear() === currentMonth.getFullYear())
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const previousMonthExpenses = transactions
    .filter(t => t.type === "expense" && parseISO(t.date).getMonth() === previousMonth.getMonth() && parseISO(t.date).getFullYear() === previousMonth.getFullYear())
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  let expenseComparisonMessage = "Nenhum dado para comparar.";
  let expenseComparisonIcon = null;
  let expenseComparisonColor = "text-muted-foreground";

  if (previousMonthExpenses > 0) {
    const percentageChange = ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100;
    if (percentageChange < 0) {
      expenseComparisonMessage = `Você gastou ${Math.abs(percentageChange).toFixed(0)}% menos que no mês passado.`;
      expenseComparisonIcon = <ArrowDown className="h-4 w-4 text-green-500" />;
      expenseComparisonColor = "text-green-500";
    } else if (percentageChange > 0) {
      expenseComparisonMessage = `Você gastou ${percentageChange.toFixed(0)}% mais que no mês passado.`;
      expenseComparisonIcon = <ArrowUp className="h-4 w-4 text-red-500" />;
      expenseComparisonColor = "text-red-500";
    } else {
      expenseComparisonMessage = "Você gastou o mesmo que no mês passado.";
      expenseComparisonColor = "text-muted-foreground";
    }
  } else if (currentMonthExpenses > 0) {
    expenseComparisonMessage = "Você teve gastos este mês, mas não no mês passado.";
  }

  // Encontrar a meta de liberdade financeira
  const financialFreedomGoal = goals.find(g => g.is_financial_freedom_goal);

  let ffProgress = 0;
  let ffTargetCapital = 0;
  let ffProjectedValue = 0;
  let ffMonthsRemaining = 0;
  let ffIsAchieved = false;

  if (financialFreedomGoal && financialFreedomGoal.target_monthly_income && financialFreedomGoal.annual_return_rate) {
    ffTargetCapital = (financialFreedomGoal.target_monthly_income * 12) / (financialFreedomGoal.annual_return_rate / 100);
    ffMonthsRemaining = differenceInMonths(parseISO(financialFreedomGoal.due_date), new Date());
    
    if (ffMonthsRemaining > 0) {
      ffProjectedValue = calculateFutureValue(
        financialFreedomGoal.current_investments || 0,
        financialFreedomGoal.monthly_contribution || 0,
        financialFreedomGoal.annual_return_rate,
        ffMonthsRemaining
      );
    } else {
      ffProjectedValue = financialFreedomGoal.current_investments || 0;
    }
    
    ffProgress = (ffProjectedValue / ffTargetCapital) * 100;
    ffIsAchieved = ffProjectedValue >= ffTargetCapital;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Olá, {userProfile?.first_name || "Usuário"}!
      </h1>

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

        {userProfile?.show_goals && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Metas Ativas</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{goals.filter(g => (g.current_amount || 0) < (g.target_amount || 0) && parseISO(g.due_date) >= new Date()).length}</div>
              <p className="text-xs text-muted-foreground">
                {goals.filter(g => (g.current_amount || 0) < (g.target_amount || 0) && parseISO(g.due_date) >= new Date()).length === 1 ? "meta ativa" : "metas ativas"}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comparativo Mensal</CardTitle>
            {expenseComparisonIcon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R${currentMonthExpenses.toFixed(2)}</div>
            <p className={cn("text-xs", expenseComparisonColor)}>
              {expenseComparisonMessage}
            </p>
          </CardContent>
        </Card>

        {userProfile?.show_goals && financialFreedomGoal && (
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Liberdade Financeira: {financialFreedomGoal.name}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ffProjectedValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} / {ffTargetCapital.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
              <Progress value={Math.min(100, ffProgress)} className="mt-2" indicatorClassName={getProgressBarColor(ffProgress)} />
              <p className="text-xs text-muted-foreground mt-1">
                {ffIsAchieved ? "Meta de Liberdade Financeira Atingida!" : `${ffMonthsRemaining > 0 ? ffMonthsRemaining : 0} meses restantes para a data limite.`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {userProfile?.show_budgets && (
        <>
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
        </>
      )}

      <h2 className="text-2xl font-bold mt-8 mb-4">Análise de Gastos</h2>
      <DashboardCharts />

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