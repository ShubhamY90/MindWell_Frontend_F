import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../context/firebase/firebase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    
    // First check localStorage for admin/psychiatrist sessions
    const checkLocalStorageAuth = () => {
      const adminToken = localStorage.getItem('admin_token');
      const adminName = localStorage.getItem('admin_name');
      const adminEmail = localStorage.getItem('admin_email');

      if (adminToken && adminName && adminEmail) {
        setUser({
          role: 'admin',
          name: adminName,
          email: adminEmail,
          token: adminToken
        });
        setLoading(false);
        return true;
      }

      const psyToken = localStorage.getItem('psy_token');
      const psyName = localStorage.getItem('psy_name');
      const psyEmail = localStorage.getItem('psy_email');
      const psyCollege = localStorage.getItem('psy_college');

      if (psyToken && psyName && psyEmail) {
        setUser({
          role: 'psychiatrist',
          name: psyName,
          email: psyEmail,
          college: psyCollege,
          token: psyToken
        });
        setLoading(false);
        return true;
      }

      return false;
    };

    // Check localStorage first
    if (checkLocalStorageAuth()) {
      return;
    }

    // If no localStorage auth, check Firebase
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.email));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const idToken = await firebaseUser.getIdToken();
            
            setUser({
              role: userData.role,
              name: userData.name,
              email: userData.email,
              token: idToken,
              college: userData.college || null
            });
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (userData) => {
    if (userData.role === 'admin') {
      localStorage.setItem('admin_token', userData.token);
      localStorage.setItem('admin_name', userData.name);
      localStorage.setItem('admin_email', userData.email);
    } else if (userData.role === 'psychiatrist') {
      localStorage.setItem('psy_token', userData.token);
      localStorage.setItem('psy_name', userData.name);
      localStorage.setItem('psy_email', userData.email);
      if (userData.college) {
        localStorage.setItem('psy_college', userData.college);
      }
    }
    setUser(userData);
    console.log('🔐 useAuth user state updated to:', userData);
  };

  const logout = async () => {
    const auth = getAuth();
    
    // Sign out from Firebase
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out from Firebase:', error);
    }
    
    // Clear admin session
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_name');
    localStorage.removeItem('admin_email');
    
    // Clear psychiatrist session
    localStorage.removeItem('psy_token');
    localStorage.removeItem('psy_name');
    localStorage.removeItem('psy_email');
    localStorage.removeItem('psy_college');
    
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout
  };
};
