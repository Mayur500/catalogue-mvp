import axios from 'axios';
import { config } from '../config.js';
import { fallbackProducts } from '../data/fallbackProducts.js';
import type { Product } from '../types.js';

const client = axios.create({
  baseURL: config.fakeStoreBaseUrl,
  timeout: 8000,
});

const normaliseCategory = (value: string) => value.trim().toLowerCase();

const withProductDefaults = (products: Product[]) =>
  products.map((product) => ({
    ...product,
    category: normaliseCategory(product.category),
    rating: {
      rate: Number(product.rating?.rate ?? 0),
      count: Number(product.rating?.count ?? 0),
    },
  }));

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const { data } = await client.get<Product[]>('/products');
    return withProductDefaults(data ?? []);
  } catch (error) {
    console.warn('Falling back to local product catalog because Fake Store API is unavailable.', error);
    return withProductDefaults(fallbackProducts);
  }
};

export const getCategories = async (): Promise<string[]> => {
  const allProducts = await getAllProducts();
  return [...new Set(allProducts.map((product) => product.category))].sort();
};

export const getFeaturedProducts = async (limit = 5): Promise<Product[]> => {
  const allProducts = await getAllProducts();
  return [...allProducts]
    .sort((left, right) => right.rating.rate - left.rating.rate)
    .slice(0, limit);
};

export const getProductById = async (id: number): Promise<Product | undefined> => {
  const allProducts = await getAllProducts();
  return allProducts.find((product) => product.id === id);
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  const allProducts = await getAllProducts();
  const normalizedCategory = normaliseCategory(category);

  return allProducts.filter((product) => normaliseCategory(product.category) === normalizedCategory);
};
