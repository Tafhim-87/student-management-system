
import type { Metadata } from 'next';
import '@/app/globals.css';
import SideNav from '@/components/ui/SideNav';


export const metadata: Metadata = {
  title: 'My Next.js App',
  description: 'A Next.js app with a sidebar',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className=''>
      <SideNav>{children}</SideNav>
    </main>
  );
}