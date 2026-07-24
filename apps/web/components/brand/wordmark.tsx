import Image from 'next/image';
import Link from 'next/link';

interface WordmarkProps {
  compact?: boolean;
  href?: string;
}

export function Wordmark({ compact = false, href = '/' }: WordmarkProps) {
  return (
    <Link className="wordmark" href={href} aria-label="Feed Sync home">
      <Image src="/icon.svg" width={38} height={38} alt="" priority />
      {!compact && (
        <span>
          <strong>Feed Sync</strong>
          <small>Aquaculture operations</small>
        </span>
      )}
    </Link>
  );
}
