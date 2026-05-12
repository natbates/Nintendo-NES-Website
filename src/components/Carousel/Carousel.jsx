import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useResources } from "../../context/ResourceContext";
import { useCarousel } from "../../context/CarouselContext";
import CarouselSlide from "./CarouselSlide";
import CarouselControls from "./CarouselControls";
import LightingControl from "../LightingControl";
import CanvasControlBar from "../CanvasControlBar";
import LoadingSpinner from "../LoadingSpinner";

import "../../styles/Carousel.css";

const TRANSITION_MS = 800;

function Carousel() {
  const { productKeys, loading } = useResources();
  const {
    currentIndex,
    setCurrentIndex,
    resetAutoplayTimer,
    setSlideCount,
    pauseCarousel,
    resumeCarousel,
    lightStrength,
    autoSpinEnabled,
    setAutoSpinEnabled,
    playSoundsEnabled,
    setPlaySoundsEnabled,
  } = useCarousel();

  const trackRef = useRef(null);
  const [translate, setTranslate] = useState(0);
  const translateRef = useRef(0);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const [visualIndex, setVisualIndex] = useState(null);
  const [loadedProductKeys, setLoadedProductKeys] = useState(() => new Set());
  const [delayComplete, setDelayComplete] = useState(false);

  const safeSlideCount = productKeys.length;
  // Render three copies so we can keep the active item centered while wrapping seamlessly.
  const repeatedKeys = [...productKeys, ...productKeys, ...productKeys];
  const allModelsReady =
    safeSlideCount > 0 && loadedProductKeys.size >= safeSlideCount;
  // Gate interactions until resources are loaded, models are ready, and handoff delay has finished.
  const showLoadingOverlay = loading || !allModelsReady || !delayComplete;

  useEffect(() => {
    setLoadedProductKeys(new Set());
    setDelayComplete(false);
  }, [safeSlideCount]);

  useEffect(() => {
    if (loading || !allModelsReady) {
      setDelayComplete(false);
      return;
    }

    const timer = setTimeout(() => {
      setDelayComplete(true);
    }, 400);

    return () => clearTimeout(timer);
  }, [loading, allModelsReady]);

  // Hold autoplay until all carousel models are actually ready and delay is complete.
  useEffect(() => {
    if (showLoadingOverlay) {
      pauseCarousel("interaction");
      return;
    }

    resumeCarousel();
  }, [showLoadingOverlay, pauseCarousel, resumeCarousel]);

  const handleModelReady = useCallback((productKey) => {
    setLoadedProductKeys((prev) => {
      if (prev.has(productKey)) return prev;
      const next = new Set(prev);
      next.add(productKey);
      return next;
    });
  }, []);

  // Set slide count
  useEffect(() => {
    setSlideCount(safeSlideCount);
    if (safeSlideCount > 0) {
      // Start in the middle copy so there is room to shift visually in either direction.
      setVisualIndex(safeSlideCount + (currentIndex % safeSlideCount));
    }
  }, [productKeys, safeSlideCount, currentIndex, setSlideCount]);

  useEffect(() => {
    translateRef.current = translate;
  }, [translate]);

  // Recalculate on container size changes
  useEffect(() => {
    if (!trackRef.current) return;

    const carousel = trackRef.current.parentElement;
    if (!carousel || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      setLayoutVersion((prev) => prev + 1);
    });

    observer.observe(carousel);
    return () => observer.disconnect();
  }, []);

  // Calculate slide dimensions and track translation
  useEffect(() => {
    if (!trackRef.current || safeSlideCount === 0) return;

    const carousel = trackRef.current.parentElement;
    const containerWidth = carousel?.clientWidth || 0;
    if (containerWidth === 0) return;

    const slides = trackRef.current.querySelectorAll(".carousel-slide");
    if (slides.length === 0) return;

    const centerOffset = (slideElement) => {
      const slideLeft = slideElement.offsetLeft;
      const slideWidth = slideElement.clientWidth;
      const centered = Math.round(containerWidth / 2 - slideWidth / 2);
      return Math.round(centered - slideLeft);
    };

    const candidateIndices = [
      currentIndex,
      currentIndex + safeSlideCount,
      currentIndex + safeSlideCount * 2,
    ];

    const initialCandidate = currentIndex + safeSlideCount;

    // Choose the visually nearest duplicate index to avoid sudden jumps across wrapped copies.
    const nearestVisualIndex =
      visualIndex === null
        ? initialCandidate
        : candidateIndices.reduce((bestIndex, candidate) => {
            const candidateSlide = slides[candidate];
            const bestSlide = slides[bestIndex];
            if (!candidateSlide || !bestSlide) return bestIndex;

            const candidateDistance = Math.abs(
              centerOffset(candidateSlide) - translateRef.current,
            );
            const bestDistance = Math.abs(
              centerOffset(bestSlide) - translateRef.current,
            );

            return candidateDistance < bestDistance ? candidate : bestIndex;
          }, candidateIndices[0]);

    const activeSlide = slides[nearestVisualIndex];
    if (!activeSlide) return;

    setVisualIndex(nearestVisualIndex);
    setTranslate(centerOffset(activeSlide));
  }, [currentIndex, safeSlideCount, layoutVersion, visualIndex]);

  // Apply transform
  useEffect(() => {
    if (!trackRef.current) return;
    trackRef.current.style.transition = `transform ${TRANSITION_MS}ms cubic-bezier(.2,.9,.2,1)`;
    trackRef.current.style.transform = `translateX(${translate}px)`;
  }, [translate]);

  const handlePrevious = () => {
    if (safeSlideCount === 0) return;
    resetAutoplayTimer();
    setCurrentIndex((prev) => (prev - 1 + safeSlideCount) % safeSlideCount);
  };

  const handleNext = () => {
    if (safeSlideCount === 0) return;
    resetAutoplayTimer();
    setCurrentIndex((prev) => (prev + 1) % safeSlideCount);
  };

  const handleSlideClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div id="homeCarouselWrap">
      <div id="homeCarousel">
        {showLoadingOverlay && (
          <LoadingSpinner fullScreen={true} message="Loading models..." />
        )}

        <CanvasControlBar
          className="carousel-canvas-control-bar"
          spinEnabled={autoSpinEnabled}
          onSpinToggle={setAutoSpinEnabled}
          soundEnabled={playSoundsEnabled}
          onSoundToggle={setPlaySoundsEnabled}
        />

        <div id="carouselTrack" ref={trackRef} className="carousel-track">
          {repeatedKeys.map((key, index) => (
            <CarouselSlide
              key={`${key}-${index}`}
              productKey={key}
              index={index % safeSlideCount}
              lightStrength={lightStrength}
              onClick={() => handleSlideClick(index % safeSlideCount)}
              onModelReady={handleModelReady}
              shouldReportReady={index < safeSlideCount}
            />
          ))}
        </div>

        <button
          id="carouselPrev"
          className="carousel-button carousel-prev"
          aria-label="Previous"
          onClick={handlePrevious}
        >
          <FaChevronLeft size={8} />
        </button>

        <button
          id="carouselNext"
          className="carousel-button carousel-next"
          aria-label="Next"
          onClick={handleNext}
        >
          <FaChevronRight size={8} />
        </button>

        <CarouselControls onPrev={handlePrevious} onNext={handleNext} />

        <LightingControl />
      </div>
    </div>
  );
}

export default Carousel;
