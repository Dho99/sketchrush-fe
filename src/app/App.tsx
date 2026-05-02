import { RouterProvider } from 'react-router';
import { ThemeProvider } from 'next-themes';
import { useEffect } from 'react';
import { router } from './routes';
import { useAuthStore } from '../store/auth-store';

export default function App() {
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const hasFetchedMe = useAuthStore((state) => state.hasFetchedMe);

  useEffect(() => {
    if (!hasFetchedMe) {
      fetchMe();
    }
  }, [fetchMe, hasFetchedMe]);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
