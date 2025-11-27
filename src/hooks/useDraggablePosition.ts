import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";

interface Position {
  x: number;
  y: number;
}

interface UseDraggablePositionReturn {
  position: Position;
  isDragging: boolean;
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void;
  };
  containerRef: React.RefObject<HTMLDivElement>;
}

export function useDraggablePosition(
  defaultPosition: Position = { x: 10, y: 10 }
): UseDraggablePositionReturn {
  const [position, setPosition] = useState<Position>(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number; clientX: number; clientY: number } | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Measure container dimensions
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Calculate bounded position to keep control fully visible in viewport
  const getBoundedPosition = useCallback(
    (pos: Position): Position => {
      const minMargin = 5;
      const maxX = window.innerWidth - containerSize.width - minMargin;
      const maxY = window.innerHeight - containerSize.height - minMargin;

      return {
        x: Math.max(minMargin, Math.min(pos.x, maxX)),
        y: Math.max(minMargin, Math.min(pos.y, maxY)),
      };
    },
    [containerSize]
  );

  // Handle window resize to recalculate boundaries
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => getBoundedPosition(prev));
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [getBoundedPosition]);

  // Handle pointer down - start drag
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Prevent default to avoid text selection and other browser behaviors
    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    dragStartPos.current = {
      x: position.x,
      y: position.y,
      clientX: e.clientX,
      clientY: e.clientY,
    };

    setIsDragging(true);
  }, [position]);

  // Handle pointer move - update position during drag
  useEffect(() => {
    if (!isDragging || !dragStartPos.current) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!dragStartPos.current) return;

      // Cancel previous animation frame if exists
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }

      // Use requestAnimationFrame for smooth 60fps updates
      animationFrameId.current = requestAnimationFrame(() => {
        if (!dragStartPos.current) return;

        const deltaX = e.clientX - dragStartPos.current.clientX;
        const deltaY = e.clientY - dragStartPos.current.clientY;

        const newPosition = {
          x: dragStartPos.current.x + deltaX,
          y: dragStartPos.current.y + deltaY,
        };

        setPosition(getBoundedPosition(newPosition));
      });
    };

    const handlePointerUp = (e: PointerEvent) => {
      setIsDragging(false);
      dragStartPos.current = null;

      // Cancel any pending animation frame
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }

      // Release pointer capture
      const target = e.target as HTMLElement;
      if (target && target.releasePointerCapture) {
        target.releasePointerCapture(e.pointerId);
      }
    };

    // Attach global listeners
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerUp);

    return () => {
      // Cleanup listeners
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);

      // Cancel any pending animation frame
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [isDragging, getBoundedPosition]);

  return {
    position,
    isDragging,
    handlers: {
      onPointerDown,
    },
    containerRef,
  };
}
