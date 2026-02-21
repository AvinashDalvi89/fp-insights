import { notFound } from 'next/navigation';
import { CONCEPTS, getConcept, getAdjacentConcepts } from '@/lib/concepts';
import { getConceptContent } from '@/lib/conceptContent';
import ConceptPageClient from '@/components/ConceptPageClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ConceptPage({ params }: Props) {
  const { id } = await params;
  const concept = getConcept(id);
  const content = getConceptContent(id);

  if (!concept || !content) {
    notFound();
  }

  const { prev, next } = getAdjacentConcepts(id);

  return (
    <ConceptPageClient
      concept={concept}
      content={content}
      prev={prev}
      next={next}
    />
  );
}

export function generateStaticParams() {
  return CONCEPTS.map(c => ({ id: c.id }));
}
