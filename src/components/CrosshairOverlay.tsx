import { CrosshairStyle } from '../types/booster';

interface CrosshairOverlayProps {
  enabled: boolean;
  style: CrosshairStyle;
}

export function CrosshairOverlay({ enabled, style }: CrosshairOverlayProps) {
  if (!enabled) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-30 flex items-center justify-center"
      aria-hidden="true"
    >
      {style === 'tactical' && (
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" className="drop-shadow-[0_0_2px_rgba(0,0,0,0.9)]">
          <circle cx="22" cy="22" r="10" stroke="#F43F5E" strokeWidth="1.5" strokeOpacity="0.9" />
          <line x1="22" y1="3" x2="22" y2="14" stroke="#F43F5E" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="22" y1="30" x2="22" y2="41" stroke="#F43F5E" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="3" y1="22" x2="14" y2="22" stroke="#F43F5E" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="30" y1="22" x2="41" y2="22" stroke="#F43F5E" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="22" cy="22" r="2" fill="#FFFFFF" />
        </svg>
      )}
      {style === 'dot' && (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="drop-shadow-[0_0_2px_rgba(0,0,0,0.9)]">
          <circle cx="12" cy="12" r="6" stroke="#10B981" strokeWidth="1.4" strokeOpacity="0.8" />
          <circle cx="12" cy="12" r="2.2" fill="#10B981" />
        </svg>
      )}
      {style === 'chevron' && (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="drop-shadow-[0_0_2px_rgba(0,0,0,0.9)]">
          <path d="M12 24L20 15L28 24" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="20" y1="22" x2="20" y2="31" stroke="#F59E0B" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="20" cy="15" r="1.8" fill="#FFFFFF" />
        </svg>
      )}
    </div>
  );
}
