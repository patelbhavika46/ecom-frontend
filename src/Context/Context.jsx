import axios from "../axios";
import React, { useState, useEffect, createContext, useCallback } from "react";

// Define initial context shape for better autocomplete and safety
const AppContext = createContext({
  data: [],
  isError: "",
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  refreshData: () => {},
  updateStockQuantity: () => {},
});

export const AppProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [isError, setIsError] = useState("");
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart')) || [];
    } catch {
      return [];
    }
  });

  // Fetch products
  const refreshData = useCallback(async () => {
    try {
      const response = await axios.get("/products");
      setData(response.data);
      setIsError("");
    } catch (error) {
      setIsError(error.message || "Error fetching products.");
    }
  }, []);

  // Add product to cart
  const addToCart = useCallback((product) => {
    setCart((prevCart) => {
      const existingProductIndex = prevCart.findIndex((item) => item.id === product.id);
      let updatedCart;
      if (existingProductIndex !== -1) {
        updatedCart = prevCart.map((item, index) =>
          index === existingProductIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedCart = [...prevCart, { ...product, quantity: 1 }];
      }
      return updatedCart;
    });
  }, []);

  // Remove product from cart
  const removeFromCart = useCallback((productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  }, []);

  // Clear the cart
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Update stock quantity for a product in the data
  // This is a stub for demonstration; can be expanded as needed
  const updateStockQuantity = useCallback((productId, newQuantity) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.id === productId ? { ...item, stock: newQuantity } : item
      )
    );
  }, []);

  // On mount, fetch data
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Keep cart in sync with localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  return (
    <AppContext.Provider
      value={{
        data,
        isError,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        refreshData,
        updateStockQuantity,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;