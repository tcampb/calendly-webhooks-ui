import { AppShell, Button, Flex, Title } from '@mantine/core';
import reactLogo from '../assets/react.svg';
import { deleteAuthContext } from '../storage';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export function Layout() {
    const location = useLocation();
    const navigate = useNavigate();

    const onLogout = () => {
        deleteAuthContext();
        navigate('/');
    }

    return (
        <AppShell
            padding="md"
            header={{ height: 90 }}
        >
            <AppShell.Header>
                <Flex h={'100%'} pl={'md'} pr={'md'} align={'center'} justify={'space-between'}>
                    <Flex align={'center'}>
                        <img height={'40px'} width={'40px'} src={reactLogo} alt="React Logo" />
                        <Title pl={'md'} order={4}>
                            Calendly Dev Tools
                        </Title>
                    </Flex>
                    {location.pathname !== '/' && <Button onClick={onLogout}>Logout</Button>}
                </Flex>

            </AppShell.Header>
            <AppShell.Main>
                <Outlet />
            </AppShell.Main>
        </AppShell>
    );
}