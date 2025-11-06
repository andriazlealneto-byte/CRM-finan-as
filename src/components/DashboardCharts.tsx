"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, XAxis, YAxis, Tooltip, Bar, LineChart, Line, CartesianGrid } from "recharts";
import { useTransactionContext } from "@/context/TransactionContext";
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const DashboardCharts = () => {
  const { transactions, totalIncome, totalExpenses } = useTransactionContext();

  // Data for Pie Chart (Expense Categories)
  const expenseCategoriesData = React.useMemo(() => {
    const categoryMap: { [key: string]: number } = {};
    transactions
      .filter(t => t.type === "expense")
      .forEach(t => {
        const amount = Math.abs(t.amount);
        categoryMap[t.category] = (categoryMap[t.category] || 0) + amount;
      });
    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // Data for Bar Chart (Monthly Income vs Expenses)
  const monthlyData = React.useMemo(() => {
    const monthlyMap: { [key: string]: { income: number; expense: number } } = {};

    transactions.forEach(t => {
      const monthYear = format(parseISO(t.date), "MMM/yyyy", { locale: ptBR });
      if (!monthlyMap[monthYear]) {
        monthlyMap[monthYear] = { income: 0, expense: 0 };
      }
      if (t.type === "income") {
        monthlyMap[monthYear].income += t.amount;
      } else {
        monthlyMap[monthYear].expense += Math.abs(t.amount);
      }
    });

    // Sort by date
    const sortedMonths = Object.keys(monthlyMap).sort((a, b) => {
      const [monthA, yearA] = a.split('/');
      const [monthB, yearB] = b.split('/');
      const dateA = new Date(`${monthA} 1, ${yearA}`);
      const dateB = new Date(`${monthB} 1, ${yearB}`);
      return dateA.getTime() - dateB.getTime();
    });

    return sortedMonths.map(monthYear => ({
      month: monthYear,
      Receita: monthlyMap[monthYear].income,
      Despesa: monthlyMap[monthYear].expense,
    }));
  }, [transactions]);

  // Data for Timeline Chart (Balance over time)
  const timelineData = React.useMemo(() => {
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let currentBalance = 0;
    const balanceHistory: { date: string; balance: number }[] = [];

    sortedTransactions.forEach(t => {
      currentBalance += t.amount;
      balanceHistory.push({ date: format(parseISO(t.date), "dd/MM/yyyy", { locale: ptBR }), balance: currentBalance });
    });
    return balanceHistory;
  }, [transactions]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Despesas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          {expenseCategoriesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseCategoriesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {expenseCategoriesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground">Nenhuma despesa para exibir.</p>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Receitas vs. Despesas Mensais</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" formatter={(value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
                <Tooltip formatter={(value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
                <Legend />
                <Bar dataKey="Receita" fill="#82ca9d" />
                <Bar dataKey="Despesa" fill="#ff8042" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground">Nenhum dado mensal para exibir.</p>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Evolução do Saldo ao Longo do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          {timelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" formatter={(value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
                <Tooltip formatter={(value) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
                <Legend />
                <Line type="monotone" dataKey="balance" stroke="#8884d8" activeDot={{ r: 8 }} name="Saldo" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground">Nenhum histórico de saldo para exibir.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;