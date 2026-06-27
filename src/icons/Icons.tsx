const commonProps = {
  className: "button-icon",
  viewBox: "0 0 48 48",
  fill: "none",
  width: 18,
  height: 18,
  stroke: "currentColor",
  strokeWidth: 4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": true,
} as const;

export const FullScreen = (
  <svg {...commonProps}>
    <path d="M30 6H42V18" />
    <path d="M18 6H6V18" />
    <path d="M30 42H42V30" />
    <path d="M18 42H6V30" />
    <path d="M42 6L29 19" />
    <path d="M19 29L6 42" />
  </svg>
);

export const OffScreen = (
  <svg {...commonProps}>
    <path d="M41 19H29V7" />
    <path d="M18 6H6V18" />
    <path d="M30 42H42V30" />
    <path d="M7 29H19V41" />
    <path d="M42 6L29 19" />
    <path d="M19 29L6 42" />
  </svg>
);

export const Help = (
  <svg {...commonProps}>
    <path d="M24 44C29.5228 44 34.5228 41.7614 38.1421 38.1421C41.7614 34.5228 44 29.5228 44 24C44 18.4772 41.7614 13.4772 38.1421 9.85786C34.5228 6.23858 29.5228 4 24 4C18.4772 4 13.4772 6.23858 9.85786 9.85786C6.23858 13.4772 4 18.4772 4 24C4 29.5228 6.23858 34.5228 9.85786 38.1421C13.4772 41.7614 18.4772 44 24 44Z" />
    <path d="M24 28.6248V24.6248C27.3137 24.6248 30 21.9385 30 18.6248C30 15.3111 27.3137 12.6248 24 12.6248C20.6863 12.6248 18 15.3111 18 18.6248" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      fill="currentColor"
      stroke="none"
      d="M24 37.6248C25.3807 37.6248 26.5 36.5055 26.5 35.1248C26.5 33.7441 25.3807 32.6248 24 32.6248C22.6193 32.6248 21.5 33.7441 21.5 35.1248C21.5 36.5055 22.6193 37.6248 24 37.6248Z"
    />
  </svg>
);
