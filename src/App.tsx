// 📁 src/App.tsx
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '@/routes/AppRoutes';
import { ThemeModeProvider } from '@/providers/ThemeModeProvider';
import ToastProvider from '@/components/ToastProvider'; // ✅ استفاده از Provider یکتا

export default function App() {
  return (
    <ThemeModeProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <ToastProvider />
    </ThemeModeProvider>
  );
}
