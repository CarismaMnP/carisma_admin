import { Box, Button, Dialog, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { API } from '@/api';

import { ProductCard } from './components/ProductCard';
import { IProduct } from './types';
import { ProductForm } from '@/cmsTabs/Products/components/ProductForm';

export const ProductsTab = () => {
  const [count, setCount] = useState<number>(0);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const getProducts = async () => {
    try {
      const { data: response } = await API.get('/product');
      const rows = Array.isArray(response)
        ? response
        : response?.rows || response?.items || response?.data;

      if (rows) {
        const normalized = (rows as IProduct[]).filter((p: IProduct) => !p?.isDeleted);
        setProducts(normalized);
        setCount(response?.count || response?.total || normalized.length);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const onFinishAdd = async () => {
    await getProducts();
    setShowAddModal(false);
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <Stack gap='20px' width='100%'>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ md: 'center' }}
        justifyContent='space-between'
        gap='12px'
      >
        <Stack gap={0.5}>
          <Typography variant='h6'>Товары</Typography>
          <Typography variant='body2' color='text.secondary'>
            Всего позиций: {count}
          </Typography>
        </Stack>
        <Button variant='contained' onClick={() => setShowAddModal(true)}>
          Добавить товар
        </Button>
      </Stack>
      <Stack width='100%' gap='20px'>
        <Box display='grid' gridTemplateColumns='repeat(auto-fit, minmax(260px, 1fr))' gap='20px'>
          {products?.map(product => (
            <ProductCard key={product?.id} product={product} actionCallback={getProducts} />
          ))}
        </Box>

        {showAddModal && (
          <Dialog
            maxWidth='md'
            fullWidth
            open={showAddModal}
            onClose={() => setShowAddModal(false)}
          >
            <DialogTitle>Создать товар</DialogTitle>
            <DialogContent>
              <ProductForm onFinish={onFinishAdd} />
            </DialogContent>
          </Dialog>
        )}
      </Stack>
    </Stack>
  );
};
