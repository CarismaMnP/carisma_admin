import { Box, Container, Paper, Stack, Tab, Tabs } from '@mui/material';
import { SyntheticEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { CategoriesTab } from '@/cmsTabs/Categories';
import { ProductsTab } from '@/cmsTabs/Products';
import { UsersTab } from '@/cmsTabs/Users';
import { OrdersTab } from '@/cmsTabs/Orders';
import { ArrivalsTab } from '@/cmsTabs/Arrivals';

const tabsConfig = [
  { value: 'categories', label: 'Categories', icon: <CategoryOutlinedIcon /> },
  { value: 'arrivals', label: 'Latest arrivals', icon: <BoltOutlinedIcon /> },
  { value: 'products', label: 'Products', icon: <Inventory2OutlinedIcon /> },
  { value: 'users', label: 'Users', icon: <GroupOutlinedIcon /> },
  { value: 'orders', label: 'Orders', icon: <ReceiptLongOutlinedIcon /> },
];

const allowedTabs = tabsConfig.map(tab => tab.value);

export const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const pathnameTab = location.pathname.split('/')[1];
  const currentTab = allowedTabs.includes(pathnameTab) ? pathnameTab : 'categories';
  const [tab, setTab] = useState(currentTab);

  useEffect(() => {
    if (tab !== currentTab) {
      setTab(currentTab);
    }
  }, [currentTab, tab]);

  const handleTabChange = (_event: SyntheticEvent, newValue: string) => {
    setTab(newValue);
    navigate(`/${newValue}`);
  };

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 3, md: 5 } }}>
      <Container maxWidth='lg'>
        <Stack spacing={3}>
          <Paper
            sx={{
              p: { xs: 1, md: 2 },
              background: 'linear-gradient(135deg, #ffffff 0%, #eef7ff 100%)',
            }}
          >
            <Tabs
              value={tab}
              onChange={handleTabChange}
              variant='scrollable'
              scrollButtons='auto'
              sx={{ gap: 3 }}
            >
              {tabsConfig.map(tabItem => (
                <Tab
                  key={tabItem.value}
                  label={tabItem.label}
                  value={tabItem.value}
                  icon={tabItem.icon}
                  iconPosition='start'
                />
              ))}
            </Tabs>
          </Paper>

          <Box>
            <Routes>
              <Route path='categories' element={<CategoriesTab />} />
              <Route path='arrivals' element={<ArrivalsTab />} />
              <Route path='products' element={<ProductsTab />} />
              <Route path='users' element={<UsersTab />} />
              <Route path='orders' element={<OrdersTab />} />
              <Route path='*' element={<Navigate to='/categories' replace />} />
            </Routes>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};
