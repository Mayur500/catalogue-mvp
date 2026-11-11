import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import productsRouter from './routes/products.js';

const app = express();

app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  }),
);

app.use(express.json({ limit: '1mb' }));
app.use('/api', productsRouter);

app.get('/', (_req, res) => {
  res.json({ message: 'Catalogue API is running.' });
});

export default app;
