import { createTheme, ThemeProvider } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CredentialEncryptor from "./containers/CredentialEncryptor";
import CredentialDecryptor from "./containers/CredentialDecryptor";
import LandingPage from "./components/LandingPage";
import AesGcmInfo from "./components/AesGcmInfo";
import NotFound from "./components/NotFound";
import CryptoTools from "./containers/CryptoTools";

const App = () => {
  const theme = createTheme({
    palette: {
      primary: {
        main: "#000000" // black color
      },
      secondary: {
        main: "#ffffff" // white color
      }
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          {/* Main Routes */}
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/encrypt" element={<CredentialEncryptor />} />
          <Route path="/decrypt" element={<CredentialDecryptor />} />
          {/* AES-GCM Info Page */}
          <Route path="/aes-gcm" element={<AesGcmInfo />} />
          {/* Tools */}
          <Route path="/tools" element={<CryptoTools />} />
          {/* Error for unknown page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;