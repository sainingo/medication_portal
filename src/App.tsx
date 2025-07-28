import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRoutes } from './AppRoutes';
import { ToastContainer } from './components/ui/Toast';
import { AuthProvider } from './context/AuthContext';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      {/* for prod ensure this basename is applied
        /* basename="/med-portal"
       */}
      <Router basename="/med-portal">
      <AuthProvider>
      <AppRoutes />
      </AuthProvider>
        
        <ToastContainer />
      </Router>
    </QueryClientProvider>
  );
};

export default App;