import { redirect } from 'next/navigation';

/**
 * Home page - redirect to feed
 */
export default function Home() {
  redirect('/feed');
}
