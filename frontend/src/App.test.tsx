import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import App from './App';

describe('Catalog app', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes('/api/products/featured')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { id: 1, title: 'Alpha', price: 10, description: 'Desc', category: "men's clothing", image: 'https://example.com/alpha.jpg', rating: { rate: 4.8, count: 22 } },
            { id: 2, title: 'Beta', price: 20, description: 'Desc', category: 'electronics', image: 'https://example.com/beta.jpg', rating: { rate: 4.7, count: 31 } },
            { id: 3, title: 'Gamma', price: 30, description: 'Desc', category: "women's clothing", image: 'https://example.com/gamma.jpg', rating: { rate: 4.5, count: 40 } },
            { id: 4, title: 'Delta', price: 40, description: 'Desc', category: 'jewelery', image: 'https://example.com/delta.jpg', rating: { rate: 4.4, count: 18 } },
            { id: 5, title: 'Epsilon', price: 50, description: 'Desc', category: 'electronics', image: 'https://example.com/epsilon.jpg', rating: { rate: 4.3, count: 12 } },
          ],
        });
      }

      if (url.includes('/api/categories')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ categories: ["men's clothing", 'electronics', "women's clothing", 'jewelery'] }),
        });
      }

      if (url.includes('/api/products?search=')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ products: [{ id: 1, title: 'Alpha', price: 10, description: 'Desc', category: "men's clothing", image: 'https://example.com/alpha.jpg', rating: { rate: 4.8, count: 22 } }], featured: [], total: 1 }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({ message: 'ok' }),
      });
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders featured products on the home page and allows search', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    await waitFor(() => expect(screen.getByText('Featured picks')).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText('Search products...');
    await user.type(searchInput, 'alpha');
    await user.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => expect(screen.getByText(/Search results/i)).toBeInTheDocument());
  });
});
