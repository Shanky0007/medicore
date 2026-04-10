'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import RecordFormModal from '@/components/records/RecordFormModal';
import { formatDateLong } from '@/lib/utils';
import s from '@/styles/records.module.css';

interface RecordDetail {
  _id: string;
  recordId: string;
  patient: { _id: string; firstName: string; lastName: string; patientId: string; gender: string; dateOfBirth: string; phone: string } | null;
  doctor: { firstName: string; lastName: string; department: string } | null;
  type: string;
  content: {
    chiefComplaint: string;
    examination: string;
    diagnosis: string;
    treatmentPlan: string;
    vitals: { bloodPressure: string; heartRate: string; temperature: string; weight: string; height: string };
    prescriptions: { medication: string; dosage: string; frequency: string; duration: string }[];
    notes: string;
  };
  createdAt: string;
}

const typeLabels: Record<string, string> = {
  consultation: 'Consultation', diagnosis: 'Diagnosis', treatment: 'Treatment', vitals: 'Vitals', prescription: 'Prescription',
};

export default function RecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<RecordDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const fetchRecord = async () => {
    try {
      const res = await fetch(`/api/records/${params.id}`);
      const json = await res.json();
      if (json.success) setRecord(json.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRecord(); }, [params.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async () => {
    if (!confirm('Delete this medical record?')) return;
    await fetch(`/api/records/${params.id}`, { method: 'DELETE' });
    router.push('/records');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>Loading...</div>;
  if (!record) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>Record not found</div>;

  const c = record.content;
  const v = c?.vitals;
  const hasVitals = v && (v.bloodPressure || v.heartRate || v.temperature || v.weight || v.height);

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <Button variant="secondary" onClick={() => router.push('/records')}><ArrowLeft size={14} /> Back to Records</Button>
      </div>

      <div className={s.detailHeader}>
        <div className={s.detailHeaderInfo}>
          <h1>Record {record.recordId}</h1>
          <div className={s.detailMeta}>
            <StatusBadge status={record.type} label={typeLabels[record.type]} />
            {record.patient && <span>{record.patient.firstName} {record.patient.lastName} ({record.patient.patientId})</span>}
            {record.doctor && <span>Dr. {record.doctor.firstName} {record.doctor.lastName}</span>}
            <span>{formatDateLong(new Date(record.createdAt))}</span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <Button variant="secondary" onClick={() => setEditOpen(true)}><Edit size={14} /> Edit</Button>
          <Button variant="danger" onClick={handleDelete}><Trash2 size={14} /> Delete</Button>
        </div>
      </div>

      <div className={s.detailGrid}>
        {/* Left column */}
        <div>
          {c?.chiefComplaint && (
            <Card>
              <div className={s.section}><div className={s.sectionTitle}>Chief Complaint</div><div className={s.sectionContent}>{c.chiefComplaint}</div></div>
            </Card>
          )}
          {c?.examination && (
            <Card style={{ marginTop: '16px' }}>
              <div className={s.section}><div className={s.sectionTitle}>Examination</div><div className={s.sectionContent}>{c.examination}</div></div>
            </Card>
          )}
          {c?.diagnosis && (
            <Card style={{ marginTop: '16px' }}>
              <div className={s.section}><div className={s.sectionTitle}>Diagnosis</div><div className={s.sectionContent}>{c.diagnosis}</div></div>
            </Card>
          )}
          {c?.treatmentPlan && (
            <Card style={{ marginTop: '16px' }}>
              <div className={s.section}><div className={s.sectionTitle}>Treatment Plan</div><div className={s.sectionContent}>{c.treatmentPlan}</div></div>
            </Card>
          )}
          {c?.notes && (
            <Card style={{ marginTop: '16px' }}>
              <div className={s.section}><div className={s.sectionTitle}>Notes</div><div className={s.sectionContent}>{c.notes}</div></div>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div>
          {hasVitals && (
            <Card>
              <CardHeader title="Vitals" />
              <div className={s.vitalsGrid}>
                {v.bloodPressure && <div className={s.vitalItem}><div className={s.vitalLabel}>Blood Pressure</div><div className={s.vitalValue}>{v.bloodPressure}</div></div>}
                {v.heartRate && <div className={s.vitalItem}><div className={s.vitalLabel}>Heart Rate</div><div className={s.vitalValue}>{v.heartRate}</div></div>}
                {v.temperature && <div className={s.vitalItem}><div className={s.vitalLabel}>Temperature</div><div className={s.vitalValue}>{v.temperature}</div></div>}
                {v.weight && <div className={s.vitalItem}><div className={s.vitalLabel}>Weight</div><div className={s.vitalValue}>{v.weight}</div></div>}
                {v.height && <div className={s.vitalItem}><div className={s.vitalLabel}>Height</div><div className={s.vitalValue}>{v.height}</div></div>}
              </div>
            </Card>
          )}

          {c?.prescriptions?.length > 0 && (
            <Card style={{ marginTop: hasVitals ? '16px' : '0' }}>
              <CardHeader title="Prescriptions" />
              {c.prescriptions.map((p, i) => (
                <div key={i} className={s.prescriptionRow}>
                  <span className={s.prescMed}>{p.medication}</span>
                  <span className={s.prescDetail}>{p.dosage} — {p.frequency} — {p.duration}</span>
                </div>
              ))}
            </Card>
          )}

          {/* Patient info card */}
          {record.patient && (
            <Card style={{ marginTop: '16px' }}>
              <CardHeader title="Patient" action="View Profile →" onAction={() => router.push(`/patients/${record.patient?._id}`)} />
              <div style={{ fontSize: '13px' }}>
                <div style={{ fontWeight: 500, marginBottom: '4px' }}>{record.patient.firstName} {record.patient.lastName}</div>
                <div style={{ color: 'var(--muted)', fontSize: '12px' }}>
                  {record.patient.patientId} · {record.patient.gender === 'male' ? 'Male' : 'Female'} · {record.patient.phone || 'No phone'}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      <RecordFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={fetchRecord}
        editData={editOpen ? record as unknown as Record<string, unknown> : null}
      />
    </div>
  );
}
