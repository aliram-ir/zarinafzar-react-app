import { ThemeProvider, CssBaseline } from '@mui/material'
import theme from './theme/muiTheme'
import ToastProvider from './components/ToastProvider'
import UsersList from './pages/UsersList'

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <ToastProvider />
    <UsersList />
  </ThemeProvider>
)

export default App
