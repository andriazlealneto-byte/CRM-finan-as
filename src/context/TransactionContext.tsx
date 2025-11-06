"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage"; // Still used for auth, but not for transaction data
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useSession } from "./SessionContext"; // Import useSession

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  isFixed?: boolean;
  user_id: string; // Adicionado user_id
}

interface FutureExpense {
  id: string;
  dueDate: string;
  description: string;
  amount: number;
  category: string;
  installments?: number; // Novo campo
  term_months?: number; // Novo campo
  user_id: string; // Adicionado user_id
}

interface SavedCategory {
  id: string;
  name: string;
  user_id: string; // Adicionado user_id
}

interface UserBudget {
  id: string;
  user_id: string;
  misc_expenses_limit: number;
  food_expenses_limit: number;
  misc_categories: string[];
  food_categories: string[];
  created_at: string;
  updated_at: string;
}

interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  due_date: string;
  created_at: string;
  updated_at: string;
}

interface Debt {
  id: string;
  user_id: string;
  name: string;
  total_amount: number;
  paid_amount: number;
  installments: number;
  current_installment: number;
  due_date: string; // Due date for the *current* installment
  status: string; // e.g., 'pending', 'paid', 'overdue'
  created_at: string;
  updated_at: string;
}

interface Subscription { // Nova interface para assinaturas
  id: string;
  user_id: string;
  name: string;
  amount: number;
  next_due_date: string | null;
  created_at: string;
}

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  primary_color_hsl: string | null; // Nova propriedade
  background_color_hsl: string | null; // Nova propriedade
  avatar_style: string | null; // Nova propriedade
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "id" | "user_id">) => void;
  deleteTransaction: (id: string) => void;
  futureExpenses: FutureExpense[];
  addFutureExpense: (expense: Omit<FutureExpense, "id" | "user_id">) => void;
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
  loading: boolean;

  goals: Goal[];
  addGoal: (goal: Omit<Goal, "id" | "user_id" | "created_at" | "updated_at">) => void;
  updateGoal: (id: string, updates: Partial<Omit<Goal, "id" | "user_id" | "created_at">>) => void;
  deleteGoal: (id: string) => void;

  debts: Debt[];
  addDebt: (debt: Omit<Debt, "id" | "user_id" | "created_at" | "updated_at">) => void;
  updateDebt: (id: string, updates: Partial<Omit<Debt, "id" | "user_id" | "created_at">>) => void;
  deleteDebt: (id: string) => void;

  subscriptions: Subscription[]; // Novo estado para assinaturas
  addSubscription: (subscription: Omit<Subscription, "id" | "user_id" | "created_at">) => void;
  updateSubscription: (id: string, updates: Partial<Omit<Subscription, "id" | "user_id" | "created_at">>) => void;
  deleteSubscription: (id: string) => void;

  userProfile: UserProfile | null;
  updateUserProfile: (updates: Partial<Omit<UserProfile, "id">>) => void;
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
  const [goals, setGoals] = useState<Goal[]>([]); // Novo estado para metas
  const [debts, setDebts] = useState<Debt[]>([]); // Novo estado para dívidas
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]); // Novo estado para assinaturas
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // Novo estado para perfil do usuário
  const [loading, setLoading] = useState(true);

  const { user, loading: sessionLoading } = useSession(); // Obter user e loading da sessão

  // Fetch data from Supabase
  const fetchTransactions = useCallback(async () => {
    if (!user?.id) {
      setTransactions([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.from('transactions').select('*').eq('user_id', user.id);
    if (error) {
      toast.error("Erro ao carregar transações: " + error.message);
      console.error("Erro ao carregar transações:", error);
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  }, [user?.id]);

  const fetchFutureExpenses = useCallback(async () => {
    if (!user?.id) {
      setFutureExpenses([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.from('future_expenses').select('*').eq('user_id', user.id);
    if (error) {
      toast.error("Erro ao carregar gastos futuros: " + error.message);
      console.error("Erro ao carregar gastos futuros:", error);
    } else {
      setFutureExpenses(data || []);
    }
    setLoading(false);
  }, [user?.id]);

  const fetchSavedCategories = useCallback(async () => {
    if (!user?.id) {
      setSavedCategories([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.from('saved_categories').select('name').eq('user_id', user.id);
    if (error) {
      toast.error("Erro ao carregar categorias: " + error.message);
      console.error("Erro ao carregar categorias:", error);
    } else {
      setSavedCategories(data.map(item => item.name) || []);
    }
    setLoading(false);
  }, [user?.id]);

  const fetchBudgets = useCallback(async () => {
    if (!user?.id) {
      setMiscExpensesLimitState(0);
      setFoodExpensesLimitState(0);
      setMiscCategoriesState([]);
      setFoodCategoriesState([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.from('user_budgets').select('*').eq('user_id', user.id).limit(1);
    if (error) {
      toast.error("Erro ao carregar orçamentos: " + error.message);
      console.error("Erro ao carregar orçamentos:", error);
    } else if (data && data.length > 0) {
      const budget = data[0] as UserBudget;
      setMiscExpensesLimitState(budget.misc_expenses_limit);
      setFoodExpensesLimitState(budget.food_expenses_limit);
      setMiscCategoriesState(budget.misc_categories || []);
      setFoodCategoriesState(budget.food_categories || []);
    } else {
      // Initialize default budget if none exists for the current user
      const { data: newBudget, error: insertError } = await supabase
        .from('user_budgets')
        .insert({
          user_id: user.id,
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
        const budget = newBudget[0] as UserBudget;
        setMiscExpensesLimitState(budget.misc_expenses_limit);
        setFoodExpensesLimitState(budget.food_expenses_limit);
        setMiscCategoriesState(budget.misc_categories || []);
        setFoodCategoriesState(budget.food_categories || []);
      }
    }
    setLoading(false);
  }, [user?.id]);

  const fetchGoals = useCallback(async () => {
    if (!user?.id) {
      setGoals([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.from('goals').select('*').eq('user_id', user.id);
    if (error) {
      toast.error("Erro ao carregar metas: " + error.message);
      console.error("Erro ao carregar metas:", error);
    } else {
      setGoals(data || []);
    }
    setLoading(false);
  }, [user?.id]);

  const fetchDebts = useCallback(async () => {
    if (!user?.id) {
      setDebts([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.from('debts').select('*').eq('user_id', user.id);
    if (error) {
      toast.error("Erro ao carregar dívidas: " + error.message);
      console.error("Erro ao carregar dívidas:", error);
    } else {
      setDebts(data || []);
    }
    setLoading(false);
  }, [user?.id]);

  const fetchSubscriptions = useCallback(async () => { // Nova função para buscar assinaturas
    if (!user?.id) {
      setSubscriptions([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.from('subscriptions').select('*').eq('user_id', user.id);
    if (error) {
      toast.error("Erro ao carregar assinaturas: " + error.message);
      console.error("Erro ao carregar assinaturas:", error);
    } else {
      setSubscriptions(data || []);
    }
    setLoading(false);
  }, [user?.id]);

  const fetchUserProfile = useCallback(async () => {
    if (!user?.id) {
      setUserProfile(null);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (error) {
      // If profile doesn't exist, create a basic one
      if (error.code === 'PGRST116') { // No rows found
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({ 
            id: user.id, 
            first_name: user.user_metadata.first_name || null, 
            last_name: user.user_metadata.last_name || null,
            primary_color_hsl: '250 80% 60%', // Default value
            background_color_hsl: '220 10% 10%', // Default value
            avatar_style: 'User', // Default value
          })
          .select()
          .single();
        if (insertError) {
          toast.error("Erro ao criar perfil do usuário: " + insertError.message);
          console.error("Erro ao criar perfil:", insertError);
        } else {
          setUserProfile(newProfile as UserProfile);
        }
      } else {
        toast.error("Erro ao carregar perfil do usuário: " + error.message);
        console.error("Erro ao carregar perfil:", error);
      }
    } else {
      setUserProfile(data as UserProfile);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (!sessionLoading && user?.id) {
      fetchTransactions();
      fetchFutureExpenses();
      fetchSavedCategories();
      fetchBudgets();
      fetchGoals();
      fetchDebts();
      fetchSubscriptions(); // Chamar fetchSubscriptions
      fetchUserProfile();
    } else if (!sessionLoading && !user?.id) {
      // Clear data if user logs out
      setTransactions([]);
      setFutureExpenses([]);
      setSavedCategories([]);
      setMiscExpensesLimitState(0);
      setFoodExpensesLimitState(0);
      setMiscCategoriesState([]);
      setFoodCategoriesState([]);
      setGoals([]);
      setDebts([]);
      setSubscriptions([]); // Limpar assinaturas ao deslogar
      setUserProfile(null);
      setLoading(false);
    }
  }, [sessionLoading, user?.id, fetchTransactions, fetchFutureExpenses, fetchSavedCategories, fetchBudgets, fetchGoals, fetchDebts, fetchSubscriptions, fetchUserProfile]);

  const addTransaction = async (transaction: Omit<Transaction, "id" | "user_id">) => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para adicionar transações.");
      return;
    }
    const { data, error } = await supabase.from('transactions').insert({ ...transaction, user_id: user.id }).select();
    if (error) {
      toast.error("Erro ao adicionar transação: " + error.message);
      console.error("Erro ao adicionar transação:", error);
    } else if (data) {
      setTransactions((prev) => [...prev, data[0] as Transaction]);
      toast.success("Transação adicionada com sucesso!");
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para excluir transações.");
      return;
    }
    const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id);
    if (error) {
      toast.error("Erro ao excluir transação: " + error.message);
      console.error("Erro ao excluir transação:", error);
    } else {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast.success("Transação excluída com sucesso!");
    }
  };

  const addFutureExpense = async (expense: Omit<FutureExpense, "id" | "user_id">) => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para adicionar gastos futuros.");
      return;
    }
    const { data, error } = await supabase.from('future_expenses').insert({ ...expense, user_id: user.id }).select();
    if (error) {
      toast.error("Erro ao adicionar gasto futuro: " + error.message);
      console.error("Erro ao adicionar gasto futuro:", error);
    } else if (data) {
      setFutureExpenses((prev) => [...prev, data[0] as FutureExpense]);
      toast.success("Gasto futuro adicionado com sucesso!");
    }
  };

  const deleteFutureExpense = async (id: string) => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para excluir gastos futuros.");
      return;
    }
    const { error } = await supabase.from('future_expenses').delete().eq('id', id).eq('user_id', user.id);
    if (error) {
      toast.error("Erro ao excluir gasto futuro: " + error.message);
      console.error("Erro ao excluir gasto futuro:", error);
    } else {
      setFutureExpenses((prev) => prev.filter((e) => e.id !== id));
      toast.success("Gasto futuro excluído com sucesso!");
    }
  };

  const addSavedCategory = async (category: string) => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para adicionar categorias.");
      return;
    }
    if (category && !savedCategories.includes(category)) {
      const { data, error } = await supabase.from('saved_categories').insert({ name: category, user_id: user.id }).select();
      if (error) {
        toast.error("Erro ao adicionar categoria: " + error.message);
        console.error("Erro ao adicionar categoria:", error);
      } else if (data) {
        setSavedCategories((prev) => [...prev, (data[0] as SavedCategory).name]);
        toast.success("Categoria adicionada com sucesso!");
      }
    }
  };

  const editSavedCategory = async (oldCategory: string, newCategory: string) => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para editar categorias.");
      return;
    }
    if (newCategory && newCategory !== oldCategory && !savedCategories.includes(newCategory)) {
      const { data: oldCatData, error: fetchError } = await supabase
        .from('saved_categories')
        .select('id')
        .eq('name', oldCategory)
        .eq('user_id', user.id) // Filtrar por user_id
        .single();

      if (fetchError || !oldCatData) {
        toast.error("Erro ao encontrar categoria para edição: " + (fetchError?.message || "Categoria não encontrada."));
        console.error("Erro ao encontrar categoria para edição:", fetchError);
        return;
      }

      const { error } = await supabase.from('saved_categories').update({ name: newCategory }).eq('id', oldCatData.id).eq('user_id', user.id);
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
    if (!user?.id) {
      toast.error("Você precisa estar logado para excluir categorias.");
      return;
    }
    const { error } = await supabase.from('saved_categories').delete().eq('name', categoryToDelete).eq('user_id', user.id);
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

  const updateBudgetsInSupabase = async (updates: Partial<UserBudget>) => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para atualizar orçamentos.");
      return;
    }
    const { data: existingBudget, error: fetchError } = await supabase
      .from('user_budgets')
      .select('id')
      .eq('user_id', user.id) // Filtrar por user_id
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
        .eq('id', budgetId)
        .eq('user_id', user.id); // Garantir que a atualização é para o orçamento do usuário
      if (error) {
        toast.error("Erro ao atualizar orçamento: " + error.message);
        console.error("Erro ao atualizar orçamento:", error);
      }
    } else {
      // Este caso deve ser tratado pelo fetchBudgets inicializando um padrão
      // mas como fallback, insere se nenhum orçamento existir
      const { error } = await supabase
        .from('user_budgets')
        .insert({
          user_id: user.id, // Adicionar user_id aqui
          misc_expenses_limit: updates.misc_expenses_limit || miscExpensesLimit,
          food_expenses_limit: updates.food_expenses_limit || foodExpensesLimit,
          misc_categories: updates.misc_categories || miscCategories,
          food_categories: updates.food_categories || foodCategories,
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

  const addGoal = async (goal: Omit<Goal, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para adicionar metas.");
      return;
    }
    const { data, error } = await supabase.from('goals').insert({ ...goal, user_id: user.id }).select();
    if (error) {
      toast.error("Erro ao adicionar meta: " + error.message);
      console.error("Erro ao adicionar meta:", error);
    } else if (data) {
      setGoals((prev) => [...prev, data[0] as Goal]);
      toast.success("Meta adicionada com sucesso!");
    }
  };

  const updateGoal = async (id: string, updates: Partial<Omit<Goal, "id" | "user_id" | "created_at">>) => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para atualizar metas.");
      return;
    }
    const { error } = await supabase.from('goals').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', user.id);
    if (error) {
      toast.error("Erro ao atualizar meta: " + error.message);
      console.error("Erro ao atualizar meta:", error);
    } else {
      setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates, updated_at: new Date().toISOString() } : g)));
      toast.success("Meta atualizada com sucesso!");
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para excluir metas.");
      return;
    }
    const { error } = await supabase.from('goals').delete().eq('id', id).eq('user_id', user.id);
    if (error) {
      toast.error("Erro ao excluir meta: " + error.message);
      console.error("Erro ao excluir meta:", error);
    } else {
      setGoals((prev) => prev.filter((g) => g.id !== id));
      toast.success("Meta excluída com sucesso!");
    }
  };

  const addDebt = async (debt: Omit<Debt, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para adicionar dívidas.");
      return;
    }
    const { data, error } = await supabase.from('debts').insert({ ...debt, user_id: user.id }).select();
    if (error) {
      toast.error("Erro ao adicionar dívida: " + error.message);
      console.error("Erro ao adicionar dívida:", error);
    } else if (data) {
      setDebts((prev) => [...prev, data[0] as Debt]);
      toast.success("Dívida adicionada com sucesso!");
    }
  };

  const updateDebt = async (id: string, updates: Partial<Omit<Debt, "id" | "user_id" | "created_at">>) => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para atualizar dívidas.");
      return;
    }
    const { error } = await supabase.from('debts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', user.id);
    if (error) {
      toast.error("Erro ao atualizar dívida: " + error.message);
      console.error("Erro ao atualizar dívida:", error);
    } else {
      setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates, updated_at: new Date().toISOString() } : d)));
      toast.success("Dívida atualizada com sucesso!");
    }
  };

  const deleteDebt = async (id: string) => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para excluir dívidas.");
      return;
    }
    const { error } = await supabase.from('debts').delete().eq('id', id).eq('user_id', user.id);
    if (error) {
      toast.error("Erro ao excluir dívida: " + error.message);
      console.error("Erro ao excluir dívida:", error);
    } else {
      setDebts((prev) => prev.filter((d) => d.id !== id));
      toast.success("Dívida excluída com sucesso!");
    }
  };

  const addSubscription = async (subscription: Omit<Subscription, "id" | "user_id" | "created_at">) => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para adicionar assinaturas.");
      return;
    }
    const { data, error } = await supabase.from('subscriptions').insert({ ...subscription, user_id: user.id }).select();
    if (error) {
      toast.error("Erro ao adicionar assinatura: " + error.message);
      console.error("Erro ao adicionar assinatura:", error);
    } else if (data) {
      setSubscriptions((prev) => [...prev, data[0] as Subscription]);
      toast.success("Assinatura adicionada com sucesso!");
    }
  };

  const updateSubscription = async (id: string, updates: Partial<Omit<Subscription, "id" | "user_id" | "created_at">>) => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para atualizar assinaturas.");
      return;
    }
    const { error } = await supabase.from('subscriptions').update(updates).eq('id', id).eq('user_id', user.id);
    if (error) {
      toast.error("Erro ao atualizar assinatura: " + error.message);
      console.error("Erro ao atualizar assinatura:", error);
    } else {
      setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
      toast.success("Assinatura atualizada com sucesso!");
    }
  };

  const deleteSubscription = async (id: string) => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para excluir assinaturas.");
      return;
    }
    const { error } = await supabase.from('subscriptions').delete().eq('id', id).eq('user_id', user.id);
    if (error) {
      toast.error("Erro ao excluir assinatura: " + error.message);
      console.error("Erro ao excluir assinatura:", error);
    } else {
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
      toast.success("Assinatura excluída com sucesso!");
    }
  };

  const updateUserProfile = async (updates: Partial<Omit<UserProfile, "id">>) => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para atualizar seu perfil.");
      return;
    }
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (error) {
      toast.error("Erro ao atualizar perfil: " + error.message);
      console.error("Erro ao atualizar perfil:", error);
    } else {
      setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
      toast.success("Perfil atualizado com sucesso!");
    }
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
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        debts,
        addDebt,
        updateDebt,
        deleteDebt,
        subscriptions, // Adicionado subscriptions
        addSubscription, // Adicionado addSubscription
        updateSubscription, // Adicionado updateSubscription
        deleteSubscription, // Adicionado deleteSubscription
        userProfile,
        updateUserProfile,
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