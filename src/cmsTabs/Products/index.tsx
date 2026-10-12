import { Alert, Autocomplete, Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, FormControlLabel, LinearProgress, MenuItem, Pagination, Paper, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API } from '@/api';
import { ProductCard } from './components/ProductCard';
import { IProduct } from './types';
import { ProductForm } from './components/ProductForm';

type Facet = {make: string; models: string[]};
const money = (value: number) => new Intl.NumberFormat('en-US', {style:'currency',currency:'USD'}).format(value);
export const ProductsTab = () => {
  const [params, setParams] = useSearchParams();
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const [products, setProducts] = useState<IProduct[]>([]);
  const [counts, setCounts] = useState({count:0, active:0, inactive:0});
  const [facets, setFacets] = useState<Facet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [facetError, setFacetError] = useState(false);
  const [revision, setRevision] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<IProduct | null>(null);
  const search = params.get('search') || '';
  const [searchDraft, setSearchDraft] = useState(search);
  const active = params.get('active') !== 'false';
  const inactive = params.get('inactive') === 'true';
  const make = params.get('make') || '';
  const model = params.get('model') || '';
  const page = Math.max(1,Number(params.get('page')) || 1);
  const limit = [25,50,100].includes(Number(params.get('limit'))) ? Number(params.get('limit')) : 25;
  const min = params.get('minPrice') || '', max = params.get('maxPrice') || '';
  const priceError = Number(min) < 0 || Number(max) < 0 || (min !== '' && max !== '' && Number(min) > Number(max));
  const change = (values: Record<string,string>, reset = true) => {
    const next = new URLSearchParams(paramsRef.current);
    for (const [key,value] of Object.entries(values)) {if (value !== '') next.set(key,value); else next.delete(key);}
    if (reset) next.delete('page');
    paramsRef.current = next;
    setParams(next, {replace:true});
  };
  useEffect(() => {setSearchDraft(search);}, [search]);
  useEffect(() => {
    if (searchDraft === search) return;
    const timer = setTimeout(() => change({search:searchDraft}),350);
    return () => clearTimeout(timer);
  },[searchDraft,search]);
  useEffect(() => {
    const controller = new AbortController();
    API.get<Facet[]>('/product/filters',{signal:controller.signal}).then(r => {setFacets(r.data);setFacetError(false);})
      .catch(() => {if (!controller.signal.aborted) setFacetError(true);});
    return () => controller.abort();
  },[revision]);
  const query = params.toString();
  useEffect(() => {
    if (priceError) {setLoading(false);return;}
    const controller = new AbortController();
    setLoading(true);setError('');
    const values = Object.fromEntries(new URLSearchParams(query));
    API.get('/product',{params:{...values,page,limit,active,inactive}, signal:controller.signal})
      .then(({data}) => {
        if (controller.signal.aborted) return;
        const last = Math.max(1,Math.ceil(data.count / limit));
        if (page > last) {change({page:String(last)},false);return;}
        setProducts(data.rows);setCounts({count:data.count,active:data.active,inactive:data.inactive});
      }).catch(e => {if (!controller.signal.aborted) setError(e.response?.data?.message || 'Не удалось загрузить товары. Повторите попытку.');})
      .finally(() => {if (!controller.signal.aborted) setLoading(false);});
    return () => controller.abort();
  },[query,revision,priceError]);
  const refresh = async () => {setSelected(null);setRevision(n => n+1);};
  const status = (p: IProduct) => p.isDeleted || p.adminHidden ? 'Скрыт' : Number(p.count) > 0 ? 'Активен' : p.websiteSold ? 'Продан на сайте' : 'Нет в наличии';
  const source = (p: IProduct) => p.source === 'carparts' ? 'Checkmate' : p.source === 'legacy' ? 'Архив eBay' : 'Вручную';
  return <Stack gap={2} width='100%'>
    <Stack direction={{xs:'column',sm:'row'}} justifyContent='space-between' gap={1}>
      <Box><Typography variant='h5' fontWeight={700}>Товары</Typography>
        <Typography color='text.secondary'>Остатки, цены и доступность каталога</Typography></Box>
      <Button variant='contained' onClick={() => setShowAdd(true)}>Добавить товар</Button>
    </Stack>
    <Paper variant='outlined' sx={{p:2,borderRadius:2}}>
      <Stack gap={2}>
        <Stack direction={{xs:'column',md:'row'}} gap={2}>
          <TextField label='Поиск' placeholder='Название, артикул Checkmate, GUID или ID' value={searchDraft}
            onChange={e => setSearchDraft(e.target.value)} size='small' sx={{flex:1,minWidth:240}} />
          <TextField select label='Источник' value={params.get('source') || ''} onChange={e => change({source:e.target.value})} size='small' sx={{minWidth:170}}>
            <MenuItem value=''>Все источники</MenuItem><MenuItem value='carparts'>Checkmate</MenuItem>
            <MenuItem value='manual'>Добавлены вручную</MenuItem><MenuItem value='legacy'>Архив eBay</MenuItem>
          </TextField>
          <TextField select label='Сортировка' value={params.get('sort') || 'newest'} onChange={e => change({sort:e.target.value})} size='small' sx={{minWidth:210}}>
            <MenuItem value='newest'>Сначала новые</MenuItem><MenuItem value='price_asc'>Цена: по возрастанию</MenuItem>
            <MenuItem value='price_desc'>Цена: по убыванию</MenuItem><MenuItem value='name'>Название: А–Я</MenuItem>
          </TextField>
        </Stack>
        <Stack direction={{xs:'column',md:'row'}} gap={2}>
          <Autocomplete options={facets.map(f => f.make)} value={make || null} onChange={(_,v) => change({make:v || '',model:''})}
            size='small' sx={{flex:1,minWidth:180}} renderInput={p => <TextField {...p} label='Марка' />} />
          <Autocomplete options={facets.find(f => f.make === make)?.models || []} value={model || null} disabled={!make}
            onChange={(_,v) => change({model:v || ''})} size='small' sx={{flex:1,minWidth:180}}
            renderInput={p => <TextField {...p} label='Модель' placeholder='Сначала выберите марку' />} />
          <TextField label='Цена от, $' type='number' value={min} onChange={e => change({minPrice:e.target.value})} size='small'
            error={priceError} slotProps={{htmlInput:{min:0,step:0.01}}} sx={{width:{xs:'100%',md:150}}} />
          <TextField label='Цена до, $' type='number' value={max} onChange={e => change({maxPrice:e.target.value})} size='small'
            error={priceError} slotProps={{htmlInput:{min:0,step:0.01}}} sx={{width:{xs:'100%',md:150}}} />
        </Stack>
        <Stack direction='row' flexWrap='wrap' alignItems='center' gap={1}>
          <FormControlLabel control={<Checkbox checked={active} onChange={e => change({active:String(e.target.checked)})} />} label={`Активные (${counts.active.toLocaleString()})`} />
          <FormControlLabel control={<Checkbox checked={inactive} onChange={e => change({inactive:String(e.target.checked)})} />} label={`Неактивные (${counts.inactive.toLocaleString()})`} />
          <Box sx={{flex:1}} /><Button onClick={() => {setSearchDraft('');setParams({}, {replace:true});}}>Сбросить фильтры</Button>
        </Stack>
      </Stack>
    </Paper>
    {priceError && <Alert severity='warning'>Укажите положительный диапазон цен: цена «от» не должна превышать цену «до».</Alert>}
    {facetError && <Alert severity='warning' action={<Button onClick={() => setRevision(n => n+1)}>Повторить</Button>}>Не удалось загрузить марки и модели.</Alert>}
    {error && <Alert severity='error' action={<Button onClick={() => setRevision(n => n+1)}>Повторить</Button>}>{error}</Alert>}
    <Stack direction='row' alignItems='center' justifyContent='space-between'>
      <Typography color='text.secondary'>{loading ? 'Загрузка…' : `Найдено: ${counts.count.toLocaleString()}`}</Typography>
      <TextField select size='small' label='На странице' value={limit} onChange={e => change({limit:e.target.value})} sx={{width:140}}>
        {[25,50,100].map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
      </TextField>
    </Stack>
    <Paper variant='outlined' sx={{overflow:'hidden',borderRadius:2}}>
      {loading && <LinearProgress />}
      <TableContainer><Table size='small' sx={{minWidth:850,opacity:loading || priceError ? 0.5 : 1}}>
        <TableHead><TableRow><TableCell>Товар</TableCell><TableCell>Марка / модель</TableCell><TableCell>Статус</TableCell>
          <TableCell align='right'>Цена</TableCell><TableCell align='right'>Остаток</TableCell><TableCell /></TableRow></TableHead>
        <TableBody>{products.map(p => {
          const image = p.images?.[0];const url = typeof image === 'string' ? image : image?.previewUrl || image?.imageUrl;
          return <TableRow key={p.id} hover>
            <TableCell sx={{maxWidth:480}}><Stack direction='row' gap={1.5} alignItems='center' py={1}>
              <Box sx={{width:52,height:52,flexShrink:0,bgcolor:'#f1f5f9',borderRadius:1,overflow:'hidden'}}>
                {url && <Box component='img' src={url} alt='' loading='lazy' sx={{width:'100%',height:'100%',objectFit:'contain'}} />}</Box>
              <Box><Button onClick={() => setSelected(p)} sx={{p:0,textAlign:'left',justifyContent:'flex-start',textTransform:'none',fontWeight:600}}>{p.name}</Button>
                <Typography variant='caption' display='block' color='text.secondary'>{source(p)} · {p.carpartsTag || `ID ${p.id}`}</Typography></Box>
            </Stack></TableCell>
            <TableCell>{p.make || '—'}<Typography variant='body2' color='text.secondary'>{p.ebayModel || '—'}</Typography></TableCell>
            <TableCell><Chip size='small' variant='outlined' color={!p.isDeleted && Number(p.count)>0 ? 'success':'default'} label={status(p)} /></TableCell>
            <TableCell align='right' sx={{whiteSpace:'nowrap',fontWeight:600}}>{money(Number(p.price))}</TableCell>
            <TableCell align='right'>{p.count ?? 0}</TableCell><TableCell><Button size='small' onClick={() => setSelected(p)}>Подробнее</Button></TableCell>
          </TableRow>;
        })}</TableBody>
      </Table></TableContainer>
      {!loading && !error && !products.length && <Box p={5} textAlign='center'><Typography>Товары не найдены</Typography>
        <Typography color='text.secondary'>Измените фильтры или включите активные и неактивные товары.</Typography></Box>}
    </Paper>
    {counts.count > limit && <Stack alignItems='center'><Pagination color='primary' count={Math.ceil(counts.count/limit)} page={page}
      onChange={(_,n) => change({page:String(n)},false)} disabled={loading || priceError} /></Stack>}
    <Dialog maxWidth='md' fullWidth open={showAdd} onClose={() => setShowAdd(false)}><DialogTitle>Создать товар</DialogTitle>
      <DialogContent>{showAdd && <ProductForm mode='create' onFinish={async () => {setShowAdd(false);await refresh();}} />}</DialogContent></Dialog>
    <Dialog maxWidth='sm' fullWidth open={!!selected} onClose={() => setSelected(null)}><DialogTitle>Карточка товара</DialogTitle>
      <DialogContent>{selected && <ProductCard product={selected} actionCallback={refresh} />}</DialogContent>
      <DialogActions><Button onClick={() => setSelected(null)}>Закрыть</Button></DialogActions></Dialog>
  </Stack>;
};
