"use client";

import { useEffect, useRef, useState } from "react";
import type { PublicReview } from "@/lib/google-reviews/public";

const AVATAR_COLORS = ["#1d3a6b", "#5a2323", "#2c4a3a", "#4a3a1d", "#3a2c4a"];

function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export function ReviewStars({ rating }: { rating: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span aria-label={`${rating} out of 5 stars`} className="inline-flex gap-0.5 leading-none" role="img">
      {[0, 1, 2, 3, 4].map((i) =>
        i < filled ? (
          <span key={i} aria-hidden="true" style={{ color: "#FBBC04" }}>
            ★
          </span>
        ) : (
          <span key={i} aria-hidden="true" className="text-ink-muted/40">
            ★
          </span>
        ),
      )}
    </span>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dir === "left" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 3h7v7" />
      <path d="M10 14L21 3" />
      <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
    </svg>
  );
}

function ReviewCard({ review, reviewsUrl }: { review: PublicReview; reviewsUrl: string | null }) {
  const [expanded, setExpanded] = useState(false);
  const initial = (review.name.trim().charAt(0) || "G").toUpperCase();
  const hasPhoto = !!review.photoUrl && review.photoUrl.startsWith("https://");
  const long = !!review.comment && review.comment.length > 180;

  return (
    <article className="relative bg-surface border border-border rounded-xl p-5 flex flex-col gap-3 h-full">
      <div className="flex items-center gap-3">
        {hasPhoto ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={review.photoUrl as string} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-10 w-10 rounded-full object-cover" />
          </>
        ) : (
          <div
            aria-hidden="true"
            className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-paper font-heading font-bold"
            style={{ backgroundColor: avatarColor(review.name) }}
          >
            {initial}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-body font-medium text-paper text-sm truncate">{review.name}</p>
          {review.dateLabel ? <p className="text-ink-muted text-xs">{review.dateLabel}</p> : null}
        </div>
      </div>

      <ReviewStars rating={review.rating} />

      {review.comment ? (
        <div className="flex flex-col items-start gap-1">
          <p className={`font-body text-sm leading-relaxed text-paper/85 whitespace-pre-line${expanded ? "" : " line-clamp-4"}`}>
            {review.comment}
          </p>
          {long ? (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="relative z-10 text-xs text-ink-muted underline hover:text-paper"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-auto pt-1">
        {reviewsUrl ? (
          <a
            href={reviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-ink-muted text-xs hover:text-paper after:absolute after:inset-0 after:content-[''] after:rounded-xl"
          >
            Posted on Google
            <ExternalIcon />
            <span className="sr-only">Open Google reviews in a new tab</span>
          </a>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-ink-muted text-xs">
            Posted on Google
            <ExternalIcon />
          </span>
        )}
      </div>
    </article>
  );
}

export default function ReviewsCarousel({ reviews, reviewsUrl }: { reviews: PublicReview[]; reviewsUrl: string | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      setCanPrev(el.scrollLeft > 4);
      setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
      setOverflows(el.scrollWidth > el.clientWidth + 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(update);
      ro.observe(el);
    }
    return () => {
      el.removeEventListener("scroll", update);
      ro?.disconnect();
    };
  }, [reviews.length]);

  const scroll = (direction: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
  };

  const arrowCls =
    "hidden md:flex absolute top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-paper shadow-lg transition-opacity hover:border-brand-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-red disabled:cursor-not-allowed";
  const mobileArrowCls =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-paper transition-colors hover:border-brand-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-red disabled:opacity-35 disabled:cursor-not-allowed";

  return (
    <div className="relative md:px-14">
      {overflows ? (
        <button type="button" aria-label="Previous reviews" onClick={() => scroll(-1)} disabled={!canPrev} className={`${arrowCls} left-0${canPrev ? "" : " opacity-40"}`}>
          <Chevron dir="left" />
        </button>
      ) : null}
      <div
        ref={ref}
        className="no-scrollbar flex gap-4 overflow-x-auto snap-x snap-mandatory overscroll-x-contain focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-red"
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Customer reviews from Google"
      >
        {reviews.map((r) => (
          <div key={r.id} className="snap-start shrink-0 basis-full sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-0.667rem)]">
            <ReviewCard review={r} reviewsUrl={reviewsUrl} />
          </div>
        ))}
      </div>
      {overflows ? (
        <button type="button" aria-label="Next reviews" onClick={() => scroll(1)} disabled={!canNext} className={`${arrowCls} right-0${canNext ? "" : " opacity-40"}`}>
          <Chevron dir="right" />
        </button>
      ) : null}
      {overflows ? (
        <div className="mt-4 flex items-center justify-center gap-4 md:hidden">
          <button type="button" aria-label="Previous reviews" onClick={() => scroll(-1)} disabled={!canPrev} className={mobileArrowCls}>
            <Chevron dir="left" />
          </button>
          <p className="text-xs font-body text-ink-muted">Swipe or tap to browse</p>
          <button type="button" aria-label="Next reviews" onClick={() => scroll(1)} disabled={!canNext} className={mobileArrowCls}>
            <Chevron dir="right" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
