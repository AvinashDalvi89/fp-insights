'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function GoogleAnalytics() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Check domain on client side
    if (window.location.hostname === 'fp-insights.avinashdalvi.com') {
      setShouldLoad(true);
    }
  }, []);

  if (!shouldLoad) {
    return null;
  }

  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-2BRCQGNCB7"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-2BRCQGNCB7');
        `}
      </Script>
    </>
  );
}
