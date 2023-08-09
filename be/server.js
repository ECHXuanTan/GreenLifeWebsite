import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import seedRouter from './routes/seedRoute.js';
import productRouter from './routes/productRoute.js';
import userRouter from './routes/userRoute.js';
import orderRouter from './routes/orderRoute.js';
import router  from './routes/vnpayRoute.js';
import uploadRouter from './routes/uploadRoute.js';
import fetch from 'node-fetch';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';


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
app.use('/api/upload', uploadRouter);


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

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '/fe/build')));
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/fe/build/index.html'))
);


const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`serve at http://localhost:${port}`);
});

app.listen(PORT_PROXY, () => {
  console.log(`Proxy server listening on port http://localhost:${PORT_PROXY}`);
});