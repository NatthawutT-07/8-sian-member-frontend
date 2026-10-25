import { useState } from 'react';

// Files in public/ are served from the website root.
export default function BrandLogo() {
  const [loaded, setLoaded] = useState(false),
    [failed, setFailed] = useState(false);
  return (
    <span className="brand-icon brand-logo" aria-hidden="true">
      {!failed && (
        <img
          src="/images/logo.png"
          alt=""
          hidden={!loaded}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
      {!loaded && (
        <>
          8<span>เซียน</span>
        </>
      )}
    </span>
  );
}
