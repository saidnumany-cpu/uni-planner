import React from 'react';

// Lucide tarzı, 2px çizgili tutarlı ikon seti
const svgProps = (size, className, props) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className,
  'aria-hidden': true,
  focusable: 'false',
  ...props
});

export function CalendarIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
}

export function CalendarDaysIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" /></svg>;
}

export function ClipboardIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="m9 14 2 2 4-4" /></svg>;
}

export function ChartIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><path d="M3 3v18h18" /><path d="M18 17V9M13 17V5M8 17v-3" /></svg>;
}

export function PlusIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><path d="M12 5v14M5 12h14" /></svg>;
}

export function TrashIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" /></svg>;
}

export function EditIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>;
}

export function ChevronLeftIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><path d="m15 18-6-6 6-6" /></svg>;
}

export function ChevronRightIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><path d="m9 18 6-6-6-6" /></svg>;
}

export function CheckIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><path d="M20 6 9 17l-5-5" /></svg>;
}

export function XIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><path d="M18 6 6 18M6 6l12 12" /></svg>;
}

export function MinusIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><path d="M5 12h14" /></svg>;
}

export function BookOpenIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>;
}

export function ClockIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>;
}

export function MapPinIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>;
}

export function AlertCircleIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>;
}

export function AlertTriangleIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4M12 17h.01" /></svg>;
}

export function UserIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
}

export function LogOutIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>;
}

export function CheckCircleIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>;
}

export function XCircleIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" /></svg>;
}

export function SaveIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8H7v8M7 3v5h8" /></svg>;
}

export function FileTextIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></svg>;
}

export function SettingsIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>;
}

export function SunIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>;
}

export function MoonIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>;
}

export function MonitorIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>;
}

export function GraduationCapIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><path d="M22 10 12 5 2 10l10 5 10-5Z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>;
}

export function InboxIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>;
}

export function RotateCcwIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>;
}

export function SearchIcon({ size = 20, className = '', ...props }) {
  return <svg {...svgProps(size, className, props)}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>;
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
