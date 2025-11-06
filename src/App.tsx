"use client";

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/ThemeProvider";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";

import Index from "@/pages/Index";
import TransactionsPage from "@/pages/TransactionsPage";
import CategoryManagementPage from "@/pages/CategoryManagementPage";
import BudgetManagementPage from "@/pages/BudgetManagementPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import NotFound from "@/pages/NotFound";

import { SessionProvider } from "@/context/SessionContext";
import { AuthProvider } from "@/context/AuthContext";
import { TransactionProvider } from "@/context/TransactionContext";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark"> {/* Alterado para dark e removido storageKey */}
        <Toaster richColors />
        <SessionProvider>
          <AuthProvider>
            <TransactionProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/transactions" element={<TransactionsPage />} />
                    <Route path="/categories" element={<CategoryManagementPage />} />
                    <Route path="/budgets" element={<BudgetManagementPage />} />
                  </Route>
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TransactionProvider>
          </AuthProvider>
        </SessionProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;