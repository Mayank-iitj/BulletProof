'use client';

import React, { useEffect, useState, useRef } from 'react';

export function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const cursorRef = useRef<HTMLDivElement>(null);
  const targetPos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const isHoveredRef = useRef(false);
  const isClickingRef = useRef(false);
  const isOverTextInputRef = useRef(false);

  useEffect(() => {
    setMounted(true);

    const onMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };

      const target = e.target as HTMLElement | null;
      const isTextInput = Boolean(
        target && target.closest('textarea, input[type="text"], input[type="password"], input[type="email"]')
      );

      if (isOverTextInputRef.current !== isTextInput) {
        isOverTextInputRef.current = isTextInput;
      }

      // Hide custom cursor when typing in text input to allow native I-beam cursor
      if (isTextInput) {
        setIsVisible(false);
        return;
      } else {
        setIsVisible(true);
      }

      const hovered = Boolean(
        target &&
          target.closest(
            'a, button, [role="button"], label, .cursor-pointer, input[type="checkbox"], input[type="radio"]'
          )
      );

      if (isHoveredRef.current !== hovered) {
        isHoveredRef.current = hovered;
      }
    };

    const onMouseDown = () => {
      isClickingRef.current = true;
    };

    const onMouseUp = () => {
      isClickingRef.current = false;
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    const onMouseEnter = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      currentPos.current = { x: e.clientX, y: e.clientY };
      if (!isOverTextInputRef.current) {
        setIsVisible(true);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    document.documentElement.addEventListener('mouseenter', onMouseEnter);

    let animId: number;
    const render = () => {
      // Lerp factor 0.22 for responsive smooth inertia
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.22;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.22;

      if (cursorRef.current) {
        const scale = isHoveredRef.current
          ? isClickingRef.current
            ? 1.9
            : 2.3
          : isClickingRef.current
          ? 0.8
          : 1.0;

        cursorRef.current.style.transform = `translate3d(${currentPos.current.x - 16}px, ${currentPos.current.y - 16}px, 0) scale(${scale})`;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      document.documentElement.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(animId);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className={`fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[99999] bg-white transition-opacity duration-200 will-change-transform ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        mixBlendMode: 'difference',
        transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease',
      }}
    />
  );
}
