import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'DripCourse — Analytics',
  description: 'Creator Analytics Dashboard & Drip Schedule Management',
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <div className={inter.className}>{children}</div>;
}
