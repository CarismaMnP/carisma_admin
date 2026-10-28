import {useState} from 'react';
import {Alert,Button,Dialog,DialogActions,DialogContent,DialogTitle,Stack,TextField,Typography} from '@mui/material';
import {API} from '@/api';
import {IProduct} from '../types';
export function PackageEditor({product,onClose,onSaved}:{product:IProduct;onClose:()=>void;onSaved:()=>void}){
 const [values,setValues]=useState({weightLb:product.parcelPackage?.weightLb?.toString()||'',lengthIn:product.parcelPackage?.lengthIn?.toString()||'',widthIn:product.parcelPackage?.widthIn?.toString()||'',heightIn:product.parcelPackage?.heightIn?.toString()||''});
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const save=async(clear=false)=>{setBusy(true);setError('');try{
  await API.put(`/product/${product.id}/parcel-package`,{parcelPackage:clear?null:Object.fromEntries(Object.entries(values).map(([k,v])=>[k,Number(v)]))});
  onSaved();onClose();
 }catch(e:any){setError(e.response?.data?.message||'Не удалось сохранить упаковку');}finally{setBusy(false)}};
 return <Dialog open onClose={busy?undefined:onClose} maxWidth='sm' fullWidth>
  <DialogTitle>Упаковка для доставки FedEx</DialogTitle><DialogContent><Stack gap={2} sx={{pt:1}}>
   <Typography>{product.name}</Typography><Alert severity='info'>Укажите вес и наружные размеры готовой упаковки для одной детали. Каждая единица рассчитывается как отдельная посылка. Эти данные сохраняются на сайте и не меняются при синхронизации с Checkmate.</Alert>
   <Typography variant='body2'>Только обычные грузы, разрешённые к стандартной перевозке. Крупногабаритные детали рассчитываются по грузовому профилю Savtrans.</Typography>
   {(Object.entries({weightLb:'Вес с упаковкой, lb',lengthIn:'Длина, in',widthIn:'Ширина, in',heightIn:'Высота, in'}) as [keyof typeof values,string][]).map(([key,label])=><TextField key={key} label={label} type='number' value={values[key]} disabled={busy} inputProps={{min:0.01,step:key==='weightLb'?0.01:1}} onChange={e=>setValues(v=>({...v,[key]:e.target.value}))}/>)}
   {error&&<Alert severity='error'>{error}</Alert>}
  </Stack></DialogContent><DialogActions>
   {product.parcelPackage&&<Button color='error' disabled={busy} onClick={()=>save(true)}>Убрать замеры</Button>}
   <Button disabled={busy} onClick={onClose}>Отмена</Button><Button variant='contained' disabled={busy||Object.values(values).some(v=>!v||Number(v)<=0)} onClick={()=>save()}>Сохранить</Button>
  </DialogActions>
 </Dialog>;
}
