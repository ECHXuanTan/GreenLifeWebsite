import express from 'express';
import Product from '../models/productModel.js';
//import data from '../data.js';
import User from '../models/userModel.js';


const seedRouter = express.Router();

seedRouter.get('/', async (req, res) => {
  try {
  await Product.deleteMany({});
  const productsData = await Product.find({});
  const createdProducts = await Product.insertMany(productsData);
  await User.deleteMany({});
  const usersData = await User.find({});
  const createdUsers = await User.insertMany(usersData);
  res.send({ createdProducts, createdUsers });
  }catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).send({ error: 'Error seeding data' });
  }
});
export default seedRouter;
