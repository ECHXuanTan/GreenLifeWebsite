import { useEffect, useReducer } from 'react';
import axios from 'axios';
import logger from 'use-reducer-logger';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Product from '../components/Product';
import { Helmet } from 'react-helmet-async';
import MessageBox from '../components/MessageBox';
import LoadingBox from '../components/LoadingBox';
import ChatBot from '../components/ChatBot';
// import data from '../data';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, products: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

function HomeScreen() {
  const [{ loading, error, products }, dispatch] = useReducer(logger(reducer), {
    products: [],
    loading: true,
    error: '',
  });
  // const [products, setProducts] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get('/api/products');
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
      }

      // setProducts(result.data);
    };
    fetchData();
  }, []);

  const showPopup = () => {
    const popupContainer = document.getElementById('popupContainer');
    popupContainer.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  };

  const hidePopup = () => {
    const popupContainer = document.getElementById('popupContainer');
    popupContainer.style.display = 'none';
    document.body.style.overflow = 'auto'; // Allow scrolling
    
  };
  const closePopup = () => {
    hidePopup();
  }

  const handleSubscribe = async (event) => {
    event.preventDefault();
    
    const emailInput = document.getElementById('emailInput'); // Replace with the actual ID of your email input element
    const email = emailInput.value;
    
    if (email) {
      try {
        const response = await axios.get(`/api/mailchimp/subscribe?email=${encodeURIComponent(email)}`);
        console.log(response.data);
        hidePopup(); // Close the popup after successful subscription
      } catch (error) {
        console.error("Error subscribing:", error);
      }
    }
  };

  return (
    <div>
    <Helmet>
      <title>GreenLife</title>
    </Helmet>
    <div className="banner">
      <img src={'/images/banner.jpg'} alt="Banner" />
      <div className="banner-text">
      <h2>Tận hưởng không gian sống xanh</h2>
      <p>Bổ sung thêm cây xanh là một cách đơn giản nhất để tạo ra sự thoải mái cho không gian sống của bạn, giúp mang lại hiệu quả công việc và thư giãn mỗi khi trở về</p>
      <button className="subscribe-button" onClick={showPopup}>Liên hệ</button>
    </div>
    <div class="popup-container" id="popupContainer">
  <div class="popup">
    <h3>Đăng ký để nhận thông tin mới nhất</h3>
    <p>Luôn cập nhật những tin tức và ưu đãi mới nhất của chúng tôi.</p>
     <form id="subscribeForm" onSubmit={handleSubscribe}>
        <input
          type="email"
          id="emailInput" // Add an ID to the email input
          placeholder="Nhập email của bạn"
          required
        />
        <button type="submit">Đăng ký</button>
      </form>
    <span class="close" id="closePopup" onClick={closePopup}>
            &times;
          </span>
  </div>
</div>

  
    </div>
    <div className="content">
      <h1 className = "h1-content">Sản phẩm mới</h1>
      <div className="products">
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <Row>
            {products.map((product) => (
              <Col key={product.slug} sm={6} md={4} lg={3} className="mb-3">
                <Product product={product}></Product>
              </Col>
            ))}
          </Row>
        )}
      </div>
      <ChatBot />
    </div>
  </div>
  );
}
export default HomeScreen;
