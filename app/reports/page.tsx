'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import BarChart from '@/components/charts/BarChart';
import DonutChart from '@/components/charts/DonutChart';
import { formatCurrency } from '@/lib/utils';

const deptColors: Record<string, string> = {
  Cardiology: 'var(--accent)', Gynecology: 'var(--purple)', Pediatrics: 'var(--green)',
  Neurology: 'var(--amber)', Surgery: 'var(--red)', Ophthalmology: 'var(--accent2)',
  Dermatology: 'var(--purple)', Emergency: 'var(--red)', 'General Medicine': 'var(--accent)', Orthopedics: 'var(--green)',
};
const categoryColors: Record<string, string> = { outpatient: 'var(--accent)', hospitalized: 'var(--purple)', external: 'var(--green)', emergency: 'var(--amber)' };
const categoryLabels: Record<string, string> = { outpatient: 'Outpatient', hospitalized: 'Hospitalized', external: 'External', emergency: 'Emergency' };
const statusColors: Record<string, string> = { completed: 'var(--green)', 'in-progress': 'var(--accent)', confirmed: 'var(--amber)', scheduled: 'var(--purple)', 'no-show': 'var(--red)', cancelled: 'var(--muted)' };

interface ReportData {
  consultationsByDept: { _id: string; count: number }[];
  patientDistribution: { _id: string; count: number }[];
  revenueByMonth: { _id: string; revenue: number; invoices: number }[];
  appointmentStats: { _id: string; count: number }[];
  labStats: { _id: string; count: number }[];
  totalRevenue: number; totalPatients: number; totalAppointments: number;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    try {
      const res = await fetch(`/api/reports?${params}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, [dateFrom, dateTo]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>Loading reports...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: '22px', fontWeight: 400, marginBottom: '4px' }}>Reporting &amp; Stats</h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>Clinic analytics and performance overview</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', padding: '8px 14px', fontSize: '13px' }} />
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>to</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', padding: '8px 14px', fontSize: '13px' }} />
        </div>
      </div>

      {/* KPI Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Revenue', value: `${formatCurrency(data?.totalRevenue || 0)} MAD`, color: 'var(--green)' },
          { label: 'Total Patients', value: data?.totalPatients || 0, color: 'var(--accent)' },
          { label: 'Total Appointments', value: data?.totalAppointments || 0, color: 'var(--purple)' },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <div style={{ fontSize: '11.5px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>{kpi.label}</div>
            <div style={{ fontSize: '24px', fontWeight: 600, color: kpi.color }}>{kpi.value}</div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <Card>
          <CardHeader title="Consultations by Department" />
          <BarChart data={(data?.consultationsByDept || []).map(d => ({ label: d._id || 'Other', value: d.count, color: deptColors[d._id] || 'var(--accent)' }))} />
        </Card>
        <Card>
          <CardHeader title="Patient Distribution" />
          <DonutChart
            data={(data?.patientDistribution || []).map(d => ({ label: categoryLabels[d._id] || d._id, value: d.count, color: categoryColors[d._id] || 'var(--muted)' }))}
            centerLabel={String(data?.totalPatients || 0)}
          />
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <Card>
          <CardHeader title="Revenue by Month" />
          <BarChart data={(data?.revenueByMonth || []).map(d => ({ label: d._id, value: d.revenue, color: 'var(--green)' }))} />
        </Card>
        <Card>
          <CardHeader title="Appointment Status Breakdown" />
          <DonutChart
            data={(data?.appointmentStats || []).map(d => ({ label: d._id, value: d.count, color: statusColors[d._id] || 'var(--muted)' }))}
            centerLabel={String(data?.totalAppointments || 0)}
          />
        </Card>
      </div>

      <Card>
        <CardHeader title="Lab Request Status" />
        <BarChart data={(data?.labStats || []).map(d => ({ label: d._id, value: d.count, color: d._id === 'validated' ? 'var(--green)' : d._id === 'completed' ? 'var(--accent)' : d._id === 'in-progress' ? 'var(--amber)' : 'var(--muted)' }))} />
      </Card>
    </div>
  );
}
