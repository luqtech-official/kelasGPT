import { memo } from 'react';

export const UserIcon = memo(({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
));

export const MailIcon = memo(({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
  </svg>
));

export const PhoneIcon = memo(({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
));

export const SecureShieldIcon = memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <path d="m9 12 2 2 4-4"></path>
  </svg>
));

export const CancelledIcon = memo(({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <path d="m15 9-6 6"></path>
    <path d="m9 9 6 6"></path>
  </svg>
));

export const TimeoutIcon = memo(({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12,6 12,12 16,14"></polyline>
  </svg>
));

export const SuccessIcon = memo(({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <path d="m9 12 2 2 4-4"></path>
  </svg>
));

export const FailedIcon = memo(({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <path d="m15 9-6 6"></path>
    <path d="m9 9 6 6"></path>
  </svg>
));

export const ProcessingIcon = memo(({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 6v6l4 2"></path>
  </svg>
));

export const SecurePayIcon = memo(({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="24" viewBox="0 0 100 30" className={className}>
    <rect width="100" height="30" rx="4" fill="#2563eb"/>
    <text x="50" y="20" textAnchor="middle" fill="white" fontSize="12" fontWeight="600" fontFamily="Inter, sans-serif">
      SecurePay
    </text>
  </svg>
));

export const FPXIcon = memo(({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="24" viewBox="0 0 50 30" className={className}>
    <rect width="50" height="30" rx="4" fill="#0066cc"/>
    <text x="25" y="20" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" fontFamily="Inter, sans-serif">
      FPX
    </text>
  </svg>
));

UserIcon.displayName = 'UserIcon';
MailIcon.displayName = 'MailIcon';
PhoneIcon.displayName = 'PhoneIcon';
SecureShieldIcon.displayName = 'SecureShieldIcon';
CancelledIcon.displayName = 'CancelledIcon';
TimeoutIcon.displayName = 'TimeoutIcon';
SuccessIcon.displayName = 'SuccessIcon';
FailedIcon.displayName = 'FailedIcon';
ProcessingIcon.displayName = 'ProcessingIcon';
SecurePayIcon.displayName = 'SecurePayIcon';
FPXIcon.displayName = 'FPXIcon';

// Pokemon Game Icons
export const SparklesIcon = memo(({ size = 16, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
    <path d="M5 3v4"></path>
    <path d="M19 17v4"></path>
    <path d="M3 5h4"></path>
    <path d="M17 19h4"></path>
  </svg>
));

export const SwordsIcon = memo(({ size = 16, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="14.5,17.5 3,6 3,3 6,3 17.5,14.5"></polyline>
    <line x1="13" x2="19" y1="19" y2="13"></line>
    <line x1="16" x2="20" y1="16" y2="20"></line>
    <line x1="19" x2="21" y1="21" y2="19"></line>
    <polyline points="14.5,6.5 18,3 21,3 21,6 17.5,9.5"></polyline>
    <line x1="5" x2="9" y1="14" y2="18"></line>
    <line x1="7" x2="4" y1="17" y2="20"></line>
    <line x1="3" x2="5" y1="19" y2="21"></line>
  </svg>
));

export const TrophyIcon = memo(({ size = 16, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
    <path d="M4 22h16"></path>
    <path d="M10 14.66V17c0 .55.47.98.97 1.21C11.56 18.75 12 19.38 12 20v2"></path>
    <path d="M14 14.66V17c0 .55-.47.98-.97 1.21C12.44 18.75 12 19.38 12 20v2"></path>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
  </svg>
));

export const ShuffleIcon = memo(({ size = 16, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 3h5v5"></path>
    <path d="M4 20 21 3"></path>
    <path d="M21 16v5h-5"></path>
    <path d="M15 15l6 6"></path>
    <path d="M4 4l5 5"></path>
  </svg>
));

export const WandIcon = memo(({ size = 16, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 4V2a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v2"></path>
    <path d="M15 4h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4"></path>
    <path d="M15 10v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2Z"></path>
    <path d="m9 14 2 2 4-4"></path>
  </svg>
));

export const HeartIcon = memo(({ size = 16, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"></path>
  </svg>
));

export const StarIcon = memo(({ size = 16, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
  </svg>
));

export const PlayCircleIcon = memo(({ size = 16, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <polygon points="10,8 16,12 10,16 10,8"></polygon>
  </svg>
));

export const DiceIcon = memo(({ size = 16, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="12" height="12" x="2" y="10" rx="2" ry="2"></rect>
    <path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"></path>
    <path d="M6 18h.01"></path>
    <path d="M10 14h.01"></path>
    <path d="M15 6h.01"></path>
    <path d="M18 9h.01"></path>
  </svg>
));

export const PlusIcon = memo(({ size = 16, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14"></path>
    <path d="M12 5v14"></path>
  </svg>
));

export const XIcon = memo(({ size = 16, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18"></path>
    <path d="m6 6 12 12"></path>
  </svg>
));

export const UndoIcon = memo(({ size = 16, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 7v6h6"></path>
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
  </svg>
));

SparklesIcon.displayName = 'SparklesIcon';
SwordsIcon.displayName = 'SwordsIcon';
TrophyIcon.displayName = 'TrophyIcon';
ShuffleIcon.displayName = 'ShuffleIcon';
WandIcon.displayName = 'WandIcon';
HeartIcon.displayName = 'HeartIcon';
StarIcon.displayName = 'StarIcon';
PlayCircleIcon.displayName = 'PlayCircleIcon';
DiceIcon.displayName = 'DiceIcon';
PlusIcon.displayName = 'PlusIcon';
XIcon.displayName = 'XIcon';
UndoIcon.displayName = 'UndoIcon';