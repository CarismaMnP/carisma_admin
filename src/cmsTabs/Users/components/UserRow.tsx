import { Button, Checkbox, Chip, Stack, TableCell, TableRow, Typography } from '@mui/material';
import { IUser } from '../types';
const money = (value:number) => Number(value || 0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const date = (value?:string | null) => value ? new Date(value).toLocaleDateString('ru-RU') : '—';
interface Props {
  user:IUser; checked:boolean; highlighted:boolean; disabled:boolean;
  onToggle:(checked:boolean)=>void; onEdit:()=>void;
}
export const UserRow = ({user,checked,highlighted,disabled,onToggle,onEdit}:Props) => <TableRow hover selected={checked} sx={highlighted ? {backgroundColor:'#fff4d6','& td':{borderTop:'2px solid #daa72b',borderBottom:'2px solid #daa72b'}} : undefined}>
  <TableCell padding="checkbox"><Checkbox checked={checked} disabled={disabled} onChange={e => onToggle(e.target.checked)} inputProps={{'aria-label':`Выбрать пользователя ${user.id}`}}/></TableCell>
  <TableCell><Typography fontWeight={600}>{user.name || 'Без имени'}</Typography><Typography variant="caption" color="text.secondary">#{user.id} · {user.category} · Скидка {user.discount || 0}%</Typography>{user.resaleTaxExempt && <Chip size="small" label="Resale approved" color="success" variant="outlined" sx={{mt:0.5,display:'flex',width:'fit-content'}}/>}</TableCell>
  <TableCell sx={{maxWidth:260,overflowWrap:'anywhere'}}><Typography variant="body2">{user.mail || '—'}</Typography><Typography variant="caption" color="text.secondary">{user.phone || 'Телефон не указан'}</Typography></TableCell>
  <TableCell><Stack alignItems="flex-start"><Typography variant="body2">{user.purchasingAs || 'Не указана'}</Typography><Button size="small" onClick={onEdit} disabled={disabled} aria-label={`Изменить категорию пользователя ${user.id}`} sx={{px:0}}>Изменить</Button></Stack></TableCell>
  <TableCell align="right" sx={{whiteSpace:'nowrap'}}>{money(user.total)}</TableCell>
  <TableCell align="right"><Typography variant="body2">{user.paidOrdersCount || 0}</Typography><Typography variant="caption" color="text.secondary">{date(user.lastOrderAt)}</Typography></TableCell>
  <TableCell align="right" sx={{whiteSpace:'nowrap'}}>{money(user.cartSum)}</TableCell><TableCell sx={{whiteSpace:'nowrap'}}>{date(user.createdAt)}</TableCell>
</TableRow>;
