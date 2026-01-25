//@ts-nocheck

import { Box, Stack, Typography } from '@mui/material';
import { FC, useMemo } from 'react';
import { IProduct } from '@/cmsTabs/Products/types';

interface IMiniProductCardProps {
  product: IProduct;
  count: number;
  selectorValue?: string;
}

export const MiniProductCard: FC<IMiniProductCardProps> = ({ product, count, selectorValue }) => {
  const cover = useMemo(() => {
    const first = product?.images?.[0];
    return first || undefined;
  }, [product?.images]);

  return (
    <Stack
      direction='row'
      gap={1.5}
      p={1.5}
      sx={{
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
          {product?.name}
        </Typography>
        <Stack direction='row' gap={1} alignItems='center'>
          <Typography fontSize={13} color='text.secondary'>
            {product?.price} $ x {count}
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
          {(product?.price * count).toFixed(2)} $
        </Typography>
      </Stack>
    </Stack>
  );
};
