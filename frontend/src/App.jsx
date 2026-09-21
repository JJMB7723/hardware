import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import EmployeesPage from './pages/EmployeesPage';
import StockPage from './pages/StockPage';
import ManufacturingPage from './pages/ManufacturingPage';
import AssemblyPage from './pages/AssemblyPage';
import DeliveriesPage from './pages/DeliveriesPage';
import ReturnsPage from './pages/ReturnsPage';
import InspectionsPage from './pages/InspectionsPage';
import TraceabilityPage from './pages/TraceabilityPage';
import AdminManagementPage from './pages/AdminManagementPage';
import SignInPage from './pages/SignInPage';
import SignUpNoticePage from './pages/SignUpNoticePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpNoticePage />} />
          <Route path="/login" element={<Navigate to="/signin" replace />} />

          {/* Protected Application Routes (Protected by ADMIN role authorization) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="stock" element={<StockPage />} />
            <Route path="manufacturing" element={<ManufacturingPage />} />
            <Route path="assembly" element={<AssemblyPage />} />
            <Route path="deliveries" element={<DeliveriesPage />} />
            <Route path="returns" element={<ReturnsPage />} />
            <Route path="inspections" element={<InspectionsPage />} />
            <Route path="traceability" element={<TraceabilityPage />} />
            <Route path="admin-management" element={<AdminManagementPage />} />
            <Route path="create-admin" element={<Navigate to="/admin-management" replace />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
