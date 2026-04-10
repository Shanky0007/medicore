'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import ImagingFormModal from '@/components/imaging/ImagingFormModal';
import { formatDateLong } from '@/lib/utils';
import s from '@/styles/imaging.module.css';

const typeLabels: Record<string, string> = {
  xray: 'X-Ray', ultrasound: 'Ultrasound', ct: 'CT Scan', mri: 'MRI', echocardiography: 'Echocardiography', other: 'Other',
};

interface ImagingDetail {
  _id: string; studyId: string; type: string; bodyPart: string; status: string; report: string; notes: string; createdAt: string;
  patient: { _id: string; firstName: string; lastName: string; patientId: string; gender: string; phone: string } | null;
  doctor: { firstName: string; lastName: string; department: string } | null;
}

export default function ImagingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [study, setStudy] = useState<ImagingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const fetchStudy = async () => {
    try {
      const res = await fetch(`/api/imaging/${params.id}`);
      const json = await res.json();
      if (json.success) setStudy(json.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStudy(); }, [params.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async () => {
    if (!confirm('Delete this imaging study?')) return;
    await fetch(`/api/imaging/${params.id}`, { method: 'DELETE' });
    router.push('/imaging');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>Loading...</div>;
  if (!study) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>Study not found</div>;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <Button variant="secondary" onClick={() => router.push('/imaging')}><ArrowLeft size={14} /> Back to Imaging</Button>
      </div>

      <div className={s.detailHeader}>
        <div className={s.detailHeaderInfo}>
          <h1>Study {study.studyId}</h1>
          <div className={s.detailMeta}>
            <StatusBadge status={study.status} />
            <StatusBadge status={study.type} label={typeLabels[study.type]} />
            {study.bodyPart && <span>{study.bodyPart}</span>}
            {study.patient && <span>{study.patient.firstName} {study.patient.lastName}</span>}
            <span>{formatDateLong(new Date(study.createdAt))}</span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <Button variant="secondary" onClick={() => setEditOpen(true)}><Edit size={14} /> Edit</Button>
          <Button variant="danger" onClick={handleDelete}><Trash2 size={14} /> Delete</Button>
        </div>
      </div>

      <div className={s.detailGrid}>
        <div>
          {study.report && (
            <Card>
              <div className={s.section}><div className={s.sectionTitle}>Report</div><div className={s.sectionContent}>{study.report}</div></div>
            </Card>
          )}
          {!study.report && (
            <Card>
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)', fontSize: '13px' }}>No report available yet</div>
            </Card>
          )}
          {study.notes && (
            <Card style={{ marginTop: '16px' }}>
              <div className={s.section}><div className={s.sectionTitle}>Notes</div><div className={s.sectionContent}>{study.notes}</div></div>
            </Card>
          )}
        </div>
        <div>
          {study.patient && (
            <Card>
              <CardHeader title="Patient" action="View Profile →" onAction={() => router.push(`/patients/${study.patient?._id}`)} />
              <div style={{ fontSize: '13px' }}>
                <div style={{ fontWeight: 500, marginBottom: '4px' }}>{study.patient.firstName} {study.patient.lastName}</div>
                <div style={{ color: 'var(--muted)', fontSize: '12px' }}>{study.patient.patientId} · {study.patient.gender === 'male' ? 'Male' : 'Female'} · {study.patient.phone || 'No phone'}</div>
              </div>
            </Card>
          )}
          {study.doctor && (
            <Card style={{ marginTop: '16px' }}>
              <CardHeader title="Requesting Doctor" />
              <div style={{ fontSize: '13px', fontWeight: 500 }}>Dr. {study.doctor.firstName} {study.doctor.lastName}</div>
              {study.doctor.department && <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{study.doctor.department}</div>}
            </Card>
          )}
        </div>
      </div>

      <ImagingFormModal open={editOpen} onClose={() => setEditOpen(false)} onSaved={fetchStudy} editData={editOpen ? study as unknown as Record<string, unknown> : null} />
    </div>
  );
}
