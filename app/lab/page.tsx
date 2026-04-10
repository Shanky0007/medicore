'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import LabFormModal from '@/components/lab/LabFormModal';
import { formatDateShort } from '@/lib/utils';
import s from '@/styles/lab.module.css';

interface LabRow {
  _id: string;
  requestId: string;
  patient: { firstName: string; lastName: string; patientId: string } | null;
  doctor: { firstName: string; lastName: string } | null;
  tests: { name: string; category: string }[];
  status: string;
  createdAt: string;
}

export default function LabPage() {
  const router = useRouter();
  const [labs, setLabs] = useState<LabRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const limit = 20;

  const fetchLabs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);

    try {
      const res = await fetch(`/api/lab?${params}`);
      const json = await res.json();
      if (json.success) { setLabs(json.data); setTotal(json.pagination.total); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchLabs(); }, [fetchLabs]);

  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const updateStatus = async (id: string, newStatus: string) => {
    await fetch(`/api/lab/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchLabs();
  };

  const columns = [
    { key: 'requestId', label: 'ID' },
    {
      key: 'patient',
      label: 'Patient',
      render: (r: Record<string, unknown>) => {
        const row = r as unknown as LabRow;
        return row.patient ? `${row.patient.firstName} ${row.patient.lastName}` : '—';
      },
    },
    {
      key: 'tests',
      label: 'Tests',
      render: (r: Record<string, unknown>) => {
        const row = r as unknown as LabRow;
        return row.tests?.map(t => t.name).join(', ') || '—';
      },
    },
    {
      key: 'doctor',
      label: 'Requested By',
      render: (r: Record<string, unknown>) => {
        const row = r as unknown as LabRow;
        return row.doctor ? `Dr. ${row.doctor.firstName} ${row.doctor.lastName}` : '—';
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (r: Record<string, unknown>) => {
        const row = r as unknown as LabRow;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <StatusBadge status={row.status} />
            {row.status === 'requested' && (
              <button className={s.statusBtn} onClick={(e) => { e.stopPropagation(); updateStatus(row._id, 'sample-collected'); }}>Collect</button>
            )}
            {row.status === 'sample-collected' && (
              <button className={s.statusBtn} onClick={(e) => { e.stopPropagation(); updateStatus(row._id, 'in-progress'); }}>Start</button>
            )}
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (r: Record<string, unknown>) => formatDateShort(new Date((r as unknown as LabRow).createdAt)),
    },
  ];

  return (
    <div>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <h1>Laboratory (LIS)</h1>
          <p>{total} lab request{total !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> New Lab Request
        </Button>
      </div>

      <div className={s.controls}>
        <input className={s.searchInput} placeholder="Search by ID or test name..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        <select className={s.filterSelect} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="requested">Requested</option>
          <option value="sample-collected">Sample Collected</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="validated">Validated</option>
        </select>
      </div>

      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: '13px' }}>Loading lab requests...</div>
        ) : (
          <DataTable
            columns={columns}
            data={labs as unknown as Record<string, unknown>[]}
            page={page}
            totalPages={Math.ceil(total / limit)}
            total={total}
            onPageChange={setPage}
            onRowClick={(row) => router.push(`/lab/${(row as unknown as LabRow)._id}`)}
          />
        )}
      </Card>

      <LabFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={fetchLabs} />
    </div>
  );
}
