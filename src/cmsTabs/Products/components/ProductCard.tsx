//@ts-nocheck

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { FC, useMemo, useState } from 'react';

import { ActionsCard } from '@/shared';
import { IProduct } from '@/cmsTabs/Products/types';
import { API } from '@/api';
import { ProductForm } from '@/cmsTabs/Products/components/ProductForm';

interface IProductCardProps {
  product: IProduct;
  count?: number;
  actionCallback?: () => Promise<void>;
  readonly?: boolean;
  selectorValue?: string;
}

export const ProductCard: FC<IProductCardProps> = ({
  product,
  count,
  actionCallback,
  readonly,
  selectorValue,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);

  const onFinishDelete = async () => {
    try {
      await API.delete('/product', { params: { id: product?.id } });
      actionCallback && (await actionCallback());
      setShowDeleteModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const onFinishCopy = async () => {
    await actionCallback?.();
    setShowCopyModal(false);
  };

  const cover = useMemo(() => {
    const first = product?.images?.[0];
    if (!first) return undefined;
    return first;
  }, [product?.images]);

  const alsoFits = useMemo(() => {
    if (!product?.ebayAlsoFits) return [];
    if (typeof product.ebayAlsoFits === 'string') {
      try {
        const parsed = JSON.parse(product.ebayAlsoFits);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return product.ebayAlsoFits
          .split(',')
          .map(p => p.trim())
          .filter(Boolean);
      }
    }
    return product.ebayAlsoFits.filter(Boolean);
  }, [product?.ebayAlsoFits]);

  const stock = useMemo(() => {
    const value = count ?? product?.count;
    return value === undefined ? null : value;
  }, [count, product?.count]);

  return (
    <>
      <ActionsCard
        readonly={readonly}
        onDelete={() => setShowDeleteModal(true)}
        onCopy={() => setShowCopyModal(true)}
        showEdit={false}
        showDelete={!readonly}
        showCopy={!readonly}
      >
        <Stack gap={1}>
          <Box
            width='100%'
            sx={{ aspectRatio: 1, overflow: 'hidden', borderRadius: '12px', background: '#f8fafc' }}
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
                <Typography variant='caption'>Нет изображения</Typography>
              </Stack>
            )}
          </Box>
          <Typography px='4px' fontWeight={700}>
            {product?.name}
          </Typography>
          <Typography px='4px' color='text.secondary'>
            {product?.about || 'Описание не указано'}
          </Typography>
          <Stack direction='row' justifyContent='space-between' px='4px' alignItems='center'>
            <Typography fontWeight={700}>{product?.price} $</Typography>
            <Typography variant='body2' color='text.secondary'>
              {stock !== null ? `В наличии: ${stock}` : 'Сток не указан'}
            </Typography>
          </Stack>
          {(product?.ebayModel || product?.ebayCategory || product?.make || selectorValue) && (
            <Typography px='4px' variant='body2' color='text.secondary'>
              {product?.make && `${product.make}`}
              {product?.ebayModel && ` • ${product.ebayModel}`}
              {product?.ebayCategory && ` • ${product.ebayCategory}`}
              {selectorValue && ` • ${selectorValue}`}
            </Typography>
          )}
        </Stack>
      </ActionsCard>

      {showDeleteModal && (
        <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
          <DialogTitle>Удалить товар?</DialogTitle>
          <DialogContent>
            <Typography>Удаление нельзя будет отменить.</Typography>
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

      {showCopyModal && (
        <Dialog maxWidth='md' fullWidth open={showCopyModal} onClose={() => setShowCopyModal(false)}>
          <DialogTitle>Копировать товар</DialogTitle>
          <DialogContent>
            <ProductForm product={product} onFinish={onFinishCopy} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
