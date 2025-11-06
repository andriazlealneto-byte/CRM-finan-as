import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index"; // This is now the Dashboard
import TransactionsPage from "./pages/TransactionsPage"; // New transactions page
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout"; // New layout component
import { ThemeProvider } from "./components/ThemeProvider"; // Import ThemeProvider
import { TransactionProvider } from "./context/TransactionContext"; // Import TransactionProvider

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme" attribute="class" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <TransactionProvider> {/* Wrap with TransactionProvider */}
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} /> {/* Dashboard */}
                <Route path="transactions" element={<TransactionsPage />} /> {/* Transactions */}
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </TransactionProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;