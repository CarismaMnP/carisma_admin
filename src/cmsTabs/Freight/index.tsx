import {useEffect,useState} from 'react';
import {Alert,Box,Button,Chip,Dialog,DialogContent,DialogTitle,MenuItem,Pagination,Stack,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,TextField,Typography} from '@mui/material';
import {Tabs,Tab} from '@mui/material';
import {ParcelQuotes} from './ParcelQuotes';
import {API} from '@/api';
type Item={productId:number;name:string;code:string;length:number;width:number;height:number;weight:number;freightClass:number;nmfc:string;commodity:string};
type Rate={carrier:string;amountCents:number;transitDays:number|null};
type Quote={id:string;userId:number;createdAt:string;expiresAt:string;status:string;error:string|null;amountCents:number;request:{zip:string;originZip:string;addressType:string;limitedAccess:boolean;insuredCents:number;shipmentItems:Item[]};result:null|{reference:string;insuranceCents:number;selected:Rate;rates:Rate[]}};
const money=(cents:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100);
const SavtransTab=()=>{
 const [page,setPage]=useState(1),[status,setStatus]=useState(''),[zip,setZip]=useState(''),[refresh,setRefresh]=useState(0);
 const [rows,setRows]=useState<Quote[]>([]),[count,setCount]=useState(0),[error,setError]=useState(''),[loading,setLoading]=useState(false),[selected,setSelected]=useState<Quote|null>(null);
 useEffect(()=>{const controller=new AbortController();setLoading(true);setError('');
  API.get('/freight/quotes',{params:{page,status,zip:zip.length===5?zip:''},signal:controller.signal}).then(({data})=>{setRows(data.rows);setCount(data.count);}).catch(e=>{if(!controller.signal.aborted)setError(e.response?.data?.message||'Не удалось загрузить расчёты');}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});return()=>controller.abort();
 },[page,status,zip,refresh]);
 return <Stack gap={2}>
  <Stack direction='row' justifyContent='space-between'><Typography variant='h5'>Грузовая доставка · Savtrans</Typography><Button onClick={()=>setRefresh(n=>n+1)} disabled={loading}>Обновить</Button></Stack>
  <Alert severity='info'>Расчёт включает Lift-gate Delivery и страховку крупных деталей. Выбирается самый дешёвый тариф. Здесь сохраняются успешные расчёты и ошибки; заказ перевозки оформляется отдельно у брокера.</Alert>
  <Stack direction='row' gap={2}><TextField select label='Статус' size='small' value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}} sx={{minWidth:190}}><MenuItem value=''>Все</MenuItem><MenuItem value='quoted'>Рассчитано</MenuItem><MenuItem value='failed'>Ошибка</MenuItem><MenuItem value='requested'>Запрошено</MenuItem></TextField><TextField label='ZIP получателя' size='small' value={zip} onChange={e=>{setZip(e.target.value.replace(/\D/g,'').slice(0,5));setPage(1);}} /></Stack>
  {error&&<Alert severity='error'>{error}</Alert>}
  <TableContainer><Table size='small'><TableHead><TableRow>{['Дата / клиент ID','Маршрут','Груз','Тариф','Статус',''].map(x=><TableCell key={x}>{x}</TableCell>)}</TableRow></TableHead><TableBody>{rows.map(q=><TableRow key={q.id}><TableCell>{new Date(q.createdAt).toLocaleString('ru-RU')}<Typography variant='caption' display='block'>Клиент #{q.userId}</Typography></TableCell><TableCell>{q.request.originZip} → {q.request.zip}<Typography variant='caption' display='block'>{q.request.addressType==='residential'?'Жилой адрес':'Коммерческий адрес'}{q.request.limitedAccess?' · ограниченный доступ':''}</Typography></TableCell><TableCell>{q.request.shipmentItems.length} паллет · страховка {money(q.request.insuredCents)}</TableCell><TableCell>{q.result ? <>{money(q.amountCents)}<Typography variant='caption' display='block'>{q.result.selected.carrier}</Typography></>:'—'}</TableCell><TableCell><Chip size='small' color={q.status==='quoted'?'success':q.status==='failed'?'error':'warning'} label={q.status==='quoted'?'Рассчитано':q.status==='failed'?'Ошибка':'Запрошено'} /></TableCell><TableCell><Button onClick={()=>setSelected(q)}>Детали</Button></TableCell></TableRow>)}</TableBody></Table></TableContainer>
  {!loading&&!rows.length&&<Typography color='text.secondary'>Расчётов пока нет.</Typography>}<Pagination count={Math.max(1,Math.ceil(count/25))} page={page} onChange={(_,p)=>setPage(p)} />
  <Dialog open={!!selected} onClose={()=>setSelected(null)} fullWidth maxWidth='lg'><DialogTitle>Расчёт доставки</DialogTitle><DialogContent>{selected&&<Stack gap={2}>
    <Typography variant='body2'>ID: {selected.id} · Savtrans: {selected.result?.reference||'—'}</Typography>{selected.error&&<Alert severity='error'>{selected.error}</Alert>}
    <Typography>Страховая стоимость: {money(selected.request.insuredCents)} · страховой сбор: {selected.result?money(selected.result.insuranceCents):'—'} (уже включён в тариф)</Typography>
    <TableContainer><Table size='small'><TableHead><TableRow>{['Деталь','Код','Размеры, in','Вес, lbs','Commodity / Class / NMFC'].map(x=><TableCell key={x}>{x}</TableCell>)}</TableRow></TableHead><TableBody>{selected.request.shipmentItems.map((x,i)=><TableRow key={i}><TableCell>#{x.productId} {x.name}</TableCell><TableCell>{x.code}</TableCell><TableCell>{x.length} × {x.width} × {x.height}</TableCell><TableCell>{x.weight}</TableCell><TableCell>{x.commodity} / {x.freightClass} / {x.nmfc}</TableCell></TableRow>)}</TableBody></Table></TableContainer>
    <Typography variant='h6'>Предложения перевозчиков</Typography>{selected.result?.rates.map((r,i)=><Box key={i} display='flex' justifyContent='space-between'><Typography>{i===0?'✓ ':''}{r.carrier} · {r.transitDays||'—'} раб. дн.</Typography><Typography fontWeight={i===0?700:400}>{money(r.amountCents)}</Typography></Box>)}
    <Button onClick={()=>setSelected(null)}>Закрыть</Button>
  </Stack>}</DialogContent></Dialog>
 </Stack>;
};

export const FreightTab=()=>{const [tab,setTab]=useState(0);return <Stack gap={2}><Tabs value={tab} onChange={(_,value)=>setTab(value)}><Tab label="Крупные детали · Savtrans"/><Tab label="Посылки · FedEx"/></Tabs>{tab===0?<SavtransTab/>:<ParcelQuotes/>}</Stack>};
