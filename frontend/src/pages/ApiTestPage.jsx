import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import chatApi from '../api/chatApi';
import { API_BASE_URL } from '../api/apiConfig';

const ApiTestPage = () => {
  const { user, token } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testChatRoomApi = async () => {
    setLoading(true);
    try {
      console.log('Testing chat room API...');
      const response = await chatApi.getOrCreateChatRoom();
      console.log('API Response:', response);
      setResult(response);
    } catch (error) {
      console.error('API Error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testDirectFetch = async () => {
    setLoading(true);
    try {
      console.log('Testing direct fetch...');
      const response = await fetch(`${API_BASE_URL}/chat/room`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      setResult(data);
    } catch (error) {
      console.error('Fetch Error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testDebugUsers = async () => {
    setLoading(true);
    try {
      console.log('Testing debug users API...');
      const response = await fetch(`${API_BASE_URL}/chat/debug/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      setResult(data);
    } catch (error) {
      console.error('Fetch Error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Please login first</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">API Test Page</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testChatRoomApi}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {loading ? 'Testing...' : 'Test Chat Room API (via chatApi)'}
        </button>
        
        <button
          onClick={testDirectFetch}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300 ml-2"
        >
          {loading ? 'Testing...' : 'Test Direct Fetch'}
        </button>
        
        <button
          onClick={testDebugUsers}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded disabled:bg-gray-300 ml-2"
        >
          {loading ? 'Testing...' : 'Test Debug Users'}
        </button>
      </div>

      {result && (
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-bold mb-2">Result:</h2>
          <pre className="text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ApiTestPage;