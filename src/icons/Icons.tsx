const commonProps = {
  className: "button-icon",
  viewBox: "0 0 48 48",
  fill: "none",
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
