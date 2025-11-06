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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarClock className="mr-2 h-5 w-5" />
            Próximos Gastos Futuros
          </CardTitle>
        </CardHeader>
        <CardContent>
          {futureExpenses.length > 0 ? (
            <div className="space-y-4">
              {futureExpenses
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between border-b pb-2 last:border-b-0 last:pb-0">
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(expense.dueDate), "dd/MM/yyyy", { locale: ptBR })} - {expense.category}
                      </p>
                    </div>
                    <p className="font-bold text-red-600">
                      - {expense.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhum gasto futuro registrado. Adicione um!</p>
          )}
        </CardContent>
      </Card>

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