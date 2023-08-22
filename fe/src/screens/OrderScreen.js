import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../store';
import { getError } from '../utils';
import { toast } from 'react-toastify';
import Button from 'react-bootstrap/Button';
import ReactGA from 'react-ga4';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, order: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'PAY_REQUEST':
    return { ...state, loadingPay: true };
    case 'PAY_SUCCESS':
      return { ...state, loadingPay: false, successPay: true };
    case 'PAY_FAIL':
      return { ...state, loadingPay: false };
    case 'PAY_RESET':
      return { ...state, loadingPay: false, successPay: false };
    case 'DELIVER_REQUEST':
      return { ...state, loadingDeliver: true };
    case 'DELIVER_SUCCESS':
      return { ...state, loadingDeliver: false, successDeliver: true };
    case 'DELIVER_FAIL':
      return { ...state, loadingDeliver: false };
    case 'DELIVER_RESET':
      return {
        ...state,
        loadingDeliver: false,
        successDeliver: false,
      };
    default:
      return state;
  }
}

export default function OrderScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;

  const params = useParams();
  const { id: orderId } = params;
  const navigate = useNavigate();

  const [
    {
      loading,
      error,
      order,
      successPay,
      loadingPay,
      loadingDeliver,
      successDeliver,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    order: {},
    error: '',
    successPay: false,
    loadingPay: false,
  });

  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  function createOrder(data, actions) {
    const usdAmount = (order.totalPrice / 24000).toFixed(2);
    return actions.order
      .create({
        purchase_units: [
          {
            amount: { currency_code: 'USD',
            value: usdAmount, },
          },
        ],
      })
      .then((orderID) => {
        return orderID;
      });
  }

  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        dispatch({ type: 'PAY_REQUEST' });
        const { data } = await axios.put(
          `/api/orders/${order._id}/pay`,
          details,
          {
            headers: { authorization: `Bearer ${userInfo.token}` },
          }
        );
        
        // Update the countInDisplay for each item
        const updatedItems = order.orderItems.map(item => {
          return {
            ...item,
            countInDisplay: item.countInDisplay - item.quantity
          };
        });
  
        // Make an API call to update the item countInDisplay
        await Promise.all(
          updatedItems.map(async item => {
            await axios.put(
              `/api/products/paid/${item._id}`, // Change this to the correct endpoint
              { countInDisplay: item.countInDisplay },
              {
                headers: { authorization: `Bearer ${userInfo.token}` },
              }
            );
          })
        );
  
        dispatch({ type: 'PAY_SUCCESS', payload: data });
        toast.success('Thanh toán thành công');
        ReactGA.gtag('event', 'purchase', {
          transaction_id: order._id,
          value: order.totalPrice,
          currency: 'VND',
        });
      } catch (err) {
        dispatch({ type: 'PAY_FAIL', payload: getError(err) });
        toast.error(getError(err));
      }
    });
  }
  function onError(err) {
    toast.error(getError(err));
  }

  useEffect(() => {
    
    

     // Create a URLSearchParams object
  const urlParams = new URLSearchParams(window.location.search);
  
  // Use the .get method to get the value of `vnp_ResponseCode`
  const vnpResponseCode = urlParams.get('vnp_ResponseCode');
  
  // Log the value
  console.log('vnp_ResponseCode:', vnpResponseCode);

  if (!order._id || vnpResponseCode === '00') {
    // Payment successful, update the order status
    axios.put(
      `/api/orders/${order._id}/pay`, 
      {
        id: urlParams.get('vnp_TransactionNo'),
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
      },
      {
        headers: { authorization: `Bearer ${userInfo.token}` },
      }
    )
    .then(() => handlePaymentSuccess())
    .catch((error) => {
      console.error('Error updating order status:', error);
    });
  }

  async function handlePaymentSuccess() {
    try {
      toast.success('Thanh toán thành công');
      
      // Update the countInDisplay for each item
      const updatedItems = order.orderItems.map(item => {
        return {
          ...item,
          countInDisplay: item.countInDisplay - item.quantity
        };
      });
      
      // Make an API call to update the item countInDisplay
      await Promise.all(
        updatedItems.map(async item => {
          await axios.put(
            `/api/products/paid/${item._id}`, // Change this to the correct endpoint
            { countInDisplay: item.countInDisplay },
            {
              headers: { authorization: `Bearer ${userInfo.token}` },
            }
          );
        })
      );
  
      // Refresh the order details
      await fetchOrder();
      ReactGA.gtag('event', 'purchase', {
        transaction_id: order._id,
        value: order.totalPrice,
        currency: 'VND',
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  }

    const fetchOrder = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        const orderItemsWithCounts = await Promise.all(
          data.orderItems.map(async (item) => {
            const countInDisplay = await fetchCountInDisplay(item.slug);
            const countInStock = await fetchCountInStock(item.slug);
            return {
              ...item,
              countInDisplay,
              countInStock,
            };
          })
        );
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: {
            ...data,
            orderItems: orderItemsWithCounts,
          },
        });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    if (!userInfo) {
      return navigate('/login');
    }
    if (
      !order._id ||
      successPay ||
      successDeliver ||
      (order._id && order._id !== orderId)
    ) {
      fetchOrder();
      if (successPay) {
        dispatch({ type: 'PAY_RESET' });
      }
      if (successDeliver) {
        dispatch({ type: 'DELIVER_RESET' });
      }
    } else {
      const loadPaypalScript = async () => {
        const { data: clientId } = await axios.get('/api/keys/paypal', {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        paypalDispatch({
          type: 'resetOptions',
          value: {
            'client-id': clientId,
            currency: 'USD',
          },
        });
        paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
      };
      loadPaypalScript();
    }
  }, [
    order,
    userInfo,
    orderId,
    navigate,
    paypalDispatch,
    successPay,
    successDeliver,
  ]);

  

  async function deliverOrderHandler() {
    try {
      dispatch({ type: 'DELIVER_REQUEST' });
      const { data } = await axios.put(
        `/api/orders/${order._id}/deliver`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );

      // Update the countInStock for each item
      const updatedItems = order.orderItems.map(item => {
        return {
          ...item,
          countInStock: item.countInStock - item.quantity
        };
      });

      // Make an API call to update the item countInStocky
      await Promise.all(
        updatedItems.map(async item => {
          await axios.put(
            `/api/products/delivered/${item._id}`, // Change this to the correct endpoint
            { countInStock: item.countInStock },
            {
              headers: { authorization: `Bearer ${userInfo.token}` },
            }
          );
        })
      );


      dispatch({ type: 'DELIVER_SUCCESS', payload: data });
      toast.success('Đơn hàng đã được giao');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'DELIVER_FAIL' });
    }
  }

  function onVnpayClick() {
    const returnUrl = `http://localhost:3000/order/${order._id}`

    axios.get('/api/vnpayRouter/create_payment_url', {
      params: {
        amount: order.totalPrice, // Set the amount as order.totalPrice
        returnUrl,
      },
    }).then((response) => {
      // Redirect the browser to the VNPAY URL after receiving the response
      window.location.href = response.data.url;
    }).catch((error) => {
      console.error('Error fetching VNPAY URL', error);
    });
  }

  async function fetchCountInDisplay(slug) {
    try {
      const response = await axios.get(`/api/products/slug2/${slug}`);
      if (response.status === 200) {
        const data = response.data;
        return data.countInDisplay;
      } else {
        throw new Error('Product Not Found');
      }
    } catch (error) {
      console.error('Error fetching countInDisplay:', error.message);
      return null; // or throw an error if you prefer
    }
  }

  async function fetchCountInStock(slug) {
    try {
      const response = await axios.get(`/api/products/slug3/${slug}`);
      if (response.status === 200) {
        const data = response.data;
        return data.countInStock;
      } else {
        throw new Error('Product Not Found');
      }
    } catch (error) {
      console.error('Error fetching countInStock:', error.message);
      return null; // or throw an error if you prefer
    }
  }

  console.log('c', fetchCountInStock('cay-trau-ba-cot-chau-xi-mang'));

  return loading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <Helmet>
        <title>Đơn hàng {orderId}</title>
      </Helmet>
      <h1 className="my-3">Đơn hàng {orderId}</h1>
      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Địa chỉ nhận hàng</Card.Title>
              <Card.Text>
                <strong>Họ và tên:</strong> {order.shippingAddress.fullName} <br />
                <strong>Số điện thoại:</strong> {order.shippingAddress.phoneNumber} <br />
                <strong>Địa chỉ: </strong> {order.shippingAddress.address}, {order.shippingAddress.district},
                {order.shippingAddress.city}, 
                
              </Card.Text>
              {order.isDelivered ? (
                <MessageBox variant="success">
                  Giao tại {order.deliveredAt}
                </MessageBox>
              ) : (
                <MessageBox variant="danger">Chưa được giao</MessageBox>
              )}
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Thanh toán</Card.Title>

              {order.isPaid ? (
                <MessageBox variant="success">
                  Đã thanh toán {order.paidAt}
                </MessageBox>
              ) : (
                <MessageBox variant="danger">Chưa thanh toán</MessageBox>
              )}
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Sản phẩm</Card.Title>
              <ListGroup variant="flush">
                {order.orderItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={7}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded img-thumbnail"
                        ></img>{' '}
                        <Link className='text-decoration-none' to={`/product/${item.slug}`}>{item.name}</Link>
                      </Col>
                      <Col md={3}>
                        <span>{item.quantity}</span>
                      </Col>
                      <Col md={2}>{item.price}đ</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Đơn hàng</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Sản phẩm</Col>
                    <Col>{order.itemsPrice.toFixed(2)}đ</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Phí vận chuyển</Col>
                    <Col>{order.shippingPrice.toFixed(2)}đ</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Thuế</Col>
                    <Col>{order.taxPrice.toFixed(2)}đ</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong> Giá trị đơn hàng</strong>
                    </Col>
                    <Col>
                      <strong>{order.totalPrice.toFixed(2)}đ</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                {!order.isPaid && (
                <ListGroup.Item>
                  {isPending ? (
                    <LoadingBox />
                  ) : (
                    <div>
                      {/* Check if item quantity is greater than countInDisplay */}
                      {order.orderItems.every(item => item.quantity <= item.countInDisplay) ? (
                        <>
                          <PayPalButtons
                            createOrder={createOrder}
                            onApprove={onApprove}
                            onError={onError}
                          ></PayPalButtons>
                          <button className="vnpay-button-style" onClick={onVnpayClick}>
                            VNPAY
                          </button>
                        </>
                      ) : (
                        <MessageBox variant="danger">
                          Sản phẩm không còn đủ số lượng để thanh toán.
                        </MessageBox>
                      )}
                    </div>
                  )}
                  {loadingPay && <LoadingBox></LoadingBox>}
                </ListGroup.Item>
              )}
                {userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                  <ListGroup.Item>
                    {loadingDeliver && <LoadingBox />}
                    <div className="d-grid">
                    {order.orderItems.every(item => item.quantity > item.countInStock) ? (
                        <MessageBox variant="danger">
                        Sản phẩm không đủ số lượng để giao hàng.
                      </MessageBox>
                      ) : (
                        <Button type="button" onClick={deliverOrderHandler}>
                          Giao Hàng
                        </Button>
                        
                      )}
                    </div>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}