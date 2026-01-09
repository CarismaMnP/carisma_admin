import { Box, Button, Divider, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { ICategory } from '@/cmsTabs/Categories/types.ts';
import { API } from '@/api';
import { slugify } from 'transliteration';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { MuiFileInput } from 'mui-file-input';
import { apiUrlBuilder } from '@/shared/utils/apiUrlBuilder.ts';

interface ICategoryFormProps {
  onFinish: () => void;
  category?: ICategory;
  mode: 'create' | 'edit';
}

interface ICategoryOption {
  value: number;
  label: string;
}

export const CategoryForm: FC<ICategoryFormProps> = ({ onFinish, category, mode }) => {
  const isCreate = mode === 'create';

  const [name, setName] = useState<string>(category?.name || '');
  const [description, setDescription] = useState<string>(category?.description || '');
  const [link, setLink] = useState<string>(category?.link || '');
  const [parentId, setParentId] = useState<number | ''>(category?.parentId || '');
  const [file, setFile] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewHorizontalUrl, setPreviewHorizontalUrl] = useState<string | null>(null);

  const [categoriesOptions, setCategoriesOptions] = useState<ICategoryOption[]>([]);

  const onSubmit = async () => {
    if (!name || !description || !link || !file) return;
    const formData = new FormData();
    formData.append('file', file);
    if (file2) {
      formData.append('file2', file2);
    }
    formData.append(
      'data',
      JSON.stringify({ name, description, link, parentId: !!parentId ? parentId : null }),
    );

    try {
      if (isCreate) {
        await API.post('/category', formData);
        onFinish && onFinish();
        return;
      }
      await API.put('/category', formData, { params: { id: category?.id } });
      onFinish && onFinish();
    } catch (e) {
      console.error(e);
    }
  };

  const getCategories = async () => {
    try {
      const { data: response } = await API.get('/category');
      if (response && response?.length) {
        setCategoriesOptions(
          response
            ?.filter((p: ICategory) => !p?.isDeleted)
            ?.map((category: ICategory) => ({
              value: category?.id,
              label: category?.name,
            })),
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFileFromUrl = async (url?: string) => {
    if (!url) return null;
    const response = await fetch(apiUrlBuilder(url));
    const blob = await response.blob();
    return new File([blob], url.split('/')[1], { type: blob.type });
  };

  const getImagesFiles = async (category: ICategory) => {
    try {
      const [vertical, horizontal] = await Promise.all([
        fetchFileFromUrl(category?.imageUrl),
        fetchFileFromUrl(category?.horizontalImageUrl),
      ]);

      if (vertical) {
        setFile(vertical);
      }
      if (horizontal) {
        setFile2(horizontal);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getCategories();
    if (!isCreate && category) getImagesFiles(category);
  }, [category, isCreate]);

  useEffect(() => {
    setLink(slugify(name));
  }, [name]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!file2) {
      setPreviewHorizontalUrl(null);
      return;
    }
    const url = URL.createObjectURL(file2);
    setPreviewHorizontalUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file2]);

  return (
    <Stack
      gap='18px'
      p='16px'
      minWidth='440px'
      sx={{ background: 'linear-gradient(145deg, #ffffff 0%, #f5f7fb 100%)', borderRadius: '18px' }}
    >
      <Stack gap={0.5}>
        <Typography variant='h6'>
          {isCreate ? 'Новая категория' : 'Редактировать категорию'}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Обновите описание, выберите родителя и загрузите вертикальную и горизонтальную обложки.
        </Typography>
      </Stack>

      <Box display='grid' gridTemplateColumns='repeat(auto-fit, minmax(260px, 1fr))' gap='16px'>
        <TextField
          label='Название категории'
          fullWidth
          placeholder='Например, Эспрессо'
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <TextField
          label='Описание'
          multiline
          minRows={2}
          fullWidth
          placeholder='Коротко расскажите о категории'
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        {categoriesOptions && !!categoriesOptions?.length && (
          <TextField
            label='Родительская категория (опционально)'
            fullWidth
            select
            value={parentId}
            onChange={e => setParentId(+e.target.value)}
          >
            {categoriesOptions.map(categoryOption => (
              <MenuItem key={categoryOption.value} value={categoryOption.value}>
                {categoryOption.label}
              </MenuItem>
            ))}
          </TextField>
        )}

        <TextField
          label='Ссылка'
          fullWidth
          placeholder='Сформируется автоматически'
          helperText='Формируется из названия, можно скорректировать'
          value={link}
          onChange={e => setLink(e.target.value)}
        />
      </Box>

      <Divider />

      <Box display='grid' gridTemplateColumns='repeat(auto-fit, minmax(260px, 1fr))' gap='16px'>
        <Stack gap='10px'>
          <MuiFileInput
            label='Обложка (вертикальная)'
            inputProps={{ accept: '.png, .jpeg' }}
            placeholder='Загрузите вертикальное изображение'
            value={file}
            onChange={setFile}
            fullWidth
            clearIconButtonProps={{
              title: 'Remove',
              children: <DeleteForeverIcon fontSize='small' />,
            }}
          />
          {previewUrl && (
            <Box
              sx={{
                border: '1px dashed #cbd5e1',
                borderRadius: '14px',
                p: 1.5,
                backgroundColor: '#f8fafc',
              }}
            >
              <Typography variant='caption' color='text.secondary'>
                Превью вертикальной обложки
              </Typography>
              <Box
                component='img'
                src={previewUrl}
                alt='Превью вертикальной обложки'
                sx={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: '12px', mt: 1 }}
              />
            </Box>
          )}
        </Stack>

        <Stack gap='10px'>
          <MuiFileInput
            label='Обложка (горизонтальная)'
            inputProps={{ accept: '.png, .jpeg' }}
            placeholder='Загрузите горизонтальное изображение'
            value={file2}
            onChange={setFile2}
            fullWidth
            clearIconButtonProps={{
              title: 'Remove',
              children: <DeleteForeverIcon fontSize='small' />,
            }}
          />
          {previewHorizontalUrl && (
            <Box
              sx={{
                border: '1px dashed #cbd5e1',
                borderRadius: '14px',
                p: 1.5,
                backgroundColor: '#f8fafc',
              }}
            >
              <Typography variant='caption' color='text.secondary'>
                Превью горизонтальной обложки
              </Typography>
              <Box
                component='img'
                src={previewHorizontalUrl}
                alt='Превью горизонтальной обложки'
                sx={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: '12px', mt: 1 }}
              />
            </Box>
          )}
        </Stack>
      </Box>

      <Button fullWidth variant='contained' size='large' onClick={onSubmit}>
        {isCreate ? 'Создать категорию' : 'Сохранить изменения'}
      </Button>
    </Stack>
  );
};
