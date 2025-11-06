"use client";

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";

import LandingPage from "@/pages/LandingPage"; // Nova Landing Page
import Index from "@/pages/Index"; // Importar a página Index (Painel)
import TransactionsPage from "@/pages/TransactionsPage";
import CategoryManagementPage from "@/pages/CategoryManagementPage";
import BudgetManagementPage from "@/pages/BudgetManagementPage";
import GoalsPage from "@/pages/GoalsPage";
import DebtsPage from "@/pages/DebtsPage";
import SubscriptionManagementPage from "@/pages/SubscriptionManagementPage";
// REMOVIDO: import BehavioralAnalysisPage from "@/pages/BehavioralAnalysisPage";
import MonthlyReviewPage from "@/pages/MonthlyReviewPage";
import ProfilePage from "@/pages/ProfilePage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import NotFound from "@/pages/NotFound";
import PaymentPage from "@/pages/PaymentPage"; // Nova página de pagamento
import SubscriptionRequiredPage from "@/pages/SubscriptionRequiredPage"; // Nova página de assinatura necessária
import SubscriptionDetailsPage from "@/pages/SubscriptionDetailsPage"; // Importar a nova página de detalhes da assinatura

import { SessionProvider } from "@/context/SessionContext";
import { AuthProvider } from "@/context/AuthContext";
import { TransactionProvider } from "@/context/TransactionContext";
import { ThemeProvider } from "next-themes"; // Importar ThemeProvider

function App() {
  return (
    <BrowserRouter>
      <Toaster richColors />
      <SessionProvider>
        <AuthProvider>
          <TransactionProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem> {/* Adicionar ThemeProvider */}
              <Routes>
                <Route path="/" element={<LandingPage />} /> {/* Nova Landing Page como rota raiz */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/payment" element={<PaymentPage />} /> {/* Rota para pagamento */}
                <Route path="/subscribe" element={<SubscriptionRequiredPage />} /> {/* Rota para assinatura necessária */}
                
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/app" element={<Index />} /> {/* Rota padrão após login agora aponta para Index */}
                    <Route path="/app/transactions" element={<TransactionsPage />} />
                    <Route path="/app/categories" element={<CategoryManagementPage />} />
                    <Route path="/app/budgets" element={<BudgetManagementPage />} />
                    <Route path="/app/goals" element={<GoalsPage />} />
                    <Route path="/app/debts" element={<DebtsPage />} />
                    <Route path="/app/subscriptions" element={<SubscriptionManagementPage />} />
                    {/* REMOVIDO: <Route path="/app/behavioral-analysis" element={<BehavioralAnalysisPage />} /> */}
                    <Route path="/app/monthly-review" element={<MonthlyReviewPage />} />
                    <Route path="/app/profile" element={<ProfilePage />} />
                    <Route path="/app/subscription-details" element={<SubscriptionDetailsPage />} /> {/* Nova rota */}
                  </Route>
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ThemeProvider>
          </TransactionProvider>
        </AuthProvider>
      </SessionProvider>
    </BrowserRouter>
  );
}

export default App;