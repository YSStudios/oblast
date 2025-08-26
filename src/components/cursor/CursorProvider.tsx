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

  return (
    <CursorContext.Provider
      value={{
        cursorVariant,
        setCursorVariant,
      }}
    >
      <>
        {children}
        <CustomCursor />
      </>
    </CursorContext.Provider>
  );
};