import { Alert, Button, Chip, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { API } from '@/api';

type SyncStatus = {
  stale: boolean;
  catalog?: {finishedAt: string; sourceRows: number; available: number; reasons: Record<string, number>};
  carpartsAvailable: number; manualAvailable: number; legacyAvailable: number;
  images: {ready: number; pending: number; failed: number};
  sales: {enabled: boolean; pending: number; review: number; recent: {id: string; orderId: string; productId: number; state: string; attempts: number; lastError?: string; updatedAt: string}[]};
};
const labels: Record<string,string> = {pending:'В очереди',processing:'Обрабатывается',retry:'Повтор при восстановлении связи',review:'Требует проверки',succeeded:'Удалено из Checkmate'};
export const CarpartsTab = () => {
  const [data, setData] = useState<SyncStatus>();
  const [error, setError] = useState('');
  const refresh = async () => {
    try {const response=await API.get('/carparts/status');setData(response.data);setError('');}
    catch {setError('Не удалось получить состояние обмена. Попробуйте обновить страницу.');}
  };
  useEffect(()=>{refresh();const timer=setInterval(refresh,30000);return ()=>clearInterval(timer);},[]);
  return <Stack gap={2}>
    <Stack direction='row' justifyContent='space-between'><Typography variant='h5'>Обмен с Checkmate</Typography><Button onClick={refresh}>Обновить</Button></Stack>
    {error && <Alert severity='error'>{error}</Alert>}
    {data && <>
      <Alert severity={data.stale?'error':'success'}>{data.stale?'Данные об остатках устарели. Оплата товаров Checkmate временно приостановлена.':`Каталог обновлён: ${new Date(data.catalog!.finishedAt).toLocaleString('ru-RU')}. Проверка изменений — каждые 5 минут.`}</Alert>
      {!data.sales.enabled && <Alert severity='warning'>Удаление оплаченных деталей из Checkmate пока выключено.</Alert>}
      {data.sales.review>0 && <Alert severity='error'>Требуют проверки: {data.sales.review} продаж. Эти детали скрыты на сайте; проверьте их состояние в Checkmate по заказам ниже.</Alert>}
      <Paper variant='outlined' sx={{p:2}}><Stack gap={1}>
        <Typography>На сайте: {data.carpartsAvailable} товаров Checkmate и {data.manualAvailable} ручных карточек.</Typography>
        <Typography>В Checkmate: {data.catalog?.sourceRows ?? '—'} деталей, из них доступны для сайта: {data.catalog?.available ?? '—'}.</Typography>
        <Typography color='text.secondary'>Проданные, закрытые и скрытые детали исключаются. Оплаченные и зарезервированные на сайте товары также недоступны для повторной покупки.</Typography>
        {data.legacyAvailable>0 && <Alert severity='warning'>Осталось проверить старые карточки: {data.legacyAvailable}.</Alert>}
        <Typography>Фото в нашем хранилище: {data.images.ready}. Ожидают переноса: {data.images.pending}. Ошибки загрузки: {data.images.failed}.</Typography>
        <Typography>Продажи в очереди: {data.sales.pending}.</Typography>
      </Stack></Paper>
      <Typography variant='h6'>Последние продажи товаров Checkmate</Typography>
      {!data.sales.recent.length ? <Typography color='text.secondary'>После запуска обмена оплаченных заказов ещё не было.</Typography> : <Paper variant='outlined' sx={{overflowX:'auto'}}><Table size='small'>
        <TableHead><TableRow><TableCell>Заказ / товар</TableCell><TableCell>Результат</TableCell><TableCell>Обновление</TableCell></TableRow></TableHead>
        <TableBody>{data.sales.recent.map(job=><TableRow key={job.id}><TableCell>{job.orderId}<br/>Товар № {job.productId}</TableCell><TableCell><Chip size='small' color={job.state==='succeeded'?'success':job.state==='review'?'error':'warning'} label={labels[job.state]||job.state}/>{job.lastError && <Typography variant='caption' display='block'>{job.lastError}</Typography>}</TableCell><TableCell>{new Date(job.updatedAt).toLocaleString('ru-RU')}</TableCell></TableRow>)}</TableBody>
      </Table></Paper>}
      <Typography color='text.secondary'>Товары Checkmate редактируются в Checkmate. Ручные карточки управляются только здесь. Возврат платежа не восстанавливает удалённую деталь автоматически.</Typography>
    </>}
  </Stack>;
};
