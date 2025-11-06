"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactionContext } from "@/context/TransactionContext";
import { TrendingUp, TrendingDown, Lightbulb, Zap } from "lucide-react";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

const BehavioralAnalysisPage = () => {
  const { transactions, totalExpenses, totalIncome, miscCategories, foodCategories, currentMiscExpenses, currentFoodExpenses, miscExpensesLimit, foodExpensesLimit } = useTransactionContext();

  // Análise de Gastos por Categoria
  const expenseCategorySummary = React.useMemo(() => {
    const categoryMap: { [key: string]: number } = {};
    transactions
      .filter(t => t.type === "expense")
      .forEach(t => {
        const amount = Math.abs(t.amount);
        categoryMap[t.category] = (categoryMap[t.category] || 0) + amount;
      });

    const sortedCategories = Object.entries(categoryMap).sort(([, a], [, b]) => b - a);
    return sortedCategories;
  }, [transactions]);

  // Análise de Picos de Gastos (ex: por dia da semana ou mês)
  const monthlySpending = React.useMemo(() => {
    const monthMap: { [key: string]: number } = {};
    transactions
      .filter(t => t.type === "expense")
      .forEach(t => {
        const monthYear = format(parseISO(t.date), "MMMM/yyyy", { locale: ptBR });
        monthMap[monthYear] = (monthMap[monthYear] || 0) + Math.abs(t.amount);
      });
    return Object.entries(monthMap).sort((a, b) => {
      const dateA = parseISO(format(new Date(), "yyyy") + "-" + (ptBR.localize?.month(ptBR.months.indexOf(a[0].split('/')[0])) || '') + "-01");
      const dateB = parseISO(format(new Date(), "yyyy") + "-" + (ptBR.localize?.month(ptBR.months.indexOf(b[0].split('/')[0])) || '') + "-01");
      return dateA.getTime() - dateB.getTime();
    });
  }, [transactions]);

  // Insights Comportamentais
  const insights: string[] = [];

  if (totalExpenses > totalIncome * 0.7) { // Mais de 70% da renda gasta
    insights.push("Você parece estar gastando uma grande parte da sua renda. Considere revisar suas despesas para aumentar sua capacidade de poupança.");
  }

  if (expenseCategorySummary.length > 0 && expenseCategorySummary[0][1] > totalExpenses * 0.4) {
    insights.push(`Sua maior despesa é em "${expenseCategorySummary[0][0]}". Analisar essa categoria pode ser um bom ponto de partida para economizar.`);
  }

  if (currentMiscExpenses > miscExpensesLimit && miscExpensesLimit > 0) {
    insights.push(`Cuidado! Você excedeu seu limite de gastos bestas este mês. Tente identificar o que causou o excesso.`);
  } else if (currentMiscExpenses > miscExpensesLimit * 0.8 && miscExpensesLimit > 0) {
    insights.push(`Seus gastos bestas estão se aproximando do limite. Fique atento para não exceder!`);
  }

  if (currentFoodExpenses > foodExpensesLimit && foodExpensesLimit > 0) {
    insights.push(`Seu orçamento de comida foi excedido. Que tal planejar as refeições ou cozinhar mais em casa?`);
  } else if (currentFoodExpenses > foodExpensesLimit * 0.8 && foodExpensesLimit > 0) {
    insights.push(`Os gastos com comida estão altos este mês. Pequenas mudanças podem fazer a diferença.`);
  }

  if (transactions.filter(t => t.type === "income").length === 0 && transactions.length > 0) {
    insights.push("Não há receitas registradas. Certifique-se de registrar todas as suas fontes de renda para uma análise completa.");
  }

  if (transactions.length < 5) {
    insights.push("Com mais transações registradas, poderemos fornecer insights mais precisos sobre seu comportamento financeiro!");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Análise Comportamental Financeira</h1>
      <p className="text-muted-foreground">Entenda seus hábitos de gastos e receba insights personalizados.</p>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5" /> Seus Insights</CardTitle>
          <CardDescription>Recomendações e observações baseadas em seus dados financeiros.</CardDescription>
        </CardHeader>
        <CardContent>
          {insights.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2">
              {insights.map((insight, index) => (
                <li key={index} className="text-muted-foreground">{insight}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Continue registrando suas transações para receber insights personalizados!</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingDown className="h-5 w-5" /> Maiores Despesas por Categoria</CardTitle>
            <CardDescription>Onde seu dinheiro está indo.</CardDescription>
          </CardHeader>
          <CardContent>
            {expenseCategorySummary.length > 0 ? (
              <ul className="space-y-2">
                {expenseCategorySummary.slice(0, 5).map(([category, amount]) => (
                  <li key={category} className="flex justify-between items-center">
                    <span className="font-medium">{category}</span>
                    <span className="text-muted-foreground">{amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Nenhuma despesa registrada para analisar.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" /> Padrões de Gastos Mensais</CardTitle>
            <CardDescription>Como seus gastos variam ao longo dos meses.</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlySpending.length > 0 ? (
              <ul className="space-y-2">
                {monthlySpending.map(([month, amount]) => (
                  <li key={month} className="flex justify-between items-center">
                    <span className="font-medium">{month}</span>
                    <span className="text-muted-foreground">{amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Nenhum dado mensal para analisar.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BehavioralAnalysisPage;