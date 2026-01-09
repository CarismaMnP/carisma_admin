//@ts-nocheck

import { Button, Dialog, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { API } from '@/api';

import { ArrivalCard } from './components/ArrivalCard';
import { IArrival } from './types';
import { ArrivalForm } from './components/ArrivalForm';


export const ArrivalsTab = () => {
  const [arrivals, setArrivals] = useState<IArrival[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const getArrivals = async () => {
    try {
      const { data: response } = await API.get('/arrival');
      if (response) setArrivals(response);
    } catch (e) {
      console.error(e);
    }
  };

  const onFinishAdd = async () => {
    await getArrivals();
    setShowAddModal(false);
  };

  useEffect(() => {
    getArrivals();
  }, []);

  return (
    <Stack gap='20px' width='100%'>
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent='space-between' gap='12px'>
        <Stack gap={0.5}>
          <Typography variant='h6'>Latest arrivals cars</Typography>
        </Stack>
        <Button variant='contained' onClick={() => setShowAddModal(true)}>
          Добавить новинку
        </Button>
      </Stack>
      <Stack width='100%' gap='20px'>
        {arrivals.map(arrival => (
          <ArrivalCard key={arrival?.id} arrival={arrival} actionCallback={getArrivals} />
        ))}

        {showAddModal && (
          <Dialog open={showAddModal} onClose={() => setShowAddModal(false)} maxWidth='sm' fullWidth>
            <DialogTitle>Новое поступление</DialogTitle>
            <DialogContent>
              <ArrivalForm onFinish={onFinishAdd} mode='create' />
            </DialogContent>
          </Dialog>
        )}
      </Stack>
    </Stack>
  );
};
