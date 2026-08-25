import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// SPA navigation doesn't reset scroll position or move focus the way a full page
// load does — without this, going from a long catalog page to a new route leaves
// the viewport (and screen-reader focus) wherever it was, which is disorienting
// both visually and for assistive tech.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    const main = document.getElementById('conteudo-principal');
    main?.focus();
  }, [pathname]);

  return null;
}
