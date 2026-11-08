import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource/poppins/latin-400.css";
import "@fontsource/poppins/latin-500.css";
import "@fontsource/poppins/latin-600.css";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { API_URL } from "./api/client";
import { initialiserTraduction } from "./traduction/traducteur";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);

// Traduction automatique de l'interface (bouton FR | EN de la barre latérale)
initialiserTraduction(API_URL);
