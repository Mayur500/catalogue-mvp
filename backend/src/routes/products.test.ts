import request from 'supertest';
import app from '../app.js';

describe('Product catalog API', () => {
  it('returns a healthy response', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('returns the featured products and supports search filtering', async () => {
    const featured = await request(app).get('/api/products/featured');
    expect(featured.status).toBe(200);
    expect(featured.body.featured.length).toBe(5);

    const search = await request(app).get('/api/products?search=shirt');
    expect(search.status).toBe(200);
    expect(search.body.products.length).toBeGreaterThan(0);
    expect(search.body.products.some((product: { title: string }) => product.title.toLowerCase().includes('shirt'))).toBeTruthy();
  });

  it('returns additional category products without repeating its featured products', async () => {
    const response = await request(app).get('/api/categories/electronics');

    expect(response.status).toBe(200);
    const featuredIds = response.body.featured.map((product: { id: number }) => product.id);
    const additionalIds = response.body.products.map((product: { id: number }) => product.id);
    expect(additionalIds.some((id: number) => featuredIds.includes(id))).toBe(false);
  });

  it('submits a product enquiry and returns a thank you message', async () => {
    const response = await request(app).post('/api/enquiries').send({
      productId: 1,
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '0400000000',
      message: 'I would like pricing and delivery details for this product.',
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toContain('Thank you');
  });
});
