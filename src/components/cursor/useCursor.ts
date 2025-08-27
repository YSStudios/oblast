import { createContext, useContext } from "react";

interface CursorContextType {
  cursorVariant: "default" | "hover";
  setCursorVariant: (variant: "default" | "hover") => void;
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