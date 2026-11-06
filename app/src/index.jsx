import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import "@fontsource-variable/inter";
import "./global.css";
import { masquerChargeur } from "./utils/chargeur";

const container = document.getElementById("root");

const root = createRoot(container);
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);

// Le site est monté : on retire l'écran de chargement dès que la page est prête
masquerChargeur();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
