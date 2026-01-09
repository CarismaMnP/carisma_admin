import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { FC, useState } from 'react';

import { ActionsCard } from '@/shared';
import { ICategory } from '@/cmsTabs/Categories/types';
import { CategoryForm } from '@/cmsTabs/Categories/components/CategoryForm';
import { API } from '@/api';

interface ICategoryCardProps {
  category: ICategory;
  actionCallback: () => Promise<void>;
}

export const CategoryCard: FC<ICategoryCardProps> = ({ category, actionCallback }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const onFinishEdit = async () => {
    actionCallback && (await actionCallback());
    setShowEditModal(false);
  };

  const onFinishDelete = async () => {
    try {
      await API.delete('/category', { params: { id: category?.id } });
      actionCallback && (await actionCallback());
      setShowDeleteModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <ActionsCard onEdit={() => setShowEditModal(true)} onDelete={() => setShowDeleteModal(true)}>
        <Typography p='10px' fontWeight={700}>
          {category?.name}
        </Typography>
      </ActionsCard>

      {showEditModal && (
        <Dialog open={showEditModal} onClose={() => setShowEditModal(false)}>
          <DialogTitle>Редактировать категорию</DialogTitle>
          <DialogContent>
            <CategoryForm onFinish={onFinishEdit} category={category} mode='edit' />
          </DialogContent>
        </Dialog>
      )}

      {showDeleteModal && (
        <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
          <DialogTitle>Удалить категорию?</DialogTitle>
          <DialogContent>
            <Typography>Категорию нельзя будет восстановить после удаления.</Typography>
          </DialogContent>
          <DialogActions>
            <Button variant='contained' onClick={() => setShowDeleteModal(false)}>
              Отмена
            </Button>
            <Button variant='contained' color='error' onClick={onFinishDelete}>
              Удалить
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};
