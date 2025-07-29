import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Manage loading state here

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      toast.success('تم تسجيل الخروج بنجاح');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    }
  }, []);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false); // Set loading to false after auth state is determined
    });

    return () => unsubscribeAuth();
  }, []); // No dependency on setLoading needed

  return (
    <AuthContext.Provider value={{ user, loading, setLoading, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};