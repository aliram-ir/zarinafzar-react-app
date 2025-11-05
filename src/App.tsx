import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '@/routes/AppRoutes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeModeProvider } from '@/providers/ThemeModeProvider';

export default function App() {
  return (
    <ThemeModeProvider>
      {/* تمام اپلیکیشن داخل ThemeModeProvider تا تم دینامیک اعمال شود */}
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>

      {/* ToastContainer داخل Provider باشد تا تم را بگیرد */}
      <ToastContainer
        rtl
        position="bottom-left"
        theme="colored" // رنگ‌بندی Toast بر اساس تم
      />
    </ThemeModeProvider>
  );
}
