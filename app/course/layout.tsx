import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'DripCourse — Digital Marketing Mastery',
  description: 'Unlock Learning Over Time',
};

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  return <div className={inter.className}>{children}</div>;
}
