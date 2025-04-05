'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PagesIndex() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/');
  }, [router]);
  
  return null;
}