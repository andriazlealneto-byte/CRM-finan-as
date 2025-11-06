"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, CalendarClock } from "lucide-react";
import { useTransactionContext } from "@/context/TransactionContext"; // Import the context hook
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Index = () => {
  const { totalBalance, totalIncome, totalExpenses, futureExpenses } = useTransactionContext();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Painel</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"> {/* Changed to lg:grid-cols-4 to accommodate the new card */}
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

        {/* Card para o resumo de Gastos Futuros */}
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
      </div>

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