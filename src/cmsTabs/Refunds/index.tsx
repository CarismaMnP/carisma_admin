import {useCallback,useEffect,useState} from 'react';
import {Link as RouterLink} from 'react-router-dom';
import {Alert,Box,Button,Checkbox,Chip,Dialog,DialogActions,DialogContent,DialogTitle,FormControlLabel,Link,MenuItem,Pagination,Paper,Stack,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,TextField,Typography} from '@mui/material';
import {API} from '@/api';
interface ReturnRequest {
 id:string;orderId:string;userId:number;status:'pending'|'approved'|'rejected';reason:string;reviewComment:string;createdAt:string;reviewedAt:string|null;reviewedBy:number|null;
 user?:{id:number;name:string;mail:string;phone:string};
 order?:{id:string;state:string;sum:number;tax:number;total:number;shippingAmount:number;stripePaymentIntentId:string|null;stripeRefundedCents:number;stripeRefundUpdatedAt:string|null;delivey_type:string;fullName:string;mail:string;phone:string;orderProducts:Array<{id:number;count:number;productSnapshot?:{name?:string};product?:{name:string}}>};
}
const labels={pending:'На рассмотрении',approved:'Одобрено',rejected:'Отклонено'};
const money=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
const message=(e:unknown)=>(e as {response?:{data?:{message?:string}}})?.response?.data?.message||'Не удалось выполнить запрос. Попробуйте ещё раз.';
export function RefundsTab(){
 const [rows,setRows]=useState<ReturnRequest[]>([]),[count,setCount]=useState(0),[page,setPage]=useState(1),[status,setStatus]=useState('pending');
 const [loading,setLoading]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState(''),[revision,setRevision]=useState(0);
 const [selected,setSelected]=useState<ReturnRequest|null>(null),[decision,setDecision]=useState('approved'),[comment,setComment]=useState(''),[confirmed,setConfirmed]=useState(false),[busy,setBusy]=useState(false),[dialogError,setDialogError]=useState('');
 const refresh=useCallback(()=>setRevision(v=>v+1),[]);
 useEffect(()=>{const abort=new AbortController();setLoading(true);setError('');API.get('/refunds',{params:{status,page},signal:abort.signal}).then(({data})=>{if(!abort.signal.aborted){setRows(data.rows);setCount(data.count);if(page>1&&data.count<=(page-1)*25)setPage(Math.max(1,Math.ceil(data.count/25)))}}).catch(e=>{if(!abort.signal.aborted)setError(message(e))}).finally(()=>{if(!abort.signal.aborted)setLoading(false)});return()=>abort.abort()},[status,page,revision]);
 const open=(request:ReturnRequest)=>{setSelected(request);setDecision('approved');setComment('');setConfirmed(false);setDialogError('')};
 const save=async()=>{if(!selected||busy)return;setBusy(true);setDialogError('');try{await API.post(`/refunds/${selected.id}/review`,{decision,comment,confirmManualRefund:confirmed});setSelected(null);setNotice(decision==='approved'?'Возврат одобрен. Заказ получил статус refunded. Возврат денег выполните вручную в Stripe.':'Заявка отклонена. Комментарий доступен покупателю.');refresh()}catch(e){setDialogError(message(e))}finally{setBusy(false)}};
 return <Stack gap={2} sx={{minWidth:0}}>
  <Stack direction={{xs:'column',sm:'row'}} justifyContent='space-between' gap={1}><Box><Typography variant='h5' fontWeight={700}>Возвраты</Typography><Typography color='text.secondary'>Заявки покупателей и ручная обработка</Typography></Box><Button disabled={loading} onClick={refresh}>Обновить</Button></Stack>
  <Alert severity='info'>Одобрение меняет статус заказа на refunded. Деньги возвращаются вручную в Stripe. Стоимость обратной доставки учитывайте при возврате платежа.</Alert>
  <Paper sx={{p:2}}><TextField select label='Статус заявки' value={status} onChange={e=>{setStatus(e.target.value);setPage(1)}} size='small' sx={{minWidth:240}}><MenuItem value=''>Все заявки</MenuItem>{Object.entries(labels).map(([value,label])=><MenuItem key={value} value={value}>{label}</MenuItem>)}</TextField><Typography variant='caption' sx={{ml:2}}>Найдено: {loading?'…':count}</Typography></Paper>
  {error&&<Alert severity='error'>{error}</Alert>}{notice&&<Alert severity='success' onClose={()=>setNotice('')}>{notice}</Alert>}
  <TableContainer component={Paper}><Table size='small' sx={{minWidth:820}}><TableHead><TableRow>{['Дата / покупатель','Заказ / причина','Статус заявки','Stripe: возврат',''].map((label,i)=><TableCell key={i}>{label}</TableCell>)}</TableRow></TableHead><TableBody>
   {rows.map(row=><TableRow key={row.id} hover>
    <TableCell>{new Date(row.createdAt).toLocaleString('ru-RU')}<Typography variant='body2'><Link component={RouterLink} to={`/users?userId=${row.userId}`}>{row.order?.fullName||row.user?.name||`Покупатель #${row.userId}`}</Link></Typography><Typography variant='caption' sx={{overflowWrap:'anywhere'}}>{row.order?.mail||row.user?.mail}</Typography></TableCell>
    <TableCell sx={{maxWidth:340}}><Link component={RouterLink} to={`/orders?orderId=${row.orderId}`}>Заказ #{row.orderId.slice(0,8).toUpperCase()}</Link><Typography variant='body2' sx={{overflowWrap:'anywhere',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{row.reason}</Typography></TableCell>
    <TableCell><Chip size='small' label={labels[row.status]} color={row.status==='pending'?'warning':row.status==='approved'?'success':'default'}/><Typography variant='caption' display='block'>Заказ: {row.order?.state}</Typography></TableCell>
    <TableCell>{row.order?.stripeRefundedCents?money(row.order.stripeRefundedCents/100):'Нет уведомления о возврате'}</TableCell>
    <TableCell><Button onClick={()=>open(row)}>{row.status==='pending'?'Рассмотреть':'Детали'}</Button></TableCell>
   </TableRow>)}
   {!rows.length&&<TableRow><TableCell colSpan={5} sx={{py:4}} align='center'>{loading?'Загрузка…':'Заявок с таким статусом нет.'}</TableCell></TableRow>}
  </TableBody></Table></TableContainer>
  <Pagination page={page} count={Math.max(1,Math.ceil(count/25))} onChange={(_,v)=>setPage(v)} disabled={loading}/>
  <Dialog open={!!selected} onClose={()=>!busy&&setSelected(null)} fullWidth maxWidth='sm'><DialogTitle>Запрос на возврат</DialogTitle><DialogContent>{selected&&<Stack gap={2} sx={{pt:1}}>
   <Typography><strong>{selected.order?.fullName||selected.user?.name||`Покупатель #${selected.userId}`}</strong><br/>{selected.order?.mail||selected.user?.mail}<br/>{selected.order?.phone||selected.user?.phone}</Typography>
   <Link component={RouterLink} to={`/orders?orderId=${selected.orderId}`}>Открыть заказ #{selected.orderId.slice(0,8).toUpperCase()} — адрес и все детали</Link>
   <Box><Typography variant='subtitle2'>Причина возврата</Typography><Typography sx={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{selected.reason}</Typography></Box>
   <Box><Typography variant='subtitle2'>Товары</Typography>{selected.order?.orderProducts?.map(item=><Typography variant='body2' key={item.id}>{item.productSnapshot?.name||item.product?.name||'Товар'} × {item.count}</Typography>)}</Box>
   <Typography variant='body2'>Доставка: {selected.order?.delivey_type==='freight'?'Грузовая':selected.order?.delivey_type==='pickup'?'Самовывоз':'Посылка'}<br/>Стоимость товаров: {money(selected.order?.sum||0)}<br/>Сумма возврата по уведомлениям Stripe: {money((selected.order?.stripeRefundedCents||0)/100)}</Typography>
   {selected.order?.stripePaymentIntentId&&<Box><Typography variant='caption'>Stripe Payment Intent</Typography><Typography variant='body2' sx={{overflowWrap:'anywhere',fontFamily:'monospace'}}>{selected.order.stripePaymentIntentId}</Typography><Link href='https://dashboard.stripe.com/payments' target='_blank' rel='noopener noreferrer'>Открыть платежи Stripe ↗</Link></Box>}
   {selected.status==='pending'?<>
    <TextField id='refund-decision' select label='Решение' value={decision} onChange={e=>{setDecision(e.target.value);setConfirmed(false)}} disabled={busy}><MenuItem value='approved'>Одобрить возврат</MenuItem><MenuItem value='rejected'>Отклонить заявку</MenuItem></TextField>
    <TextField label={decision==='approved'?'Комментарий покупателю (необязательно)':'Причина отказа для покупателя'} multiline minRows={3} value={comment} onChange={e=>setComment(e.target.value)} inputProps={{maxLength:2000}} required={decision==='rejected'} disabled={busy}/>
    {decision==='approved'&&<FormControlLabel control={<Checkbox checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} disabled={busy}/>} label='Подтверждаю одобрение возврата. Статус заказа станет refunded; возврат денег я оформляю вручную в Stripe.'/>}
   </>:<Alert severity={selected.status==='approved'?'success':'info'}>{labels[selected.status]}{selected.reviewComment&&<Typography sx={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{selected.reviewComment}</Typography>}{selected.reviewedAt&&<Typography variant='caption' display='block'>{new Date(selected.reviewedAt).toLocaleString('ru-RU')} · администратор #{selected.reviewedBy}</Typography>}</Alert>}
   {dialogError&&<Alert severity='error'>{dialogError}</Alert>}
  </Stack>}</DialogContent><DialogActions><Button disabled={busy} onClick={()=>setSelected(null)}>Закрыть</Button>{selected?.status==='pending'&&<Button variant='contained' color={decision==='approved'?'success':'error'} disabled={busy||(decision==='approved'?!confirmed:!comment.trim())} onClick={save}>{busy?'Сохранение…':decision==='approved'?'Одобрить возврат':'Отклонить'}</Button>}</DialogActions></Dialog>
 </Stack>;
}
