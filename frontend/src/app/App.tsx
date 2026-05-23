import { BrowserRouter, Route, Routes } from "react-router-dom";

import { QueryProvider } from "@/app/providers/query";
import { Footer } from "@/widgets/Footer";
import { Header } from "@/widgets/Header";
import { BrandsPage } from "@/pages/BrandsPage";
import { AdminPanelPage } from "@/pages/AdminPanelPage";
import { CartPage } from "@/pages/CartPage";
import { CatalogPage } from "@/pages/CatalogPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { FavoritesPage } from "@/pages/FavoritesPage";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { ProductPage } from "@/pages/ProductPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { PromotionsPage } from "@/pages/PromotionsPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ToastViewport } from "@/shared/ui/toast";

export function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/brands" element={<BrandsPage />} />
            <Route path="/promotions" element={<PromotionsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/admin-panel" element={<AdminPanelPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <ToastViewport />
      </BrowserRouter>
    </QueryProvider>
  );
}
