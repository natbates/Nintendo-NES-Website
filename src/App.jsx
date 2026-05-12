import React from "react";
import { Routes, Route, BrowserRouter, useLocation } from "react-router-dom";
import { ResourceProvider } from "./context/ResourceContext";
import { CarouselProvider } from "./context/CarouselContext";
import Carousel from "./components/Carousel/Carousel";

import References from "./pages/References";
import Model from "./pages/Model";
import About from "./pages/About";
import Statement from "./pages/Statement";
import NotFound from "./pages/NotFound";

import Navigation from "./components/Navigation";

import "./styles/Global.css";

function AppContent() {
  const location = useLocation();

  return (
    <div id="page-container">
      <Navigation />

      <div id="page-content">
        <div className="background-lines"></div>

        {/* Keep the hero background words exclusive to the carousel landing page. */}
        {location.pathname === "/" && (
          <div className="background-words">
            <h1>NINTENDO</h1>
            <h1>ENTERTAINMENT</h1>
            <h1>SYSTEM</h1>
          </div>
        )}

        <Routes>
          <Route path="/" element={<Carousel />} />
          <Route path="/model/:id" element={<Model />} />
          <Route path="/about" element={<About />} />
          <Route path="/statement" element={<Statement />} />
          <Route path="/references" element={<References />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      {/* Providers wrap routes so every page can access shared resources and carousel state. */}
      <ResourceProvider>
        <CarouselProvider>
          <AppContent />
        </CarouselProvider>
      </ResourceProvider>
    </BrowserRouter>
  );
}

export default App;
