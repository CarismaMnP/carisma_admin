//@ts-nocheck

import { Box, Stack, Typography } from '@mui/material';
import {Link} from 'react-router-dom';
import { FC, useMemo } from 'react';
import { IProduct } from '@/cmsTabs/Products/types';

interface IMiniProductCardProps {
  product: IProduct;
  count: number;
  unitPriceCents?: number | null;
  discountCents?: number;
  productSnapshot?: {name?: string; stock?: string | null; tag?: string | null};
  selectorValue?: string;
}

export const MiniProductCard: FC<IMiniProductCardProps> = ({ product, count, selectorValue, unitPriceCents, productSnapshot, discountCents=0 }) => {
  const price = unitPriceCents != null ? unitPriceCents / 100 : product?.price;
  const cover = useMemo(() => {
    const first = product?.images?.[0];
    return typeof first === "string" ? first : first?.imageUrl;
  }, [product?.images]);

  return (
    <Stack
      component={product?.link?Link:'div'}
      {...(product?.link?{to:'/products?product='+encodeURIComponent(product.link),target:'_blank',rel:'noopener noreferrer'}:{})}
      direction='row'
      gap={1.5}
      p={1.5}
      sx={{
        color:'inherit',textDecoration:'none','&:hover':{borderColor:'#0f766e'},
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          minWidth: 64,
          borderRadius: '8px',
          overflow: 'hidden',
          background: '#f8fafc',
        }}
      >
        {cover ? (
          <Box
            component='img'
            src={cover}
            alt={product?.name}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Stack height='100%' alignItems='center' justifyContent='center' color='text.secondary'>
            <Typography variant='caption' fontSize={10}>
              No image
            </Typography>
          </Stack>
        )}
      </Box>

      <Stack flex={1} minWidth={0} justifyContent='center'>
        <Typography fontWeight={600} fontSize={14} noWrap>
          {productSnapshot?.name || product?.name}
        </Typography>
        <Typography fontSize={12} color='text.secondary'>Stock number: {productSnapshot?.stock ?? product?.carpartsData?.stock ?? '—'} · Tag number: {productSnapshot?.tag ?? product?.carpartsTag ?? '—'}</Typography>
        <Stack direction='row' gap={1} alignItems='center'>
          <Typography fontSize={13} color='text.secondary'>
            {price} $ x {count}
          </Typography>
          {selectorValue && (
            <Typography fontSize={12} color='text.secondary'>
              ({selectorValue})
            </Typography>
          )}
        </Stack>
      </Stack>

      <Stack justifyContent='center' alignItems='flex-end'>
        <Typography fontWeight={700} fontSize={14}>
          {(price * count-discountCents/100).toFixed(2)} $
        </Typography>
      </Stack>
    </Stack>
  );
};
