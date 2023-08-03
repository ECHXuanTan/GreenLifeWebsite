import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import seedRouter from './routers/seedRouter.js';
import productRouter from './routers/productRouter.js';
import userRouter from './routers/userRouter.js';
import orderRouter from './routers/orderRouter.js';
import router  from './routers/vnpayRouter.js';
import fetch from 'node-fetch';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';


dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('connected to db');
  })
  .catch((err) => {
    console.log(err.message);
  });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:3000'
}));

app.use('/api/proxy', createProxyMiddleware({
  target: 'https://sandbox.vnpayment.vn', // target host
  changeOrigin: true, // needed for virtual hosted sites
  pathRewrite: {
    ['^/api/proxy']: '/paymentv2', // rewrite path
  },
}));

app.get('/api/keys/paypal', (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
});

app.use('/api/vnpayRouter', router );


const PORT_PROXY = 3001; // Choose a port for your proxy server

app.post('/api/shipment/fee', async (req, res) => {
  const url = 'https://services.giaohangtietkiem.vn/services/shipment/fee';
  const token = '999232dcc709d6426b3d677c2cb19c64057f3f52';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {-
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.use('/api/seed', seedRouter);
app.use('/api/products', productRouter);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);


const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`serve at http://localhost:${port}`);
});

app.listen(PORT_PROXY, () => {
  console.log(`Proxy server listening on port http://localhost:${PORT_PROXY}`);
});