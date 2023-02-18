"use client";
import { useEffect, useLayoutEffect, useRef } from "react";

interface TextBoxProps {
  text: string;
  options?: {
    fade?: boolean;
    delay?: number;
  };
  onClick?: () => void;
}

export default function TextBox({ text = "", onClick }: TextBoxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const ogRef = useRef<HTMLDivElement>();

  useLayoutEffect(() => {
    if (ref.current && !ogRef.current) {
      ogRef.current = ref.current;
    }

    if (ref.current) {
      ref.current.style.opacity = "0";
    }
  }, []);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.opacity = "1";
      ref.current.style.transition = "opacity 2s ease-in";
    }
  }, []);

  return (
    <div
      ref={ref}
      style={{
        background: "#121212",
        borderStyle: "inset",
        borderColor: "#202020",
        borderWidth: "12px",
        color: "#efefef",
        fontFamily: "monospace",
        fontSize: "16px",
        padding: "12px",
      }}
    >
      <span>{text}</span>
      <br />
      <button onClick={onClick}>ok</button>
    </div>
  );
}
