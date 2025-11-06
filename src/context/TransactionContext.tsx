"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage"; // Still used for auth, but not for transaction data
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  isFixed?: boolean;
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
  savedCategories: string[];
  addSavedCategory: (category: string) => void;
  editSavedCategory: (oldCategory: string, newCategory: string) => void;
  deleteSavedCategory: (categoryToDelete: string) => void;
  
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
  loading: boolean; // Add loading state
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [futureExpenses, setFutureExpenses] = useState<FutureExpense[]>([]);
  const [savedCategories, setSavedCategories] = useState<string[]>([]);
  const [miscExpensesLimit, setMiscExpensesLimitState] = useState<number>(0);
  const [foodExpensesLimit, setFoodExpensesLimitState] = useState<number>(0);
  const [miscCategories, setMiscCategoriesState] = useState<string[]>([]);
  const [foodCategories, setFoodCategoriesState] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from Supabase
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('transactions').select('*');
    if (error) {
      toast.error("Erro ao carregar transações: " + error.message);
      console.error("Erro ao carregar transações:", error);
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  }, []);

  const fetchFutureExpenses = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('future_expenses').select('*');
    if (error) {
      toast.error("Erro ao carregar gastos futuros: " + error.message);
      console.error("Erro ao carregar gastos futuros:", error);
    } else {
      setFutureExpenses(data || []);
    }
    setLoading(false);
  }, []);

  const fetchSavedCategories = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('saved_categories').select('name');
    if (error) {
      toast.error("Erro ao carregar categorias: " + error.message);
      console.error("Erro ao carregar categorias:", error);
    } else {
      setSavedCategories(data.map(item => item.name) || []);
    }
    setLoading(false);
  }, []);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('user_budgets').select('*').limit(1);
    if (error) {
      toast.error("Erro ao carregar orçamentos: " + error.message);
      console.error("Erro ao carregar orçamentos:", error);
    } else if (data && data.length > 0) {
      const budget = data[0];
      setMiscExpensesLimitState(budget.misc_expenses_limit);
      setFoodExpensesLimitState(budget.food_expenses_limit);
      setMiscCategoriesState(budget.misc_categories || []);
      setFoodCategoriesState(budget.food_categories || []);
    } else {
      // Initialize default budget if none exists
      const { data: newBudget, error: insertError } = await supabase
        .from('user_budgets')
        .insert({
          misc_expenses_limit: 200,
          food_expenses_limit: 500,
          misc_categories: ["Lazer", "Outros"],
          food_categories: ["Alimentação"],
        })
        .select('*');
      if (insertError) {
        toast.error("Erro ao inicializar orçamento: " + insertError.message);
        console.error("Erro ao inicializar orçamento:", insertError);
      } else if (newBudget && newBudget.length > 0) {
        const budget = newBudget[0];
        setMiscExpensesLimitState(budget.misc_expenses_limit);
        setFoodExpensesLimitState(budget.food_expenses_limit);
        setMiscCategoriesState(budget.misc_categories || []);
        setFoodCategoriesState(budget.food_categories || []);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchFutureExpenses();
    fetchSavedCategories();
    fetchBudgets();
  }, [fetchTransactions, fetchFutureExpenses, fetchSavedCategories, fetchBudgets]);

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    const { data, error } = await supabase.from('transactions').insert(transaction).select();
    if (error) {
      toast.error("Erro ao adicionar transação: " + error.message);
      console.error("Erro ao adicionar transação:", error);
    } else if (data) {
      setTransactions((prev) => [...prev, data[0]]);
      toast.success("Transação adicionada com sucesso!");
    }
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) {
      toast.error("Erro ao excluir transação: " + error.message);
      console.error("Erro ao excluir transação:", error);
    } else {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast.success("Transação excluída com sucesso!");
    }
  };

  const addFutureExpense = async (expense: Omit<FutureExpense, "id">) => {
    const { data, error } = await supabase.from('future_expenses').insert(expense).select();
    if (error) {
      toast.error("Erro ao adicionar gasto futuro: " + error.message);
      console.error("Erro ao adicionar gasto futuro:", error);
    } else if (data) {
      setFutureExpenses((prev) => [...prev, data[0]]);
      toast.success("Gasto futuro adicionado com sucesso!");
    }
  };

  const deleteFutureExpense = async (id: string) => {
    const { error } = await supabase.from('future_expenses').delete().eq('id', id);
    if (error) {
      toast.error("Erro ao excluir gasto futuro: " + error.message);
      console.error("Erro ao excluir gasto futuro:", error);
    } else {
      setFutureExpenses((prev) => prev.filter((e) => e.id !== id));
      toast.success("Gasto futuro excluído com sucesso!");
    }
  };

  const addSavedCategory = async (category: string) => {
    if (category && !savedCategories.includes(category)) {
      const { data, error } = await supabase.from('saved_categories').insert({ name: category }).select();
      if (error) {
        toast.error("Erro ao adicionar categoria: " + error.message);
        console.error("Erro ao adicionar categoria:", error);
      } else if (data) {
        setSavedCategories((prev) => [...prev, data[0].name]);
        toast.success("Categoria adicionada com sucesso!");
      }
    }
  };

  const editSavedCategory = async (oldCategory: string, newCategory: string) => {
    if (newCategory && newCategory !== oldCategory && !savedCategories.includes(newCategory)) {
      // Find the ID of the old category
      const { data: oldCatData, error: fetchError } = await supabase
        .from('saved_categories')
        .select('id')
        .eq('name', oldCategory)
        .single();

      if (fetchError || !oldCatData) {
        toast.error("Erro ao encontrar categoria para edição: " + (fetchError?.message || "Categoria não encontrada."));
        console.error("Erro ao encontrar categoria para edição:", fetchError);
        return;
      }

      const { error } = await supabase.from('saved_categories').update({ name: newCategory }).eq('id', oldCatData.id);
      if (error) {
        toast.error("Erro ao editar categoria: " + error.message);
        console.error("Erro ao editar categoria:", error);
      } else {
        setSavedCategories((prev) =>
          prev.map((cat) => (cat === oldCategory ? newCategory : cat))
        );
        // Update budget categories if the category is renamed
        setMiscCategoriesState((prev) => prev.map(cat => cat === oldCategory ? newCategory : cat));
        setFoodCategoriesState((prev) => prev.map(cat => cat === oldCategory ? newCategory : cat));
        toast.success("Categoria editada com sucesso!");
      }
    }
  };

  const deleteSavedCategory = async (categoryToDelete: string) => {
    const { error } = await supabase.from('saved_categories').delete().eq('name', categoryToDelete);
    if (error) {
      toast.error("Erro ao excluir categoria: " + error.message);
      console.error("Erro ao excluir categoria:", error);
    } else {
      setSavedCategories((prev) => prev.filter((cat) => cat !== categoryToDelete));
      // Remover a categoria das listas de orçamento se ela for excluída
      setMiscCategoriesState((prev) => prev.filter((cat) => cat !== categoryToDelete));
      setFoodCategoriesState((prev) => prev.filter((cat) => cat !== categoryToDelete));
      toast.success(`Categoria "${categoryToDelete}" excluída com sucesso!`);
    }
  };

  const updateBudgetsInSupabase = async (updates: Partial<TransactionContextType>) => {
    const { data: existingBudget, error: fetchError } = await supabase
      .from('user_budgets')
      .select('id')
      .limit(1);

    if (fetchError) {
      toast.error("Erro ao buscar orçamento existente: " + fetchError.message);
      console.error("Erro ao buscar orçamento existente:", fetchError);
      return;
    }

    if (existingBudget && existingBudget.length > 0) {
      const budgetId = existingBudget[0].id;
      const { error } = await supabase
        .from('user_budgets')
        .update(updates)
        .eq('id', budgetId);
      if (error) {
        toast.error("Erro ao atualizar orçamento: " + error.message);
        console.error("Erro ao atualizar orçamento:", error);
      }
    } else {
      // This case should ideally be handled by fetchBudgets initializing a default
      // but as a fallback, insert if no budget exists
      const { error } = await supabase
        .from('user_budgets')
        .insert({
          misc_expenses_limit: updates.miscExpensesLimit || miscExpensesLimit,
          food_expenses_limit: updates.foodExpensesLimit || foodExpensesLimit,
          misc_categories: updates.miscCategories || miscCategories,
          food_categories: updates.foodCategories || foodCategories,
        });
      if (error) {
        toast.error("Erro ao criar orçamento: " + error.message);
        console.error("Erro ao criar orçamento:", error);
      }
    }
  };

  const setMiscExpensesLimit = (limit: number) => {
    setMiscExpensesLimitState(limit);
    updateBudgetsInSupabase({ misc_expenses_limit: limit });
  };

  const setFoodExpensesLimit = (limit: number) => {
    setFoodExpensesLimitState(limit);
    updateBudgetsInSupabase({ food_expenses_limit: limit });
  };

  const setMiscCategories = (categories: string[]) => {
    setMiscCategoriesState(categories);
    updateBudgetsInSupabase({ misc_categories: categories });
  };

  const setFoodCategories = (categories: string[]) => {
    setFoodCategoriesState(categories);
    updateBudgetsInSupabase({ food_categories: categories });
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalBalance = transactions.reduce((sum, t) => sum + t.amount, 0);

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
        loading,
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