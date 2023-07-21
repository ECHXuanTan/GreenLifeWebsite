import { Link } from 'react-router-dom';
import axios from 'axios';
import React, { useState, useEffect } from 'react';


function HomeScreen() {
    const [products, setProducts] = useState([]);
    useEffect(() => {
      const fetchData = async () => {
        const result = await axios.get('/api/products');
        setProducts(result.data);
      };
      fetchData();
    }, []);

  return (
    <div>
              <h1>SẢNG PHẨM MỚI</h1>
        <div className="products">
            {products.map((product) => (
            <div className="product" key={product.slug}>
              <a href={`/product/${product.slug}`}>
                <img src={product.image} alt={product.name} />
              </a>
              <div className="product-info">
                <a href={`/product/${product.slug}`}>
                  <p>{product.name}</p>
                </a>
                <p>
                  <strong>{product.price}đ</strong>
                </p>
                <button>Thêm vào giỏ hàng</button>
              </div>
            </div>
          ))}
        </div>  
    </div>
  );
}
export default HomeScreen;