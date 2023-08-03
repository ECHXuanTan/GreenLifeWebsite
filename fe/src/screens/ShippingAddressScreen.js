import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { Store } from '../store';
import CheckoutSteps from '../components/CheckoutSteps';

export default function ShippingAddressScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    userInfo,
    cart: { shippingAddress },
  } = state;
  const [fullName, setFullName] = useState(shippingAddress.fullName || '');
  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [phoneNumber, setphoneNumber] = useState(
    shippingAddress.phoneNumber || ''
  );
  useEffect(() => {
    if (!userInfo) {
      navigate('/signin?redirect=/shipping');
    }
  }, [userInfo, navigate]);
  const [district, setdistrict] = useState(shippingAddress.district || '');
  const submitHandler = (e) => {
    e.preventDefault();
    ctxDispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: {
        fullName,
        city,
        district,
        address,
        phoneNumber,
      },
    });
    localStorage.setItem(
      'shippingAddress',
      JSON.stringify({
        fullName,
        city,
        district,
        address,
        phoneNumber,
      })
    );
    navigate('/placeorder');
  };
  return (
    <div>
      <Helmet>
        <title>Thiết lập địa chỉ</title>
      </Helmet>

      <CheckoutSteps step1 step2></CheckoutSteps>
      <div className="container small-container">
        <h1 className="my-3">Thiết lập địa chỉ</h1>
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="fullName">
            <Form.Label>Họ và tên</Form.Label>
            <Form.Control
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="city">
            <Form.Label>Tỉnh/thành phố</Form.Label>
            <Form.Control
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="district">
            <Form.Label>Quận/Huyện</Form.Label>
            <Form.Control
              value={district}
              onChange={(e) => setdistrict(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="address">
            <Form.Label>Địa chỉ cụ thể</Form.Label>
            <Form.Control
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="phoneNumber">
            <Form.Label>Số điện thoại</Form.Label>
            <Form.Control
              value={phoneNumber}
              onChange={(e) => setphoneNumber(e.target.value)}
              required
            />
          </Form.Group>
          <div className="mb-3">
            <Button variant="primary" type="submit">
              Tiếp tục
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}