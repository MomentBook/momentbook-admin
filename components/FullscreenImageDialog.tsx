"use client";

import { createPortal } from "react-dom";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
} from "react";
import Image from "next/image";
import { AppIcon, CloseActionIcon } from "@/components/AppIcons";
import { shouldBypassNextImageOptimization } from "@/lib/next-image-optimization";
import styles from "./FullscreenImageDialog.module.scss";

const MIN_SCALE = 1;
const DOUBLE_TAP_SCALE = 2.4;
const MAX_SCALE = 4;
const WHEEL_STEP = 0.18;
const DOUBLE_TAP_DELAY_MS = 280;
const DOUBLE_TAP_DISTANCE_PX = 28;

type Point = {
  x: number;
  y: number;
};

type PointerState = Point & {
  startX: number;
  startY: number;
};

type Size = {
  width: number;
  height: number;
};

type FullscreenImageDialogProps = {
  src: string;
  alt: string;
  trigger: ReactNode;
  triggerAriaLabel: string;
  dialogAriaLabel: string;
  closeAriaLabel: string;
  triggerClassName?: string;
  imageSizes?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getDistance([a, b]: PointerState[]) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function getContainedSize(natural: Size | null, stage: Size): Size {
  if (
    !natural ||
    natural.width <= 0 ||
    natural.height <= 0 ||
    stage.width <= 0 ||
    stage.height <= 0
  ) {
    return stage;
  }

  const widthRatio = stage.width / natural.width;
  const heightRatio = stage.height / natural.height;
  const ratio = Math.min(widthRatio, heightRatio);

  return {
    width: natural.width * ratio,
    height: natural.height * ratio,
  };
}

function clampOffset(offset: Point, scale: number, baseSize: Size): Point {
  if (scale <= 1) {
    return { x: 0, y: 0 };
  }

  const maxX = Math.max(0, ((baseSize.width * scale) - baseSize.width) / 2);
  const maxY = Math.max(0, ((baseSize.height * scale) - baseSize.height) / 2);

  return {
    x: clamp(offset.x, -maxX, maxX),
    y: clamp(offset.y, -maxY, maxY),
  };
}

export function FullscreenImageDialog({
  src,
  alt,
  trigger,
  triggerAriaLabel,
  dialogAriaLabel,
  closeAriaLabel,
  triggerClassName,
  imageSizes = "100vw",
}: FullscreenImageDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState<Size | null>(null);
  const [stageSize, setStageSize] = useState<Size>({ width: 0, height: 0 });
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const shouldUseUnoptimizedSrc = shouldBypassNextImageOptimization(src);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const activePointersRef = useRef<Map<number, PointerState>>(new Map());
  const panSessionRef = useRef<{
    pointerId: number;
    origin: Point;
    startOffset: Point;
  } | null>(null);
  const pinchSessionRef = useRef<{
    startDistance: number;
    startScale: number;
  } | null>(null);
  const lastTouchTapRef = useRef<{
    time: number;
    point: Point;
  } | null>(null);
  const baseSize = useMemo(
    () => getContainedSize(naturalSize, stageSize),
    [naturalSize, stageSize],
  );
  const clampedOffset = useMemo(
    () => clampOffset(offset, scale, baseSize),
    [baseSize, offset, scale],
  );

  const handleImageLoad = (target: HTMLImageElement) => {
    setNaturalSize({
      width: target.naturalWidth,
      height: target.naturalHeight,
    });
  };

  function resetViewerState() {
    activePointersRef.current.clear();
    panSessionRef.current = null;
    pinchSessionRef.current = null;
    lastTouchTapRef.current = null;
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setNaturalSize(null);
  }

  function openViewer() {
    resetViewerState();
    setIsOpen(true);
  }

  function closeViewer() {
    resetViewerState();
    setIsOpen(false);
  }

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(pointer: coarse)");
    const syncPointerType = () => setIsCoarsePointer(mediaQuery.matches);

    syncPointerType();
    mediaQuery.addEventListener("change", syncPointerType);

    return () => {
      mediaQuery.removeEventListener("change", syncPointerType);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const dialog = dialogRef.current;

    if (!dialog || typeof dialog.showModal !== "function" || dialog.open) {
      return;
    }

    dialog.showModal();
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    const handleCancel = (event: Event) => {
      event.preventDefault();
      activePointersRef.current.clear();
      panSessionRef.current = null;
      pinchSessionRef.current = null;
      lastTouchTapRef.current = null;
      setScale(1);
      setOffset({ x: 0, y: 0 });
      setIsOpen(false);
    };

    const handleClose = () => {
      activePointersRef.current.clear();
      panSessionRef.current = null;
      pinchSessionRef.current = null;
      lastTouchTapRef.current = null;
      setScale(1);
      setOffset({ x: 0, y: 0 });
      setIsOpen(false);
    };

    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("close", handleClose);

    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("close", handleClose);
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog || isOpen || !dialog.open) {
      return;
    }

    dialog.close();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !stageRef.current || typeof ResizeObserver === "undefined") {
      return;
    }

    const node = stageRef.current;
    const observer = new ResizeObserver((entries) => {
      const nextEntry = entries[0];
      if (!nextEntry) {
        return;
      }

      setStageSize({
        width: nextEntry.contentRect.width,
        height: nextEntry.contentRect.height,
      });
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [isOpen]);

  const toggleZoom = () => {
    if (scale > 1) {
      setScale(1);
      setOffset({ x: 0, y: 0 });
      return;
    }

    setScale(DOUBLE_TAP_SCALE);
  };

  const startPanFromRemainingPointer = () => {
    const [remainingPointer] = Array.from(activePointersRef.current.entries());

    if (!remainingPointer || scale <= 1) {
      panSessionRef.current = null;
      return;
    }

    const [pointerId, pointer] = remainingPointer;
    panSessionRef.current = {
      pointerId,
      origin: { x: pointer.x, y: pointer.y },
      startOffset: offset,
    };
  };

  const startPinch = () => {
    const pointers = Array.from(activePointersRef.current.values());

    if (pointers.length < 2) {
      pinchSessionRef.current = null;
      return;
    }

    pinchSessionRef.current = {
      startDistance: getDistance([pointers[0], pointers[1]]),
      startScale: scale,
    };
    panSessionRef.current = null;
  };

  const finishPointerSession = (event: ReactPointerEvent<HTMLDivElement>) => {
    const pointerState = activePointersRef.current.get(event.pointerId);

    if (
      pointerState &&
      event.pointerType !== "mouse" &&
      Math.abs(pointerState.x - pointerState.startX) < 10 &&
      Math.abs(pointerState.y - pointerState.startY) < 10
    ) {
      const now = Date.now();
      const lastTap = lastTouchTapRef.current;

      if (
        lastTap &&
        now - lastTap.time <= DOUBLE_TAP_DELAY_MS &&
        Math.hypot(lastTap.point.x - event.clientX, lastTap.point.y - event.clientY) <=
          DOUBLE_TAP_DISTANCE_PX
      ) {
        toggleZoom();
        lastTouchTapRef.current = null;
      } else {
        lastTouchTapRef.current = {
          time: now,
          point: { x: event.clientX, y: event.clientY },
        };
      }
    }

    activePointersRef.current.delete(event.pointerId);

    if (stageRef.current?.hasPointerCapture(event.pointerId)) {
      stageRef.current.releasePointerCapture(event.pointerId);
    }

    if (activePointersRef.current.size >= 2) {
      startPinch();
      return;
    }

    pinchSessionRef.current = null;
    startPanFromRemainingPointer();
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isOpen) {
      return;
    }

    event.preventDefault();

    activePointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
    });

    stageRef.current?.setPointerCapture(event.pointerId);

    if (activePointersRef.current.size >= 2) {
      startPinch();
      return;
    }

    if (scale > 1) {
      panSessionRef.current = {
        pointerId: event.pointerId,
        origin: { x: event.clientX, y: event.clientY },
        startOffset: offset,
      };
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const currentPointer = activePointersRef.current.get(event.pointerId);

    if (!currentPointer) {
      return;
    }

    currentPointer.x = event.clientX;
    currentPointer.y = event.clientY;

    if (pinchSessionRef.current && activePointersRef.current.size >= 2) {
      const pointers = Array.from(activePointersRef.current.values());
      const distance = getDistance([pointers[0], pointers[1]]);
      const nextScale = clamp(
        pinchSessionRef.current.startScale *
          (distance / Math.max(pinchSessionRef.current.startDistance, 1)),
        MIN_SCALE,
        MAX_SCALE,
      );

      setScale(nextScale);
      setOffset((currentOffset) => clampOffset(currentOffset, nextScale, baseSize));
      return;
    }

    if (!panSessionRef.current || panSessionRef.current.pointerId !== event.pointerId) {
      return;
    }

    const nextOffset = {
      x:
        panSessionRef.current.startOffset.x +
        (event.clientX - panSessionRef.current.origin.x),
      y:
        panSessionRef.current.startOffset.y +
        (event.clientY - panSessionRef.current.origin.y),
    };

    setOffset(clampOffset(nextOffset, scale, baseSize));
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (isCoarsePointer) {
      return;
    }

    event.preventDefault();

    const nextScale = clamp(
      scale + (event.deltaY < 0 ? WHEEL_STEP : -WHEEL_STEP),
      MIN_SCALE,
      MAX_SCALE,
    );

    setScale(nextScale);

    if (nextScale === 1) {
      setOffset({ x: 0, y: 0 });
      return;
    }

    setOffset((currentOffset) => clampOffset(currentOffset, nextScale, baseSize));
  };

  const handleShellClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      closeViewer();
    }
  };

  return (
    <>
      <button
        type="button"
        className={[styles.triggerButton, triggerClassName].filter(Boolean).join(" ")}
        onClick={openViewer}
        aria-label={triggerAriaLabel}
        aria-haspopup="dialog"
      >
        {trigger}
      </button>

      {typeof document !== "undefined"
        ? createPortal(
            <dialog
              ref={dialogRef}
              className={styles.viewerDialog}
              aria-label={dialogAriaLabel}
            >
              <div className={styles.viewerShell} onClick={handleShellClick}>
                <div
                  className={styles.viewerFrame}
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className={styles.viewerTopBar}>
                    <button
                      type="button"
                      className={styles.viewerCloseButton}
                      onClick={closeViewer}
                      aria-label={closeAriaLabel}
                      autoFocus
                    >
                      <AppIcon icon={CloseActionIcon} size={18} />
                    </button>
                  </div>

                  <div
                    ref={stageRef}
                    className={`${styles.viewerStage} ${scale > 1 ? styles.viewerStageDragging : ""}`}
                    onDoubleClick={toggleZoom}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={finishPointerSession}
                    onPointerCancel={finishPointerSession}
                    onLostPointerCapture={finishPointerSession}
                    onWheel={handleWheel}
                  >
                    <div
                      className={styles.viewerImageFrame}
                      style={{
                        width: `${baseSize.width}px`,
                        height: `${baseSize.height}px`,
                        transform: `translate3d(${clampedOffset.x}px, ${clampedOffset.y}px, 0) scale(${scale})`,
                      }}
                    >
                      <Image
                        src={src}
                        alt={alt}
                        fill
                        className={styles.viewerImage}
                        sizes={imageSizes}
                        unoptimized={shouldUseUnoptimizedSrc}
                        onLoad={(event) => {
                          handleImageLoad(event.currentTarget);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </dialog>,
            document.body,
          )
        : null}
    </>
  );
}
