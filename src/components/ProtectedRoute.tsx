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

  // Se o perfil ainda estiver carregando ou for nulo, mostre um indicador de carregamento
  if (profileLoading || userProfile === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Carregando perfil...</p>
      </div>
    );
  }

  // Agora que userProfile é garantido como não nulo, podemos verificar is_premium
  if (!userProfile.is_premium) {
    return <Navigate to="/subscribe" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;