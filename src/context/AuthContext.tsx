"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase"; // Importar o cliente Supabase
import { useSession } from "./SessionContext"; // Importar o useSession

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { session, loading } = useSession(); // Usar o session do SessionContext
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      setIsAuthenticated(!!session);
      if (session && window.location.pathname === "/login") {
        navigate("/");
      } else if (!session && window.location.pathname !== "/login") {
        navigate("/login");
      }
    }
  }, [session, loading, navigate]);

  const login = async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Erro ao fazer login: " + error.message);
      console.error("Erro de login:", error);
      return false;
    } else {
      toast.success("Login realizado com sucesso!");
      // O useEffect acima cuidará da navegação após a sessão ser atualizada
      return true;
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao fazer logout: " + error.message);
      console.error("Erro de logout:", error);
    } else {
      toast.info("Você foi desconectado.");
      // O useEffect acima cuidará da navegação após a sessão ser atualizada
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};