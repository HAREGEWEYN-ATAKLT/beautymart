"use client";

import { type ReactNode, useRef } from "react";

type HorizontalCarouselProps = {
  children: ReactNode;
  className: string;
  label: string;
};

export default function HorizontalCarousel({
  children,
  className,
  label,
}: HorizontalCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  function move(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;

    track.scrollBy({
      left: direction * Math.max(track.clientWidth * 0.82, 280),
      behavior: "smooth",
    });
  }

  return (
    <div className="home-carousel">
      <div
        ref={trackRef}
        className={`${className} home-carousel-track`}
        aria-label={label}
        role="region"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            move(-1);
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            move(1);
          }
        }}
      >
        {children}
      </div>

      <div className="home-carousel-controls" aria-label={`${label} controls`}>
        <button type="button" onClick={() => move(-1)} aria-label={`Show previous ${label.toLowerCase()}`}>
          <span aria-hidden="true">←</span>
        </button>
        <button type="button" onClick={() => move(1)} aria-label={`Show more ${label.toLowerCase()}`}>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
