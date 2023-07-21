import data from './data';

function App() {
  return (
    <div>
      <header>
        <a href="/">Green Life</a>
      </header>
      <main>
        <h1>SẢNG PHẨM MỚI</h1>
        <div className="products">
          {data.products.map((product) => (
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
      </main>
    </div>
  );
}

export default App;