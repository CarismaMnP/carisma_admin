import { Button, Dialog, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { API } from '@/api';

import { CategoryCard } from './components/CategoryCard';
import { ICategory } from './types';
import { CategoryForm } from '@/cmsTabs/Categories/components/CategoryForm';

export const CategoriesTab = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const getCategories = async () => {
    try {
      const { data: response } = await API.get('/category');
      if (response) setCategories(response.filter((p: ICategory) => !p?.isDeleted));
    } catch (e) {
      console.error(e);
    }
  };

  const onFinishAdd = async () => {
    await getCategories();
    setShowAddModal(false);
  };

  useEffect(() => {
    getCategories();
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
          <Typography variant='h6'>Категории</Typography>
          <Typography variant='body2' color='text.secondary'>
            Управляйте группами товаров и их иерархией.
          </Typography>
        </Stack>
        <Button variant='contained' onClick={() => setShowAddModal(true)}>
          Создать категорию
        </Button>
      </Stack>
      <Stack width='100%' gap='20px'>
        {categories.map(category => (
          <CategoryCard key={category?.id} category={category} actionCallback={getCategories} />
        ))}

        {showAddModal && (
          <Dialog open={showAddModal} onClose={() => setShowAddModal(false)}>
            <DialogTitle>Создать категорию</DialogTitle>
            <DialogContent>
              <CategoryForm onFinish={onFinishAdd} mode='create' />
            </DialogContent>
          </Dialog>
        )}
      </Stack>
    </Stack>
  );
};
