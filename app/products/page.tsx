"use client"
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useCart } from "@/app/context/cartcontext";
import ProductCard from "@/app/components/productcard";
import Head from "next/head";
import { ToastContainer, ToastPosition, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "@/app/components/header";
import { motion } from "framer-motion";
import { RiCloseLine } from "react-icons/ri";
import { SlidersHorizontal } from 'lucide-react';
import { UserContext } from "@/app/context/usercontext"; 
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import Link  from 'next/link';
import Footer from '@/app/components/footer'

interface Product {
  name: string;
  rate: number;
  image_name: string;
  image_path: string;
  quantity: number;
  category?: string;
  customer_id: number;
  item_id: string;
  group_name?: string;
}

const Products = () => {
  const userContext = useContext(UserContext);
  const user = userContext?.user;
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
  const [tempSelectedFilters, setTempSelectedFilters] = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);  
  const [isMobile, setIsMobile] = useState(false);
  const [userName, setUserName] = useState('');
  const [customerId, setCustomerId] = useState<string | null>(null);
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  const router = useRouter(); 
  const [cartItems, setCartItems] = useState<Product[]>([]);

  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    const storedName = localStorage.getItem('name');
    if (storedName) {
      setUserName(storedName);
    }

    const storedCustomerId = localStorage.getItem('customer_id');
    if (storedCustomerId) {
      setCustomerId(storedCustomerId);
    }
  }, [router]);

  useEffect(() => {
    const handleResize = () => {
      const isCurrentlyMobile = window.innerWidth <= 1024; // Adjust to include tablet
      setIsMobile(isCurrentlyMobile);
      if (isCurrentlyMobile) {
        setIsFilterOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(baseURL + "/api/zoho/items");
        setAuthToken(response.data.auth);
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
    if (!customerId) {
      showToast("Customer ID not found. Please log in again.", "error");
      return;
    }
  
    try {
      await axios.post(baseURL + "/api/cart", {
        customer_id: customerId,
        item_id: product.item_id,
        qty: 1,
        price_per_unit: product.rate,
        name: product.name,
      });
  
      // Update cart items state
      setCartItems((prevItems) => {
        const itemExists = prevItems.find(
          (item) => item.item_id === product.item_id
        );
  
        if (itemExists) {
          // Update the quantity if the item already exists in the cart
          return prevItems.map((item) =>
            item.item_id === product.item_id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          // Add new item to the cart
          return [...prevItems, { ...product, quantity: 1 }];
        }
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
    if (isMobile) {
      // Use temporary filters for mobile
      setTempSelectedFilters((prevFilters) => {
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
    } else {
      // Apply filters immediately for desktop
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
    }
  };

  const applyFilters = () => {
    // Apply the temporary filters to main filter state in mobile mode
    setSelectedFilters(new Set(tempSelectedFilters));
    toggleFilterDrawer();  // Close the drawer after applying filters
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

    const { addToCart, cartItemCount } = useCart(); // Destructure cartItemCount from context

   

  const pageTitle = selectedFilters.size
    ? `Products - ${Array.from(selectedFilters).join(", ")}`
    : "Browse Our Products";

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  const toggleFilterDrawer = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const FilterDrawer = ({ isFilterOpen, toggleFilterDrawer, uniqueGroupNames, tempSelectedFilters, handleFilterChange, applyFilters }: any) => {
    const [isClosing, setIsClosing] = useState(false);
  
    // Handle smooth closing
    const handleCloseDrawer = () => {
      setIsClosing(true);
      setTimeout(() => {
        setIsClosing(false);
        toggleFilterDrawer();
      }, 300); // Match the duration of your CSS transition
    };
  
    // Close drawer on filter apply smoothly
    const handleApplyFilters = (e: any) => {
      e.stopPropagation();
      applyFilters();
      handleCloseDrawer();
    };
  
    // Close the drawer when clicking outside
    const handleOutsideClick = (e: any) => {
      if (e.target.classList.contains('drawer-background')) {
        handleCloseDrawer();
      }
    };
  
    return (
      isFilterOpen && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-30 z-50 transition-opacity duration-500 ease-out ${isClosing ? 'opacity-0' : 'opacity-100'} drawer-background`}
          onClick={handleOutsideClick}
        >
          <div
            className={`fixed inset-y-0 right-0 w-64 bg-white shadow-lg z-50 overflow-y-auto transform transition-transform duration-500 ease-out ${
              isClosing ? 'translate-x-full' : 'translate-x-0'
            }`}
            onClick={(e) => e.stopPropagation()} 
          >
            <div className="p-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Filters</h2>
                <button onClick={handleCloseDrawer} className="text-gray-500">
                  <RiCloseLine size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <label
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={tempSelectedFilters.size === 0}
                    onChange={() => handleFilterChange('All')}
                    className="form-checkbox w-5 h-5 accent-[#EFDF00]"
                  />
                  <span className="text-gray-700">All</span>
                </label>
                {uniqueGroupNames.map((groupName: any) => (
                  <label
                    key={groupName}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={tempSelectedFilters.has(groupName)}
                      onChange={() => handleFilterChange(groupName)}
                      className="form-checkbox w-5 h-5 accent-[#EFDF00]"
                    />
                    <span className="text-gray-700 capitalize">{groupName}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={handleApplyFilters}
                className="mt-7 w-full py-2 bg-black text-white font-semibold rounded-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )
    );
  }

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
      <Header cartItemCount={cartItems.reduce((total, item) => total + item.quantity, 0)} />


        <ToastContainer />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-screen relative my-8 px-4 sm:px-8 md:block hidden"
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
              className="text-white text-lg font-sans sm:text-2xl sm:px-6 md:px-8 lg:text-3xl lg:px-10 px-4 font-bold"
            >
              Hi {userName || "Guest"}. Welcome Back!
            </motion.div>
          </div>
        </motion.div>

        <div className="px-4 md:px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row md:flex-row mt-4 sm:gap-6 gap-4 ">
            {isMobile ? (
              <>
                <button
                  onClick={toggleFilterDrawer}
                  className="fixed bottom-4 left-4 z-40 bg-[#EFDF00] text-black p-3 rounded-full shadow-lg"
                >
                  <SlidersHorizontal size={20} strokeWidth={1.25} />
                </button>
                <FilterDrawer 
                  isFilterOpen={isFilterOpen} 
                  toggleFilterDrawer={toggleFilterDrawer} 
                  uniqueGroupNames={uniqueGroupNames} 
                  tempSelectedFilters={tempSelectedFilters} 
                  handleFilterChange={handleFilterChange} 
                  applyFilters={applyFilters} 
                />
              </>
            ) : (
              // Always open filters on desktop without toggle state
              <div className="lg:w-1/6 w-full lg:h-full flex-shrink-0 mb-4 lg:mb-0">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-[#F4F6F7CC] p-4 sm:p-6 shadow-md h-auto lg:h-screen flex flex-col justify-between"
                >
                 <div className="font-sans tracking-widest mb-3 font-2xl">
                  FILTERS
                  </div>

                  <motion.div
                    className="space-y-4 font-sans mt-4 lg:mt-0 flex-grow overflow-y-auto"
                  >
                    <motion.label className="flex items-center space-x-3 cursor-pointer">
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
                </motion.div>
              </div>
            )}
            <div className="lg:w-5/6 w-full lg:mx-0">
            <div className="text-black text-lg font-sans m-1 mb-2 mx-auto lg:hidden flex gap-24">
              Hi {userName || "Guest"}. Welcome Back!
              <Link href = "/cart" >
              <div className="relative">
            <ShoppingCart strokeWidth={1.25} className="relative z-10" />
            {cartItems.length > 0 && (
              <span className="absolute -top-4 -right-1.5 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 flex items-center justify-center">
                {cartItems.reduce((total, item) => total + item.quantity, 0)}
              </span>
            )}
          </div>
          </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 ">
                {filteredProducts.map((product: Product, index: number) => (
                  <motion.div
                    key={product.item_id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ProductCard
                      product={product}
                      auth={authToken}
                      onAddToCart={() => handleAddToCart(product)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
