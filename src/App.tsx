import React from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Simulator from "./pages/Simulator";
import Review from "./pages/Review";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Simulator />} />
        <Route path="/review/:candidateId" element={<Review />} />
      </Routes>
    </BrowserRouter>
  );
}
