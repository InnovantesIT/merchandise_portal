"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "@/app/context/cartcontext";
import ProductCard from "@/app/components/productcard";
import Head from "next/head";
import { ToastContainer, ToastPosition, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "@/app/components/header";
import { motion, AnimatePresence } from "framer-motion";
import { RiFilterLine, RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";

interface Product {
  name: string;
  rate: number;
  image_name: string;
  quantity: number;
  category?: string;
  customer_id: number;
  item_id: string;
  group_name?: string; // Added group_name
}

const Products =() => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [height,setHeight] = useState(0)
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(baseURL+"/api/zoho/items");
        // Mapping group_name from API response to each product
        const productsWithGroup = response.data.items.map((item: any) => ({
          ...item,
          group_name: item.group_name,
        }));
        setProducts(productsWithGroup);
      } catch (error) {
        console.error("Error fetching products:", error);
        showToast("Failed to load products. Please try again later.", "error");
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (product: Product) => {
    try {
      console.log("Product to add:", {
        customer_id: product.customer_id,
        item_id: product.item_id,
        qty: 1,
        price_per_unit: product.rate,
        name: product.name,
      });

      const response = await axios.post(baseURL+"/api/cart", {
        customer_id: "1977850000000020000",
        item_id: product.item_id,
        qty: 1,
        price_per_unit: product.rate,
        name: product.name,
      });

      console.log(response);

      // Add to cart using the context's addToCart function
      addToCart({
        item_id: product.item_id,
        rate: product.rate,
        name: product.name,
        price: product.rate,
        image: product.image_name,
        quantity: 1,
        category: product.category,
      });

      // Show success toast
      showToast(`${product.name} added to cart.`, "success");
    } catch (error: any) {
      // Log the error for debugging
      console.error("Error adding to cart:", error.response ? error.response.data : error.message);
      showToast("Failed to add item to cart.", "error");
    }
  };

  const handleRemoveFromCart = (product: Product) => {
    if (product.quantity > 0) {
      const updatedProduct = { ...product, quantity: Math.max(product.quantity - 1, 0) };
      updateProductList(updatedProduct);
      showToast(`${product.name} removed from cart.`, "error");
    }
  };

  const updateProductList = (updatedProduct: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => (p.item_id === updatedProduct.item_id ? updatedProduct : p))
    );
  };
  

  const showToast = (message: string, type: "success" | "error") => {
    const position: ToastPosition =  "top-right"; // Explicitly casting to ToastPosition
    const options = {
      position,
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    };
  
    if (type === "success") {
      toast.success(message, options);
    } else {
      toast.error(message, options);
    }
  };
  const handleFilterChange = (groupName: string | null) => {
    setFilter(groupName === "All" ? null : groupName);
  };
  
  // Get unique group names from products for dynamic filter options
  const uniqueGroupNames = Array.from(
    new Set(products.map((product) => product.group_name ?? "").filter(Boolean))
  );
  
  const filteredProducts = products
    .filter((product) => !filter || (product.group_name ?? "") === filter)
    .sort((a, b) => (a.group_name ?? "").localeCompare(b.group_name ?? ""));
  
  const cartItemCount = products.reduce((acc, product) => acc + product.quantity, 0);
  
  const pageTitle = filter ? `Products - ${filter}` : "Browse Our Products";
  
  useEffect(() => {
     setHeight(window.innerHeight);
    document.title = pageTitle;
  }, [pageTitle]);
  
  

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <meta
          name="description"
          content={`Browse and order products from ${filter ? filter : "various categories"}.`}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="max-w-9xl mx-auto">
        <Header cartItemCount={cartItemCount} />
        <ToastContainer />
        <div className="px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-black mt-9 text-xl font-sans font-semibold flex items-center gap-3"
          >
            <img src="/icons/hi.svg" className="w-6 h-6" alt="Hi Icon" />
            Hi Kailash! Order now!
          </motion.div>
          <div className="flex flex-col md:flex-row mt-8 gap-8">
            <div className="md:w-1/4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white p-6 rounded-lg"
              >
                <div
                  className="flex items-center justify-between cursor-pointer md:cursor-default"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <div className="flex items-center gap-1">
                    <RiFilterLine className="w-5 h-6 mb-1" />
                    <span className="text-xl font-semibold text-pretty font-sans">Filter</span>
                  </div>
                  <div className="md:hidden">
                    {isFilterOpen ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
                  </div>
                </div>
                <AnimatePresence>
                  {(isFilterOpen || height >= 768) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2 font-sans mt-4"
                    >
                      {["All", ...uniqueGroupNames].map((groupName) => (
                        <motion.label
                          key={groupName}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="group_name"
                            value={groupName}
                            checked={filter === (groupName === "All" ? null : groupName)}
                            onChange={() =>
                              handleFilterChange(groupName === "All" ? null : groupName)
                            }
                            className="form-radio text-indigo-600"
                          />
                          <span className="text-gray-700 capitalize">{groupName}</span>
                        </motion.label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            <div className="md:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={() => handleAddToCart(product)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Products;
