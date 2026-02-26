import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { SyntheticEvent, useEffect, useMemo, useState } from 'react';
import { API } from '@/api';
import { formatDate } from '@/shared/utils/formarDate';
import { IClientRequest, IPartRequest } from './types';

type RequestTabType = 'client' | 'part';

const getShortText = (value: string, maxLength = 110) => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...`;
};

export const RequestsTab = () => {
  const [tab, setTab] = useState<RequestTabType>('client');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | false>(false);
  const [markingReadIds, setMarkingReadIds] = useState<Record<string, boolean>>({});
  const [clientRequests, setClientRequests] = useState<IClientRequest[]>([]);
  const [partRequests, setPartRequests] = useState<IPartRequest[]>([]);

  const fetchRequests = async (silent = false) => {
    if (silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const [clientResponse, partResponse] = await Promise.all([
        API.get<IClientRequest[]>('/request/client/requests'),
        API.get<IPartRequest[]>('/request/part/requests'),
      ]);

      setClientRequests(Array.isArray(clientResponse.data) ? clientResponse.data : []);
      setPartRequests(Array.isArray(partResponse.data) ? partResponse.data : []);
    } catch (requestError) {
      console.error('Ошибка при получении запросов:', requestError);
      setError('Не удалось загрузить запросы. Попробуйте обновить страницу.');
    } finally {
      if (silent) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  const markRequestAsRead = async (id: string) => {
    if (markingReadIds[id]) return;

    setMarkingReadIds(prev => ({ ...prev, [id]: true }));

    try {
      await API.post('/request/read', { id });

      setClientRequests(prev => prev.map(request => (request.id === id ? { ...request, isUnread: false } : request)));
      setPartRequests(prev => prev.map(request => (request.id === id ? { ...request, isUnread: false } : request)));
    } catch (requestError) {
      console.error('Ошибка при отметке запроса как прочитанного:', requestError);
    } finally {
      setMarkingReadIds(prev => {
        const nextState = { ...prev };
        delete nextState[id];
        return nextState;
      });
    }
  };

  useEffect(() => {
    void fetchRequests();
  }, []);

  const handleTabChange = (_event: SyntheticEvent, newValue: RequestTabType) => {
    setTab(newValue);
    setExpandedId(false);
  };

  const handleAccordionChange =
    (id: string, isUnread: boolean) => (_event: SyntheticEvent, isExpanded: boolean) => {
      setExpandedId(isExpanded ? id : false);

      if (isExpanded && isUnread) {
        void markRequestAsRead(id);
      }
    };

  const unreadClientCount = useMemo(
    () => clientRequests.reduce((count, request) => count + (request.isUnread ? 1 : 0), 0),
    [clientRequests],
  );
  const unreadPartCount = useMemo(
    () => partRequests.reduce((count, request) => count + (request.isUnread ? 1 : 0), 0),
    [partRequests],
  );

  const activeRequests = tab === 'client' ? clientRequests : partRequests;

  if (isLoading) {
    return (
      <Stack alignItems='center' justifyContent='center' py={8}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack gap='20px' width='100%'>
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent='space-between' gap='12px'>
        <Stack gap={0.5}>
          <Typography variant='h6'>Клиентские запросы</Typography>
          <Typography variant='body2' color='text.secondary'>
            Просматривайте сообщения клиентов и заявки на автозапчасти.
          </Typography>
        </Stack>
        <Button variant='outlined' onClick={() => void fetchRequests(true)} disabled={isRefreshing}>
          {isRefreshing ? 'Обновляем...' : 'Обновить'}
        </Button>
      </Stack>

      {error && <Alert severity='error'>{error}</Alert>}

      <Paper
        sx={{
          p: { xs: 1, md: 2 },
          background: 'linear-gradient(145deg, #ffffff 0%, #f6f9ff 100%)',
        }}
      >
        <Tabs value={tab} onChange={handleTabChange} variant='scrollable' scrollButtons='auto'>
          <Tab
            value='client'
            label={`Клиентские сообщения (${unreadClientCount}/${clientRequests.length})`}
          />
          <Tab
            value='part'
            label={`Запросы по автозапчастям (${unreadPartCount}/${partRequests.length})`}
          />
        </Tabs>
      </Paper>

      <Stack gap='12px'>
        {activeRequests.length === 0 && (
          <Paper sx={{ p: 3 }}>
            <Typography color='text.secondary'>Запросов пока нет.</Typography>
          </Paper>
        )}

        {tab === 'client' &&
          clientRequests.map(request => (
            <Accordion
              key={request.id}
              disableGutters
              expanded={expandedId === request.id}
              onChange={handleAccordionChange(request.id, request.isUnread)}
              sx={{
                borderRadius: '12px',
                border: '1px solid',
                borderColor: request.isUnread ? 'primary.light' : 'divider',
                bgcolor: request.isUnread ? 'rgba(25, 118, 210, 0.05)' : 'background.paper',
                '&::before': { display: 'none' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack width='100%' direction={{ xs: 'column', md: 'row' }} justifyContent='space-between' gap={1}>
                  <Stack gap={0.5} minWidth={0}>
                    <Typography variant='subtitle1' sx={{ fontWeight: request.isUnread ? 700 : 600 }}>
                      {request.name} ({request.mail})
                    </Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ wordBreak: 'break-word' }}>
                      {getShortText(request.message)}
                    </Typography>
                  </Stack>
                  <Stack
                    direction='row'
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    justifyContent='flex-end'
                    gap={1}
                    flexWrap='wrap'
                  >
                    {request.isUnread && <Chip size='small' color='primary' label='Новый' />}
                    {markingReadIds[request.id] && <Chip size='small' label='Отмечаем...' />}
                    <Typography variant='caption' color='text.secondary'>
                      {formatDate(request.createdAt)}
                    </Typography>
                  </Stack>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack gap={1.5}>
                  <Typography variant='body2'>
                    <Box component='span' sx={{ fontWeight: 600 }}>
                      Имя:
                    </Box>{' '}
                    {request.name}
                  </Typography>
                  <Typography variant='body2'>
                    <Box component='span' sx={{ fontWeight: 600 }}>
                      Email:
                    </Box>{' '}
                    {request.mail}
                  </Typography>
                  <Typography variant='body2'>
                    <Box component='span' sx={{ fontWeight: 600 }}>
                      Дата:
                    </Box>{' '}
                    {formatDate(request.createdAt)}
                  </Typography>
                  <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {request.message}
                  </Typography>
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}

        {tab === 'part' &&
          partRequests.map(request => (
            <Accordion
              key={request.id}
              disableGutters
              expanded={expandedId === request.id}
              onChange={handleAccordionChange(request.id, request.isUnread)}
              sx={{
                borderRadius: '12px',
                border: '1px solid',
                borderColor: request.isUnread ? 'primary.light' : 'divider',
                bgcolor: request.isUnread ? 'rgba(25, 118, 210, 0.05)' : 'background.paper',
                '&::before': { display: 'none' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack width='100%' direction={{ xs: 'column', md: 'row' }} justifyContent='space-between' gap={1}>
                  <Stack gap={0.5} minWidth={0}>
                    <Typography variant='subtitle1' sx={{ fontWeight: request.isUnread ? 700 : 600 }}>
                      {request.make} {request.model} {request.generation}
                    </Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ wordBreak: 'break-word' }}>
                      {getShortText(request.partDescription)}
                    </Typography>
                  </Stack>
                  <Stack
                    direction='row'
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    justifyContent='flex-end'
                    gap={1}
                    flexWrap='wrap'
                  >
                    {request.isUnread && <Chip size='small' color='primary' label='Новый' />}
                    {markingReadIds[request.id] && <Chip size='small' label='Отмечаем...' />}
                    <Typography variant='caption' color='text.secondary'>
                      {formatDate(request.createdAt)}
                    </Typography>
                  </Stack>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack gap={1.5}>
                  <Typography variant='body2'>
                    <Box component='span' sx={{ fontWeight: 600 }}>
                      Марка:
                    </Box>{' '}
                    {request.make}
                  </Typography>
                  <Typography variant='body2'>
                    <Box component='span' sx={{ fontWeight: 600 }}>
                      Модель:
                    </Box>{' '}
                    {request.model}
                  </Typography>
                  <Typography variant='body2'>
                    <Box component='span' sx={{ fontWeight: 600 }}>
                      Поколение:
                    </Box>{' '}
                    {request.generation || '-'}
                  </Typography>
                  <Typography variant='body2'>
                    <Box component='span' sx={{ fontWeight: 600 }}>
                      Запчасть:
                    </Box>{' '}
                    {request.partDescription || '-'}
                  </Typography>
                  <Typography variant='body2'>
                    <Box component='span' sx={{ fontWeight: 600 }}>
                      Email:
                    </Box>{' '}
                    {request.email}
                  </Typography>
                  <Typography variant='body2'>
                    <Box component='span' sx={{ fontWeight: 600 }}>
                      Дата:
                    </Box>{' '}
                    {formatDate(request.createdAt)}
                  </Typography>
                  <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {request.partDescription}
                  </Typography>
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
      </Stack>
    </Stack>
  );
};
