import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getCategories, getFeaturedProducts, getProductById, getProductsByCategory, getProductsForSearch, submitEnquiry } from './api';
import type { Product } from './types';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(value);

const ProductCard = ({ product }: { product: Product }) => (
  <article className="product-card" key={product.id}>
    <img src={product.image} alt={product.title} />
    <h3>{product.title}</h3>
    <div className="product-meta">
      <span>{product.category}</span>
      <span>★ {product.rating.rate}</span>
    </div>
    <div className="price">{formatCurrency(product.price)}</div>
    <div className="card-actions">
      <Link to={`/product/${product.id}`} className="secondary-btn" style={{ textAlign: 'center' }}>
        View details
      </Link>
    </div>
  </article>
);

const SearchHeader = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!search.trim()) return;
    navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          Catalog Pro
        </Link>

        <div className="header-actions">
          <form className="search-form" onSubmit={handleSubmit}>
            <input
              aria-label="Search products"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
            />
            <button type="submit" className="primary-btn">
              Search
            </button>
          </form>
        </div>
      </div>
    </header>
  );
};

const HomePage = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [featuredProducts, categoryList] = await Promise.all([getFeaturedProducts(), getCategories()]);
        setFeatured(featuredProducts);
        setCategories(categoryList);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-card">
            <div>
              <h1>Curated essentials for modern living.</h1>
              <p>
                Discover premium products, compare categories, and share your interest with a fast enquiry flow designed to evolve as the business grows.
              </p>
              <div className="feature-badges">
                <span className="badge">Top-rated picks</span>
                <span className="badge">Instant category browsing</span>
                <span className="badge">Customer enquiries</span>
              </div>
            </div>
            <div className="highlights">
              <div className="highlight-panel">
                <span>Featured items</span>
                <strong>{featured.length || 5}</strong>
              </div>
              <div className="highlight-panel">
                <span>Categories</span>
                <strong>{categories.length || 4}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="section-head">
            <h2>Browse categories</h2>
          </div>
          <div className="category-row">
            {categories.map((category) => (
              <Link key={category} className="category-chip" to={`/category/${encodeURIComponent(category)}`}>
                {category}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="section-head">
            <h2>Featured picks</h2>
          </div>
          {loading ? (
            <div className="empty-state">Loading featured products…</div>
          ) : (
            <div className="product-grid">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

const CategoryPage = () => {
  const { category } = useParams();
  const [data, setData] = useState<{ featured: Product[]; products: Product[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;

    const load = async () => {
      try {
        const response = await getProductsByCategory(decodeURIComponent(category));
        setData({ featured: response.featured, products: response.products });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [category]);

  if (loading) {
    return <div className="container empty-state">Loading {category}…</div>;
  }

  if (!data) {
    return <div className="container empty-state">No products were found for this category.</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>{category}</h1>
      </div>
      <section className="page-section">
        <div className="section-head">
          <h2>Top rated in this category</h2>
        </div>
        <div className="product-grid">
          {data.featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="page-section">
        <div className="section-head">
          <h2>More products</h2>
        </div>
        <div className="product-grid">
          {data.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const searchTerm = useMemo(() => searchParams.get('q') ?? '', [searchParams]);

  useEffect(() => {
    const load = async () => {
      if (!searchTerm) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const response = await getProductsForSearch(searchTerm);
        setProducts(response.products);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [searchTerm]);

  return (
    <div className="container">
      <div className="page-header">
        <h1>Search results for “{searchTerm}”</h1>
      </div>
      {loading ? (
        <div className="empty-state">Searching products…</div>
      ) : products.length ? (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="empty-state">No products matched your search.</div>
      )}
    </div>
  );
};

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  useEffect(() => {
    const productId = Number(id);
    if (!productId) return;

    const load = async () => {
      try {
        const response = await getProductById(productId);
        setProduct(response.product);
        setRelated(response.related);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!product) return;

    try {
      const response = await submitEnquiry({
        productId: product.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      });

      setSuccessMessage(response.message);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      setSuccessMessage(error instanceof Error ? error.message : 'Unable to send your enquiry right now.');
    }
  };

  if (loading) {
    return <div className="container empty-state">Loading product details…</div>;
  }

  if (!product) {
    return <div className="container empty-state">Product not found.</div>;
  }

  return (
    <div className="container">
      <div className="detail-layout">
        <div className="detail-media">
          <img src={product.image} alt={product.title} />
        </div>

        <div className="detail-copy">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.title}</h1>
          <div className="price-block">
            <span className="value">{formatCurrency(product.price)}</span>
            <span>★ {product.rating.rate} ({product.rating.count} reviews)</span>
          </div>
          <p>{product.description}</p>

          <form className="enquiry-form" onSubmit={handleSubmit}>
            <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Your name" required />
            <input name="email" value={formData.email} onChange={handleInputChange} placeholder="Your email" type="email" required />
            <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone number" required />
            <textarea name="message" value={formData.message} onChange={handleInputChange} placeholder="Tell us what you need" required />
            <button type="submit" className="primary-btn">Enquire</button>
          </form>

          {successMessage ? <div className="success-box">{successMessage}</div> : null}
        </div>
      </div>

      <section className="page-section">
        <div className="section-head">
          <h2>Related products</h2>
        </div>
        <div className="product-grid">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </div>
  );
};

const App = () => (
  <div className="app-shell">
    <SearchHeader />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/category/:category" element={<CategoryPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/product/:id" element={<ProductPage />} />
    </Routes>
  </div>
);

export default App;
