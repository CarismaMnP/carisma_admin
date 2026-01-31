import {
  Autocomplete,
  Box,
  Button,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { API } from '@/api';
import { AddValuesField } from '@/shared';
import { MuiFileInput } from 'mui-file-input';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { checkFormValidation, normalizeJsonField } from '@/cmsTabs/Products/utils.ts';
import { slugify } from 'transliteration';
import { IProduct } from '@/cmsTabs/Products/types';

interface IProductFormProps {
  onFinish: () => void;
  product?: IProduct;
}

export const ProductForm: FC<IProductFormProps> = ({ onFinish, product }) => {
  const [name, setName] = useState(product?.name || '');
  const [link, setLink] = useState(product?.link || '');
  const [price, setPrice] = useState<number | ''>(product?.price || '');
  const [make, setMake] = useState(product?.make || '');
  const [about, setAbout] = useState(product?.about || '');
  const [additionalFields, setAdditionalFields] = useState(
    typeof product?.additionalFields === 'object'
      ? JSON.stringify(product.additionalFields, null, 2)
      : product?.additionalFields || ''
  );
  const [ebayCategory, setEbayCategory] = useState(product?.ebayCategory || '');
  const [ebayModel, setEbayModel] = useState(product?.ebayModel || '');
  const [ebayYear, setEbayYear] = useState(product?.ebayYear || '');
  const [ebayAdditionalNotes, setEbayAdditionalNotes] = useState(product?.ebayAdditionalNotes || '');
  const [count, setCount] = useState<number | ''>(product?.count || '');
  const [ebayAlsoFits, setEbayAlsoFits] = useState<string[]>(
    Array.isArray(product?.ebayAlsoFits) ? product.ebayAlsoFits : []
  );
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [makes, setMakes] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchMakes = async () => {
    try {
      const { data } = await API.get('/product/makes');
      setMakes(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await API.get('/product/categories');
      setCategories(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMakes();
    fetchCategories();
  }, []);

  const onSubmit = async () => {
    if (!checkFormValidation(name, link, price)) return;

    const data = {
      name,
      link,
      price,
      make: make || undefined,
      about: about || undefined,
      additionalFields: normalizeJsonField(additionalFields),
      ebayCategory: ebayCategory || undefined,
      ebayModel: ebayModel || undefined,
      ebayYear: ebayYear || undefined,
      ebayAdditionalNotes: ebayAdditionalNotes || undefined,
      count: count === '' ? undefined : count,
      ebayAlsoFits: ebayAlsoFits?.length ? ebayAlsoFits : undefined,
    };

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('data', JSON.stringify(data));

    try {
      await API.post('/product/manual', formData);
      onFinish && onFinish();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!product) {
      setLink(slugify(name));
    }
  }, [name, product]);

  useEffect(() => {
    if (!files?.length) {
      setPreviews([]);
      return;
    }
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [files]);

  const numberOrEmpty = (value: string) => (value === '' ? '' : +value);

  return (
    <Stack
      gap='16px'
      minWidth='720px'
      p='16px'
      sx={{ background: 'linear-gradient(145deg, #ffffff 0%, #f5f7fb 100%)', borderRadius: '18px' }}
    >
      <Stack gap={0.5}>
        <Typography variant='h6'>{product ? 'Копировать товар' : 'Добавить товар вручную'}</Typography>
        <Typography variant='body2' color='text.secondary'>
          {product
            ? 'Данные скопированы из товара. Изображения нужно загрузить заново.'
            : 'Заполните карточку и загрузите фото. Записи будут отмечены как isManual и не затрутся синхронизацией eBay.'}
        </Typography>
      </Stack>

      <Box display='grid' gridTemplateColumns='repeat(auto-fit, minmax(320px, 1fr))' gap='16px'>
        <TextField
          label='Название'
          fullWidth
          placeholder='Введите название'
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <TextField
          label='Ссылка'
          fullWidth
          placeholder='Автогенерация из названия'
          helperText='Можно скорректировать вручную'
          value={link}
          onChange={e => setLink(e.target.value)}
        />

        <TextField
          label='Цена'
          fullWidth
          placeholder='Введите цену'
          value={price}
          onChange={e => setPrice(numberOrEmpty(e.target.value))}
          type='number'
          slotProps={{
            input: {
              endAdornment: <InputAdornment position='start'>$</InputAdornment>,
            },
          }}
        />

        <TextField
          label='Количество (stock)'
          fullWidth
          placeholder='Опционально'
          value={count}
          onChange={e => setCount(numberOrEmpty(e.target.value))}
          type='number'
        />

        <Autocomplete
          freeSolo
          options={makes.filter(Boolean)}
          value={make}
          onChange={(_, newValue) => setMake(newValue || '')}
          onInputChange={(_, newValue) => setMake(newValue)}
          renderInput={params => (
            <TextField {...params} label='Марка автомобиля (Brand)' placeholder='Например, BMW, Mercedes' />
          )}
        />

        <Autocomplete
          freeSolo
          options={categories.filter(Boolean)}
          value={ebayCategory}
          onChange={(_, newValue) => setEbayCategory(newValue || '')}
          onInputChange={(_, newValue) => setEbayCategory(newValue)}
          renderInput={params => <TextField {...params} label='Категория' placeholder='Выберите или введите категорию' />}
        />

        <TextField
          label='Модель'
          fullWidth
          placeholder='Например, Honda CR-V'
          value={ebayModel}
          onChange={e => setEbayModel(e.target.value)}
        />

        <TextField
          label='Год'
          fullWidth
          placeholder='Например, 2019'
          value={ebayYear}
          onChange={e => setEbayYear(e.target.value)}
        />
      </Box>

      <Divider />

      <Box display='grid' gridTemplateColumns='repeat(auto-fit, minmax(320px, 1fr))' gap='16px'>
        <TextField
          label='Описание'
          multiline
          minRows={3}
          fullWidth
          placeholder='Расскажите про товар'
          value={about}
          onChange={e => setAbout(e.target.value)}
        />

        <TextField
          label='Доп. поля (JSON)'
          multiline
          minRows={3}
          fullWidth
          placeholder='{"color": "black", "material": "steel"}'
          value={additionalFields}
          onChange={e => setAdditionalFields(e.target.value)}
        />

        <TextField
          label='Примечания'
          multiline
          minRows={3}
          fullWidth
          placeholder='Особые условия или доп. инфо'
          value={ebayAdditionalNotes}
          onChange={e => setEbayAdditionalNotes(e.target.value)}
        />
      </Box>

      <AddValuesField
        label='Также подходит'
        placeholder='Нажмите Enter, чтобы добавить'
        fullWidth
        value={ebayAlsoFits}
        onChange={setEbayAlsoFits}
      />

      <Stack gap='12px'>
        <MuiFileInput
          label='Изображения товара'
          inputProps={{ accept: 'image/*' }}
          placeholder='Загрузите изображения'
          multiple
          value={files}
          onChange={setFiles}
          fullWidth
          clearIconButtonProps={{
            title: 'Remove',
            children: <DeleteForeverIcon fontSize='small' />,
          }}
        />
        {previews?.length > 0 && (
          <Box display='grid' gridTemplateColumns='repeat(auto-fit, minmax(160px, 1fr))' gap='12px'>
            {previews.map((src, index) => (
              <Box
                key={`${src}-${index}`}
                sx={{
                  border: '1px dashed #cbd5e1',
                  borderRadius: '12px',
                  p: 1,
                  backgroundColor: '#f8fafc',
                }}
              >
                <Box
                  component='img'
                  src={src}
                  alt={files[index]?.name || 'Предпросмотр'}
                  sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: '10px' }}
                />
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.5 }}>
                  {files[index]?.name}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Stack>

      <Button fullWidth variant='contained' size='large' onClick={onSubmit}>
        {product ? 'Создать копию товара' : 'Создать товар вручную'}
      </Button>
    </Stack>
  );
};
