import type { CategoryProductsResponse, CategoryResponse, Product, ProductDetailResponse, ProductSummaryResponse } from './types';

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message ?? 'Request failed');
  }

  return (await response.json()) as T;
};

export const getFeaturedProducts = () => request<Product[]>('/products/featured').then((payload) => payload as Product[]);

export const getCategories = () => request<CategoryResponse>('/categories').then((payload) => payload.categories);

export const getProductsByCategory = (category: string) => request<CategoryProductsResponse>(`/categories/${encodeURIComponent(category)}`);

export const getProductsForSearch = (searchTerm: string) => request<ProductSummaryResponse>(`/products?search=${encodeURIComponent(searchTerm)}`);

export const getProductById = (id: number) => request<ProductDetailResponse>(`/products/${id}`);

export const submitEnquiry = (payload: {
  productId: number;
  name: string;
  email: string;
  phone: string;
  message: string;
}) => request<{ message: string }>(`/enquiries`, {
  method: 'POST',
  body: JSON.stringify(payload),
});
