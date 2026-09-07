import type { StructuredData } from '@/lib/utils/structured-data';

interface Props {
  data: StructuredData | StructuredData[];
}

/**
 * Renders JSON-LD structured data in a script tag.
 * Usage: <StructuredData data={organizationSchema()} />
 */
export default function StructuredData({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
