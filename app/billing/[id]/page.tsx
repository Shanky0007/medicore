'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, CreditCard } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import PaymentModal from '@/components/billing/PaymentModal';
import { formatDateLong, formatDateShort, formatCurrency } from '@/lib/utils';
import s from '@/styles/billing.module.css';

interface InvoiceDetail {
  _id: string; invoiceId: string; totalAmount: number; paidAmount: number; status: string; notes: string; createdAt: string;
  patient: { _id: string; firstName: string; lastName: string; patientId: string; gender: string; phone: string } | null;
  items: { description: string; category: string; amount: number }[];
  payments: { amount: number; method: string; paidAt: string; notes: string }[];
}

const methodLabels: Record<string, string> = { cash: 'Cash', check: 'Check', insurance: 'Insurance/CNSS', 'bank-transfer': 'Bank Transfer' };

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const fetchInvoice = async () => {
    try { const res = await fetch(`/api/billing/${params.id}`); const json = await res.json(); if (json.success) setInvoice(json.data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchInvoice(); }, [params.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async () => { if (!confirm('Delete this invoice?')) return; await fetch(`/api/billing/${params.id}`, { method: 'DELETE' }); router.push('/billing'); };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>Loading...</div>;
  if (!invoice) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>Invoice not found</div>;

  const balance = invoice.totalAmount - invoice.paidAmount;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}><Button variant="secondary" onClick={() => router.push('/billing')}><ArrowLeft size={14} /> Back to Billing</Button></div>

      <div className={s.detailHeader}>
        <div className={s.detailHeaderInfo}>
          <h1>Invoice {invoice.invoiceId}</h1>
          <div className={s.detailMeta}>
            <StatusBadge status={invoice.status} />
            {invoice.patient && <span>{invoice.patient.firstName} {invoice.patient.lastName} ({invoice.patient.patientId})</span>}
            <span>{formatDateLong(new Date(invoice.createdAt))}</span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          {invoice.status !== 'paid' && (
            <Button onClick={() => setPaymentOpen(true)}><CreditCard size={14} /> Record Payment</Button>
          )}
          <Button variant="danger" onClick={handleDelete}><Trash2 size={14} /> Delete</Button>
        </div>
      </div>

      <div className={s.detailGrid}>
        <div>
          {/* Line Items */}
          <Card>
            <CardHeader title="Line Items" />
            <table className={s.itemsTable}>
              <thead><tr><th>Description</th><th>Category</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
              <tbody>
                {invoice.items.map((item, i) => (
                  <tr key={i}><td>{item.description}</td><td><StatusBadge status={item.category} label={item.category} /></td><td style={{ textAlign: 'right' }}>{formatCurrency(item.amount)} MAD</td></tr>
                ))}
                <tr className={s.totalRow}><td colSpan={2}>Total</td><td style={{ textAlign: 'right' }}>{formatCurrency(invoice.totalAmount)} MAD</td></tr>
              </tbody>
            </table>
          </Card>

          {/* Payments */}
          <Card style={{ marginTop: '16px' }}>
            <CardHeader title="Payments" right={<span style={{ fontSize: '12px', color: 'var(--muted)' }}>{invoice.payments.length} payment{invoice.payments.length !== 1 ? 's' : ''}</span>} />
            {invoice.payments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)', fontSize: '13px' }}>No payments recorded</div>
            ) : (
              invoice.payments.map((p, i) => (
                <div key={i} className={s.paymentRow}>
                  <span className={s.paymentAmount}>+{formatCurrency(p.amount)} MAD</span>
                  <span className={s.paymentMethod}>{methodLabels[p.method] || p.method}</span>
                  {p.notes && <span style={{ fontSize: '12px', color: 'var(--muted)' }}>— {p.notes}</span>}
                  <span className={s.paymentDate}>{formatDateShort(new Date(p.paidAt))}</span>
                </div>
              ))
            )}
          </Card>
        </div>

        <div>
          {/* Summary */}
          <Card>
            <CardHeader title="Summary" />
            <div className={s.summaryItem}><span>Total</span><span>{formatCurrency(invoice.totalAmount)} MAD</span></div>
            <div className={s.summaryItem}><span style={{ color: 'var(--green)' }}>Paid</span><span style={{ color: 'var(--green)' }}>{formatCurrency(invoice.paidAmount)} MAD</span></div>
            <div className={s.summaryItem}><span style={{ color: balance > 0 ? 'var(--red)' : 'var(--green)' }}>Balance</span><span style={{ color: balance > 0 ? 'var(--red)' : 'var(--green)' }}>{formatCurrency(balance)} MAD</span></div>
          </Card>

          {invoice.patient && (
            <Card style={{ marginTop: '16px' }}>
              <CardHeader title="Patient" action="View Profile →" onAction={() => router.push(`/patients/${invoice.patient?._id}`)} />
              <div style={{ fontSize: '13px' }}>
                <div style={{ fontWeight: 500, marginBottom: '4px' }}>{invoice.patient.firstName} {invoice.patient.lastName}</div>
                <div style={{ color: 'var(--muted)', fontSize: '12px' }}>{invoice.patient.patientId} · {invoice.patient.phone || 'No phone'}</div>
              </div>
            </Card>
          )}

          {invoice.notes && (
            <Card style={{ marginTop: '16px' }}>
              <CardHeader title="Notes" />
              <div style={{ fontSize: '13px', lineHeight: 1.6 }}>{invoice.notes}</div>
            </Card>
          )}
        </div>
      </div>

      <PaymentModal open={paymentOpen} onClose={() => setPaymentOpen(false)} onSaved={fetchInvoice} invoiceId={invoice._id} remaining={balance} />
    </div>
  );
}
