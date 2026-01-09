import { ChangeEvent, useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
} from '@mui/material';
import { API } from '@/api';
import { IUser } from './types';
import { UserRow } from './components/UserRow';

export const UsersTab = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);
  const [totalCount, setTotalCount] = useState<number>(0);

  const fetchUsers = async () => {
    try {
      const { data: response } = await API.get('/user', {
        params: { page: page + 1, limit: rowsPerPage },
      });
      if (response) {
        setUsers(response.rows);
        setTotalCount(response.count);
      }
    } catch (error) {
      console.error('Ошибка при получении пользователей:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Имя</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Телефон</TableCell>
              <TableCell>Категория</TableCell>
              <TableCell>Скидка</TableCell>
              <TableCell>Потрачено</TableCell>
              <TableCell>Корзина</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user => (
              <UserRow key={user.id} user={user} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component='div'
        count={totalCount}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </>
  );
};
