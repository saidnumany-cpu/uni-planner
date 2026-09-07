import React from 'react';

// Common SVG props
const commonProps = (size, className, props) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className,
  "aria-hidden": "true",
  ...props
});

export function CalendarIcon({ size = 24, className = '', ...props }) {
  return (
    <svg {...commonProps(size, className, props)}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function ClipboardIcon({ size = 24, className = '', ...props }) {
  return (
    <svg {...commonProps(size, className, props)}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}

export function ChartIcon({ size = 24, className = '', ...props }) {
  return (
    <svg {...commonProps(size, className, props)}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

export function PlusIcon({ size = 24, className = '', ...props }) {
  return (
    <svg {...commonProps(size, className, props)}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function TrashIcon({ size = 24, className = '', ...props }) {
  return (
    <svg {...commonProps(size, className, props)}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function EditIcon({ size = 24, className = '', ...props }) {
  return (
    <svg {...commonProps(size, className, props)}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export function ChevronLeftIcon({ size = 24, className = '', ...props }) {
  return (
    <svg {...commonProps(size, className, props)}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export function CheckIcon({ size = 24, className = '', ...props }) {
  return (
    <svg {...commonProps(size, className, props)}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function XIcon({ size = 24, className = '', ...props }) {
  return (
    <svg {...commonProps(size, className, props)}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function BookOpenIcon({ size = 24, className = '', ...props }) {
  return (
    <svg {...commonProps(size, className, props)}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

export function ClockIcon({ size = 24, className = '', ...props }) {
  return (
    <svg {...commonProps(size, className, props)}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function MapPinIcon({ size = 24, className = '', ...props }) {
  return (
    <svg {...commonProps(size, className, props)}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function AlertCircleIcon({ size = 24, className = '', ...props }) {
  return (
    <svg {...commonProps(size, className, props)}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export function SearchIcon({ size = 24, className = '', ...props }) {
  return (
    <svg {...commonProps(size, className, props)}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function UserIcon({ size = 24, className = '', ...props }) {
  return (
    <svg {...commonProps(size, className, props)}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function LogOutIcon({ size = 24, className = '', ...props }) {
  return (
    <svg {...commonProps(size, className, props)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function GoogleIcon({ size = 24, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...props}>
      <path fill="#4285F4" d="M23.7449 12.27C23.7449 11.48 23.6749 10.73 23.5549 10H12.2549V14.51H18.7249C18.4349 15.99 17.5849 17.24 16.3249 18.09V21.09H20.1849C22.4449 19.01 23.7449 15.92 23.7449 12.27Z" />
      <path fill="#34A853" d="M12.2551 24C15.4951 24 18.2051 22.92 20.1851 21.09L16.3251 18.09C15.2451 18.81 13.8751 19.25 12.2551 19.25C9.13508 19.25 6.47508 17.14 5.52508 14.29H1.54508V17.38C3.51508 21.3 7.56508 24 12.2551 24Z" />
      <path fill="#FBBC05" d="M5.5249 14.29C5.2749 13.57 5.1449 12.8 5.1449 12C5.1449 11.2 5.2849 10.43 5.5249 9.71V6.62H1.5449C0.724902 8.24 0.254902 10.06 0.254902 12C0.254902 13.94 0.724902 15.76 1.5449 17.38L5.5249 14.29Z" />
      <path fill="#EA4335" d="M12.2551 4.75C14.0251 4.75 15.6051 5.36 16.8551 6.55L20.2751 3.13C18.1951 1.19 15.4951 0 12.2551 0C7.56508 0 3.51508 2.7 1.54508 6.62L5.52508 9.71C6.47508 6.86 9.13508 4.75 12.2551 4.75Z" />
    </svg>
  );
}

export function CheckCircleIcon({ size = 24, className = '', ...props }) {
  return (
    <svg {...commonProps(size, className, props)}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export function XCircleIcon({ size = 24, className = '', ...props }) {
  return (
    <svg {...commonProps(size, className, props)}>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

export function SaveIcon({ size = 24, className = '', ...props }) {
  return (
    <svg {...commonProps(size, className, props)}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

export function FileTextIcon({ size = 24, className = '', ...props }) {
  return (
    <svg {...commonProps(size, className, props)}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

export function SparklesIcon({ size = 24, className = '', ...props }) {
  return (
    <svg {...commonProps(size, className, props)}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}
