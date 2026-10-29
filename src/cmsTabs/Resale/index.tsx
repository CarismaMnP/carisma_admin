import {useEffect,useState} from 'react';
import {Alert,Button,Checkbox,Chip,Dialog,DialogActions,DialogContent,DialogTitle,FormControlLabel,MenuItem,Pagination,Stack,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,TextField,Typography} from '@mui/material';
import {API} from '@/api';
type Application={id:string;userId:number;companyName:string;status:string;fileName:string;fileSize:number;sha256:string;reviewComment:string|null;reviewedBy:number|null;reviewedAt:string|null;createdAt:string;user:{id:number;name:string;mail:string;resaleTaxExempt:boolean;resaleCertificateId:string|null}};
type Review={id:string;fromStatus:string;toStatus:string;actorId:number;comment:string|null;createdAt:string};
const labels:Record<string,string>={pending:'Ожидает проверки',approved:'Одобрено',rejected:'Отклонено',revoked:'Одобрение отозвано',superseded:'Заменено'};
const errorText=(e:unknown)=>{const err=e as {response?:{data?:{message?:string}}};return err.response?.data?.message||'Не удалось выполнить запрос. Попробуйте снова.'};
export const ResaleTab=()=>{
 const [status,setStatus]=useState('pending'),[search,setSearch]=useState(''),[query,setQuery]=useState(''),[page,setPage]=useState(1),[refresh,setRefresh]=useState(0);
 const [rows,setRows]=useState<Application[]>([]),[count,setCount]=useState(0),[loading,setLoading]=useState(true),[error,setError]=useState(''),[success,setSuccess]=useState('');
 const [selected,setSelected]=useState<Application|null>(null),[decision,setDecision]=useState(''),[comment,setComment]=useState(''),[verified,setVerified]=useState(false),[busy,setBusy]=useState(false),[dialogError,setDialogError]=useState(''),[reviews,setReviews]=useState<Review[]>([]);
 useEffect(()=>{const t=setTimeout(()=>{setQuery(search.trim());setPage(1)},300);return()=>clearTimeout(t)},[search]);
 useEffect(()=>{const c=new AbortController();setLoading(true);setError('');API.get('/resale',{params:{status,search:query,page},signal:c.signal}).then(({data})=>{setRows(data.rows);setCount(data.count)}).catch(e=>{if(!c.signal.aborted)setError(errorText(e))}).finally(()=>{if(!c.signal.aborted)setLoading(false)});return()=>c.abort()},[status,query,page,refresh]);
 useEffect(()=>{setReviews([]);if(!selected)return;const c=new AbortController();API.get(`/resale/${selected.id}/reviews`,{signal:c.signal}).then(({data})=>setReviews(data)).catch(()=>{});return()=>c.abort()},[selected]);
 const open=(a:Application)=>{setSelected(a);setDecision(a.status==='pending'?'approved':a.status==='approved'?'revoked':'');setComment('');setVerified(false);setDialogError('')};
 const download=async(a:Application)=>{setBusy(true);setDialogError('');setError('');try{const {data}=await API.get(`/resale/${a.id}/document`,{responseType:'blob'});const url=URL.createObjectURL(data),link=document.createElement('a');link.href=url;link.download=a.fileName;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch(e){if(selected)setDialogError(errorText(e));else setError(errorText(e))}finally{setBusy(false)}};
 const save=async()=>{if(!selected||!decision)return;setBusy(true);setDialogError('');try{await API.post(`/resale/${selected.id}/review`,{decision,comment:comment.trim()});setSuccess(`Документ «${selected.fileName}»: ${labels[decision].toLowerCase()}. Решение сохранено.`);setSelected(null);setRefresh(n=>n+1)}catch(e){setDialogError(errorText(e))}finally{setBusy(false)}};
 return <Stack gap={2}>
  <Stack direction='row' justifyContent='space-between' alignItems='center'><Typography variant='h5'>Resale · налоговые сертификаты</Typography><Button disabled={loading||busy} onClick={()=>setRefresh(n=>n+1)}>Обновить</Button></Stack>
  <Alert severity='info'>Загрузка документа сама по себе не освобождает от налога. После проверки и одобрения освобождение применяется к новым заказам, в которых покупатель выбрал покупку для перепродажи. Уже созданные заказы и платежи не меняются.</Alert>
  <Stack direction={{xs:'column',sm:'row'}} gap={2}><TextField select label='Статус' SelectProps={{displayEmpty:true,renderValue:value=>labels[String(value)]||'Все статусы'}} InputLabelProps={{shrink:true}} size='small' sx={{minWidth:220}} value={status} onChange={e=>{setStatus(e.target.value);setPage(1)}}><MenuItem value=''>Все статусы</MenuItem>{Object.entries(labels).map(([key,label])=><MenuItem key={key} value={key}>{label}</MenuItem>)}</TextField><TextField label='Компания, имя или email' size='small' value={search} onChange={e=>setSearch(e.target.value)} fullWidth /></Stack>
  {error&&<Alert severity='error'>{error}</Alert>}{success&&<Alert severity='success' onClose={()=>setSuccess('')}>{success}</Alert>}
  {loading&&<Typography role='status'>Загрузка…</Typography>}
  <TableContainer><Table size='small'><TableHead><TableRow>{['Дата / клиент','Компания / документ','Статус','Решение',''].map((x,i)=><TableCell key={i}>{x}</TableCell>)}</TableRow></TableHead><TableBody>{rows.map(a=><TableRow key={a.id} hover>
   <TableCell>{new Date(a.createdAt).toLocaleString('ru-RU')}<Typography variant='body2'>{a.user?.name||`Клиент #${a.userId}`}</Typography><Typography variant='caption'>{a.user?.mail}</Typography></TableCell>
   <TableCell>{a.companyName}<Typography variant='body2' sx={{overflowWrap:'anywhere'}}>{a.fileName} · {(a.fileSize/1024).toFixed(0)} KB</Typography><Button size='small' disabled={busy} onClick={()=>download(a)}>Скачать документ</Button></TableCell>
   <TableCell><Chip size='small' label={labels[a.status]||a.status} color={a.status==='approved'?'success':a.status==='pending'?'warning':a.status==='rejected'||a.status==='revoked'?'error':'default'}/></TableCell>
   <TableCell sx={{maxWidth:280,whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{a.reviewComment||'—'}{a.reviewedAt&&<Typography variant='caption' display='block'>{new Date(a.reviewedAt).toLocaleString('ru-RU')} · администратор #{a.reviewedBy}</Typography>}</TableCell>
   <TableCell><Button disabled={busy} onClick={()=>open(a)}>{a.status==='pending'?'Рассмотреть':'Детали'}</Button></TableCell>
  </TableRow>)}</TableBody></Table></TableContainer>
  {!loading&&!rows.length&&!error&&<Typography color='text.secondary'>Заявок с такими условиями нет.</Typography>}
  <Pagination page={page} count={Math.max(1,Math.ceil(count/25))} onChange={(_,p)=>setPage(p)} />
  <Dialog open={!!selected} onClose={()=>{if(!busy)setSelected(null)}} fullWidth maxWidth='sm'><DialogTitle>Проверка resale certificate</DialogTitle><DialogContent>{selected&&<Stack gap={2} sx={{pt:1}}>
   <Typography><strong>{selected.companyName}</strong><br/>{selected.user?.name} · {selected.user?.mail}<br/>Клиент #{selected.userId}</Typography>
   <Button variant='outlined' disabled={busy} onClick={()=>download(selected)}>Скачать {selected.fileName}</Button>
   <Typography variant='caption' sx={{overflowWrap:'anywhere'}}>SHA-256: {selected.sha256}</Typography>
   {selected.status==='pending'&&<TextField select label='Решение' value={decision} onChange={e=>{setDecision(e.target.value);setVerified(false)}} disabled={busy}><MenuItem value='approved'>Одобрить</MenuItem><MenuItem value='rejected'>Отклонить</MenuItem></TextField>}
   {selected.status==='approved'&&<Alert severity='warning'>Отзыв одобрения отключит освобождение для будущих заказов. Неоплаченные заказы, уже созданные с освобождением, сохранят прежние условия.</Alert>}
   {!!decision&&<>
    <TextField label={decision==='approved'?'Комментарий для клиента (необязательно)':'Причина для клиента'} multiline minRows={3} value={comment} onChange={e=>setComment(e.target.value)} inputProps={{maxLength:2000}} required={decision!=='approved'} disabled={busy}/>
    <FormControlLabel control={<Checkbox checked={verified} onChange={e=>setVerified(e.target.checked)} disabled={busy}/>} label={decision==='approved'?'Я проверил документ и подтверждаю освобождение от sales tax для будущих покупок для перепродажи.':decision==='revoked'?'Подтверждаю отзыв одобрения.':'Подтверждаю отклонение документа.'}/>
   </>}
   {!decision&&selected.reviewComment&&<Alert severity='info'>{selected.reviewComment}</Alert>}
   {!!reviews.length&&<><Typography variant='subtitle2'>История решений</Typography>{reviews.map(r=><Typography variant='body2' key={r.id}>{new Date(r.createdAt).toLocaleString('ru-RU')} · #{r.actorId}: {labels[r.fromStatus]} → {labels[r.toStatus]}{r.comment?` · ${r.comment}`:''}</Typography>)}</>}
   {dialogError&&<Alert severity='error'>{dialogError}</Alert>}
  </Stack>}</DialogContent><DialogActions><Button disabled={busy} onClick={()=>setSelected(null)}>Закрыть</Button>{decision&&<Button variant='contained' color={decision==='approved'?'success':'error'} disabled={busy||!verified||(decision!=='approved'&&!comment.trim())} onClick={save}>{busy?'Сохранение…':decision==='approved'?'Одобрить':decision==='revoked'?'Отозвать одобрение':'Отклонить'}</Button>}</DialogActions></Dialog>
 </Stack>;
};
