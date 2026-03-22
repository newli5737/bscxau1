'use client';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Override mobile-container constraint for admin
  useEffect(() => {
    const container = document.querySelector('.mobile-container') as HTMLElement;
    if (container) {
      container.style.maxWidth = '100%';
      container.style.borderLeft = 'none';
      container.style.borderRight = 'none';
      container.style.background = 'linear-gradient(135deg, #0a0e27 0%, #0d1b3e 50%, #0a0e27 100%)';
    }
    return () => {
      if (container) {
        container.style.maxWidth = '420px';
        container.style.borderLeft = '';
        container.style.borderRight = '';
        container.style.background = '';
      }
    };
  }, []);

  return <>{children}</>;
}
