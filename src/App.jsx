import { createTheme, ThemeProvider, Button } from "@mui/material";
import "./App.css";
import CredentialEncryptor from "./CredentialEncryptor";
import CredentialDecryptor from "./CredentialDecryptor";
import { BrowserRouter, Routes, Route } from "react-router";

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
          {/* <Route path="/" element={<div> Coming soon </div>} /> */}
          <Route path="/" element={<CredentialEncryptor />} />
          <Route path="/cred-decrypt" element={<CredentialDecryptor />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
