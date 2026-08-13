/**
 * The prototype's drawing kit, carried over as-is.
 *
 * Both of these came out of `CoachirinhoApp.dc.html` unchanged apart from the attribute
 * casing React insists on. The line icons are what the app used emoji for; the mark is
 * the rhino's face on its sand tile, which is the logo the prototype put beside the name.
 *
 * The sprite is mounted once by the app shell and referenced with `<use href="#ic-…">`,
 * so twenty-one icons cost one copy no matter how many times they appear.
 */

export function IconSprite() {
  return (
    <svg width="0" height="0" style={{position: 'absolute', width: '0', height: '0', overflow: 'hidden'}} aria-hidden="true">
<symbol id="ic-home" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10.4 12 4l8 6.4"></path><path d="M6 9.8V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.8"></path><path d="M9.8 20v-5.4h4.4V20"></path></symbol>
<symbol id="ic-route" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 20c0-3.2 11-3.4 11-7.2 0-3-11-2.6-11-6.2"></path><circle cx="6.5" cy="4.4" r="2.2"></circle><circle cx="17.5" cy="19.6" r="2.2"></circle></symbol>
<symbol id="ic-practice" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9.4v5.2"></path><path d="M20 9.4v5.2"></path><path d="M7.4 6.8v10.4"></path><path d="M16.6 6.8v10.4"></path><path d="M7.4 12h9.2"></path></symbol>
<symbol id="ic-chart" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19V11"></path><path d="M12 19V5"></path><path d="M19 19v-5.4"></path></symbol>
<symbol id="ic-play" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6.5 17.5 12 9 17.5z"></path></symbol>
<symbol id="ic-repeat" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12a8 8 0 1 1-2.6-5.9"></path><path d="M20 4v4.2h-4.2"></path></symbol>
<symbol id="ic-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.6 9.6 17.2 19 6.8"></path></symbol>
<symbol id="ic-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4.8" y="10.4" width="14.4" height="9.2" rx="2.6"></rect><path d="M8.4 10.4V8a3.6 3.6 0 0 1 7.2 0v2.4"></path><path d="M12 14.2v2"></path></symbol>
<symbol id="ic-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 5.5 16 12l-6.5 6.5"></path></symbol>
<symbol id="ic-arrow-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H6"></path><path d="M11.5 6.5 6 12l5.5 5.5"></path></symbol>
<symbol id="ic-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5 17.5 17.5"></path><path d="M17.5 6.5 6.5 17.5"></path></symbol>
<symbol id="ic-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5"></circle><path d="M12 7.2V12l3.2 2"></path></symbol>
<symbol id="ic-target" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5"></circle><circle cx="12" cy="12" r="4.2"></circle><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"></circle></symbol>
<symbol id="ic-write" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 19.5l1.1-4.3L15 5.8a2 2 0 0 1 2.8 0l.4.4a2 2 0 0 1 0 2.8l-9.4 9.4z"></path><path d="M13.8 7 17 10.2"></path></symbol>
<symbol id="ic-choice" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3.2 20.8 12 12 20.8 3.2 12z"></path><path d="M9 12l2.2 2.2L15.2 10"></path></symbol>
<symbol id="ic-order" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 7.5h11"></path><path d="M5 12h14"></path><path d="M5 16.5h7.5"></path></symbol>
<symbol id="ic-dialogue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 7.3A2.3 2.3 0 0 1 5.8 5h7.4A2.3 2.3 0 0 1 15.5 7.3v3.4a2.3 2.3 0 0 1-2.3 2.3H8L4.8 15.4v-2.6a2.3 2.3 0 0 1-1.3-2.1z"></path><path d="M18.5 10.6A2 2 0 0 1 20.5 12.6v3.3a2 2 0 0 1-2 2h-.6l-2.6 2v-2h-2.4"></path></symbol>
<symbol id="ic-audio" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 10.2v3.6"></path><path d="M8.2 7.4v9.2"></path><path d="M12 5.2v13.6"></path><path d="M15.8 8.4v7.2"></path><path d="M19.5 10.8v2.4"></path></symbol>
<symbol id="ic-cards" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="7.5" width="12" height="12" rx="2.5"></rect><path d="M7.6 7.5V6a2 2 0 0 1 2-2h8.9a2 2 0 0 1 2 2v8.9a2 2 0 0 1-2 2h-1.6"></path></symbol>
<symbol id="ic-gauge" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.8 17.6a8.6 8.6 0 1 1 16.4 0"></path><path d="M12 17.6l4.4-4.8"></path><path d="M5.6 12.6h1.2"></path><path d="M12 6.6v1.2"></path><path d="M18.4 12.6h-1.2"></path></symbol>
<symbol id="ic-flame" viewBox="0 0 24 24"><path d="M12.6 2.4c.5 3.1 2.2 4.4 3.7 6a7 7 0 0 1 2 4.9 6.3 6.3 0 1 1-12.6 0c0-1.8.7-3.3 1.7-4.4.1 1.1.7 2 1.6 2.4.4-3.6 1.6-6.5 3.6-8.9z" fill="currentColor"></path><path d="M12.2 12.2c.9 1.2 2.3 2 2.3 3.6a2.6 2.6 0 0 1-5.2 0c0-1.2 1.4-2.1 2.9-3.6z" fill="#fff" opacity=".5"></path></symbol>
</svg>
  )
}

/** One icon from the sprite. Size follows the font unless told otherwise. */
export function Icon({ name, size = 21 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} aria-hidden="true" focusable="false">
      <use href={`#ic-${name}`} />
    </svg>
  )
}

export type IconName =
  | 'home' | 'route' | 'practice' | 'chart' | 'play' | 'repeat' | 'check' | 'lock'
  | 'chevron' | 'arrow-left' | 'close' | 'clock' | 'target' | 'write' | 'choice'
  | 'order' | 'dialogue' | 'audio' | 'cards' | 'gauge' | 'flame'

/** The wordmark's rhino, on the sand tile the prototype gave it. */
export function BrandMark() {
  return (
    <svg viewBox="0 0 512 512" className="brand-mark" role="img" aria-label="Coachirinho"><defs><linearGradient id="sandg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#EFE3CA"></stop><stop offset="1" stopColor="#DCC9A4"></stop></linearGradient><clipPath id="sandc"><rect width="512" height="512" rx="112"></rect></clipPath></defs><g clipPath="url(#sandc)"><rect width="512" height="512" fill="url(#sandg)"></rect><circle cx="256" cy="300" r="212" fill="#F7EFDF" opacity=".35"></circle><g transform="translate(256,274) scale(1.98) translate(-200,-166)"><g transform="rotate(-20 140 122)"><ellipse cx="140" cy="112" rx="21" ry="28" fill="#818EA2"></ellipse><ellipse cx="140" cy="114" rx="11" ry="17" fill="#D98C9D"></ellipse></g><g transform="rotate(20 260 122)"><ellipse cx="260" cy="112" rx="21" ry="28" fill="#818EA2"></ellipse><ellipse cx="260" cy="114" rx="11" ry="17" fill="#D98C9D"></ellipse></g><ellipse cx="200" cy="170" rx="87" ry="74" fill="#68778D"></ellipse><ellipse cx="200" cy="204" rx="57" ry="39" fill="#BAC0C9"></ellipse><path d="M177 200 C181 156 189 128 200 108 C211 128 219 156 223 200 Z" fill="#F2E3C4"></path><path d="M200 108 C211 128 219 156 223 200 L209 200 C207 160 204 132 200 108 Z" fill="#D9C49B" opacity=".7"></path><ellipse cx="157" cy="159" rx="19" ry="19.5" fill="#F6F8FB"></ellipse><ellipse cx="243" cy="159" rx="19" ry="19.5" fill="#F6F8FB"></ellipse><circle cx="159" cy="162" r="12.5" fill="#242A36"></circle><circle cx="241" cy="162" r="12.5" fill="#242A36"></circle><circle cx="154" cy="157" r="4.8" fill="#fff"></circle><circle cx="236" cy="157" r="4.8" fill="#fff"></circle><circle cx="164" cy="168" r="2.4" fill="#fff"></circle><circle cx="246" cy="168" r="2.4" fill="#fff"></circle><path d="M143 134 q14 -9 27 -3" stroke="#CDD0D5" strokeWidth="5.5" strokeLinecap="round" fill="none"></path><path d="M257 134 q-14 -9 -27 -3" stroke="#CDD0D5" strokeWidth="5.5" strokeLinecap="round" fill="none"></path><ellipse cx="136" cy="196" rx="14" ry="10" fill="#E0899A" opacity=".5"></ellipse><ellipse cx="264" cy="196" rx="14" ry="10" fill="#E0899A" opacity=".5"></ellipse><ellipse cx="184" cy="210" rx="4.6" ry="3.4" fill="#95A1B1"></ellipse><ellipse cx="216" cy="210" rx="4.6" ry="3.4" fill="#95A1B1"></ellipse><path d="M184 220 q16 16 32 0" stroke="#2B3242" strokeWidth="6" strokeLinecap="round" fill="none"></path></g></g></svg>
  )
}
