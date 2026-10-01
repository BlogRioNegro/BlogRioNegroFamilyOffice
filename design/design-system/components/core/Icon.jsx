import React from 'react';

// Traçados do Lucide (lucide.dev, licença ISC), 24×24, stroke 2.
const PATHS = {
  x: [['path',{d:'M18 6 6 18'}],['path',{d:'m6 6 12 12'}]],
  check: [['path',{d:'M20 6 9 17l-5-5'}]],
  'chevron-left': [['path',{d:'m15 18-6-6 6-6'}]],
  'chevron-right': [['path',{d:'m9 18 6-6-6-6'}]],
  'arrow-right': [['path',{d:'M5 12h14'}],['path',{d:'m12 5 7 7-7 7'}]],
  'arrow-left': [['path',{d:'m12 19-7-7 7-7'}],['path',{d:'M19 12H5'}]],
  'circle-alert': [['circle',{cx:12,cy:12,r:10}],['line',{x1:12,x2:12,y1:8,y2:12}],['line',{x1:12,x2:12.01,y1:16,y2:16}]],
  'circle-check': [['circle',{cx:12,cy:12,r:10}],['path',{d:'m9 12 2 2 4-4'}]],
  'triangle-alert': [['path',{d:'m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3'}],['path',{d:'M12 9v4'}],['path',{d:'M12 17h.01'}]],
  loader: [['path',{d:'M21 12a9 9 0 1 1-6.219-8.56'}]],
  'file-text': [['path',{d:'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'}],['path',{d:'M14 2v4a2 2 0 0 0 2 2h4'}],['path',{d:'M10 9H8'}],['path',{d:'M16 13H8'}],['path',{d:'M16 17H8'}]],
  'align-left': [['path',{d:'M15 12H3'}],['path',{d:'M17 18H3'}],['path',{d:'M21 6H3'}]],
  pencil: [['path',{d:'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z'}],['path',{d:'m15 5 4 4'}]],
  trash: [['path',{d:'M3 6h18'}],['path',{d:'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6'}],['path',{d:'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'}],['line',{x1:10,x2:10,y1:11,y2:17}],['line',{x1:14,x2:14,y1:11,y2:17}]],
  download: [['path',{d:'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'}],['polyline',{points:'7 10 12 15 17 10'}],['line',{x1:12,x2:12,y1:15,y2:3}]],
  'external-link': [['path',{d:'M15 3h6v6'}],['path',{d:'M10 14 21 3'}],['path',{d:'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'}]],
  send: [['path',{d:'M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z'}],['path',{d:'m21.854 2.147-10.94 10.939'}]],
  plus: [['path',{d:'M5 12h14'}],['path',{d:'M12 5v14'}]],
  search: [['circle',{cx:11,cy:11,r:8}],['path',{d:'m21 21-4.3-4.3'}]],
  eye: [['path',{d:'M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0'}],['circle',{cx:12,cy:12,r:3}]],
  'rotate-ccw': [['path',{d:'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8'}],['path',{d:'M3 3v5h5'}]],
};

export function Icon({ name, size = 20, className = '', label, ...rest }) {
  const parts = PATHS[name] || [];
  return (
    <svg className={'rn-icon ' + (name === 'loader' ? 'rn-spinner ' : '') + className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} {...rest}>
      {parts.map(([tag, attrs], i) => React.createElement(tag, { key: i, ...attrs }))}
    </svg>
  );
}
