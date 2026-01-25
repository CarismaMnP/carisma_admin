// @ts-nocheck
import { Box, Button, Chip, Divider, InputAdornment, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { FC, useState } from 'react';
import { IOrder } from '@/cmsTabs/Orders/types';
import { API } from '@/api';
import { ORDER_STATE_OPTIONS } from '@/cmsTabs/Orders/utils.ts';
import { MiniProductCard } from '@/cmsTabs/Orders/components/MiniProductCard.tsx';

interface IOrderFormProps {
  onFinish: () => void;
  order?: IOrder;
  mode: 'create' | 'edit';
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStateColor = (state: string) => {
  switch (state) {
    case 'pending':
      return 'warning';
    case 'paid':
      return 'success';
    case 'shipped':
      return 'info';
    case 'delivered':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

export const OrderForm: FC<IOrderFormProps> = ({ onFinish, order, mode }) => {
  const isCreate = mode === 'create';

  const [state, setState] = useState<string>(order?.state || '');
  const [sum, setSum] = useState<number | ''>(order?.sum || '');

  const onSubmit = async () => {
    if (!sum) return;
    try {
      if (!isCreate) {
        await API.put('/order', { state, sum }, { params: { id: order?.id } });
        onFinish && onFinish();
        return;
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Stack
      gap='16px'
      p='20px'
      width='100%'
      sx={{ background: 'linear-gradient(145deg, #ffffff 0%, #f5f7fb 100%)', borderRadius: '18px' }}
    >
      <Stack direction='row' justifyContent='space-between' alignItems='flex-start'>
        <Stack gap={0.5}>
          <Typography variant='h6'>{isCreate ? 'New Order' : 'Edit Order'}</Typography>
          <Typography variant='body2' color='text.secondary'>
            Order ID: {order?.id}
          </Typography>
        </Stack>
        <Chip label={order?.state} color={getStateColor(order?.state || '')} size='small' />
      </Stack>

      <Divider />

      <Box display='grid' gridTemplateColumns='repeat(auto-fit, minmax(260px, 1fr))' gap='14px'>
        <TextField label='Status' select value={state} onChange={e => setState(e.target.value)}>
          {ORDER_STATE_OPTIONS.map(categoryOption => (
            <MenuItem key={categoryOption.value} value={categoryOption.value}>
              {categoryOption.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label='Order Sum'
          fullWidth
          placeholder='Enter sum'
          value={sum}
          onChange={e => setSum(+e.target.value)}
          type='number'
          slotProps={{
            input: {
              endAdornment: <InputAdornment position='start'>$</InputAdornment>,
            },
          }}
        />
      </Box>

      <Stack gap='12px' p='16px' sx={{ background: '#f8fafc', borderRadius: '12px' }}>
        <Typography variant='subtitle2' fontWeight={600}>
          Order Summary
        </Typography>
        <Stack direction='row' justifyContent='space-between'>
          <Typography fontSize={14} color='text.secondary'>
            Subtotal:
          </Typography>
          <Typography fontSize={14}>${order?.sum?.toFixed(2) || '0.00'}</Typography>
        </Stack>
        <Stack direction='row' justifyContent='space-between'>
          <Typography fontSize={14} color='text.secondary'>
            Tax:
          </Typography>
          <Typography fontSize={14}>${order?.tax?.toFixed(2) || '0.00'}</Typography>
        </Stack>
        <Divider />
        <Stack direction='row' justifyContent='space-between'>
          <Typography fontSize={14} fontWeight={600}>
            Total:
          </Typography>
          <Typography fontSize={14} fontWeight={600}>
            ${order?.total?.toFixed(2) || '0.00'}
          </Typography>
        </Stack>
      </Stack>

      <Stack gap='12px' p='16px' sx={{ background: '#f8fafc', borderRadius: '12px' }}>
        <Typography variant='subtitle2' fontWeight={600}>
          Customer Information
        </Typography>
        <Box display='grid' gridTemplateColumns='repeat(auto-fit, minmax(200px, 1fr))' gap='8px'>
          <Stack>
            <Typography fontSize={12} color='text.secondary'>
              Full Name
            </Typography>
            <Typography fontSize={14}>{order?.fullName || '-'}</Typography>
          </Stack>
          <Stack>
            <Typography fontSize={12} color='text.secondary'>
              Phone
            </Typography>
            <Typography fontSize={14}>{order?.phone || '-'}</Typography>
          </Stack>
          <Stack>
            <Typography fontSize={12} color='text.secondary'>
              Email
            </Typography>
            <Typography fontSize={14}>{order?.mail || '-'}</Typography>
          </Stack>
          <Stack>
            <Typography fontSize={12} color='text.secondary'>
              User ID
            </Typography>
            <Typography fontSize={14}>{order?.userId || '-'}</Typography>
          </Stack>
        </Box>
      </Stack>

      <Stack gap='12px' p='16px' sx={{ background: '#f8fafc', borderRadius: '12px' }}>
        <Typography variant='subtitle2' fontWeight={600}>
          Shipping Address
        </Typography>
        <Box display='grid' gridTemplateColumns='repeat(auto-fit, minmax(200px, 1fr))' gap='8px'>
          <Stack>
            <Typography fontSize={12} color='text.secondary'>
              Delivery Type
            </Typography>
            <Typography fontSize={14} textTransform='uppercase'>
              {order?.delivey_type || '-'}
            </Typography>
          </Stack>
          <Stack>
            <Typography fontSize={12} color='text.secondary'>
              Country
            </Typography>
            <Typography fontSize={14}>{order?.country || '-'}</Typography>
          </Stack>
          <Stack>
            <Typography fontSize={12} color='text.secondary'>
              State
            </Typography>
            <Typography fontSize={14}>{order?.addressState || '-'}</Typography>
          </Stack>
          <Stack>
            <Typography fontSize={12} color='text.secondary'>
              City
            </Typography>
            <Typography fontSize={14}>{order?.city || '-'}</Typography>
          </Stack>
          <Stack>
            <Typography fontSize={12} color='text.secondary'>
              ZIP Code
            </Typography>
            <Typography fontSize={14}>{order?.zip_code || '-'}</Typography>
          </Stack>
          <Stack>
            <Typography fontSize={12} color='text.secondary'>
              Address Line 1
            </Typography>
            <Typography fontSize={14}>{order?.address_line_1 || '-'}</Typography>
          </Stack>
          {order?.address_line_2 && (
            <Stack>
              <Typography fontSize={12} color='text.secondary'>
                Address Line 2
              </Typography>
              <Typography fontSize={14}>{order?.address_line_2}</Typography>
            </Stack>
          )}
        </Box>
        {order?.delivery_instructions && (
          <Stack mt={1}>
            <Typography fontSize={12} color='text.secondary'>
              Delivery Instructions
            </Typography>
            <Typography fontSize={14}>{order?.delivery_instructions}</Typography>
          </Stack>
        )}
      </Stack>

      <Stack gap='12px' p='16px' sx={{ background: '#f8fafc', borderRadius: '12px' }}>
        <Typography variant='subtitle2' fontWeight={600}>
          Payment & Dates
        </Typography>
        <Box display='grid' gridTemplateColumns='repeat(auto-fit, minmax(200px, 1fr))' gap='8px'>
          <Stack>
            <Typography fontSize={12} color='text.secondary'>
              Stripe Payment Intent
            </Typography>
            <Typography fontSize={14} sx={{ wordBreak: 'break-all' }}>
              {order?.stripePaymentIntentId || 'Not available'}
            </Typography>
          </Stack>
          <Stack>
            <Typography fontSize={12} color='text.secondary'>
              Created At
            </Typography>
            <Typography fontSize={14}>{formatDate(order?.createdAt || '')}</Typography>
          </Stack>
          <Stack>
            <Typography fontSize={12} color='text.secondary'>
              Updated At
            </Typography>
            <Typography fontSize={14}>{formatDate(order?.updatedAt || '')}</Typography>
          </Stack>
        </Box>
      </Stack>

      <Button fullWidth variant='contained' size='large' onClick={onSubmit}>
        {isCreate ? 'Create' : 'Save Changes'}
      </Button>

      <Stack gap='12px'>
        <Typography variant='subtitle2' fontWeight={600}>
          Order Products ({order?.orderProducts?.length || 0})
        </Typography>
        <Stack gap='8px'>
          {order?.orderProducts?.map(item => (
            <MiniProductCard
              key={item?.id}
              product={item?.product}
              count={item?.count}
              selectorValue={item?.selectorValue}
            />
          ))}
          {(!order?.orderProducts || order?.orderProducts?.length === 0) && (
            <Typography fontSize={14} color='text.secondary' textAlign='center' py={2}>
              No products in this order
            </Typography>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};
