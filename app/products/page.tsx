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
  group_name?: string;
}

const Products = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    // Function to determine if the screen is mobile
    const handleResize = () => {
      const isCurrentlyMobile = window.innerWidth <= 768;
      setIsMobile(isCurrentlyMobile);
      // Close filter initially if on mobile
      if (isCurrentlyMobile) {
        setIsFilterOpen(false);
      }
    };
    // Add event listener on component mount
    handleResize(); // Check on initial load
    window.addEventListener("resize", handleResize);

    // Clean up event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(baseURL + "/api/zoho/items");
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
  }, [baseURL]);

  const handleAddToCart = async (product: Product) => {
    try {
      await axios.post(baseURL + "/api/cart", {
        customer_id: "1977850000000020000",
        item_id: product.item_id,
        qty: 1,
        price_per_unit: product.rate,
        name: product.name,
      });

      addToCart({
        item_id: product.item_id,
        rate: product.rate,
        name: product.name,
        price: product.rate,
        image: product.image_name,
        quantity: 1,
        category: product.category,
      });

      showToast(`${product.name} added to cart.`, "success");
    } catch (error: any) {
      console.error(
        "Error adding to cart:",
        error.response ? error.response.data : error.message
      );
      showToast("Failed to add item to cart.", "error");
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    const position: ToastPosition = "top-right";
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

  const handleFilterChange = (groupName: string) => {
    setSelectedFilters((prevFilters) => {
      const newFilters = new Set(prevFilters);
      if (groupName === "All") {
        newFilters.clear();
      } else {
        if (newFilters.has(groupName)) {
          newFilters.delete(groupName);
        } else {
          newFilters.add(groupName);
        }
      }
      return newFilters;
    });
  };

  const uniqueGroupNames = Array.from(
    new Set(products.map((product) => product.group_name ?? "").filter(Boolean))
  );

  const filteredProducts = products
    .filter(
      (product) =>
        selectedFilters.size === 0 ||
        selectedFilters.has(product.group_name ?? "")
    )
    .sort((a, b) => (a.group_name ?? "").localeCompare(b.group_name ?? ""));

  const cartItemCount = products.reduce(
    (acc, product) => acc + product.quantity,
    0
  );

  const pageTitle = selectedFilters.size
    ? `Products - ${Array.from(selectedFilters).join(", ")}`
    : "Browse Our Products";

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <meta
          name="description"
          content={`Browse and order products from ${
            selectedFilters.size ? Array.from(selectedFilters).join(", ") : "various categories"
          }.`}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="max-w-9xl mx-auto">
        <Header cartItemCount={cartItemCount} />
        <ToastContainer />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-screen relative my-8 px-4 sm:px-8"
        >
          <motion.img
            src={isMobile ? "/img/MobBanner.jpg" : "/img/Banner.jpg"}
            alt="Welcome Banner"
            className="w-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          <div
            className="absolute inset-0 bg-gradient-to-r from-[#4C4D3ACC] to-[#313131CC] mx-4 sm:mx-8"
            style={{ clipPath: 'inset(0 0 0 0)', zIndex: 1 }}
          ></div>

          <div className="absolute inset-0 flex items-center ml-10 sm:ml-20 z-10">
          <motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="text-white text-lg font-thin font-sans  sm:text-2xl sm:px-6 md:px-8 lg:text-3xl lg:px-10 px-4"
>
  Hi Dealer. Welcome to Renault.
  <br className="sm:hidden" />
  Order merchandise now!
</motion.div>

          </div>
        </motion.div>

        <div className="px-4 sm:px-10">
          <div className="flex flex-col md:flex-row mt-4 sm:gap-6 gap-4">
            <div className="md:w-1/6 w-full md:h-full flex-shrink-0 mb-4 md:mb-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-[#F4F6F7CC] p-4 sm:p-6 shadow-md h-auto md:h-screen flex flex-col justify-between"
              >
                <motion.div
                  className="flex items-center justify-between cursor-pointer md:cursor-auto"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-lg text-pretty font-sans sm:mb-8 tracking-wider">FILTERS</span>
                  </div>
                  <div className="sm:hidden md:hidden">
                    {isFilterOpen ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
                  </div>
                </motion.div>
                <AnimatePresence>
                  {isFilterOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 font-sans mt-4 md:mt-0 flex-grow overflow-y-auto"
                    >
                      <motion.label
                        key="All"
                        className="flex items-center space-x-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          name="group_name"
                          value="All"
                          checked={selectedFilters.size === 0}
                          onChange={() => handleFilterChange("All")}
                          className="form-checkbox w-5 h-5 accent-[#EFDF00]"
                        />
                        <span className="text-gray-700 capitalize">All</span>
                      </motion.label>
                      {uniqueGroupNames.map((groupName) => (
                        <motion.label
                          key={groupName}
                          className="flex items-center space-x-3 cursor-pointer"
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: -10, opacity: 0 }}
                          transition={{ duration: 0.2, delay: 0.1 }}
                        >
                          <input
                            type="checkbox"
                            name="group_name"
                            value={groupName}
                            checked={selectedFilters.has(groupName)}
                            onChange={() => handleFilterChange(groupName)}
                            className="form-checkbox w-5 h-5 accent-[#EFDF00]"
                          />
                          <span className="text-gray-700 capitalize">{groupName}</span>
                        </motion.label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
            <div className="md:w-5/6 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
        </div>
      </main>
    </div>
  );
};

export default Products;
