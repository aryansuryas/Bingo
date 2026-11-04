import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ padding: '4rem', textAlign: 'center' }}>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link href="/bingo">Return to Bingo</Link>
    </div>
  );
}
