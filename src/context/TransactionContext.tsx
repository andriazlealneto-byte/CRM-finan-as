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
  isFixed?: boolean; // Adicionando a propriedade isFixed
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
  savedCategories: string[]; // Nova propriedade para categorias salvas
  addSavedCategory: (category: string) => void; // Nova função para adicionar categoria
  editSavedCategory: (oldCategory: string, newCategory: string) => void; // Função para editar categoria
  deleteSavedCategory: (categoryToDelete: string) => void; // Função para excluir categoria
  
  // Novas propriedades para orçamentos
  miscExpensesLimit: number;
  setMiscExpensesLimit: (limit: number) => void;
  foodExpensesLimit: number;
  setFoodExpensesLimit: (limit: number) => void;
  miscCategories: string[];
  setMiscCategories: (categories: string[]) => void;
  foodCategories: string[];
  setFoodCategories: (categories: string[]) => void;
  currentMiscExpenses: number;
  currentFoodExpenses: number;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>("finance-transactions", [
    { id: "1", date: "2023-10-26", description: "Salário", amount: 3000, type: "income", category: "Trabalho", isFixed: false },
    { id: "2", date: "2023-10-25", description: "Compras de Supermercado", amount: -120.50, type: "expense", category: "Alimentação", isFixed: false },
    { id: "3", date: "2023-10-24", description: "Projeto Freelance", amount: 500, type: "income", category: "Trabalho", isFixed: false },
    { id: "4", date: "2023-10-23", description: "Aluguel", amount: -800, type: "expense", category: "Moradia", isFixed: true },
  ]);

  const [futureExpenses, setFutureExpenses] = useLocalStorage<FutureExpense[]>("finance-future-expenses", [
    { id: "fe1", dueDate: "2023-11-05", description: "Conta de Luz", amount: 150, category: "Contas" },
    { id: "fe2", dueDate: "2023-11-10", description: "Mensalidade Academia", amount: 80, category: "Saúde" },
  ]);

  const [savedCategories, setSavedCategories] = useLocalStorage<string[]>("finance-saved-categories", [
    "Alimentação", "Moradia", "Transporte", "Saúde", "Educação", "Lazer", "Trabalho", "Contas", "Outros"
  ]);

  // Novos estados para orçamentos
  const [miscExpensesLimit, setMiscExpensesLimit] = useLocalStorage<number>("finance-misc-expenses-limit", 200);
  const [foodExpensesLimit, setFoodExpensesLimit] = useLocalStorage<number>("finance-food-expenses-limit", 500);
  const [miscCategories, setMiscCategories] = useLocalStorage<string[]>("finance-misc-categories", ["Lazer", "Outros"]);
  const [foodCategories, setFoodCategories] = useLocalStorage<string[]>("finance-food-categories", ["Alimentação"]);


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

  const addSavedCategory = (category: string) => {
    if (category && !savedCategories.includes(category)) {
      setSavedCategories((prev) => [...prev, category]);
    }
  };

  const editSavedCategory = (oldCategory: string, newCategory: string) => {
    if (newCategory && newCategory !== oldCategory && !savedCategories.includes(newCategory)) {
      setSavedCategories((prev) =>
        prev.map((cat) => (cat === oldCategory ? newCategory : cat))
      );
      // Atualizar categorias de orçamento se a categoria for renomeada
      setMiscCategories((prev) => prev.map(cat => cat === oldCategory ? newCategory : cat));
      setFoodCategories((prev) => prev.map(cat => cat === oldCategory ? newCategory : cat));
    }
  };

  const deleteSavedCategory = (categoryToDelete: string) => {
    setSavedCategories((prev) => prev.filter((cat) => cat !== categoryToDelete));
    // Remover a categoria das listas de orçamento se ela for excluída
    setMiscCategories((prev) => prev.filter((cat) => cat !== categoryToDelete));
    setFoodCategories((prev) => prev.filter((cat) => cat !== categoryToDelete));
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0); // Use Math.abs for display

  const totalBalance = transactions.reduce((sum, t) => sum + t.amount, 0);

  // Cálculo dos gastos atuais para categorias específicas
  const currentMiscExpenses = transactions
    .filter(t => t.type === "expense" && miscCategories.includes(t.category))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const currentFoodExpenses = transactions
    .filter(t => t.type === "expense" && foodCategories.includes(t.category))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

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
        savedCategories,
        addSavedCategory,
        editSavedCategory,
        deleteSavedCategory,
        miscExpensesLimit,
        setMiscExpensesLimit,
        foodExpensesLimit,
        setFoodExpensesLimit,
        miscCategories,
        setMiscCategories,
        foodCategories,
        setFoodCategories,
        currentMiscExpenses,
        currentFoodExpenses,
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