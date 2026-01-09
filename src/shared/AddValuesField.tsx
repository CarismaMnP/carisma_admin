import { ChangeEvent, FC, useState } from 'react';
import { Box, Chip, Stack, TextField, TextFieldProps } from '@mui/material';

type IAddValuesFieldProps = {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
} & Omit<TextFieldProps, 'label' | 'value' | 'onChange' | 'onKeyDown'>;

export const AddValuesField: FC<IAddValuesFieldProps> = ({
  label,
  value,
  onChange,
  ...textFieldProps
}) => {
  const [inputValue, setInputValue] = useState<string>('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter' && !!inputValue) {
      e.preventDefault();
      const trimmedValue = inputValue.trim();
      if (trimmedValue && !value.includes(trimmedValue)) {
        onChange([...value, trimmedValue]);
        setInputValue('');
      }
    }
  };

  const onDeleteValueHandler = (valueToDelete: string) => {
    onChange(value.filter(v => v !== valueToDelete));
  };

  return (
    <Stack gap='8px'>
      <TextField
        {...textFieldProps}
        label={label}
        helperText='Нажмите Enter, чтобы добавить значение'
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      {value && !!value?.length && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {value.map(value => (
            <Chip key={value} label={value} onDelete={() => onDeleteValueHandler(value)} />
          ))}
        </Box>
      )}
    </Stack>
  );
};
