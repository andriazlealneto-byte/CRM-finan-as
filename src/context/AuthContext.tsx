"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const VALID_EMAIL = "andriazlealneto@gmail.com";
const VALID_PASSWORD = "and183009";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage<boolean>("isAuthenticated", false);
  const navigate = useNavigate();

  const login = (email: string, password: string): boolean => {
    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      setIsAuthenticated(true);
      toast.success("Login realizado com sucesso!");
      navigate("/"); // Redireciona para a página inicial após o login
      return true;
    } else {
      toast.error("Email ou senha inválidos.");
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    toast.info("Você foi desconectado.");
    navigate("/login"); // Redireciona para a página de login após o logout
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