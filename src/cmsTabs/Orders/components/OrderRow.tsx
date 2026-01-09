import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { IOrder } from '../types';
import { formatDate } from '@/shared/utils/formarDate.ts';
import { ORDER_STATE_OPTIONS } from '@/cmsTabs/Orders/utils.ts';
import { API } from '@/api';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import { OrderForm } from '@/cmsTabs/Orders/components/OrderForm.tsx';

interface IOrderRowProps {
  order: IOrder;
  actionCallback: () => Promise<void>;
}

export const OrderRow: FC<IOrderRowProps> = ({ order, actionCallback }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [state, setState] = useState(order?.state);

  const changeStatusHandler = async () => {
    try {
      await API.put('/order/state', { state }, { params: { id: order?.id } });
      actionCallback && (await actionCallback());
    } catch (e) {
      console.error(e);
    }
  };

  const onFinishEdit = async () => {
    actionCallback && (await actionCallback());
    setShowEditModal(false);
  };

  const onFinishDelete = async () => {
    try {
      await API.post('/order', {}, { params: { id: order?.id } });
      actionCallback && (await actionCallback());
      setShowDeleteModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    changeStatusHandler();
  }, [state]);

  return (
    <TableRow>
      <TableCell>
        <Typography>{order?.id}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{order?.user?.name}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{order?.sum} $</Typography>
      </TableCell>
      <TableCell>
        <TextField select value={state} onChange={e => setState(e.target.value)}>
          {ORDER_STATE_OPTIONS.map(categoryOption => (
            <MenuItem key={categoryOption.value} value={categoryOption.value}>
              {categoryOption.label}
            </MenuItem>
          ))}
        </TextField>
      </TableCell>
      <TableCell>
        <Typography>{formatDate(order?.createdAt)}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{formatDate(order?.updatedAt)}</Typography>
      </TableCell>
      <TableCell>
        <Tooltip title='Подробная информация'>
          <IconButton onClick={() => setShowEditModal(true)}>
            <MoreVertIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title='Отменить заказ'>
          <IconButton onClick={() => setShowDeleteModal(true)}>
            <CloseIcon />
          </IconButton>
        </Tooltip>

        {showEditModal && (
          <Dialog
            maxWidth='md'
            fullWidth
            open={showEditModal}
            onClose={() => setShowEditModal(false)}
          >
            <DialogTitle>Редактировать заказ</DialogTitle>
            <DialogContent>
              <OrderForm onFinish={onFinishEdit} order={order} mode='edit' />
            </DialogContent>
          </Dialog>
        )}

        {showDeleteModal && (
          <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
            <DialogTitle>Отменить заказ?</DialogTitle>
            <DialogContent>
              <Typography>Отменить это действие будет невозможно.</Typography>
            </DialogContent>
            <DialogActions>
              <Button variant='contained' onClick={() => setShowDeleteModal(false)}>
                Отмена
              </Button>
              <Button variant='contained' color='error' onClick={onFinishDelete}>
                Отменить
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </TableCell>
    </TableRow>
  );
};
