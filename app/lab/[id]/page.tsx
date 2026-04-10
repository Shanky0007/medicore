'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Trash2 } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDateLong } from '@/lib/utils';
import s from '@/styles/lab.module.css';

interface LabResult {
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag: 'normal' | 'abnormal' | 'critical';
}

interface LabDetail {
  _id: string;
  requestId: string;
  patient: { _id: string; firstName: string; lastName: string; patientId: string; gender: string; dateOfBirth: string; phone: string } | null;
  doctor: { firstName: string; lastName: string; department: string } | null;
  validatedBy: { firstName: string; lastName: string } | null;
  validatedAt: string | null;
  tests: { name: string; category: string }[];
  status: string;
  results: LabResult[];
  notes: string;
  createdAt: string;
}

const flagClass: Record<string, string> = {
  normal: s.flagNormal,
  abnormal: s.flagAbnormal,
  critical: s.flagCritical,
};

export default function LabDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lab, setLab] = useState<LabDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<LabResult[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchLab = async () => {
    try {
      const res = await fetch(`/api/lab/${params.id}`);
      const json = await res.json();
      if (json.success) {
        setLab(json.data);
        if (json.data.results?.length > 0) {
          setResults(json.data.results);
        } else {
          // Initialize empty results for each test
          setResults(json.data.tests.map((t: { name: string }) => ({
            testName: t.name,
            value: '',
            unit: '',
            referenceRange: '',
            flag: 'normal' as const,
          })));
        }
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLab(); }, [params.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateResult = (idx: number, field: keyof LabResult, value: string) => {
    setResults(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const saveResults = async (newStatus: string) => {
    setSaving(true);
    try {
      await fetch(`/api/lab/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results, status: newStatus }),
      });
      await fetchLab();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const updateStatus = async (newStatus: string) => {
    await fetch(`/api/lab/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchLab();
  };

  const handleDelete = async () => {
    if (!confirm('Delete this lab request?')) return;
    await fetch(`/api/lab/${params.id}`, { method: 'DELETE' });
    router.push('/lab');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>Loading...</div>;
  if (!lab) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>Lab request not found</div>;

  const canEnterResults = lab.status === 'in-progress' || lab.status === 'sample-collected';
  const canValidate = lab.status === 'completed';
  const isFinished = lab.status === 'validated';

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <Button variant="secondary" onClick={() => router.push('/lab')}><ArrowLeft size={14} /> Back to Lab</Button>
      </div>

      <div className={s.detailHeader}>
        <div className={s.detailHeaderInfo}>
          <h1>Lab Request {lab.requestId}</h1>
          <div className={s.detailMeta}>
            <StatusBadge status={lab.status} />
            {lab.patient && <span>{lab.patient.firstName} {lab.patient.lastName} ({lab.patient.patientId})</span>}
            {lab.doctor && <span>Dr. {lab.doctor.firstName} {lab.doctor.lastName}</span>}
            <span>{formatDateLong(new Date(lab.createdAt))}</span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {lab.status === 'requested' && (
            <Button variant="secondary" onClick={() => updateStatus('sample-collected')}>Mark Sample Collected</Button>
          )}
          {lab.status === 'sample-collected' && (
            <Button variant="secondary" onClick={() => updateStatus('in-progress')}>Start Processing</Button>
          )}
          {canEnterResults && (
            <Button onClick={() => saveResults('completed')} disabled={saving}>
              {saving ? 'Saving...' : 'Save Results & Complete'}
            </Button>
          )}
          {canValidate && (
            <Button onClick={() => saveResults('validated')} disabled={saving}>
              <CheckCircle size={14} /> {saving ? 'Validating...' : 'Validate Results'}
            </Button>
          )}
          <Button variant="danger" onClick={handleDelete}><Trash2 size={14} /> Delete</Button>
        </div>
      </div>

      <div className={s.detailGrid}>
        {/* Left: Tests & Results */}
        <div>
          <Card>
            <CardHeader title="Requested Tests" />
            <div className={s.testsList}>
              {lab.tests.map((t, i) => (
                <span key={i} className={s.testTag}>{t.name} {t.category && `(${t.category})`}</span>
              ))}
            </div>
          </Card>

          <Card style={{ marginTop: '16px' }}>
            <CardHeader title={isFinished ? 'Results (Validated)' : canEnterResults ? 'Enter Results' : 'Results'} />

            <table className={s.resultsTable}>
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Value</th>
                  <th>Unit</th>
                  <th>Reference Range</th>
                  <th>Flag</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{r.testName}</td>
                    <td>
                      {canEnterResults ? (
                        <input className={s.resultInput} value={r.value} onChange={(e) => updateResult(i, 'value', e.target.value)} placeholder="Enter value" />
                      ) : (
                        r.value || '—'
                      )}
                    </td>
                    <td>
                      {canEnterResults ? (
                        <input className={s.resultInput} value={r.unit} onChange={(e) => updateResult(i, 'unit', e.target.value)} placeholder="Unit" />
                      ) : (
                        r.unit || '—'
                      )}
                    </td>
                    <td>
                      {canEnterResults ? (
                        <input className={s.resultInput} value={r.referenceRange} onChange={(e) => updateResult(i, 'referenceRange', e.target.value)} placeholder="e.g., 4.5-11" />
                      ) : (
                        r.referenceRange || '—'
                      )}
                    </td>
                    <td>
                      {canEnterResults ? (
                        <select className={s.resultInput} value={r.flag} onChange={(e) => updateResult(i, 'flag', e.target.value)}>
                          <option value="normal">Normal</option>
                          <option value="abnormal">Abnormal</option>
                          <option value="critical">Critical</option>
                        </select>
                      ) : (
                        <span className={flagClass[r.flag] || ''}>{r.flag}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Right: Info */}
        <div>
          {lab.patient && (
            <Card>
              <CardHeader title="Patient" action="View Profile →" onAction={() => router.push(`/patients/${lab.patient?._id}`)} />
              <div style={{ fontSize: '13px' }}>
                <div style={{ fontWeight: 500, marginBottom: '4px' }}>{lab.patient.firstName} {lab.patient.lastName}</div>
                <div style={{ color: 'var(--muted)', fontSize: '12px' }}>
                  {lab.patient.patientId} · {lab.patient.gender === 'male' ? 'Male' : 'Female'} · {lab.patient.phone || 'No phone'}
                </div>
              </div>
            </Card>
          )}

          {lab.validatedBy && (
            <Card style={{ marginTop: '16px' }}>
              <CardHeader title="Validation" />
              <div style={{ fontSize: '13px' }}>
                <div>Validated by: <strong>Dr. {lab.validatedBy.firstName} {lab.validatedBy.lastName}</strong></div>
                {lab.validatedAt && <div style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '4px' }}>{formatDateLong(new Date(lab.validatedAt))}</div>}
              </div>
            </Card>
          )}

          {lab.notes && (
            <Card style={{ marginTop: '16px' }}>
              <CardHeader title="Notes" />
              <div style={{ fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{lab.notes}</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
