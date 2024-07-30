import React from "react";

interface BackgroundWrapperProps {
  children: React.ReactNode;
  backgroundColor?: string;
}

const BackgroundWrapper = ({
  children,
  backgroundColor,
}: BackgroundWrapperProps) => {
  return (
    <div
      className="h-screen w-full"
      style={{ backgroundColor: backgroundColor ?? `#9C94A5`, padding: "12px" }}
    >
      {children}
    </div>
  );
};

export default BackgroundWrapper;
