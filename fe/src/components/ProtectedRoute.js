import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Store } from '../store';

export default function ProtectedRoute({ children }) {
  const { state } = useContext(Store);
  const { userInfo } = state;
  return userInfo ? children : <Navigate to="/signin" />;
}