'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import RecordFormModal from '@/components/records/RecordFormModal';
import { formatDateShort } from '@/lib/utils';
import s from '@/styles/records.module.css';

interface RecordRow {
  _id: string;
  recordId: string;
  patient: { _id: string; firstName: string; lastName: string; patientId: string } | null;
  doctor: { firstName: string; lastName: string } | null;
  type: string;
  content: { chiefComplaint: string; diagnosis: string };
  createdAt: string;
}

const typeLabels: Record<string, string> = {
  consultation: 'Consultation',
  diagnosis: 'Diagnosis',
  treatment: 'Treatment',
  vitals: 'Vitals',
  prescription: 'Prescription',
};

export default function RecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const limit = 20;

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    if (typeFilter) params.set('type', typeFilter);

    try {
      const res = await fetch(`/api/records?${params}`);
      const json = await res.json();
      if (json.success) { setRecords(json.data); setTotal(json.pagination.total); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, search, typeFilter]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const columns = [
    { key: 'recordId', label: 'ID' },
    {
      key: 'patient',
      label: 'Patient',
      render: (r: Record<string, unknown>) => {
        const row = r as unknown as RecordRow;
        return row.patient ? `${row.patient.firstName} ${row.patient.lastName}` : '—';
      },
    },
    {
      key: 'type',
      label: 'Type',
      render: (r: Record<string, unknown>) => {
        const row = r as unknown as RecordRow;
        return <StatusBadge status={row.type} label={typeLabels[row.type] || row.type} />;
      },
    },
    {
      key: 'diagnosis',
      label: 'Diagnosis',
      render: (r: Record<string, unknown>) => {
        const row = r as unknown as RecordRow;
        const diag = row.content?.diagnosis || '—';
        return diag.length > 60 ? diag.slice(0, 60) + '...' : diag;
      },
    },
    {
      key: 'doctor',
      label: 'Doctor',
      render: (r: Record<string, unknown>) => {
        const row = r as unknown as RecordRow;
        return row.doctor ? `Dr. ${row.doctor.firstName} ${row.doctor.lastName}` : '—';
      },
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (r: Record<string, unknown>) => formatDateShort(new Date((r as unknown as RecordRow).createdAt)),
    },
  ];

  return (
    <div>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <h1>Medical Records</h1>
          <p>{total} record{total !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> New Record
        </Button>
      </div>

      <div className={s.controls}>
        <input className={s.searchInput} placeholder="Search by ID, diagnosis..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        <select className={s.filterSelect} value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          <option value="consultation">Consultation</option>
          <option value="diagnosis">Diagnosis</option>
          <option value="treatment">Treatment</option>
          <option value="vitals">Vitals</option>
          <option value="prescription">Prescription</option>
        </select>
      </div>

      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: '13px' }}>Loading records...</div>
        ) : (
          <DataTable
            columns={columns}
            data={records as unknown as Record<string, unknown>[]}
            page={page}
            totalPages={Math.ceil(total / limit)}
            total={total}
            onPageChange={setPage}
            onRowClick={(row) => router.push(`/records/${(row as unknown as RecordRow)._id}`)}
          />
        )}
      </Card>

      <RecordFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={fetchRecords} />
    </div>
  );
}
