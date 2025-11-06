"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactionContext } from "@/context/TransactionContext";
import { format, subMonths, startOfMonth, endOfMonth, parseISO, isSameMonth, isSameYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Lightbulb, CheckCircle, XCircle, TrendingUp, TrendingDown } from "lucide-react";
import { Progress } from "@/components/ui/progress"; // Certifique-se de que Progress está importado

const MonthlyReviewPage = () => {
  const { transactions, goals, miscExpensesLimit, foodExpensesLimit, miscCategories, foodCategories, userProfile } = useTransactionContext();

  const currentMonth = new Date();
  const previousMonth = subMonths(currentMonth, 1);
  const formattedPreviousMonth = format(previousMonth, "MMMM 'de' yyyy", { locale: ptBR });

  const transactionsPreviousMonth = transactions.filter(t =>
    isSameMonth(parseISO(t.date), previousMonth) && isSameYear(parseISO(t.date), previousMonth)
  );

  const totalIncomePreviousMonth = transactionsPreviousMonth
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpensesPreviousMonth = transactionsPreviousMonth
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const miscExpensesPreviousMonth = transactionsPreviousMonth
    .filter(t => t.type === "expense" && miscCategories.includes(t.category))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const foodExpensesPreviousMonth = transactionsPreviousMonth
    .filter(t => t.type === "expense" && foodCategories.includes(t.category))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const insights: { type: "success" | "improvement", message: string }[] = [];
  let consistencyScore = 100; // Start with 100% and deduct for issues

  // Insight 1: Balanço Geral
  if (totalIncomePreviousMonth > totalExpensesPreviousMonth) {
    insights.push({ type: "success", message: `Parabéns! Em ${formattedPreviousMonth}, suas receitas superaram suas despesas em ${ (totalIncomePreviousMonth - totalExpensesPreviousMonth).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) }. Ótimo trabalho!` });
  } else if (totalExpensesPreviousMonth > totalIncomePreviousMonth) {
    insights.push({ type: "improvement", message: `Em ${formattedPreviousMonth}, suas despesas (${totalExpensesPreviousMonth.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}) foram maiores que suas receitas (${totalIncomePreviousMonth.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}). Vamos analisar onde podemos ajustar.` });
    consistencyScore -= 20;
  } else {
    insights.push({ type: "improvement", message: `Em ${formattedPreviousMonth}, suas receitas e despesas foram equilibradas. Considere buscar formas de aumentar a receita ou reduzir despesas para construir reservas.` });
    consistencyScore -= 5;
  }

  // Insight 2: Orçamento de Gastos Bestas
  if (miscExpensesLimit > 0) {
    if (miscExpensesPreviousMonth <= miscExpensesLimit) {
      insights.push({ type: "success", message: `Você se manteve dentro do seu orçamento de Gastos Bestas em ${formattedPreviousMonth}. Excelente controle!` });
    } else {
      insights.push({ type: "improvement", message: `Seu orçamento de Gastos Bestas foi excedido em ${ (miscExpensesPreviousMonth - miscExpensesLimit).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) } em ${formattedPreviousMonth}. Que tal revisar essa categoria para o próximo mês?` });
      consistencyScore -= 15;
    }
  }

  // Insight 3: Orçamento de Comida
  if (foodExpensesLimit > 0) {
    if (foodExpensesPreviousMonth <= foodExpensesLimit) {
      insights.push({ type: "success", message: `Você gerenciou bem seus gastos com Comida em ${formattedPreviousMonth}, ficando dentro do limite. Continue assim!` });
    } else {
      insights.push({ type: "improvement", message: `Os gastos com Comida excederam o limite em ${ (foodExpensesPreviousMonth - foodExpensesLimit).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) } em ${formattedPreviousMonth}. Pequenas mudanças podem ajudar a economizar aqui.` });
      consistencyScore -= 15;
    }
  }

  // Insight 4: Progresso de Metas
  const goalsInProgress = goals.filter(g => (g.current_amount || 0) < (g.target_amount || 0) && parseISO(g.due_date) >= previousMonth);
  if (goalsInProgress.length > 0) {
    const goalsMadeProgress = goalsInProgress.filter(g => {
      // This is a simplified check. A more robust check would compare current_amount at start vs end of month.
      // For now, we'll just check if current_amount is positive.
      return (g.current_amount || 0) > 0;
    });
    if (goalsMadeProgress.length > 0) {
      insights.push({ type: "success", message: `Você fez progresso em ${goalsMadeProgress.length} de suas metas em ${formattedPreviousMonth}. Mantenha o foco!` });
    } else {
      insights.push({ type: "improvement", message: `Nenhuma de suas metas ativas teve progresso significativo em ${formattedPreviousMonth}. Vamos criar um plano para avançar?` });
      consistencyScore -= 10;
    }
  } else {
    insights.push({ type: "improvement", message: "Você não tem metas ativas. Definir metas pode ser um grande motivador para suas finanças!" });
    consistencyScore -= 5;
  }

  // Ensure consistency score is not negative
  consistencyScore = Math.max(0, consistencyScore);

  if (!userProfile?.show_monthly_review) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <h1 className="text-3xl font-bold">Reflexão Mensal Desativada</h1>
        <p className="text-muted-foreground">
          Esta seção está desativada nas suas configurações de perfil.
          Ative-a na página de Perfil para ver sua reflexão mensal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reflexão Mensal: {formattedPreviousMonth}</h1>
      <p className="text-muted-foreground">Uma análise do seu desempenho financeiro no mês passado e sugestões para o futuro.</p>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5" /> Resumo do Mês</CardTitle>
          <CardDescription>Seu desempenho financeiro em {formattedPreviousMonth}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Receita Total</p>
              <p className="text-xl font-bold text-green-500">{totalIncomePreviousMonth.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Despesa Total</p>
              <p className="text-xl font-bold text-red-500">{totalExpensesPreviousMonth.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">Consistência Financeira</p>
            <Progress value={consistencyScore} className="mt-2" indicatorClassName={consistencyScore >= 80 ? "bg-green-500" : consistencyScore >= 50 ? "bg-yellow-500" : "bg-red-500"} />
            <p className="text-xl font-bold mt-1">{consistencyScore.toFixed(0)}%</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> O que deu certo?</CardTitle>
          <CardDescription>Pontos positivos do seu mês.</CardDescription>
        </CardHeader>
        <CardContent>
          {insights.filter(i => i.type === "success").length > 0 ? (
            <ul className="list-disc pl-5 space-y-2">
              {insights.filter(i => i.type === "success").map((insight, index) => (
                <li key={index} className="text-muted-foreground">{insight.message}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Nenhum ponto positivo identificado neste mês. Vamos buscar melhorias para o próximo!</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><XCircle className="h-5 w-5 text-red-500" /> O que precisa melhorar?</CardTitle>
          <CardDescription>Áreas para focar no próximo mês.</CardDescription>
        </CardHeader>
        <CardContent>
          {insights.filter(i => i.type === "improvement").length > 0 ? (
            <ul className="list-disc pl-5 space-y-2">
              {insights.filter(i => i.type === "improvement").map((insight, index) => (
                <li key={index} className="text-muted-foreground">{insight.message}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Ótimo trabalho! Não há grandes pontos de melhoria identificados. Continue monitorando suas finanças.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyReviewPage;