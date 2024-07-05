import React from 'react';
import type { SVGProps } from 'react';

export function SaveIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg"
         width={24}
         height={24}
         viewBox="0 0 24 24" {...props}>
      <path fill="currentColor" d="M18 19h1V6.828L17.172 5H16v4H7V5H5v14h1v-7h12zM4 3h14l2.707 2.707a1 1 0 0 1 .293.707V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1m4 11v5h8v-5z"/>
    </svg>
  );
}