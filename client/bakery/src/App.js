// src/App.js

import React from 'react';
import { Routes, Route } from 'react-router-dom'; // Удалите BrowserRouter
import Registration from './components/Registration';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import HomePage from './components/HomePage';
import MetizDetails from './components/MetizDetails';
import MetizAdmin from './components/MetizAdmin';
import MetizOrders from './components/MetizOrders';
import PrivateRoute from './components/PrivateRoute';
import MetizRoute from './components/MetizRoute';
import EditMetizInfo from './components/EditMetizInfo';
import ProductList from './components/ProductList';
import AddProduct from './components/AddProduct';
import EditProduct from './components/EditProduct';
import Cart from './components/Cart';
import Orders from './components/Orders';
import Profile from './components/Profile';
import { Container } from '@mui/material';
import NavigationBar from './components/NavigationBar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <NavigationBar />
      <Container maxWidth="lg" sx={{ paddingY: 4 }}>
        <Routes>
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/metiz/:id" element={<MetizDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/metiz-admin"
            element={
              <MetizRoute>
                <MetizAdmin />
              </MetizRoute>
            }
          />
          <Route
            path="/metiz-admin/edit"
            element={
              <MetizRoute>
                <EditMetizInfo />
              </MetizRoute>
            }
          />
          <Route
            path="/metiz-admin/products"
            element={
              <MetizRoute>
                <ProductList />
              </MetizRoute>
            }
          />
          <Route
            path="/metiz-admin/products/add"
            element={
              <MetizRoute>
                <AddProduct />
              </MetizRoute>
            }
          />
          <Route
            path="/metiz-admin/products/edit/:id"
            element={
              <MetizRoute>
                <EditProduct />
              </MetizRoute>
            }
          />
          <Route
            path="/metiz-admin/orders"
            element={
              <MetizRoute>
                <MetizOrders />
              </MetizRoute>
            }
          />
        </Routes>
      </Container>
      <ToastContainer />
    </>
  );
}

export default App;
