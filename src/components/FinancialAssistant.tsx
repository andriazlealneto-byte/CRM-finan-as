"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactionContext } from "@/context/TransactionContext";
import { useSession } from "@/context/SessionContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Brain, Loader2 } from "lucide-react";

interface FinancialInsight {
  dicas: string[];
  previsoes: string[];
  resumo: string;
}

const FinancialAssistant = () => {
  const { transactions, miscExpensesLimit, foodExpensesLimit, miscCategories, foodCategories, goals } = useTransactionContext();
  const { session } = useSession();
  const [insights, setInsights] = useState<FinancialInsight | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateInsights = async () => {
    if (!session) {
      toast.error("Você precisa estar logado para usar o assistente financeiro.");
      return;
    }

    setLoading(true);
    setInsights(null); // Clear previous insights

    try {
      // Prepare data to send to the Edge Function
      const userData = {
        transactions: transactions.map(t => ({
          date: t.date,
          description: t.description,
          amount: t.amount,
          type: t.type,
          category: t.category,
          isFixed: t.isFixed,
        })),
        budgets: {
          miscExpensesLimit,
          foodExpensesLimit,
          miscCategories,
          foodCategories,
        },
        goals: goals.map(g => ({
          name: g.name,
          target_amount: g.target_amount,
          current_amount: g.current_amount,
          due_date: g.due_date,
        })),
      };

      const { data, error } = await supabase.functions.invoke('financial-assistant', {
        body: userData,
      });

      if (error) {
        toast.error("Erro ao gerar insights: " + error.message);
        console.error("Erro ao invocar função Edge:", error);
      } else {
        setInsights(data as FinancialInsight);
        toast.success("Insights financeiros gerados com sucesso!");
      }
    } catch (error) {
      toast.error("Ocorreu um erro inesperado ao gerar insights.");
      console.error("Erro inesperado:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" /> Assistente Financeiro de IA
        </CardTitle>
        <CardDescription>
          Obtenha dicas personalizadas e previsões com base nos seus dados financeiros.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleGenerateInsights} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando Insights...
            </>
          ) : (
            "Gerar Insights Financeiros"
          )}
        </Button>

        {insights && (
          <div className="space-y-4 mt-4">
            <h3 className="text-lg font-semibold">Resumo:</h3>
            <p className="text-muted-foreground">{insights.resumo}</p>

            <h3 className="text-lg font-semibold">Dicas Personalizadas:</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              {insights.dicas.map((dica, index) => (
                <li key={index}>{dica}</li>
              ))}
            </ul>

            <h3 className="text-lg font-semibold">Previsões:</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              {insights.previsoes.map((previsao, index) => (
                <li key={index}>{previsao}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialAssistant;