import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { API } from '@/api';
import { useAuthActionsContext } from '@/contexts/authContext.ts';

export const LoginPage = () => {
  const [mail, setMail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const { afterLoginCallback } = useAuthActionsContext();

  const loginButtonHandler = async () => {
    if (!mail || !password) return;
    try {
      const { data: response } = await API.post('/user/login', { mail, password });
      if (response.token) {
        localStorage.setItem('token', response.token);
        afterLoginCallback();
      }
    } catch (e) {
      // @ts-expect-error
      console.error(e?.response?.data?.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background:
          'radial-gradient(circle at 20% 20%, rgba(14, 165, 233, 0.18), transparent 30%), linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)',
        p: 2,
      }}
    >
      <Paper
        sx={{
          width: '100%',
          maxWidth: 420,
          p: { xs: 3, md: 4 },
          borderRadius: 20,
          background: 'linear-gradient(145deg, #ffffff 0%, #f5f7fb 100%)',
        }}
      >
        <Stack gap='18px' alignItems='center'>
          <Box component='img' src={'/faunologo.svg'} alt='FAUNO' sx={{ height: 56 }} />
          <Stack gap={0.5} textAlign='center'>
            <Typography variant='h6'>Добро пожаловать</Typography>
            <Typography variant='body2' color='text.secondary'>
              Войдите, чтобы продолжить работу с админкой.
            </Typography>
          </Stack>
          <TextField
            label='E-mail'
            fullWidth
            placeholder='email@example.com'
            value={mail}
            onChange={e => setMail(e.target.value)}
            type='email'
          />
          <TextField
            label='Пароль'
            fullWidth
            placeholder='Введите пароль'
            value={password}
            onChange={e => setPassword(e.target.value)}
            type='password'
          />
          <Button fullWidth variant='contained' size='large' onClick={loginButtonHandler}>
            Войти
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
