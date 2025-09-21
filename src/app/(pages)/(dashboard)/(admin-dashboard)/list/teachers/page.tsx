'use client'
import TeachersPage from '@/components/admin-dashboard/TeachersPage';
import UseAuthGuard from '@/hooks/useAuthGuard';

export default function Teachers() {
  UseAuthGuard();
  return <TeachersPage />;
}