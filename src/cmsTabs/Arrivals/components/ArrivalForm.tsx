import { Button, Stack, TextField, Typography, Box } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { IArrival } from '@/cmsTabs/Arrivals/types.ts';
import { API } from '@/api';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { MuiFileInput } from 'mui-file-input';
import { apiUrlBuilder } from '@/shared/utils/apiUrlBuilder.ts';

interface IArrivalFormProps {
  onFinish: () => void;
  arrival?: IArrival;
  mode: 'create' | 'edit';
}

export const ArrivalForm: FC<IArrivalFormProps> = ({ onFinish, arrival, mode }) => {
  const isCreate = mode === 'create';
  const [model, setModel] = useState<string>(arrival?.model || '');
  const [body, setBody] = useState<string>(arrival?.body || '');
  const [year, setYear] = useState<string>(arrival?.year || '');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!model || !body || !year || !file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append(
      'data',
      JSON.stringify({ model, body, year }),
    );

    try {
      if (isCreate) {
        await API.post('/arrival', formData);
        onFinish && onFinish();
        return;
      }
      if (!isCreate) {
        await API.put('/arrival', formData, { params: { id: arrival?.id } });
        onFinish && onFinish();
        return;
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getImagesFiles = async (Arrival: IArrival) => {
    try {
      const response = await fetch(apiUrlBuilder(arrival?.imageURL || ''));
      const blob = await response.blob();
      setFile(new File([blob], Arrival?.imageURL.split('/')[1], { type: blob.type }));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!isCreate && arrival) getImagesFiles(arrival);
  }, [arrival, isCreate]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <Stack
      gap='18px'
      p='16px'
      minWidth='420px'
      sx={{
        background: 'linear-gradient(145deg, #ffffff 0%, #f5f7fb 100%)',
        borderRadius: '18px',
      }}
    >
      <Stack gap={0.5}>
        <Typography variant='h6'>{isCreate ? 'Новое поступление' : 'Редактировать поступление'}</Typography>
        <Typography variant='body2' color='text.secondary'>
          Добавьте описание и обложку для новой позиции.
        </Typography>
      </Stack>

      <Box display='grid' gridTemplateColumns='repeat(auto-fit, minmax(240px, 1fr))' gap='16px'>
        <TextField
          label='Модель'
          fullWidth
          placeholder='Например, Pro Model'
          value={model}
          onChange={e => setModel(e.target.value)}
        />
        <TextField
          label='Тип / кузов'
          fullWidth
          placeholder='Введите тип или кузов'
          value={body}
          onChange={e => setBody(e.target.value)}
        />
        <TextField
          label='Год'
          fullWidth
          placeholder='2025'
          value={year}
          onChange={e => setYear(e.target.value)}
        />
      </Box>

      {previewUrl && (
        <Box
          sx={{
            border: '1px dashed #cbd5e1',
            borderRadius: '14px',
            p: 1.5,
            backgroundColor: '#f8fafc',
          }}
        >
          <Box
            component='img'
            src={previewUrl}
            alt='Превью изображения'
            sx={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: '12px' }}
          />
        </Box>
      )}

      <MuiFileInput
        label='Изображение'
        inputProps={{ accept: '.png, .jpeg, .jpg' }}
        placeholder='Загрузите изображение'
        value={file}
        onChange={setFile}
        fullWidth
        clearIconButtonProps={{
          title: 'Remove',
          children: <DeleteForeverIcon fontSize='small' />,
        }}
      />

      <Button fullWidth variant='contained' size='large' onClick={onSubmit}>
        {isCreate ? 'Создать' : 'Сохранить'}
      </Button>
    </Stack>
  );
};
