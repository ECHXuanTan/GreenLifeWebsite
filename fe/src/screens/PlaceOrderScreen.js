import Axios from 'axios';
import React, { useContext, useState, useEffect, useReducer } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import { Store } from '../store';
import CheckoutSteps from '../components/CheckoutSteps';
import LoadingBox from '../components/LoadingBox';
import getShippingFeeGHTK from '../services/ghtk.js'

const reducer = (state, action) => {
    switch (action.type) {
      case 'CREATE_REQUEST':
        return { ...state, loading: true };
      case 'CREATE_SUCCESS':
        return { ...state, loading: false };
      case 'CREATE_FAIL':
        return { ...state, loading: false };
      default:
        return state;
    }
  };

export default function PlaceOrderScreen() {
  const navigate = useNavigate();

  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false,
  });

  const getCityAndDistrictFromLocalStorage = () => {
    const shippingAddress = JSON.parse(localStorage.getItem('shippingAddress'));
    if (shippingAddress) {
      const { city, district } = shippingAddress;
      return { city, district };
    
    }
    return { city: '', district: '' }; // Return default values if not found in localStorage
  };


  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100; // 123.2345 => 123.23
  cart.itemsPrice = round2(
    cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );
  const [shippingPrice, setShippingPrice] = useState(null); // State to hold the shipping price value

  useEffect(() => {
    const fetchShippingFee = async () => {
      try {
        const fee = await getShippingFeeGHTK(
          getCityAndDistrictFromLocalStorage().city,
          getCityAndDistrictFromLocalStorage().district
        );
        setShippingPrice(fee);
      } catch (error) {
        console.error('Error fetching shipping fee:', error.message);
      }
    };

    fetchShippingFee();
  }, []);
  cart.shippingPrice = shippingPrice
  console.log("shippingPrice:", cart.shippingPrice)
  cart.taxPrice = round2(0.005 * cart.itemsPrice);
  cart.totalPrice = cart.itemsPrice + cart.shippingPrice + cart.taxPrice;

  const [selectedShippingUnit, setSelectedShippingUnit] = useState('ghtk'); // Default shipping unit is GHTK
  const [shippingFeeDiscount, setShippingFeeDiscount] = useState(0); // Default discount is 0
  const [shippingUnitImage, setShippingUnitImage] = useState(
    '/images/ghtk.jpg' 
  );

  const handleShippingUnitChange = (event) => {
    const selectedUnit = event.target.value;
    setSelectedShippingUnit(selectedUnit);
  
    // Update the shipping unit image URL based on the selected unit
    switch (selectedUnit) {
      case 'ghtk':
        setShippingUnitImage('/images/ghtk.jpg'); 
        break;
      case 'ghn':
        setShippingUnitImage('/images/ghn.jpg');
        break;
      default:
        setShippingUnitImage('/images/ghtk.jpg'); // Set default image URL if the selected unit is not recognized
        break;
    }
  };

  const handleShippingFeeDiscountChange = (event) => {
    setShippingFeeDiscount(parseFloat(event.target.value));
  };

  

  const placeOrderHandler = async () => {

    try {
      dispatch({ type: 'CREATE_REQUEST' });

      const { data } = await Axios.post(
        '/api/orders',
        {
          orderItems: cart.cartItems,
          shippingAddress: cart.shippingAddress,
          itemsPrice: cart.itemsPrice,
          shippingPrice: cart.shippingPrice,
          taxPrice: cart.taxPrice,
          totalPrice: cart.totalPrice,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      ctxDispatch({ type: 'CART_CLEAR' });
      dispatch({ type: 'CREATE_SUCCESS' });
      localStorage.removeItem('cartItems');
      navigate(`/order/${data.order._id}`);
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' });
      toast.error(getError(err));
    }
  };

  return (
    <div>
      <CheckoutSteps step1 step2 step3></CheckoutSteps>
      <Helmet>
        <title>Đặt hàng</title>
      </Helmet>
      <h1 className="my-3">Đặt hàng</h1>
      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Địa chỉ giao hàng</Card.Title>
              <Card.Text>
                <strong>Họ và tên:</strong> {cart.shippingAddress.fullName} <br />
                <strong>Số điện thoại:</strong> {cart.shippingAddress.phoneNumber} <br />
                <strong>Địa chỉ: </strong> {cart.shippingAddress.address},{cart.shippingAddress.district},
                {cart.shippingAddress.city},
              </Card.Text>
              <Link to="/shipping">Thay đổi</Link>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Sản phẩm</Card.Title>
              <ListGroup variant="flush">
                {cart.cartItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={6}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded img-thumbnail"
                        ></img>{' '}
                        <Link to={`/product/${item.slug}`}>{item.name}</Link>
                      </Col>
                      <Col md={3}>
                        <span>{item.quantity}</span>
                      </Col>
                      <Col md={3}>{item.price}đ</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Link to="/cart">Thay đổi</Link>
            </Card.Body>
          </Card>

          <Card className="mb-3">
        <Card.Body>
          <Card.Title>Thông tin vận chuyển</Card.Title>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <Row>
                <Col>
                  <div className="mb-3">
                    <label htmlFor="shippingUnitSelect" className="form-label">
                      Chọn đơn vị vận chuyển:
                    </label>
                    <select
                      className="form-select"
                      style={{maxWidth: '200px'}}
                      id="shippingUnitSelect"
                      value={selectedShippingUnit}
                      onChange={handleShippingUnitChange}
                    >
                      <option value="ghtk">Giao hàng tiết kiệm</option>
                      <option value="ghn">Giao hàng nhanh</option>
                    </select>
                  </div>
                </Col>
                <Col>
                  {/* Display the shipping unit image */}
                  <img
                    src={shippingUnitImage}
                    alt="Shipping Unit"
                    style={{ maxWidth: '100%', height: 'auto', maxHeight: '150px' }}
                  />
                </Col>
              </Row>
            </ListGroup.Item>
            <ListGroup.Item>
              <Row>
                <Col>
                  <div className="mb-3">
                    <label htmlFor="shippingFeeDiscountInput" className="form-label">
                      Giảm giá phí vận chuyển:
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      style={{maxWidth: '200px'}}
                      id="shippingFeeDiscountInput"
                      value={shippingFeeDiscount}
                      onChange={handleShippingFeeDiscountChange}
                    />
                  </div>
                </Col>
              </Row>
            </ListGroup.Item>
          </ListGroup>
        </Card.Body>
      </Card>
        </Col>
    
        <Col md={4}>
          
          <Card>
            <Card.Body>
              <Card.Title>Đơn hàng</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Sản phẩm</Col>
                    <Col>{cart.itemsPrice}đ</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Phí vận chuyển</Col>
                    <Col>{cart.shippingPrice}đ</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Thuế</Col>
                    <Col>{cart.taxPrice}đ</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong> Giá trị đơn hàng</strong>
                    </Col>
                    <Col>
                      <strong>{cart.totalPrice}đ</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-grid">
                    <Button
                      type="button"
                      onClick={placeOrderHandler}
                      disabled={cart.cartItems.length === 0}
                    >
                      Đặt hàng
                    </Button>
                  </div>
                  {loading && <LoadingBox></LoadingBox>}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}