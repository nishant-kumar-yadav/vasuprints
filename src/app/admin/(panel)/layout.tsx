import { Sidebar } from '@/components/admin/Sidebar';
import { Toaster } from '@/components/admin/Toaster';
import { requireAdmin } from '@/lib/auth/session';
import { connectDb } from '@/lib/db/connect';
import { LeadModel } from '@/models/lead';
import { logout } from './actions';

export const dynamic = 'force-dynamic';

async function newLeadCount() {
  try {
    await connectDb();
    return await LeadModel.countDocuments({ status: 'new' });
  } catch {
    return 0;
  }
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const newLeads = await newLeadCount();
  return (
    <Toaster>
      <Sidebar newLeads={newLeads} logout={logout} />
      <div className="lg:pl-[248px]">
        <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </Toaster>
  );
}
