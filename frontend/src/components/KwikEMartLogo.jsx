import React from "react";

export function KwikEMartLogo({ className = "w-36 h-auto drop-shadow-md" }) {
  return (
    <svg
      viewBox="0 0 200 240"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Fondo blanco con marco azul redondeado */}
      <rect
        x="8"
        y="8"
        width="184"
        height="224"
        rx="30"
        fill="#ffffff"
        stroke="#29b6f6"
        strokeWidth="12"
      />

      {/* Fondo verde del cartel */}
      <path
        d="M 28 35 C 28 32 30 30 33 30 L 167 30 C 170 30 172 32 172 35 L 148 145 C 147 148 144 150 141 150 L 59 150 C 56 150 53 148 52 145 Z"
        fill="#7cb342"
      />

      {/* Texto KWIK */}
      <text
        x="100"
        y="70"
        fill="#c62828"
        fontSize="34"
        fontWeight="900"
        fontFamily="Arial Black, Impact, sans-serif"
        textAnchor="middle"
        letterSpacing="1"
      >
        KWIK
      </text>

      {/* Letra E grande */}
      <text
        x="100"
        y="155"
        fill="#c62828"
        fontSize="90"
        fontWeight="900"
        fontFamily="Arial Black, Impact, sans-serif"
        textAnchor="middle"
      >
        E
      </text>

      {/* Texto MART */}
      <text
        x="100"
        y="202"
        fill="#c62828"
        fontSize="34"
        fontWeight="900"
        fontFamily="Arial Black, Impact, sans-serif"
        textAnchor="middle"
        letterSpacing="1"
      >
        MART
      </text>
    </svg>
  );
}

export default KwikEMartLogo;
