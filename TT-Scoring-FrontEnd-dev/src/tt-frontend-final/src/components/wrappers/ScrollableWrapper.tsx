import React from "react";

interface ScrollableWrapperProps {
  children: React.ReactNode;
  maxWidth?: string;
  maxHeight?: string;
}

const ScrollableWrapper = ({
  children,
  maxWidth,
  maxHeight,
}: ScrollableWrapperProps) => {
  return (
    <div
      // className={`overflow-auto max-w-[${maxWidth || "900px"}] max-h-[${maxHeight || "350px"}]`}
      style={{
        overflow: "auto",
        maxHeight: maxHeight || "350px",
        maxWidth: maxWidth || "900px",
      }}
    >
      {children}
    </div>
  );
};

export default ScrollableWrapper;
