import React, { useEffect, useReducer, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import { Helmet } from 'react-helmet-async';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Rating from '../components/Rating';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Button from 'react-bootstrap/Button';
import Product from '../components/Product';
import LinkContainer from 'react-router-bootstrap/LinkContainer';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        products: action.payload.products,
        page: action.payload.page,
        pages: action.payload.pages,
        countProducts: action.payload.countProducts,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

const prices = [
  {
    name: '100.000đ đến 200.000đ',
    value: '100000-200000',
  },
  {
    name: '200.000đ đến 300.000đ',
    value: '200000-300000',
  },
  {
    name: '300.000đ đến 500.000đ',
    value: '300000-500000',
  },
];

export const ratings = [
    {
        name: '4stars & up',
        rating: 4,
      },
    
      {
        name: '3stars & up',
        rating: 3,
      },
    
      {
        name: '2stars & up',
        rating: 2,
      },
    
      {
        name: '1stars & up',
        rating: 1,
      },
];

const categoryDisplayNames = {
    outDoor: 'Ngoài trời',
    inDoor: 'Trong nhà',
  };

const styleDisplayNames = {
  big: 'Cây cao & lớn',
  hang: 'Cây treo',
  mini: 'Cây cảnh mini',
  tropic: 'Cây nhiệt đới',
};

const placeDisplayNames = {
  balcony: 'Cây trồng ban công',
  inDoor: 'Cây trong bếp & nhà tắm',
  office: 'Cây cảnh văn phòng',
  outDoor: 'Cây trước cửa & hành lang',
  table: 'Cây cảnh để bàn'
};



export default function SearchScreen() {
    const navigate = useNavigate();
    const { search } = useLocation();
    const sp = new URLSearchParams(search); // /search?category=Shirts
    const category = sp.get('category') || 'all';
    const style = sp.get('style') || 'all';
    const place = sp.get('place') || 'all';
    const query = sp.get('query') || 'all';
    const price = sp.get('price') || 'all';
    const rating = sp.get('rating') || 'all';
    const order = sp.get('order') || 'newest';
    const page = sp.get('page') || 1;
  
    const [{ loading, error, products, pages, countProducts }, dispatch] =
      useReducer(reducer, {
        loading: true,
        error: '',
      });
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const { data } = await axios.get(
            `/api/products/search?page=${page}&query=${query}&category=${category}&style=${style}&place=${place}&price=${price}&rating=${rating}&order=${order}`
          );
          dispatch({ type: 'FETCH_SUCCESS', payload: data });
        } catch (err) {
          dispatch({
            type: 'FETCH_FAIL',
            payload: getError(error),
          });
        }
      };
      fetchData();
    }, [category, style, place, error, order, page, price, query, rating]);
  
    const [categories, setCategories] = useState([]);
    const [styles, setStyles] = useState([]);
    const [places, setPlaces] = useState([]);
    useEffect(() => {
      const fetchCategories = async () => {
        try {
          const { data } = await axios.get(`/api/products/categories`);
          setCategories(data);
        } catch (err) {
          toast.error(getError(err));
        }
      };
      fetchCategories();

      const fetchStyles = async () => {
        try {
          const { data } = await axios.get(`/api/products/styles`);
          setStyles(data);
        } catch (err) {
          toast.error(getError(err));
        }
      };
      fetchStyles();

      const fetchPlaces = async () => {
        try {
          const { data } = await axios.get(`/api/products/places`);
          setPlaces(data);
        } catch (err) {
          toast.error(getError(err));
        }
      };
      fetchPlaces();
    }, [dispatch]);
  
    const getFilterUrl = (filter) => {
      const filterPage = filter.page || page;
      const filterCategory = filter.category || category;
      const filterStyle = filter.style || style;
      const filterPlace = filter.place || place;
      const filterQuery = filter.query || query;
      const filterRating = filter.rating || rating;
      const filterPrice = filter.price || price;
      const sortOrder = filter.order || order;
      return `/search?category=${filterCategory}&query=${filterQuery}&style=${filterStyle}&place=${filterPlace}&price=${filterPrice}&rating=${filterRating}&order=${sortOrder}&page=${filterPage}`;
    };

    const renderCategoryName = (categoryValue) => {
        return categoryDisplayNames[categoryValue] || categoryValue;
      };
    const renderStyleName = (styleValue) => {
      return styleDisplayNames[styleValue] || styleValue;
    };
    const renderPlaceName = (placeValue) => {
      return placeDisplayNames[placeValue] || placeValue;
    };

    return (
      <div>
        <Helmet>
          <title>Tìm kiếm sản phẩm</title>
        </Helmet>
        <Row>
          <Col md={3} className='search-sidebar'>
            <h3>Danh mục</h3>
            <div >
              <ul>
                <li className='no-underline'>
                  <Link
                    className={'all' === category ? 'text-bold' : ''}
                    to={getFilterUrl({ category: 'all' })}
                  >
                    Tất cả sản phẩm
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c}>
                    <Link
                      className={c === category ? 'text-bold' : ''}
                      to={getFilterUrl({ category: c })}
                    >
                      {renderCategoryName(c)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <h3>Kiểu dáng cây</h3>
            <div>
              <ul>
                <li>
                  <Link
                    className={'all' === style ? 'text-bold' : ''}
                    to={getFilterUrl({ style: 'all' })}
                  >
                    Tất cả sản phẩm
                  </Link>
                </li>
                {styles.map((c) => (
                  <li key={c}>
                    <Link
                      className={c === style ? 'text-bold' : ''}
                      to={getFilterUrl({ style: c})} 
                    >
                      {renderStyleName(c)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <h3>Theo vị trí đặt</h3>
            <div>
              <ul>
                <li>
                  <Link
                    className={'all' === place ? 'text-bold' : ''}
                    to={getFilterUrl({ place: 'all' })}
                  >
                    Tất cả sản phẩm
                  </Link>
                </li>
                {places.map((c) => (
                  <li key={c}>
                    <Link
                      className={c === place ? 'text-bold' : ''}
                      to={getFilterUrl({ place: c})} 
                    >
                      {renderPlaceName(c)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Khoảng giá</h3>
              <ul>
                <li>
                  <Link
                    className={'all' === price ? 'text-bold' : ''}
                    to={getFilterUrl({ price: 'all' })}
                  >
                    Tất cả sản phẩm
                  </Link>
                </li>
                {prices.map((p) => (
                  <li key={p.value}>
                    <Link
                      to={getFilterUrl({ price: p.value })}
                      className={p.value === price ? 'text-bold' : ''}
                    >
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Đánh giá</h3>
              <ul>
                {ratings.map((r) => (
                  <li key={r.name}>
                    <Link
                      to={getFilterUrl({ rating: r.rating })}
                      className={`${r.rating}` === `${rating}` ? 'text-bold' : ''}
                    >
                      <Rating caption={' trở lên'} rating={r.rating}></Rating>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to={getFilterUrl({ rating: 'all' })}
                    className={rating === 'all' ? 'text-bold' : ''}
                  >
                    <Rating caption={' trở lên'} rating={0}></Rating>
                  </Link>
                </li>
              </ul>
            </div>
          </Col>
          <Col md={9}>
            {loading ? (
              <LoadingBox></LoadingBox>
            ) : error ? (
              <MessageBox variant="danger">{error}</MessageBox>
            ) : (
              <>
                <Row className="justify-content-between mb-3">
                  <Col md={6}>
                    <div className='search-result-button'>
                      {countProducts === 0 ? 'Không' : countProducts} kết quả
                      {query !== 'all' && ' : ' + query}
                      {category !== 'all' && ' : ' + renderCategoryName(category)}
                      {style !== 'all' && ' : ' + renderStyleName(style)}
                      {place !== 'all' && ' : ' + renderPlaceName(place)}
                      {price !== 'all' && ' : Giá ' + price}
                      {rating !== 'all' && ' : Đánh giá ' + rating + ' & up'}
                      {query !== 'all' ||
                      category !== 'all' ||
                      style !== 'all' ||
                      rating !== 'all' ||
                      price !== 'all' ? (
                        <Button
                          variant="light"
                          onClick={() => navigate('/search')}
                          className='button-search'
                        >
                          <i className="fas fa-times-circle"></i>
                        </Button>
                      ) : null}
                    </div>
                  </Col>
                <Col className="text-end">
                  Sắp xếp theo{' '}
                    <select
                      value={order}
                      onChange={(e) => {
                        navigate(getFilterUrl({ order: e.target.value }));
                      }}
                    >
                      <option value="newest">Mới nhất</option>
                      <option value="lowest">Giá: Thấp đến Cao</option>
                      <option value="highest">Giá: Cao đến thấp</option>
                      <option value="toprated">Đánh giá</option>
                    </select>
                  </Col>
                </Row>
                {products.length === 0 && (
                  <MessageBox>Không tìm thấy sản phẩm</MessageBox>
                )}
  
                <Row>
                  {products.map((product) => (
                    <Col sm={6} lg={4} className="mb-3" key={product._id}>
                      <Product product={product}></Product>
                    </Col>
                  ))}
                </Row>
  
                <div>
                  {[...Array(pages).keys()].map((x) => (
                    <LinkContainer
                    key={x + 1}
                    className="mx-1"
                    to={getFilterUrl({ page: x + 1 })}
                  >
                    <Button
                      className={Number(page) === x + 1 ? 'text-bold' : ''}
                      variant="light"
                    >
                      {x + 1}
                    </Button>
                  </LinkContainer>
                ))}
              </div>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
}