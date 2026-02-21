import Link from 'next/link';
import { CONCEPTS } from '@/lib/concepts';
import ClientHome from '@/components/ClientHome';

export default function HomePage() {
  return <ClientHome concepts={CONCEPTS} />;
}
