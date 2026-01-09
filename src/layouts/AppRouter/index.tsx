import { Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { API } from '@/api';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { CircularProgress, Stack } from '@mui/material';
import { AuthActionsContext } from '@/contexts/authContext';

export const AppRouter = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  const refreshToken = async () => {
    try {
      const { data: response } = await API.get('/user/auth');

      if (response.status === 401 || !response.token) {
        setAuthenticated(false);
        navigate('/login');
        return;
      }
      if (response.token) {
        localStorage.setItem('token', response.token);
        setAuthenticated(true);
        // При успешной аутентификации переходим на "/" (а внутри HomePage уже разрулим редиректы)
        if(window.location.pathname === "/login"){
          navigate('/');
        }
      }
    } catch (e) {
      setAuthenticated(false);
      navigate('/login');
    }
  };

  useEffect(() => {
    refreshToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const afterLoginCallback = () => {
    refreshToken();
  };

  // Пока не знаем, аутентифицирован пользователь или нет — показываем лоадер
  if (authenticated === null) {
    return (
      <Stack width="100vw" height="100vh" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <AuthActionsContext.Provider value={{ afterLoginCallback }}>
      <Routes>
        {authenticated ? (
          <>
            <Route path='/' element={<Navigate to='/categories' replace />} />
            <Route path='/*' element={<HomePage />} />
          </>
        ) : (
          <Route path='/login' element={<LoginPage />} />
        )}
      </Routes>
    </AuthActionsContext.Provider>
  );
};
