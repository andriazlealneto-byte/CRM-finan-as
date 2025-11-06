"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { format } from "date-fns";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
}

interface FutureExpense {
  id: string;
  dueDate: string;
  description: string;
  amount: number;
  category: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  futureExpenses: FutureExpense[];
  addFutureExpense: (expense: Omit<FutureExpense, "id">) => void;
  deleteFutureExpense: (id: string) => void;
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>("finance-transactions", [
    { id: "1", date: "2023-10-26", description: "Salário", amount: 3000, type: "income", category: "Trabalho" },
    { id: "2", date: "2023-10-25", description: "Compras de Supermercado", amount: -120.50, type: "expense", category: "Alimentação" },
    { id: "3", date: "2023-10-24", description: "Projeto Freelance", amount: 500, type: "income", category: "Trabalho" },
    { id: "4", date: "2023-10-23", description: "Aluguel", amount: -800, type: "expense", category: "Moradia" },
  ]);

  const [futureExpenses, setFutureExpenses] = useLocalStorage<FutureExpense[]>("finance-future-expenses", [
    { id: "fe1", dueDate: "2023-11-05", description: "Conta de Luz", amount: 150, category: "Contas" },
    { id: "fe2", dueDate: "2023-11-10", description: "Mensalidade Academia", amount: 80, category: "Saúde" },
  ]);

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = { ...transaction, id: String(Date.now()) };
    setTransactions((prev) => [...prev, newTransaction]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const addFutureExpense = (expense: Omit<FutureExpense, "id">) => {
    const newFutureExpense: FutureExpense = { ...expense, id: String(Date.now()) };
    setFutureExpenses((prev) => [...prev, newFutureExpense]);
  };

  const deleteFutureExpense = (id: string) => {
    setFutureExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0); // Use Math.abs for display

  const totalBalance = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        deleteTransaction,
        futureExpenses,
        addFutureExpense,
        deleteFutureExpense,
        totalBalance,
        totalIncome,
        totalExpenses,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactionContext = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error("useTransactionContext must be used within a TransactionProvider");
  }
  return context;
};