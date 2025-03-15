import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import App from "./App.jsx";
import { Toaster } from "sonner";

import { SocketProvider } from "./context/SocketContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <SocketProvider>
    <App />
    <Toaster closeButton />
  </SocketProvider>
);
