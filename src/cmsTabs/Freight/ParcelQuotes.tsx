import {useEffect,useState} from 'react';
import {Alert,Button,Dialog,DialogContent,DialogTitle,Pagination,Stack,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Typography} from '@mui/material';
import {API} from '@/api';
type Quote={id:string;userId:number;status:string;createdAt:string;amountCents:number;error?:string;request:{address:{line1:string;line2:string;city:string;state:string;postal_code:string};packages:{productId:number;weightLb:number;lengthIn:number;widthIn:number;heightIn:number}[]};result?:{selected:{serviceName:string};rates:{serviceName:string;amountCents:number}[]}};
const money=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n/100);
export function ParcelQuotes(){
 const [page,setPage]=useState(1),[refresh,setRefresh]=useState(0),[rows,setRows]=useState<Quote[]>([]),[count,setCount]=useState(0),[error,setError]=useState(''),[selected,setSelected]=useState<Quote|null>(null);
 useEffect(()=>{const c=new AbortController();setError('');API.get('/parcel/quotes',{params:{page},signal:c.signal}).then(({data})=>{setRows(data.rows);setCount(data.count)}).catch(e=>{if(!c.signal.aborted)setError(e.response?.data?.message||'Не удалось загрузить расчёты')});return()=>c.abort()},[page,refresh]);
 return <Stack gap={2}><Stack direction='row' justifyContent='space-between'><Typography variant='h5'>Посылки · FedEx</Typography><Button onClick={()=>setRefresh(n=>n+1)}>Обновить</Button></Stack>
  <Alert severity='info'>Расчёты сохраняются с адресом, составом корзины и размерами упаковки. Самый дешёвый доступный тариф добавляется в заказ. Этикетка и отправка оформляются отдельно.</Alert>{error&&<Alert severity='error'>{error}</Alert>}
  <TableContainer><Table size='small'><TableHead><TableRow>{['Дата / клиент','ZIP','Посылки','Тариф','Статус',''].map(x=><TableCell key={x}>{x}</TableCell>)}</TableRow></TableHead><TableBody>{rows.map(q=><TableRow key={q.id}><TableCell>{new Date(q.createdAt).toLocaleString('ru-RU')}<Typography variant='caption' display='block'>Клиент #{q.userId}</Typography></TableCell><TableCell>{q.request.address.postal_code}</TableCell><TableCell>{q.request.packages.length}</TableCell><TableCell>{q.result?`${money(q.amountCents)} · ${q.result.selected.serviceName}`:'—'}</TableCell><TableCell>{q.status==='quoted'?'Рассчитано':q.status==='failed'?'Ошибка':'Запрошено'}</TableCell><TableCell><Button onClick={()=>setSelected(q)}>Детали</Button></TableCell></TableRow>)}</TableBody></Table></TableContainer>
  {!rows.length&&<Typography>Расчётов пока нет.</Typography>}<Pagination page={page} count={Math.max(1,Math.ceil(count/25))} onChange={(_,p)=>setPage(p)}/>
  <Dialog open={!!selected} onClose={()=>setSelected(null)} maxWidth='md' fullWidth><DialogTitle>Расчёт FedEx</DialogTitle><DialogContent>{selected&&<Stack gap={2}><Typography>ID: {selected.id}</Typography><Typography>{Object.values(selected.request.address).filter(Boolean).join(', ')}</Typography>{selected.error&&<Alert severity='error'>{selected.error}</Alert>}
   {selected.request.packages.map((p,i)=><Typography key={i}>Товар #{p.productId}: {p.weightLb} lb · {p.lengthIn} × {p.widthIn} × {p.heightIn} in</Typography>)}
   {selected.result?.rates.map((r,i)=><Typography key={i}>{r.serviceName}: {money(r.amountCents)}</Typography>)}<Button onClick={()=>setSelected(null)}>Закрыть</Button>
  </Stack>}</DialogContent></Dialog>
 </Stack>;
}
