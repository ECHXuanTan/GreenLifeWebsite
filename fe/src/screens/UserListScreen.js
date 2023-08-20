import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../store';
import { getError } from '../utils';
import Papa from 'papaparse';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        users: action.payload,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return {
        ...state,
        loadingDelete: false,
        successDelete: true,
      };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
};
export default function UserListScreen() {
  const navigate = useNavigate();

  const [{ loading, error, users, loadingDelete, successDelete }, dispatch] =
  useReducer(reducer, {
    loading: true,
    error: '',
  });

  const { state } = useContext(Store);
  const { userInfo } = state;
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [errorEmails, setErrorEmails] = useState('');
  const [emailAddresses, setEmailAddresses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/users`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [userInfo, successDelete]);

  const deleteHandler = async (user) => {
    if (window.confirm('Bạn muốn xóa tài khoản này?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });
        await axios.delete(`/api/users/${user._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success('Xóa người dùng thành công');
        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (error) {
        toast.error(getError(error));
        dispatch({
          type: 'DELETE_FAIL',
        });
      }
    }
  };
  
  
  const getAudience = async () => {
    setLoadingEmails(true);
    setErrorEmails('');
    try {
      const response = await axios.get(`/api/mailchimp/audiance`);
      console.log(response.data);
      const members = response.data.response.members; // Access the members array

      const extractedEmailAddresses = members.map((member) => member.email_address);
      setEmailAddresses(extractedEmailAddresses);
    // console.log(extractedEmailAddresses);
  } catch (error) {
    setErrorEmails("An error occurred while fetching email addresses");
  }
  setLoadingEmails(false);
};

const exportEmailsToCSV = () => {
  const data = emailAddresses.map((email) => ({ email }));
  const csvData = Papa.unparse(data);
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'email_addresses.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  return (
    <div>
      <Helmet>
        <title>Người dùng</title>
      </Helmet>
      <h1>Người dùng</h1>
      {loadingDelete && <LoadingBox></LoadingBox>}
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên người dùng</th>
              <th>Email</th>
              <th>Quản lý</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.isAdmin ? 'Phải' : 'Không'}</td>
                <td>
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => navigate(`/admin/user/${user._id}`)}
                  >
                    Chỉnh sửa
                  </Button>
                  &nbsp;
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => deleteHandler(user)}
                  >
                    Xóa
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
       <button className='viewEmailMailChimp' onClick={getAudience}>Xem email đăng ký trên mailchimp</button>
      {loadingEmails ? (
        <LoadingBox></LoadingBox>
      ) : errorEmails ? (
        <MessageBox variant="danger">{errorEmails}</MessageBox>
      ) : (
        emailAddresses.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {emailAddresses.map((email, index) => (
                <tr key={index}>
                  <td>{email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
      <button className='exportButton' onClick={exportEmailsToCSV}>Xuất file Excel</button>
    </div>
  );
}