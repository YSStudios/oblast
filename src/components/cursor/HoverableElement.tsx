"use client";

import React, { ReactNode, createElement } from "react";
import { useCursor } from "./useCursor";

interface HoverableElementProps {
  children: ReactNode;
  text?: string;
  className?: string;
  as?: React.ElementType;
  style?: React.CSSProperties;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
}

export const HoverableElement: React.FC<HoverableElementProps> = ({
  children,
  text, // eslint-disable-line @typescript-eslint/no-unused-vars
  className = "",
  as = "div",
  style,
  onMouseEnter: externalOnMouseEnter,
  onMouseLeave: externalOnMouseLeave,
}) => {
  const { setCursorVariant } = useCursor();

  const handleMouseEnter = (e: React.MouseEvent) => {
    setCursorVariant("hover");
    if (externalOnMouseEnter) {
      externalOnMouseEnter(e);
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    setCursorVariant("default");
    if (externalOnMouseLeave) {
      externalOnMouseLeave(e);
    }
  };

  return createElement(
    as,
    {
      className,
      style: {
        pointerEvents: 'auto',
        ...style,
      },
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
    children
  );
};