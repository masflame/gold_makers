import { Helmet } from 'react-helmet-async';
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '../config/seo';

function normalizeTitle(title) {
  if (!title) return SITE_NAME;
  return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
}

function toAbsoluteUrl(value) {
  if (!value) return value;
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE_URL}${value.startsWith('/') ? value : `/${value}`}`;
}

export default function Seo({
  title,
  description = SITE_DESCRIPTION,
  canonical,
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  noindex = false,
  jsonLd,
}) {
  const finalTitle = normalizeTitle(title);
  const finalRobots = noindex ? 'noindex, nofollow' : robots;
  const finalImage = toAbsoluteUrl(image);
  const jsonLdBlocks = Array.isArray(jsonLd) ? jsonLd.filter(Boolean) : jsonLd ? [jsonLd] : [];

  return (
    <Helmet prioritizeSeoTags>
      <html lang="en" />
      <title>{finalTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={finalRobots} />
      <meta name="application-name" content={SITE_NAME} />

      <meta property="og:type" content={type} />
      <meta property="og:locale" content="en_ZA" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:alt" content={finalTitle} />
      {canonical && <meta property="og:url" content={canonical} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={finalImage} />

      {canonical && (
        <>
          <link rel="canonical" href={canonical} />
          <link rel="alternate" hrefLang="en-ZA" href={canonical} />
          <link rel="alternate" hrefLang="x-default" href={canonical} />
        </>
      )}
      {jsonLdBlocks.map((block, index) => (
        <script key={`ld-${index}`} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  );
}
