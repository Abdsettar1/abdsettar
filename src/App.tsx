/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CommandCenter } from "./components/CommandCenter";
import { JacksWarRoom } from "./components/JacksWarRoom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CommandCenter />} />
        <Route path="/chat" element={<JacksWarRoom />} />
        {/* Fallback to home */}
        <Route path="*" element={<CommandCenter />} />
      </Routes>
    </BrowserRouter>
  );
}
