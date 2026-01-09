import {
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

interface IProductFormProps {
  onFinish: () => void;
}

export const ProductForm: FC<IProductFormProps> = ({ onFinish }) => {
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [about, setAbout] = useState('');
  const [additionalFields, setAdditionalFields] = useState('');
  const [ebayCategory, setEbayCategory] = useState('');
  const [ebayModel, setEbayModel] = useState('');
  const [ebayYear, setEbayYear] = useState('');
  const [ebayAdditionalNotes, setEbayAdditionalNotes] = useState('');
  const [count, setCount] = useState<number | ''>('');
  const [ebayAlsoFits, setEbayAlsoFits] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const onSubmit = async () => {
    if (!checkFormValidation(name, link, price)) return;

    const data = {
      name,
      link,
      price,
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
    setLink(slugify(name));
  }, [name]);

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
        <Typography variant='h6'>Добавить товар вручную</Typography>
        <Typography variant='body2' color='text.secondary'>
          Заполните карточку и загрузите фото. Записи будут отмечены как isManual и не затрутся синхронизацией eBay.
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

        <TextField
          label='Модель eBay'
          fullWidth
          placeholder='Например, Honda CR-V'
          value={ebayModel}
          onChange={e => setEbayModel(e.target.value)}
        />

        <TextField
          label='Категория eBay'
          fullWidth
          placeholder='Категория eBay'
          value={ebayCategory}
          onChange={e => setEbayCategory(e.target.value)}
        />

        <TextField
          label='Год (eBay)'
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
          label='Примечания eBay'
          multiline
          minRows={3}
          fullWidth
          placeholder='Особые условия или доп. инфо'
          value={ebayAdditionalNotes}
          onChange={e => setEbayAdditionalNotes(e.target.value)}
        />
      </Box>

      <AddValuesField
        label='Также подходит (eBay Also Fits)'
        placeholder='Нажмите Enter, чтобы добавить'
        fullWidth
        value={ebayAlsoFits}
        onChange={setEbayAlsoFits}
      />

      <Stack gap='12px'>
        <MuiFileInput
          label='Изображения товара'
          inputProps={{ accept: '.png, .jpeg' }}
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
        Создать товар вручную
      </Button>
    </Stack>
  );
};
