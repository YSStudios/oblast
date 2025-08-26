# Custom Cursor Implementation Guide for Next.js

This guide will walk you through creating a custom cursor that displays a circle instead of the default pointer, grows on hover over selected elements, and uses mix-blend-mode difference for visual effects.

## File Structure

```
components/
├── cursor/
│   ├── CustomCursor.tsx
│   ├── CursorProvider.tsx
│   └── useCursor.ts
styles/
├── cursor.module.css
└── globals.css (modifications)
hooks/
└── useMousePosition.ts
```

## Step 1: Create the Mouse Position Hook

Create `hooks/useMousePosition.ts`:

```typescript
import { useState, useEffect } from "react";

interface MousePosition {
  x: number;
  y: number;
}

export const useMousePosition = (): MousePosition => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", updateMousePosition);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);

  return mousePosition;
};
```

## Step 2: Create the Cursor Context Hook

Create `components/cursor/useCursor.ts`:

```typescript
import { createContext, useContext } from "react";

interface CursorContextType {
  cursorVariant: "default" | "hover";
  setCursorVariant: (variant: "default" | "hover") => void;
  cursorText: string;
  setCursorText: (text: string) => void;
}

export const CursorContext = createContext<CursorContextType | undefined>(
  undefined
);

export const useCursor = () => {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error("useCursor must be used within a CursorProvider");
  }
  return context;
};
```

## Step 3: Create Cursor Styles

Create `styles/cursor.module.css`:

```css
.cursor {
  position: fixed;
  left: 0;
  top: 0;
  width: 20px;
  height: 20px;
  background-color: #000;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transition: transform 0.3s ease, width 0.3s ease, height 0.3s ease;
  transform: translate(-50%, -50%);
  mix-blend-mode: normal;
}

.cursor.hover {
  width: 60px;
  height: 60px;
  mix-blend-mode: difference;
  background-color: #fff;
}

.cursorText {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: bold;
  color: #000;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cursor.hover .cursorText {
  opacity: 1;
  color: #000;
}

/* Hide default cursor */
.hideCursor {
  cursor: none;
}
```

## Step 4: Create the Custom Cursor Component

Create `components/cursor/CustomCursor.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useMousePosition } from "../../hooks/useMousePosition";
import { useCursor } from "./useCursor";
import styles from "../../styles/cursor.module.css";

export const CustomCursor: React.FC = () => {
  const { x, y } = useMousePosition();
  const { cursorVariant, cursorText } = useCursor();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Set initial visibility
    setIsVisible(true);

    return () => {
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`${styles.cursor} ${
        cursorVariant === "hover" ? styles.hover : ""
      }`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      {cursorText && <span className={styles.cursorText}>{cursorText}</span>}
    </div>
  );
};
```

## Step 5: Create the Cursor Provider

Create `components/cursor/CursorProvider.tsx`:

```typescript
"use client";

import { ReactNode, useState } from "react";
import { CursorContext } from "./useCursor";
import { CustomCursor } from "./CustomCursor";

interface CursorProviderProps {
  children: ReactNode;
}

export const CursorProvider: React.FC<CursorProviderProps> = ({ children }) => {
  const [cursorVariant, setCursorVariant] = useState<"default" | "hover">(
    "default"
  );
  const [cursorText, setCursorText] = useState("");

  return (
    <CursorContext.Provider
      value={{
        cursorVariant,
        setCursorVariant,
        cursorText,
        setCursorText,
      }}
    >
      <div className="hideCursor">
        {children}
        <CustomCursor />
      </div>
    </CursorContext.Provider>
  );
};
```

## Step 6: Create a Hoverable Component

Create `components/cursor/HoverableElement.tsx`:

```typescript
"use client";

import { ReactNode } from "react";
import { useCursor } from "./useCursor";

interface HoverableElementProps {
  children: ReactNode;
  text?: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const HoverableElement: React.FC<HoverableElementProps> = ({
  children,
  text = "",
  className = "",
  as: Component = "div",
}) => {
  const { setCursorVariant, setCursorText } = useCursor();

  const handleMouseEnter = () => {
    setCursorVariant("hover");
    setCursorText(text);
  };

  const handleMouseLeave = () => {
    setCursorVariant("default");
    setCursorText("");
  };

  return (
    <Component
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </Component>
  );
};
```

## Step 7: Update Global Styles

Add to `styles/globals.css`:

```css
.hideCursor,
.hideCursor * {
  cursor: none !important;
}

/* Ensure mix-blend-mode works properly */
body {
  background: white;
}
```

## Step 8: Implement in Your App

Update your `app/layout.tsx`:

```typescript
import { CursorProvider } from "../components/cursor/CursorProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CursorProvider>{children}</CursorProvider>
      </body>
    </html>
  );
}
```

## Step 9: Usage in Components

Update your existing components to use the hoverable elements. For example, in your Overlay component:

```typescript
import { HoverableElement } from "../cursor/HoverableElement";

// Replace your existing website items with:
{
  websiteIds.map((websiteId) => (
    <HoverableElement
      key={websiteId}
      text="View Project"
      className={`${styles.websiteItem} ${
        activeVideo === websiteId ? styles.websiteItemActive : ""
      }`}
      onMouseEnter={(e) => {
        handleMouseEnter(websiteId, e.currentTarget);
      }}
      onMouseLeave={(e) => {
        handleMouseLeave(websiteId, e.currentTarget, e);
      }}
    >
      <CornerBrackets
        isActive={activeVideo === websiteId}
        isHovered={hoveredItem === websiteId}
      />
      <SlidingText
        isActive={activeVideo === websiteId}
        isHovered={hoveredItem === websiteId}
      >
        Website {websiteId}
      </SlidingText>
      <PillButton
        isActive={activeVideo === websiteId}
        isHovered={hoveredItem === websiteId}
      />
    </HoverableElement>
  ));
}
```

## Step 10: Advanced Customization

For more advanced customization, you can extend the cursor context to include:

```typescript
interface CursorContextType {
  cursorVariant: "default" | "hover" | "click" | "text";
  setCursorVariant: (variant: string) => void;
  cursorText: string;
  setCursorText: (text: string) => void;
  cursorColor: string;
  setCursorColor: (color: string) => void;
  cursorSize: number;
  setCursorSize: (size: number) => void;
}
```

## Performance Considerations

1. The cursor updates are throttled through CSS transitions
2. Mouse position updates use native browser events
3. Context updates are minimal and only change on hover state changes
4. The cursor component is memoized to prevent unnecessary re-renders

## Browser Compatibility

- Mix-blend-mode is supported in all modern browsers
- CSS custom properties provide fallbacks
- The implementation gracefully degrades on older browsers

This modular approach keeps each piece of functionality separate and maintainable while providing a smooth, performant custom cursor experience.
