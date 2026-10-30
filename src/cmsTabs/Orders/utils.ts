export const ORDER_STATE_OPTIONS = [
  {value:'completed',label:'Завершён'},
  {value:'refunded',label:'Возврат одобрен / refunded'},
  {value:'disputed',label:'Спор по оплате'},
  {
    value: 'pending',
    label: 'В обработке',
  },
  {
    value: 'paid',
    label: 'Оплачен',
  },
  {
    value: 'expired',
    label: 'Срок оплаты истек',
  },
  {
    value: 'confirmed',
    label: 'Оплачен',
  },
  {
    value: 'delivery',
    label: 'Передан в доставку',
  },
  {
    value: 'delivered',
    label: 'Доставлен',
  },
  {
    value: 'canceled',
    label: 'Отменён',
  },
];
