export type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
};

export type ProductSummaryResponse = {
  products: Product[];
  featured: Product[];
  total: number;
};

export type FeaturedProductsResponse = {
  featured: Product[];
};

export type ProductDetailResponse = {
  product: Product;
  related: Product[];
};

export type CategoryResponse = {
  categories: string[];
};

export type CategoryProductsResponse = {
  category: string;
  featured: Product[];
  products: Product[];
};
