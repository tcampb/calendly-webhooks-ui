import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import { MantineProvider } from '@mantine/core';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./components/Login";
import CreateWebhook from "./components/CreateWebhook";
import Callback from "./components/Callback";
import { Layout } from './components/Layout';
import Webhooks from './components/Webhooks';
import { Notifications } from '@mantine/notifications';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Login />,
      },
      {
        path: "/oauth/callback",
        element: <Callback />,
      },
      {
        path: "/webhooks",
        element: <Webhooks />,
      },
      {
        path: "/webhooks/new",
        element: <CreateWebhook />,
      }
    ],
  },
]);

export default function App() {
  return (
    <MantineProvider>
      <Notifications position='top-right' />
      <RouterProvider router={router} />
    </MantineProvider>
  );
}