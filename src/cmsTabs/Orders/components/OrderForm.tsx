// @ts-nocheck
import { Box, Button, InputAdornment, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { FC, useState } from 'react';
import { IOrder } from '@/cmsTabs/Orders/types';
import { API } from '@/api';
import { ORDER_STATE_OPTIONS } from '@/cmsTabs/Orders/utils.ts';
import { ProductCard } from '@/cmsTabs/Products/components/ProductCard.tsx';

interface IOrderFormProps {
  onFinish: () => void;
  order?: IOrder;
  mode: 'create' | 'edit';
}

export const OrderForm: FC<IOrderFormProps> = ({ onFinish, order, mode }) => {
  const isCreate = mode === 'create';

  const [state, setState] = useState<string>(order?.state || '');
  const [sum, setSum] = useState<number | ''>(order?.sum || '');
  const [name] = useState(order?.name || '');
  const [phone] = useState(order?.phone || '');
  const [mail] = useState(order?.mail || '');
  const [address] = useState(order?.address || '');
  const [flat] = useState(order?.flat || '');
  const [building] = useState(order?.building || '');
  const [floor] = useState(order?.floor || '');
  const [intercom] = useState(order?.intercom || '');
  const [comment] = useState(order?.comment || '');
  const [city] = useState(order?.city || '');
  const [cdekCityId] = useState(order?.cdekCityId || '');
  const [officeName] = useState(order?.officeName || '');
  const [cdekOfficeId] = useState(order?.cdekOfficeId || '');
  const [type] = useState(order?.type || '');
  const [deliveryName] = useState(order?.deliveryName || '');
  const [deliveryPrice] = useState(order?.deliveryPrice || '');
  const [deliveryCdekId] = useState(order?.deliveryCdekId || '');

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
      p='16px'
      width='100%'
      sx={{ background: 'linear-gradient(145deg, #ffffff 0%, #f5f7fb 100%)', borderRadius: '18px' }}
    >
      <Stack gap={0.5}>
        <Typography variant='h6'>{isCreate ? 'Новый заказ' : 'Редактировать заказ'}</Typography>
        <Typography variant='body2' color='text.secondary'>
          Обновите статус и сумму, чтобы синхронизировать заказ с пользователем.
        </Typography>
      </Stack>

      <Box display='grid' gridTemplateColumns='repeat(auto-fit, minmax(260px, 1fr))' gap='14px'>
        <TextField label='Статус' select value={state} onChange={e => setState(e.target.value)}>
          {ORDER_STATE_OPTIONS.map(categoryOption => (
            <MenuItem key={categoryOption.value} value={categoryOption.value}>
              {categoryOption.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label='Сумма заказа'
          fullWidth
          placeholder='Введите сумму'
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

      <Stack gap='6px'>
        <Typography variant='subtitle2' color='text.secondary'>
          Данные клиента
        </Typography>
        <Typography fontSize={14}>Имя: {name}</Typography>
        <Typography fontSize={14}>Телефон: {phone}</Typography>
        <Typography fontSize={14}>Email: {mail}</Typography>
        <Typography fontSize={14}>Тип доставки: {type}</Typography>
        {cdekCityId && <Typography fontSize={14}>ID города в CDEK: {cdekCityId}</Typography>}
        {officeName && <Typography fontSize={14}>ПВЗ: {officeName}</Typography>}
        {cdekOfficeId && <Typography fontSize={14}>ID ПВЗ CDEK: {cdekOfficeId}</Typography>}
        <Typography fontSize={14}>Способ доставки: {deliveryName}</Typography>
        <Typography fontSize={14}>Тариф доставки: {deliveryPrice}$</Typography>
        {deliveryCdekId && <Typography fontSize={14}>ID тарифа CDEK: {deliveryCdekId}</Typography>}
        <Typography fontSize={14}>Город доставки: {city}</Typography>
        {address && <Typography fontSize={14}>Адрес: {address}</Typography>}
        {flat && <Typography fontSize={14}>Квартира: {flat}</Typography>}
        {building && <Typography fontSize={14}>Подъезд: {building}</Typography>}
        {floor && <Typography fontSize={14}>Этаж: {floor}</Typography>}
        {intercom && <Typography fontSize={14}>Домофон: {intercom}</Typography>}
        {comment && <Typography fontSize={14}>Комментарий: {comment}</Typography>}
      </Stack>

      <Button fullWidth variant='contained' size='large' onClick={onSubmit}>
        {isCreate ? 'Создать' : 'Сохранить изменения'}
      </Button>

      <Typography variant='subtitle2' color='text.secondary'>
        Товары в заказе:
      </Typography>
      <Box display='grid' gridTemplateColumns='repeat(auto-fit, minmax(240px, 1fr))' width='100%' gap='12px'>
        {order?.orderProducts?.map(product => (
          <ProductCard
            key={product?.id}
            product={product?.product}
            readonly
            count={product?.count}
            selectorValue={product?.selectorValue}
          />
        ))}
      </Box>
    </Stack>
  );
};
