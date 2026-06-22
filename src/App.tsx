/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./components/LandingPage";
import { CommandCenter } from "./components/CommandCenter";
import { JacksWarRoom } from "./components/JacksWarRoom";
import { LoginPage } from "./components/LoginPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/command" element={<CommandCenter />} />
        <Route path="/chat" element={<JacksWarRoom />} />
        <Route path="/login" element={<LoginPage />} />
        {/* Fallback to landing */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
