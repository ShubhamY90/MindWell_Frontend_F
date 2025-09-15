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
          const idToken = await firebaseUser.getIdToken();

          // Try users by UID first (preferred)
          let userSnapshot = await getDoc(doc(db, 'users', firebaseUser.uid));

          // If not found, try users by email (legacy schema)
          if (!userSnapshot.exists()) {
            userSnapshot = await getDoc(doc(db, 'users', firebaseUser.email));
          }

          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            setUser({
              role: userData.role || 'student',
              name: userData.name || firebaseUser.displayName || firebaseUser.email,
              email: userData.email || firebaseUser.email,
              token: idToken,
              college: userData.college || null
            });
          } else {
            // Try students collection by UID
            const studentSnapshot = await getDoc(doc(db, 'students', firebaseUser.uid));
            if (studentSnapshot.exists()) {
              const studentData = studentSnapshot.data();
              setUser({
                role: 'student',
                name: studentData.name || firebaseUser.displayName || firebaseUser.email,
                email: firebaseUser.email,
                token: idToken,
                college: studentData.college || null
              });
            } else {
              // Default to student if authenticated via Firebase but no profile doc yet
              setUser({
                role: 'student',
                name: firebaseUser.displayName || firebaseUser.email,
                email: firebaseUser.email,
                token: idToken,
                college: null
              });
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fall back to minimal student session to avoid blocking
          try {
            const idToken = await firebaseUser.getIdToken();
            setUser({
              role: 'student',
              name: firebaseUser.displayName || firebaseUser.email,
              email: firebaseUser.email,
              token: idToken,
              college: null
            });
          } catch (_) {
            setUser(null);
          }
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
