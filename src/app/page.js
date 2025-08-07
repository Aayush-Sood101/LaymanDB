"use client";

import PageTemplate from '@/components/PageTemplate';
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/generate');
}