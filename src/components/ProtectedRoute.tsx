"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import { useTransactionContext } from "@/context/TransactionContext"; // Importar o contexto de transações

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  const { userProfile, loading: profileLoading } = useTransactionContext();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Carregando perfil...</p>
      </div>
    );
  }

  // Se o usuário não for premium, redireciona para a página de assinatura
  if (userProfile && !userProfile.is_premium) {
    return <Navigate to="/subscribe" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;