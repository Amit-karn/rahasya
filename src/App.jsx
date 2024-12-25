import { createTheme, ThemeProvider, Button } from '@mui/material';
import './App.css'
import PasswordManager from './PasswordManager'

function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: '#000000', // black color
      },
      secondary: {
        main: '#ffffff', // white color
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <PasswordManager />
    </ThemeProvider>
  )
}

export default App
