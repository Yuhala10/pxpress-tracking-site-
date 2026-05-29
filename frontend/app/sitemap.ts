import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://pxpress-logistics.com';
  const routes = ['', '/track', '/services', '/about', '/contact', '/pricing', '/faq', '/testimonials', '/terms', '/login'];
  return routes.map((r) => ({
    url: `${base}${r}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: r === '' ? 1 : 0.8,
  }));
}
