import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SwapView from "./components/swap";
import EarnView from "./components/earn";
import AppLayout from "./components/layout";
import { WalletProvider } from "./shared/context/WalletContext";

function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/swap" replace />} />
            <Route path="swap" element={<SwapView />} />
            <Route path="earn" element={<EarnView />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  );
}

export default App;
