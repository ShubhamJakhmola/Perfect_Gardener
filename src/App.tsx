import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import GardenTools from "./pages/GardenTools";
import Products from "./pages/Products";
import Posts from "./pages/Posts";
import Contact from "./pages/Contact";
import PotCalculator from "./pages/tools/PotCalculator";
import BloomCalculator from "./pages/tools/BloomCalculator";
import BudgetPlanner from "./pages/tools/BudgetPlanner";
import FlowerCalendar from "./pages/tools/FlowerCalendar";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import BlogPost from "./pages/BlogPost";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Privacy from "./pages/Privacy";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/tools" element={<GardenTools />} />
            <Route path="/tools/pot-calculator" element={<PotCalculator />} />
            <Route path="/tools/bloom-calculator" element={<BloomCalculator />} />
            <Route path="/tools/budget-planner" element={<BudgetPlanner />} />
            <Route path="/tools/flower-calendar" element={<FlowerCalendar />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Admin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
