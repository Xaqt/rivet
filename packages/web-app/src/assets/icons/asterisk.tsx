import React from 'react';
import type { SVGProps } from 'react';

export function Asterisk(props: SVGProps<SVGSVGElement>) {
  return(
    <svg xmlns="http://www.w3.org/2000/svg"
               width={24}
               height={24}
               viewBox="0 0 24 24" {...props}>
      <path fill="currentColor" d="M11 6h2v4.079l3.341-2.34l1.147 1.639L13.743 12l3.745 2.622l-1.147 1.639L13 13.92V18h-2v-4.079l-3.341 2.34l-1.148-1.639L10.257 12L6.51 9.378l1.15-1.639L11 10.08z"/>
    </svg>
  );
}
