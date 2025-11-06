import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index"; // This is now the Dashboard
import TransactionsPage from "./pages/TransactionsPage"; // New transactions page
import CategoryManagementPage from "./pages/CategoryManagementPage"; // New category management page
import BudgetManagementPage from "./pages/BudgetManagementPage"; // New budget management page
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout"; // New layout component
import { ThemeProvider } from "./components/ThemeProvider"; // Import ThemeProvider
import { TransactionProvider } from "./context/TransactionContext"; // Import TransactionProvider
import { AuthProvider } from "./context/AuthContext"; // Import AuthProvider
import LoginPage from "./pages/LoginPage"; // Import LoginPage
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme" attribute="class" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider> {/* Wrap the entire app with AuthProvider */}
            <TransactionProvider> {/* Wrap with TransactionProvider */}
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}> {/* Protect these routes */}
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Index />} /> {/* Dashboard */}
                    <Route path="transactions" element={<TransactionsPage />} /> {/* Transactions */}
                    <Route path="categories" element={<CategoryManagementPage />} /> {/* Category Management */}
                    <Route path="budgets" element={<BudgetManagementPage />} /> {/* Budget Management */}
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Route>
              </Routes>
            </TransactionProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;