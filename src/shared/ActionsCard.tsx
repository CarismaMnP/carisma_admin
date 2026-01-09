import { Divider, IconButton, Paper, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { FC, ReactNode } from 'react';

interface IActionsCardProps {
  onEdit?: () => void;
  onDelete?: () => void;
  showEdit?: boolean;
  showDelete?: boolean;
  onClick?: () => void;
  children: ReactNode;
  readonly?: boolean;
}

export const ActionsCard: FC<IActionsCardProps> = ({
  onEdit,
  onDelete,
  onClick,
  readonly,
  showEdit = true,
  showDelete = true,
  children,
}) => {
  return (
    <Paper
      sx={{
        borderRadius: '16px',
        p: '14px',
        background: 'linear-gradient(145deg, #ffffff 0%, #f3f6ff 100%)',
        transition: 'transform 200ms ease, box-shadow 200ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 18px 42px rgba(15, 23, 42, 0.12)',
        },
      }}
      onClick={onClick && onClick}
    >
      <Stack gap='12px' justifyContent='space-between' height='100%'>
        {children}
        {!readonly && (showEdit || showDelete) && (
          <Stack gap='8px'>
            <Divider />
            <Stack direction='row' gap='10px'>
              {showEdit && (
                <IconButton onClick={onEdit}>
                  <EditIcon />
                </IconButton>
              )}
              {showDelete && (
                <IconButton onClick={onDelete}>
                  <DeleteForeverIcon />
                </IconButton>
              )}
            </Stack>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};
