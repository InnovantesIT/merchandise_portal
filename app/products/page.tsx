"use client"
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import ProductCard from "@/app/components/productcard";
import Head from "next/head";
import { ToastContainer, ToastPosition, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "@/app/components/header";
import { motion } from "framer-motion";
import { RiCloseLine } from "react-icons/ri";
import { SlidersHorizontal, Search, X } from 'lucide-react';
import { UserContext } from "@/app/context/usercontext";
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/app/components/footer';
import { decrypt } from '@/app/action/enc';
import Loader from '@/app/components/loader'

interface Product {
  name: string;
  item_name: string;
  group_name: string;
  rate: number;
  image_name: string;
  image_path: string;
  quantity: number;
  category?: string;
  customer_id: number;
  item_id: string;
  group_id: string;
  moq: number; // Minimum Order Quantity
  description?: string; // Add description field
  additional_images?: string[]; // Add additional images field
}


interface ProductGroup {
  group_name: string;
  brand: string;
}

const Products = () => {
  const userContext = useContext(UserContext);
  const [products, setProducts] = useState<Product[]>([]);
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
  const [tempSelectedFilters, setTempSelectedFilters] = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  const router = useRouter();
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [firstName, setFirstName] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
    hasNextPage: false,
    hasPrevPage: false
  });


  const retrieveToken = () => {
    if (typeof window !== 'undefined') {
      const encryptedToken = localStorage.getItem('token');
      if (encryptedToken) {
        return decrypt(encryptedToken);
      }
    }
    return null;
  };

  useEffect(() => {
    const token = retrieveToken();
    if (!token) {
      router.push('/');
      return;
    }

    const storedFirstName = localStorage.getItem('first_name');
    if (storedFirstName) {
      setFirstName(storedFirstName);
    }

    const storedCustomerId = localStorage.getItem('customer_id');
    if (storedCustomerId) {
      setCustomerId(storedCustomerId);
    }
  }, [router]);

  useEffect(() => {
    const handleResize = () => {
      const isCurrentlyMobile = window.innerWidth <= 1024;
      setIsMobile(isCurrentlyMobile);
      if (isCurrentlyMobile) {
        setIsFilterOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchProducts = async (page: number = 1, search: string = '', filters: Set<string> = selectedFilters) => {
    setIsLoading(true);

    try {
      const token = retrieveToken();
      if (!token) throw new Error("Token is missing");

      // Build query parameters
      const params = new URLSearchParams({
        brand: 'Renault',
        page: page.toString(),
      });

      if (search && search.length >= 3) {
        params.append('search', search);
      }

      if (filters.size > 0) {
        const groupNames = Array.from(filters).join(',');
        params.append('group_name', groupNames);
      }

      const response = await axios.get(`${baseURL}/api/items-paginated?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          brand: 'Renault',
        },
      });

      if (response.data.items && response.data.pagination) {
        const productsData = response.data.items;
        const paginationData = response.data.pagination;

        const productsWithmoq = productsData.map((product: Product) => ({
          ...product,
          moq: product.moq
        }));

        setProducts(productsWithmoq);
        setPagination(paginationData);
        setCurrentPage(paginationData.currentPage);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('customer_id');
        localStorage.removeItem('first_name');
        localStorage.removeItem('username');

        router.push('/');
      }

      console.error("Error fetching products:", error);
      showToast("Failed to load products. Please try again later.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1, searchTerm, selectedFilters);
  }, [baseURL, router]);

  useEffect(() => {
    const fetchProductGroups = async () => {
      try {
        const token = retrieveToken();
        if (!token) throw new Error("Token is missing");

        const response = await axios.get(`${baseURL}/api/product-categories`, {
          headers: {
            Authorization: `Bearer ${token}`,
            brand: 'Renault',
          },
        });

        if (Array.isArray(response.data)) {
          setProductGroups(response.data);
        } else {
          throw new Error("Unexpected response format for product categories");
        }
      } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          // Clear user-related storage and redirect
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('customer_id');
          localStorage.removeItem('first_name');
          localStorage.removeItem('username');

          router.push('/');
        }
        console.error("Error fetching product groups:", error);
        showToast("Failed to load product categories. Please try again later.", "error");
      }
    };

    fetchProductGroups();
  }, [baseURL, router]);

  const handleAddToCart = async (product: Product) => {
    if (!customerId) {
      showToast("Customer ID not found. Please log in again.", "error");
      return;
    }

    try {
      const token = retrieveToken();
      if (!token) throw new Error("Token is missing");

      // Use moq value (default to 100 if not set)
      const quantityToAdd = product.moq;

      await axios.post(`${baseURL}/api/add-cart`, {
        item_id: product.item_id,
        quantity: quantityToAdd,

      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          brand: 'renault',
        },
      });

      setCartItems((prevItems) => {
        const itemExists = prevItems.find(
          (item) => item.item_id === product.item_id
        );

        if (itemExists) {
          return prevItems.map((item) =>
            item.item_id === product.item_id
              ? { ...item, quantity: item.quantity + quantityToAdd }
              : item
          );
        } else {
          return [...prevItems, { ...product, quantity: quantityToAdd }];
        }
      });

      showToast(`${product.item_name} added to cart (${quantityToAdd} units).`, "success");
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Clear user-related storage and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('customer_id');
        localStorage.removeItem('first_name');
        localStorage.removeItem('username');

        router.push('/');
      }
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

  const handleFilterChange = (groupId: string) => {
    if (isMobile) {
      setTempSelectedFilters((prevFilters) => {
        const newFilters = new Set(prevFilters);
        if (groupId === "All") {
          newFilters.clear();
        } else {
          if (newFilters.has(groupId)) {
            newFilters.delete(groupId);
          } else {
            newFilters.add(groupId);
          }
        }
        return newFilters;
      });
    } else {
      setSelectedFilters((prevFilters) => {
        const newFilters = new Set(prevFilters);
        if (groupId === "All") {
          newFilters.clear();
        } else {
          if (newFilters.has(groupId)) {
            newFilters.delete(groupId);
          } else {
            newFilters.add(groupId);
          }
        }
        // Fetch products from page 1 when filters change (non-mobile)
        fetchProducts(1, searchTerm, newFilters);
        return newFilters;
      });
    }
  };

  const applyFilters = () => {
    const newFilters = new Set(tempSelectedFilters);
    setSelectedFilters(newFilters);
    // Fetch products from page 1 when filters are applied (mobile)
    fetchProducts(1, searchTerm, newFilters);
    toggleFilterDrawer();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Debounce search - fetch products after user stops typing
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      fetchProducts(1, value, selectedFilters);
    }, 500);

    setSearchTimeout(timeout);
  };

  const clearSearch = () => {
    setSearchTerm('');
    fetchProducts(1, '', selectedFilters);
  };

  // Add search timeout state
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Products are now filtered server-side, so we can use them directly
  const filteredProducts = products;

  const pageTitle = selectedFilters.size
    ? `Products - ${Array.from(selectedFilters).map(groupId =>
      productGroups.find(group => group.group_name === groupId)?.group_name
    ).filter(Boolean).join(", ")}`
    : "Browse Our Products";

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  const toggleFilterDrawer = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const FilterDrawer = ({ isFilterOpen, toggleFilterDrawer, productGroups, tempSelectedFilters, handleFilterChange, applyFilters }: any) => {
    const [isClosing, setIsClosing] = useState(false);

    const handleCloseDrawer = () => {
      setIsClosing(true);
      setTimeout(() => {
        setIsClosing(false);
        toggleFilterDrawer();
      }, 300);
    };

    const handleApplyFilters = (e: any) => {
      e.stopPropagation();
      applyFilters();
      handleCloseDrawer();
    };

    const handleOutsideClick = (e: any) => {
      if (e.target.classList.contains('drawer-background')) {
        handleCloseDrawer();
      }
    };

    return (
      isFilterOpen && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-30 z-[10000] transition-opacity duration-500 ease-out ${isClosing ? 'opacity-0' : 'opacity-100'} drawer-background`}
          onClick={handleOutsideClick}
        >
          <div
            className={`fixed inset-y-0 right-0 w-64 bg-white shadow-lg z-[10000] overflow-y-auto transform transition-transform duration-500 ease-out ${isClosing ? 'translate-x-full' : 'translate-x-0'
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
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempSelectedFilters.size === 0}
                    onChange={() => handleFilterChange('All')}
                    className="form-checkbox w-5 h-5 accent-[#EFDF00]"
                  />
                  <span className="text-gray-700">All</span>
                </label>
                {productGroups.map((group: ProductGroup) => (
                  <label
                    key={group.group_name}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={tempSelectedFilters.has(group.group_name)}
                      onChange={() => handleFilterChange(group.group_name)}
                      className="form-checkbox w-5 h-5 accent-[#EFDF00]"
                    />
                    <span className="text-gray-700 capitalize">{group.group_name}</span>
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

  const paginate = (pageNumber: number) => {
    if (pageNumber !== currentPage) {
      fetchProducts(pageNumber, searchTerm, selectedFilters);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Generate page numbers for pagination display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const totalPages = pagination.totalPages;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const currentPage = pagination.currentPage;
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <meta
          name="description"
          content={`Browse and order products from ${selectedFilters.size ? Array.from(selectedFilters).map(groupId =>
            productGroups.find(group => group.group_name === groupId)?.group_name
          ).filter(Boolean).join(", ") : "various categories"
            }.`}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="max-w-9xl mx-auto">
        <Header cartItemCount={cartItems.length} />
        <ToastContainer />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-screen relative my-8 px-4 sm:px-8 md:block hidden"
        >
          <motion.img
            src={"img/Banner.png"}
            alt="Welcome Banner"
            className="w-full object-cover h-20 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          <div
            className="absolute inset-0 bg-gradient-to-r to-[#414141] from-[#3c3c3c]   mx-4 sm:mx-8 rounded-lg"
            style={{ clipPath: 'inset(0 0 0 0)', zIndex: 1 }}
          ></div>

          <div className="absolute inset-0 flex items-center ml-10  z-10 rounded-lg">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-white text-lg font-sans sm:text-xl sm:px-6 md:px-8 lg:text-2xl lg:px-10 px-4  tracking-wider font-normal"
            >
              Hi {firstName || "Guest"}. Welcome Back!
            </motion.div>
          </div>
        </motion.div>

        <div className="px-4 md:px-6 lg:px-10">
          {/* Search Bar */}
          <div className=""></div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 sm:justify-end justify-start flex"
          >
            <div className="relative max-w-md mx-auto lg:mx-0">
              <div className="relative sm:my-0 my-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-10 py-3 my-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white shadow-sm"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              {searchTerm && searchTerm.length >= 3 && (
                <div className="mt-2 text-sm text-gray-600">
                  {pagination.totalItems} product{pagination.totalItems !== 1 ? 's' : ''} found for &ldquo;{searchTerm}&rdquo;
                </div>
              )}
              {searchTerm && searchTerm.length > 0 && searchTerm.length < 3 && (
                <div className="mt-2 text-sm text-gray-500">
                  Type at least 3 characters to search
                </div>
              )}
            </div>
          </motion.div>

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
                  productGroups={productGroups}
                  tempSelectedFilters={tempSelectedFilters}
                  handleFilterChange={handleFilterChange}
                  applyFilters={applyFilters}
                />

              </>
            ) : (
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
                        checked={selectedFilters.size === 0}
                        onChange={() => handleFilterChange("All")}
                        className="form-checkbox w-5 h-5 accent-[#EFDF00]"
                      />
                      <span className="text-gray-700 capitalize">All</span>
                    </motion.label>
                    {productGroups.map((group) => (
                      <motion.label
                        key={group.group_name}
                        className="flex items-center space-x-3 cursor-pointer"
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFilters.has(group.group_name)}
                          onChange={() => handleFilterChange(group.group_name)}
                          className="form-checkbox w-5 h-5 accent-[#EFDF00]"
                        />
                        <span className="text-gray-700 capitalize">{group.group_name}</span>
                      </motion.label>
                    ))}
                  </motion.div>
                </motion.div>
              </div>
            )}
            <div className="lg:w-5/6 w-full lg:mx-0">
              <div className="text-black text-lg font-sans m-1 mb-2 mx-auto lg:hidden flex gap-24">
                Hi {firstName || "Guest"}. Welcome Back!
                <Link href="/cart">
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

              {/* No results message */}
              {!isLoading && filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg mb-4">
                    {searchTerm.length >= 3
                      ? `No products found for "${searchTerm}"`
                      : 'No products available'
                    }
                  </div>
                  {searchTerm.length >= 3 && (
                    <button
                      onClick={clearSearch}
                      className="text-[#EFDF00] hover:underline"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full mx-auto">
                    <Loader />
                  </div>
                ) : (
                  filteredProducts.map((product: Product, index: number) => (
                    <motion.div
                      key={product.item_id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <ProductCard
                        product={product}
                        onAddToCart={() => handleAddToCart(product)}
                        auth={""}
                      />
                    </motion.div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {!isLoading && pagination.totalPages > 1 && (
                <div className="flex flex-col items-center space-y-4 my-8">
                  {/* Pagination info */}


                  {/* Pagination controls */}
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      onClick={() => paginate(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {getPageNumbers().map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-4 py-2 rounded-md border text-sm font-medium ${pagination.currentPage === number
                          ? 'bg-black text-white border-black'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        {number}
                      </button>
                    ))}

                    <button
                      onClick={() => paginate(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
      {!isLoading && (

        <Footer />
      )}
    </div>
  );

};

export default Products;