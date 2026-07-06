import { useAuth } from '../context/AuthContext';

const DebugAuthPage = () => {
  const { user, isAuthenticated, isAdmin, loading, token } = useAuth();

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Debug Authentication</h1>
      
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <strong>Loading:</strong> {loading ? 'true' : 'false'}
        </div>
        
        <div>
          <strong>Is Authenticated:</strong> {isAuthenticated ? 'true' : 'false'}
        </div>
        
        <div>
          <strong>Is Admin:</strong> {isAdmin ? 'true' : 'false'}
        </div>
        
        <div>
          <strong>Token:</strong> {token ? 'Present' : 'Missing'}
        </div>
        
        <div>
          <strong>User Data:</strong>
          <pre className="bg-gray-100 p-4 rounded mt-2 text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
        
        <div>
          <strong>LocalStorage User:</strong>
          <pre className="bg-gray-100 p-4 rounded mt-2 text-sm overflow-auto">
            {localStorage.getItem('user')}
          </pre>
        </div>
        
        <div>
          <strong>LocalStorage Token:</strong>
          <pre className="bg-gray-100 p-4 rounded mt-2 text-sm overflow-auto">
            {localStorage.getItem('token')}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DebugAuthPage;