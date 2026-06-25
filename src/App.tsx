/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./components/LandingPage";
import { CommandCenter } from "./components/CommandCenter";
import { JacksWarRoom } from "./components/JacksWarRoom";
import { LoginPage } from "./components/LoginPage";
import { GenritePage } from "./components/GenritePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/command" element={<CommandCenter />} />
        <Route path="/chat" element={<JacksWarRoom />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/genrite" element={<GenritePage />} />
        {/* Fallback to landing */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
