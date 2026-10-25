import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { API } from '@/api';
type Promo = {
  id: string;
  code: string;
  kind: string;
  value: number;
  minSubtotalCents: number;
  maxUses: number | null;
  used: number;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
};
const empty = {
  code: '',
  kind: 'percent',
  value: '',
  minSubtotal: '0',
  maxUses: '',
  startsAt: '',
  endsAt: '',
  active: true,
};
function localDate(v: string | null) {
  if (!v) return '';
  const d = new Date(v);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
export function PromoCodesTab() {
  const [rows, setRows] = useState<Promo[]>([]),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(true),
    [open, setOpen] = useState(false),
    [id, setId] = useState<string | null>(null),
    [form, setForm] = useState(empty),
    [busy, setBusy] = useState(false),
    [saveError, setSaveError] = useState('');
  const load = () => {
    setLoading(true);
    API.get('/promo-codes')
      .then(r => {
        setRows(r.data);
        setError('');
      })
      .catch(() => setError('Не удалось загрузить промокоды'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  const edit = (p?: Promo) => {
    setId(p?.id || null);
    setForm(
      p
        ? {
            code: p.code,
            kind: p.kind,
            value: String(p.value / 100),
            minSubtotal: String(p.minSubtotalCents / 100),
            maxUses: p.maxUses == null ? '' : String(p.maxUses),
            startsAt: localDate(p.startsAt),
            endsAt: localDate(p.endsAt),
            active: p.active,
          }
        : empty,
    );
    setSaveError('');
    setOpen(true);
  };
  const save = async () => {
    setBusy(true);
    setSaveError('');
    try {
      const data = {
        ...form,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      };
      if (id) await API.put('/promo-codes/' + id, data);
      else await API.post('/promo-codes', data);
      setOpen(false);
      load();
    } catch (e: any) {
      setSaveError(e.response?.data?.message || 'Не удалось сохранить промокод');
    } finally {
      setBusy(false);
    }
  };
  const field = (key: keyof typeof empty, value: string | boolean) =>
    setForm(f => ({ ...f, [key]: value }));
  return (
    <Stack gap={2}>
      <Stack direction='row' justifyContent='space-between'>
        <Box>
          <Typography variant='h5' fontWeight={700}>
            Промокоды
          </Typography>
          <Typography color='text.secondary'>
            Скидки на товары в корзине. Доставка оплачивается отдельно.
          </Typography>
        </Box>
        <Button variant='contained' onClick={() => edit()}>
          Добавить промокод
        </Button>
      </Stack>
      {error && <Alert severity='error'>{error}</Alert>}
      <Paper sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Код</TableCell>
              <TableCell>Скидка</TableCell>
              <TableCell>Условия</TableCell>
              <TableCell>Использование</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(p => (
              <TableRow key={p.id}>
                <TableCell sx={{ fontWeight: 700 }}>{p.code}</TableCell>
                <TableCell>
                  {p.kind === 'percent' ? `${p.value / 100}%` : `$${(p.value / 100).toFixed(2)}`}
                </TableCell>
                <TableCell>
                  От ${(p.minSubtotalCents / 100).toFixed(2)}
                  <Typography variant='caption' display='block'>
                    {p.startsAt ? new Date(p.startsAt).toLocaleString() : 'Без даты начала'} —{' '}
                    {p.endsAt ? new Date(p.endsAt).toLocaleString() : 'Без срока'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {p.used} / {p.maxUses ?? '∞'}
                </TableCell>
                <TableCell>
                  <Chip
                    size='small'
                    label={
                      !p.active
                        ? 'Выключен'
                        : p.endsAt && Date.parse(p.endsAt) <= Date.now()
                          ? 'Истёк'
                          : p.startsAt && Date.parse(p.startsAt) > Date.now()
                            ? 'Запланирован'
                            : 'Активен'
                    }
                    color={p.active ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Button onClick={() => edit(p)}>Изменить</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!rows.length && (
          <Typography p={3}>{loading ? 'Загрузка…' : 'Промокодов пока нет'}</Typography>
        )}
      </Paper>
      <Alert severity='info'>
        Лимит учитывает оплаченные заказы и действующие резервы. После отмены или истечения
        неоплаченной сессии использование освобождается. Изменение промокода не меняет уже созданные
        заказы.
      </Alert>
      <Dialog open={open} onClose={busy ? undefined : () => setOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>{id ? 'Изменить' : 'Создать'} промокод</DialogTitle>
        <DialogContent>
          <Stack gap={2} pt={1}>
            <TextField
              label='Код'
              value={form.code}
              onChange={e => field('code', e.target.value.toUpperCase())}
              helperText='3–40 латинских букв, цифр, дефисов или подчёркиваний'
            />
            <TextField
              select
              label='Тип скидки'
              value={form.kind}
              onChange={e => field('kind', e.target.value)}
            >
              <MenuItem value='percent'>Процент от товаров</MenuItem>
              <MenuItem value='fixed'>Фиксированная сумма на корзину</MenuItem>
            </TextField>
            <TextField
              label={form.kind === 'percent' ? 'Скидка, %' : 'Скидка, $'}
              type='number'
              value={form.value}
              onChange={e => field('value', e.target.value)}
            />
            <TextField
              label='Минимальная сумма товаров, $'
              type='number'
              value={form.minSubtotal}
              onChange={e => field('minSubtotal', e.target.value)}
            />
            <TextField
              label='Максимум использований'
              type='number'
              value={form.maxUses}
              onChange={e => field('maxUses', e.target.value)}
              helperText='Пустое поле — без ограничения'
            />
            <TextField
              label='Начало (ваше местное время)'
              type='datetime-local'
              value={form.startsAt}
              onChange={e => field('startsAt', e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label='Окончание (ваше местное время)'
              type='datetime-local'
              value={form.endsAt}
              onChange={e => field('endsAt', e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <FormControlLabel
              control={
                <Checkbox checked={form.active} onChange={e => field('active', e.target.checked)} />
              }
              label='Включён'
            />
            {saveError && <Alert severity='error'>{saveError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button variant='contained' disabled={busy} onClick={save}>
            {busy ? 'Сохранение…' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
