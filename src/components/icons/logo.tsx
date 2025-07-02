import type { SVGProps } from 'react';

export function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 96 96"
      fill="none"
      {...props}
    >
      <path
        d="M84 12H56L28 48H12V84H40L68 48H84V12Z"
        fill="currentColor"
      />
    </svg>
  );
}
