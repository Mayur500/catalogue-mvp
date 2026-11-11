import { Router } from 'express';
import { z } from 'zod';
import { sendEnquiryEmail } from '../services/emailService.js';
import { getAllProducts, getCategories, getFeaturedProducts, getProductById, getProductsByCategory } from '../services/fakeStoreService.js';

const router = Router();

const cd = (value: string | undefined) => value?.trim() ?? '';

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.get('/categories', async (_req, res) => {
  try {
    const categories = await getCategories();
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load categories', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/products', async (req, res) => {
  try {
    const category = cd(req.query.category as string | undefined);
    const search = cd(req.query.search as string | undefined);
    let products = await getAllProducts();

    if (category) {
      products = products.filter((product) => product.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const haystack = search.toLowerCase();
      products = products.filter((product) => {
        const text = `${product.title} ${product.description} ${product.category}`.toLowerCase();
        return text.includes(haystack);
      });
    }

    const featured = [...products]
      .sort((left, right) => right.rating.rate - left.rating.rate)
      .slice(0, 5);

    res.json({
      products,
      featured,
      total: products.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load products', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/products/featured', async (_req, res) => {
  try {
    const featured = await getFeaturedProducts();
    res.json({ featured });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load featured products', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const product = await getProductById(productId);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const related = (await getAllProducts()).filter(
      (candidate) => candidate.category === product.category && candidate.id !== product.id,
    );

    res.json({ product, related: related.slice(0, 4) });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load product', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/categories/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const products = await getProductsByCategory(category);
    const featured = [...products].sort((left, right) => right.rating.rate - left.rating.rate).slice(0, 5);

    res.json({ category, featured, products });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load category products', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

const enquirySchema = z.object({
  productId: z.number().int().positive(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  message: z.string().min(10),
});

router.post('/enquiries', async (req, res) => {
  try {
    const payload = enquirySchema.parse(req.body);
    const product = await getProductById(payload.productId);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    await sendEnquiryEmail({
      productId: product.id,
      productTitle: product.title,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      message: payload.message,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you. Your enquiry has been submitted successfully.',
      productTitle: product.title,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Please check the form fields and try again.', errors: error.flatten() });
      return;
    }

    res.status(500).json({ message: 'Unable to submit enquiry', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
