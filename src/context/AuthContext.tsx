"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase"; // Importar o cliente Supabase
import { useSession } from "./SessionContext"; // Importar o useSession

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, first_name: string, last_name: string) => Promise<boolean>; // Adicionando a função signup com nome e sobrenome
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
      if (session && (window.location.pathname === "/login" || window.location.pathname === "/signup")) {
        navigate("/app"); // Redireciona para /app se já logado e tentando acessar login/signup
      } else if (!session && window.location.pathname.startsWith("/app")) { // Se não logado e tentando acessar /app/*
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

  const signup = async (email: string, password: string, first_name: string, last_name: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name,
        },
      },
    });

    if (error) {
      toast.error("Erro ao cadastrar: " + error.message);
      console.error("Erro de cadastro:", error);
      return false;
    } else if (data.user) {
      // Se o Supabase estiver configurado para NÃO exigir confirmação de e-mail,
      // data.session estará presente e o usuário já estará logado.
      if (data.session) {
        toast.success("Cadastro realizado e login efetuado com sucesso!");
        return true; // Usuário já está logado
      } else {
        // Se data.session for null, a confirmação de e-mail provavelmente é necessária.
        // Para o fluxo de pagamento imediato, tentamos fazer login.
        // ATENÇÃO: Isso só funcionará se a confirmação de e-mail estiver desativada no Supabase.
        // Caso contrário, o login falhará para um usuário não confirmado.
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          toast.error("Cadastro realizado, mas não foi possível fazer login automaticamente. Por favor, verifique seu e-mail para confirmar a conta e faça login.");
          console.error("Erro de login automático após cadastro:", signInError);
          return false; // Usuário não está logado, precisa de confirmação de e-mail
        } else {
          toast.success("Cadastro realizado e login efetuado com sucesso!");
          return true; // Usuário agora está logado
        }
      }
    }
    return false; // Caso não haja erro, mas também não haja user (situação improvável)
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao fazer logout: " + error.message);
      console.error("Erro de logout:", error);
    } else {
      toast.info("Você foi desconectado.");
      navigate("/"); // Redireciona explicitamente para a Landing Page
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, signup, logout }}>
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