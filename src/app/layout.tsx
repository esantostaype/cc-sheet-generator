import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CC Sheet Generator by Inszone",
  description:
    "Assignify by Inszone is a smart task automation platform that optimizes creative workflows, assigns tasks by priority and skill, and calculates deadlines based on real working hours.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className='bg-gray-950'>{children}</body>      
    </html>
  )
}
