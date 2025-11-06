import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TransactionsPage from "./pages/TransactionsPage";
import CategoryManagementPage from "./pages/CategoryManagementPage";
import BudgetManagementPage from "./pages/BudgetManagementPage";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import { ThemeProvider } from "./components/ThemeProvider";
import { TransactionProvider } from "./context/TransactionContext";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { SessionProvider } from "./context/SessionContext"; // Import SessionProvider

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme" attribute="class" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SessionProvider> {/* Wrap with SessionProvider */}
            <AuthProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Index />} />
                    <Route path="transactions" element={<TransactionsPage />} />
                    <Route path="categories" element={<CategoryManagementPage />} />
                    <Route path="budgets" element={<BudgetManagementPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Route>
              </Routes>
            </AuthProvider>
          </SessionProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;