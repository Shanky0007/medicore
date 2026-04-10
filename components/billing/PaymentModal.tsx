'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import styles from '@/styles/ui.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  invoiceId: string;
  remaining: number;
}

export default function PaymentModal({ open, onClose, onSaved, invoiceId, remaining }: Props) {
  const [amount, setAmount] = useState(remaining);
  const [method, setMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) { setError('Amount must be greater than 0'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/billing/${invoiceId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addPayment: { amount, method, notes } }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      onSaved(); onClose();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setSaving(false); }
  };

  if (!open) return null;

  return (
    <Modal title="Record Payment" onClose={onClose}>
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--red)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '12.5px', marginBottom: '16px' }}>{error}</div>}
      <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px' }}>Remaining balance: <strong style={{ color: 'var(--text)' }}>{remaining} MAD</strong></div>
      <form onSubmit={handleSubmit}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Amount (MAD) *</label>
            <input className={styles.formInput} type="number" min="0" max={remaining} value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} required />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Method</label>
            <select className={styles.formSelect} value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="cash">Cash</option><option value="check">Check</option><option value="insurance">Insurance/CNSS</option><option value="bank-transfer">Bank Transfer</option>
            </select>
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Notes</label>
          <input className={styles.formInput} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Payment reference..." />
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Recording...' : 'Record Payment'}</Button>
        </div>
      </form>
    </Modal>
  );
}
