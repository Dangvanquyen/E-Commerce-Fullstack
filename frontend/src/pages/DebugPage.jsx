import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../api/apiConfig';

const DebugPage = () => {
  const { user, token, isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    console.log('=== DEBUG PAGE ===');
    console.log('User:', user);
    console.log('Token:', token);
    console.log('IsAuthenticated:', isAuthenticated);
    console.log('IsAdmin:', isAdmin);
    console.log('==================');
  }, [user, token, isAuthenticated, isAdmin]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Debug Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-bold">User Object:</h2>
          <pre className="text-sm">{JSON.stringify(user, null, 2)}</pre>
        </div>
        
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-bold">Token:</h2>
          <p className="text-sm break-all">{token || 'No token'}</p>
        </div>
        
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-bold">Auth Status:</h2>
          <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
          <p>Admin: {isAdmin ? 'Yes' : 'No'}</p>
        </div>
        
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-bold">Environment:</h2>
          <p>API Base URL: {API_BASE_URL}</p>
        </div>
      </div>
    </div>
  );
};

export default DebugPage;