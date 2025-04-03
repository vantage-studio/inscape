import { BrowserRouter, Routes, Route } from "react-router-dom";
import AnimatedTitle from "./components/home/AnimatedTitle";
import CaseStudy from "./components/case-study/CaseStudy";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AnimatedTitle />} />
        <Route path="/case-study/:imageId" element={<CaseStudy />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
