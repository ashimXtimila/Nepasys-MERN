import { useState, useEffect, useRef, useCallback } from "react";
import { products as allProducts } from "@/data/products";
import { Product, CartItem } from "@/types/product";
import { Header } from "@/components/Header";
import { SearchAndFilter } from "@/components/SearchAndFilter";
import { ProductCard } from "@/components/ProductCard";
import { ProductSkeleton } from "@/components/ProductSkeleton";
import { CartDrawer } from "@/components/CartDrawer";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 12;

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();
  const observerTarget = useRef<HTMLDivElement>(null);

  // Get unique categories
  const categories = Array.from(new Set(allProducts.map((p) => p.category)));

  // Filter and sort products
  const getFilteredProducts = useCallback(() => {
    let filtered = allProducts.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort products
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, sortBy]);

  // Load more products (infinite loop)
  const loadMoreProducts = useCallback(() => {
    if (loading) return;

    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const filtered = getFilteredProducts();
      if (filtered.length === 0) {
        setLoading(false);
        return;
      }
      
      const start = ((page - 1) * ITEMS_PER_PAGE) % filtered.length;
      const newProducts: Product[] = [];
      
      for (let i = 0; i < ITEMS_PER_PAGE; i++) {
        const index = (start + i) % filtered.length;
        newProducts.push({
          ...filtered[index],
          id: filtered[index].id + (page - 1) * 1000 + i, // Unique key for repeated items
        });
      }

      setDisplayedProducts((prev) => [...prev, ...newProducts]);
      setPage((prev) => prev + 1);
      setLoading(false);
    }, 500);
  }, [page, loading, getFilteredProducts]);

  // Reset when filters change
  useEffect(() => {
    setDisplayedProducts([]);
    setPage(1);
    setLoading(true);

    setTimeout(() => {
      const filtered = getFilteredProducts();
      const initial = filtered.slice(0, ITEMS_PER_PAGE);
      setDisplayedProducts(initial);
      setLoading(false);
    }, 300);
  }, [searchQuery, selectedCategory, sortBy, getFilteredProducts]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loading, loadMoreProducts]);

  // Cart functions
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleUpdateQuantity = (id: number, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart.",
    });
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={cartItemCount} onCartClick={() => setIsCartOpen(true)} />
      
      <SearchAndFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        categories={categories}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            {selectedCategory === "all"
              ? "All Products"
              : selectedCategory}
          </h2>
          <p className="text-sm text-muted-foreground">
            {getFilteredProducts().length} products found
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
          
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <ProductSkeleton key={`skeleton-${i}`} />
            ))}
        </div>

        {displayedProducts.length === 0 && !loading && (
          <div className="flex h-64 items-center justify-center">
            <p className="text-lg text-muted-foreground">No products found</p>
          </div>
        )}

        <div ref={observerTarget} className="h-10" />
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </div>
  );
};

export default Index;
