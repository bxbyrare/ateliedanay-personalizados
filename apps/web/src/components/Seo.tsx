import { useEffect } from 'react';

const SITE_NAME = 'Ateliê da Nay';
const DEFAULT_DESCRIPTION = 'Canecas, quadros, convites e lembrancinhas personalizadas artesanalmente pelo Ateliê da Nay.';

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let tag = document.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

// No react-helmet dependency — this is a client-only SPA with no SSR, so a tiny
// effect that mutates <title>/<meta> directly on route change covers what we need
// (browser tab title, social-share previews on the current URL) without the extra
// package weight or the head-manager complexity SSR would require.
export default function Seo({ title, description, noIndex }: { title: string; description?: string; noIndex?: boolean }) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    document.title = fullTitle;
    const desc = description || DEFAULT_DESCRIPTION;
    setMetaTag('name', 'description', desc);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', desc);
    setMetaTag('property', 'og:url', window.location.href);
    setMetaTag('property', 'og:image', `${window.location.origin}/mascote1.png`);
    setMetaTag('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');
  }, [title, description, noIndex]);

  return null;
}
