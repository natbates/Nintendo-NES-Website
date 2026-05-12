import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// StrictMode helps surface unsafe effects and lifecycle issues during development.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
