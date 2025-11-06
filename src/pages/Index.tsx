"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

const Index = () => {
  // Placeholder data for the dashboard
  const totalBalance = 5230.50;
  const totalIncome = 1500.00;
  const totalExpenses = 750.25;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Painel</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R${totalBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% do mês passado
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
              +15% do mês passado
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
              -5% do mês passado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* More dashboard content can go here */}
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