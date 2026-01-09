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
import { API } from '@/api';
import { IArrival } from '../types';
import { ArrivalForm } from './arrivalForm';

interface ICategoryCardProps {
  arrival: IArrival;
  actionCallback: () => Promise<void>;
}

export const ArrivalCard: FC<ICategoryCardProps> = ({ arrival, actionCallback }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const onFinishEdit = async () => {
    actionCallback && (await actionCallback());
    setShowEditModal(false);
  };

  const onFinishDelete = async () => {
    try {
      await API.delete('/arrival', { params: { id: arrival?.id } });
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
          {arrival?.model}, {arrival?.body}, {arrival?.year}
        </Typography>
      </ActionsCard>

      {showEditModal && (
        <Dialog open={showEditModal} onClose={() => setShowEditModal(false)}>
          <DialogTitle>Редактировать поступление</DialogTitle>
          <DialogContent>
            <ArrivalForm onFinish={onFinishEdit} arrival={arrival} mode='edit' />
          </DialogContent>
        </Dialog>
      )}

      {showDeleteModal && (
        <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
          <DialogTitle>Удалить поступление?</DialogTitle>
          <DialogContent>
            <Typography>После удаления восстановить карточку будет невозможно.</Typography>
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
