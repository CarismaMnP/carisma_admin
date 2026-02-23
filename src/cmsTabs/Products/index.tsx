import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Pagination,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { API } from '@/api';

import { ProductCard } from './components/ProductCard';
import { IProduct } from './types';
import { ProductForm } from '@/cmsTabs/Products/components/ProductForm';

export const ProductsTab = () => {
  const [count, setCount] = useState<number>(0);
  const [active, setActive] = useState<number>(0);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [search, setSearch] = useState<string>('');

  const getProducts = async () => {
    try {
      const params: any = { page, limit };
      if (search) params.search = search;

      const { data: response } = await API.get('/product', { params });

      const rows = Array.isArray(response) ? response : response?.rows || response?.items || response?.data;

      if (rows) {
        const normalized = (rows as IProduct[]).filter((p: IProduct) => !p?.isDeleted);
        setProducts(normalized);
        setCount(response?.count || response?.total || normalized.length);
        setActive(response?.active);
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
  }, [page, search]);

  const totalPages = Math.ceil(count / limit);

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
            Всего позиций: {count}, Активные: {active}
          </Typography>
        </Stack>
        <Button variant='contained' onClick={() => setShowAddModal(true)}>
          Добавить товар
        </Button>
      </Stack>

      <TextField
        label='Поиск по названию'
        placeholder='Введите название товара'
        value={search}
        onChange={e => setSearch(e.target.value)}
        fullWidth
        sx={{ maxWidth: 400 }}
      />

      <Stack width='100%' gap='20px'>
        <Box display='grid' gridTemplateColumns='repeat(auto-fit, minmax(260px, 1fr))' gap='20px'>
          {products?.map(product => (
            <ProductCard key={product?.id} product={product} actionCallback={getProducts} />
          ))}
        </Box>

        {totalPages > 1 && (
          <Stack alignItems='center'>
            <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color='primary' />
          </Stack>
        )}

        {showAddModal && (
          <Dialog maxWidth='md' fullWidth open={showAddModal} onClose={() => setShowAddModal(false)}>
            <DialogTitle>Создать товар</DialogTitle>
            <DialogContent>
              <ProductForm mode='create' onFinish={onFinishAdd} />
            </DialogContent>
          </Dialog>
        )}
      </Stack>
    </Stack>
  );
};
