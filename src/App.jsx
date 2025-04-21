import { createTheme, ThemeProvider } from "@mui/material";
import CredentialEncryptor from "./containers/CredentialEncryptor";
import CredentialDecryptor from "./containers/CredentialDecryptor";
import CryptoTools from "./containers/CryptoTools";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: "#000000", // black color
      },
      secondary: {
        main: "#ffffff", // white color
      },
    },
  });
  //Portable Encrypted Credential Locker

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CryptoTools />} />
          <Route path="/cred-encrypt" element={<CredentialEncryptor />} />
          <Route path="/cred-decrypt" element={<CredentialDecryptor />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
