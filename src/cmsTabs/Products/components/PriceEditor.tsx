import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { API } from '@/api';
export type PriceSelection =
  | { mode: 'ids'; ids: number[] }
  | { mode: 'filter'; filters: Record<string, string>; excludedIds: number[] };
type Preview = {
  id: string;
  count: number;
  beforeCents: number;
  afterCents: number;
  sample: { id: number; name: string; before: number; after: number }[];
};
const money = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n / 100);
export function PriceEditor({
  selection,
  onClose,
  onSaved,
  allowReset = true,
}: {
  selection: PriceSelection;
  onClose: () => void;
  onSaved: () => void;
  allowReset?: boolean;
}) {
  const [kind, setKind] = useState('decrease_percent'),
    [value, setValue] = useState(''),
    [preview, setPreview] = useState<Preview | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      if (preview) {
        await API.post(`/product/prices/${preview.id}/apply`);
        onSaved();
        onClose();
      } else {
        setPreview(
          (await API.post('/product/prices/preview', { selection, operation: { kind, value } }))
            .data,
        );
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Не удалось сохранить цены');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open maxWidth='md' fullWidth onClose={busy ? undefined : onClose}>
      <DialogTitle>Цена на сайте</DialogTitle>
      <DialogContent>
        <Stack gap={2} pt={1}>
          <Alert severity='info'>
            Цены Checkmate не изменятся. Установленные здесь цены сохранятся после синхронизации.
            Уже созданные заказы сохраняют свою цену.
          </Alert>
          {!preview ? (
            <>
              <TextField
                select
                label='Действие'
                value={kind}
                disabled={busy}
                onChange={e => setKind(e.target.value)}
              >
                <MenuItem value='set'>Установить цену, $</MenuItem>
                <MenuItem value='decrease_percent'>Снизить на %</MenuItem>
                <MenuItem value='increase_percent'>Повысить на %</MenuItem>
                <MenuItem value='decrease_amount'>Снизить на сумму, $</MenuItem>
                <MenuItem value='increase_amount'>Повысить на сумму, $</MenuItem>
                {allowReset && (
                  <MenuItem value='reset'>Вернуть цену Checkmate и её синхронизацию</MenuItem>
                )}
              </TextField>
              {kind !== 'reset' && (
                <TextField
                  label={kind.includes('percent') ? 'Процент' : 'Сумма, $'}
                  type='number'
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  disabled={busy}
                  slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
                />
              )}
            </>
          ) : (
            <>
              <Typography fontWeight={700}>
                Будет изменено товаров: {preview.count.toLocaleString()}
              </Typography>
              <Typography>
                Сумма цен: {money(preview.beforeCents)} → {money(preview.afterCents)}
              </Typography>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Товар</TableCell>
                    <TableCell align='right'>Было</TableCell>
                    <TableCell align='right'>Станет</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.sample.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>{p.name}</TableCell>
                      <TableCell align='right'>{money(p.before)}</TableCell>
                      <TableCell align='right'>{money(p.after)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {preview.count > preview.sample.length && (
                <Typography variant='caption'>
                  Показаны первые {preview.sample.length} товаров. Применение затронет все{' '}
                  {preview.count} выбранных товаров.
                </Typography>
              )}
              <Alert severity='warning'>
                Проверьте цены перед применением. Список товаров зафиксирован на 10 минут; новые
                товары из синхронизации в него не попадут.
              </Alert>
            </>
          )}
          {error && <Alert severity='error'>{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={busy} onClick={onClose}>
          Отмена
        </Button>
        {preview && (
          <Button
            disabled={busy}
            onClick={() => {
              setPreview(null);
              setError('');
            }}
          >
            Назад
          </Button>
        )}
        <Button
          variant='contained'
          disabled={busy || (!preview && kind !== 'reset' && !value)}
          onClick={submit}
        >
          {busy ? 'Сохранение…' : preview ? 'Применить цены' : 'Посмотреть изменения'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
