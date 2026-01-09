import {
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { FC } from 'react';
import { IUser } from '../types';

interface IUserRowProps {
  user: IUser;
}

export const UserRow: FC<IUserRowProps> = ({ user }) => {
  return (
    <TableRow key={user.id}>
      <TableCell><Typography>{user.name}</Typography></TableCell>
      <TableCell><Typography>{user.mail}</Typography></TableCell>
      <TableCell><Typography>{user.phone}</Typography></TableCell>
      <TableCell><Typography>{user.category}</Typography></TableCell>
      <TableCell><Typography>{user.discount}</Typography></TableCell>
      <TableCell><Typography>{user.total}</Typography></TableCell>
      <TableCell><Typography>{user.cartSum}</Typography></TableCell>
    </TableRow>
  );
};
