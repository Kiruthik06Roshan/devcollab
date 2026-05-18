import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AppProviders } from './contexts/AppProviders';

export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}