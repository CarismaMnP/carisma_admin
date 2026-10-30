import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Alert, Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, LinearProgress, MenuItem, Paper, Select, Stack, Table,
  TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography,
} from '@mui/material';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import { API } from '@/api';
import { IUser, PurchasingAs } from './types';
import { UserRow } from './components/UserRow';

const categories: PurchasingAs[] = ['Residential', 'Assurance', 'Dealership'];
const sorts = [
  ['createdAt:desc','Сначала новые'], ['createdAt:asc','Сначала старые'],
  ['name:asc','Имя: А → Я'], ['name:desc','Имя: Я → А'], ['mail:asc','Email: А → Я'],
  ['purchasingAs:asc','Категория'], ['total:desc','Покупки: больше → меньше'], ['total:asc','Покупки: меньше → больше'],
  ['paidOrdersCount:desc','Больше оплаченных заказов'], ['lastOrderAt:desc','Недавняя покупка'], ['cartSum:desc','Больше в корзине'],
];
const emptySelection = () => ({allMatching:false, ids:new Set<number>(), excludedIds:new Set<number>()});
async function messageFrom(error: unknown) {
  const data = (error as {response?: {data?: {message?:string} | Blob}})?.response?.data;
  if (data instanceof Blob) {try {return JSON.parse(await data.text()).message || 'Не удалось выполнить запрос';} catch {/* use fallback */}}
  return data && !(data instanceof Blob) && data.message || 'Не удалось выполнить запрос. Попробуйте ещё раз.';
}

export const UsersTab = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const userId = searchParams.get('userId') || '';
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [purchasingAs, setPurchasingAs] = useState('');
  const [purchases, setPurchases] = useState('');
  const [resale, setResale] = useState('');
  const [sort, setSort] = useState('createdAt:desc');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(25);
  const [users, setUsers] = useState<IUser[]>([]);
  const [count, setCount] = useState(0);
  const [selection, setSelection] = useState(emptySelection);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [exportFields, setExportFields] = useState('emails');
  const [exporting, setExporting] = useState(false);
  const [editing, setEditing] = useState<IUser | null>(null);
  const [editCategory, setEditCategory] = useState<PurchasingAs | ''>('');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const filters = useMemo(() => ({search:debouncedSearch,purchasingAs,purchases,resale,userId,sort:sort.split(':')[0],direction:sort.split(':')[1]}),
    [debouncedSearch,purchasingAs,purchases,resale,userId,sort]);
  const resetSelection = () => {setSelection(emptySelection());setNotice('');setPage(0);};
  const changeFilter = (set: (value:string)=>void, value:string) => {resetSelection();setLoading(true);set(value);};
  useEffect(() => {const timer = setTimeout(() => setDebouncedSearch(search), 300);return () => clearTimeout(timer);}, [search]);
  useEffect(() => {setSelection(emptySelection());setPage(0);}, [userId]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);setError('');
    API.get('/user',{params:{...filters,page:page+1,limit},signal:controller.signal}).then(({data}) => {
      if (controller.signal.aborted) return;
      setUsers(data.rows);setCount(data.count);
      if (page && page*limit >= data.count) setPage(Math.max(0,Math.ceil(data.count/limit)-1));
    }).catch(async e => {if (!controller.signal.aborted) setError(await messageFrom(e));})
      .finally(() => {if (!controller.signal.aborted) setLoading(false);});
    return () => controller.abort();
  }, [filters,page,limit,refresh]);
  const busy = loading || search !== debouncedSearch || exporting;
  const selected = (id:number) => selection.allMatching ? !selection.excludedIds.has(id) : selection.ids.has(id);
  const selectedCount = selection.allMatching ? Math.max(0,count-selection.excludedIds.size) : selection.ids.size;
  const pageSelected = users.filter(user => selected(user.id)).length;
  const toggle = (ids:number[], checked:boolean) => setSelection(previous => {
    const next = {...previous,ids:new Set(previous.ids),excludedIds:new Set(previous.excludedIds)};
    for (const id of ids) {
      if (next.allMatching) {if (checked) next.excludedIds.delete(id);else next.excludedIds.add(id);}
      else {if (checked) next.ids.add(id);else next.ids.delete(id);}
    }
    return next;
  });
  const resetFilters = () => {
    resetSelection();setSearch('');setDebouncedSearch('');setPurchasingAs('');setPurchases('');setResale('');setSearchParams({});
  };
  const download = async (format:'csv'|'xlsx') => {
    setExporting(true);setNotice('');setError('');
    try {
      const response = await API.post('/user/export', {format,fields:exportFields,filters,
        selection: selection.allMatching ? {allMatching:true,excludedIds:[...selection.excludedIds]} : {ids:[...selection.ids]}}, {responseType:'blob'});
      const url = URL.createObjectURL(response.data), link = document.createElement('a');
      link.href = url;link.download = `carisma-${exportFields}-${new Date().toISOString().slice(0,10)}.${format}`;
      document.body.appendChild(link);link.click();link.remove();setTimeout(() => URL.revokeObjectURL(url),60000);
      const exported = response.headers['x-export-count'];
      setNotice(`Файл ${format.toUpperCase()} готов${exported ? `: ${exported} строк` : ''}.`);
    } catch (e) {setError(await messageFrom(e));} finally {setExporting(false);}
  };
  const saveCategory = async () => {
    if (!editing) return;
    setSaving(true);setEditError('');
    try {
      await API.put(`/user/${editing.id}/category`,{purchasingAs:editCategory || null});
      setEditing(null);resetSelection();setRefresh(value => value+1);setNotice('Категория покупателя сохранена.');
    } catch (e) {setEditError(await messageFrom(e));} finally {setSaving(false);}
  };
  return <Stack spacing={2} sx={{minWidth:0}}>
    <Box><Typography variant="h5" fontWeight={700}>Пользователи</Typography><Typography color="text.secondary">Сегменты покупателей и экспорт контактов</Typography></Box>
    {userId && <Alert severity="info" action={<Button color="inherit" onClick={resetFilters}>Все пользователи</Button>}>Покупатель из заказа: #{userId}. Его строка выделена ниже.</Alert>}
    <Paper sx={{p:2}}>
      <Stack spacing={2}>
        <TextField size="small" label="Поиск по имени, email, телефону или ID" value={search} onChange={e => changeFilter(setSearch,e.target.value)} inputProps={{maxLength:200}} fullWidth />
        <Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',sm:'1fr 1fr',lg:'repeat(4,1fr)'},gap:1.5}}>
          <TextField size="small" select label="Категория покупателя" value={purchasingAs} onChange={e => changeFilter(setPurchasingAs,e.target.value)}>
            <MenuItem value="">Все категории</MenuItem><MenuItem value="unset">Не указана</MenuItem>{categories.map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}
          </TextField>
          <TextField size="small" select label="Покупки" value={purchases} onChange={e => changeFilter(setPurchases,e.target.value)}>
            <MenuItem value="">Все пользователи</MenuItem><MenuItem value="yes">Есть оплаченные заказы</MenuItem><MenuItem value="no">Без оплаченных заказов</MenuItem>
          </TextField>
          <TextField size="small" select label="Resale Tax" value={resale} onChange={e => changeFilter(setResale,e.target.value)}>
            <MenuItem value="">Любой статус</MenuItem><MenuItem value="yes">Одобрено</MenuItem><MenuItem value="no">Не одобрено</MenuItem>
          </TextField>
          <TextField size="small" select label="Сортировка" value={sort} onChange={e => {setSort(e.target.value);setPage(0);}}>
            {sorts.map(([value,label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
          </TextField>
        </Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="body2" color="text.secondary">Найдено: {loading ? '…' : count.toLocaleString('ru-RU')}</Typography><Button onClick={resetFilters}>Сбросить фильтры</Button></Stack>
      </Stack>
    </Paper>
    <Paper sx={{p:2,background:'#f0f8f7'}}>
      <Stack spacing={1.5}>
        <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center">
          <Chip label={`Выбрано: ${selectedCount}`} color={selectedCount ? 'primary' : 'default'} />
          <Button size="small" disabled={busy || !!error || !count} onClick={() => setSelection({...emptySelection(),allMatching:true})}>Выбрать всех найденных ({count})</Button>
          <Button size="small" disabled={!selectedCount || exporting} onClick={() => setSelection(emptySelection())}>Снять выбор</Button>
        </Stack>
        <Stack direction={{xs:'column',sm:'row'}} gap={1.5}>
          <FormControl size="small" sx={{minWidth:220,flex:1}}><InputLabel id="export-fields-label">Содержание файла</InputLabel><Select labelId="export-fields-label" label="Содержание файла" value={exportFields} onChange={e => setExportFields(e.target.value)}><MenuItem value="emails">Только email</MenuItem><MenuItem value="contacts">Контакты и статистика</MenuItem></Select></FormControl>
          <Button variant="outlined" startIcon={<DownloadOutlinedIcon/>} disabled={!selectedCount || busy || !!error} onClick={() => download('csv')}>CSV</Button>
          <Button variant="contained" startIcon={<DownloadOutlinedIcon/>} disabled={!selectedCount || busy || !!error} onClick={() => download('xlsx')}>Excel (.xlsx)</Button>
        </Stack>
        <Typography variant="caption" color="text.secondary">Выбор сохраняется между страницами. После выбора всей группы можно снять галочки у отдельных покупателей. В файле «Только email» повторяющиеся и пустые адреса исключаются.</Typography>
      </Stack>
    </Paper>
    {error && <Alert severity="error" action={<Button color="inherit" onClick={() => {setError('');setRefresh(v=>v+1);}}>Повторить</Button>}>{error}</Alert>}
    {notice && <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>}
    <Paper sx={{overflow:'hidden'}}>
      {(loading || exporting) && <LinearProgress/>}
      <TableContainer><Table size="small" sx={{minWidth:1000}} aria-label="Пользователи">
        <TableHead><TableRow>
          <TableCell padding="checkbox"><Checkbox inputProps={{'aria-label':'Выбрать пользователей на этой странице'}} checked={!!users.length && pageSelected===users.length} indeterminate={pageSelected>0 && pageSelected<users.length} disabled={busy || !!error || !users.length} onChange={e => toggle(users.map(u=>u.id),e.target.checked)}/></TableCell>
          <TableCell>Покупатель</TableCell><TableCell>Контакты</TableCell><TableCell>Категория покупателя</TableCell><TableCell align="right">Покупки, $</TableCell><TableCell align="right">Заказы</TableCell><TableCell align="right">Корзина, $</TableCell><TableCell>Регистрация</TableCell>
        </TableRow></TableHead>
        <TableBody>
          {!loading && !users.length && <TableRow><TableCell colSpan={8} align="center" sx={{py:5}}>Пользователи не найдены. Измените фильтры.</TableCell></TableRow>}
          {users.map(user => <UserRow key={user.id} user={user} checked={selected(user.id)} highlighted={String(user.id)===userId} disabled={busy || !!error} onToggle={checked => toggle([user.id],checked)} onEdit={() => {setEditing(user);setEditCategory(user.purchasingAs || '');setEditError('');}}/>)}
        </TableBody>
      </Table></TableContainer>
      <TablePagination component="div" count={count} page={page} rowsPerPage={limit} rowsPerPageOptions={[25,50,100]} labelRowsPerPage="На странице" labelDisplayedRows={({from,to,count}) => `${from}–${to} из ${count}`} onPageChange={(_,value) => setPage(value)} onRowsPerPageChange={e => {setLimit(Number(e.target.value));setPage(0);}} sx={{'.MuiTablePagination-toolbar':{flexWrap:'wrap'}}}/>
    </Paper>
    <Typography variant="caption" color="text.secondary">Покупки — стоимость товаров в оплаченных заказах, без доставки и налогов. Неоплаченные, отменённые, возвращённые и тестовые заказы исключены. Старые оплаченные заказы учитываются по статусу.</Typography>
    <Dialog open={!!editing} onClose={() => !saving && setEditing(null)} fullWidth maxWidth="xs">
      <DialogTitle>Категория покупателя</DialogTitle><DialogContent><Stack gap={2} sx={{pt:1}}>
        <Typography sx={{overflowWrap:'anywhere'}}>{editing?.name || 'Без имени'} · #{editing?.id}<br/>{editing?.mail}</Typography>
        <TextField id="customer-purchasing-as" select label="Purchasing as" value={editCategory} onChange={e => setEditCategory(e.target.value as PurchasingAs | '')} disabled={saving} fullWidth><MenuItem value="">Не указана</MenuItem>{categories.map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
        <Typography variant="body2" color="text.secondary">Категория используется для сегментации. Скидка и одобрение Resale Tax управляются отдельно.</Typography>
        {editError && <Alert severity="error">{editError}</Alert>}
      </Stack></DialogContent><DialogActions><Button disabled={saving} onClick={() => setEditing(null)}>Отмена</Button><Button variant="contained" disabled={saving} onClick={saveCategory}>{saving ? 'Сохранение…' : 'Сохранить'}</Button></DialogActions>
    </Dialog>
  </Stack>;
};
