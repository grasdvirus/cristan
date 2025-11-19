
'use client';

import Link from 'next/link';

export function CustomProjectButton() {
  return (
    <Link href="/contract" passHref>
      <button className="custom-project-button">
        <svg className="svgIcon" viewBox="0 0 512 512" height="1em" xmlns="http://www.w3.org/2000/svg"><path d="M501.1 392.5l-63.2 63.2c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L420.7 384l-45.3-45.3c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L484 320l45.3 45.3c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L501.1 392.5zM221.4 35.4c12.5-12.5 32.8-12.5 45.3 0l96 96c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L288 147.3V336c0 17.7-14.3 32-32 32s-32-14.3-32-32V147.3L193.4 176.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l96-96z"></path><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM48 256c0-114.9 93.1-208 208-208s208 93.1 208 208s-93.1 208-208 208S48 370.9 48 256z"></path></svg>
      </button>
    </Link>
  );
}
