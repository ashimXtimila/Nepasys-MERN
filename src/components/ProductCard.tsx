import { ShoppingCart } from "lucide-react";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  return (
    <Card className="group overflow-hidden border-border bg-card transition-all duration-300 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      
      <div className="p-4">
        <div className="mb-1">
          <span className="text-xs font-medium text-muted-foreground">
            {product.category}
          </span>
        </div>
        
        <h3 className="mb-2 line-clamp-2 text-base font-semibold text-foreground">
          {product.name}
        </h3>
        
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-primary">
              NRS {product.price.toLocaleString()}
            </span>
          </div>
          
          <Button
            size="sm"
            onClick={() => onAddToCart(product)}
            className="gap-1.5 bg-primary text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105"
          >
            <ShoppingCart className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
};
