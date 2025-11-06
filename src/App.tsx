"use client";

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import ThemeManager from "@/components/ThemeManager"; // Importar ThemeManager

import Index from "@/pages/Index";
import TransactionsPage from "@/pages/TransactionsPage";
import CategoryManagementPage from "@/pages/CategoryManagementPage";
import BudgetManagementPage from "@/pages/BudgetManagementPage";
import GoalsPage from "@/pages/GoalsPage";
import FinancialEducationPage from "@/pages/FinancialEducationPage";
import DebtsPage from "@/pages/DebtsPage";
import ProfilePage from "@/pages/ProfilePage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import NotFound from "@/pages/NotFound";

import { SessionProvider } from "@/context/SessionContext";
import { AuthProvider } from "@/context/AuthContext";
import { TransactionProvider } from "@/context/TransactionContext";

function App() {
  return (
    <BrowserRouter>
      <Toaster richColors />
      <SessionProvider>
        <AuthProvider>
          <TransactionProvider>
            <ThemeManager> {/* Envolver o aplicativo com ThemeManager */}
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/transactions" element={<TransactionsPage />} />
                    <Route path="/categories" element={<CategoryManagementPage />} />
                    <Route path="/budgets" element={<BudgetManagementPage />} />
                    <Route path="/goals" element={<GoalsPage />} />
                    <Route path="/education" element={<FinancialEducationPage />} />
                    <Route path="/debts" element={<DebtsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                  </Route>
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ThemeManager>
          </TransactionProvider>
        </AuthProvider>
      </SessionProvider>
    </BrowserRouter>
  );
}

export default App;