// src/pages/PrivatePage/Credit/CreditPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus, FiSearch, FiTrash2, FiDollarSign,
  FiClock, FiCheckCircle, FiPhone, FiCalendar, FiUser,
  FiArrowRight, FiX
} from 'react-icons/fi';
import Sidebar from '../../../components/Sidebar/Sidebar';
import {
  getAllCredits, deleteCredit, createCredit,
  addPayment, deletePayment
} from '../../../api/creditApi';
import './CreditPage.css';

const CreditPage = () => {
  const navigate = useNavigate();
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState(null);

  useEffect(() => { fetchCredits(); }, []);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      const res = await getAllCredits();
      setCredits(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this credit record?')) return;
    await deleteCredit(id);
    fetchCredits();
  };

  const handleAddPayment = async (creditId, paymentData) => {
    await addPayment(creditId, paymentData);
    fetchCredits();
    setShowPaymentModal(false);
  };

  const handleDeletePayment = async (creditId, paymentId) => {
    if (!window.confirm('Delete this payment?')) return;
    await deletePayment(creditId, paymentId);
    fetchCredits();
  };

  const filteredCredits = credits.filter((c) => {
    const matchesSearch =
      c.lenderName?.toLowerCase().includes(search.toLowerCase()) ||
      c.lenderPhone?.includes(search) ||
      c.purpose?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCredit = credits.reduce((s, c) => s + (c.totalAmount || 0), 0);
  const totalPaid = credits.reduce((s, c) => {
    return s + (c.payments || []).reduce((ps, p) => ps + (p.amount || 0), 0);
  }, 0);
  const totalRemaining = totalCredit - totalPaid;

  const formatCurrency = (n) => `Rs ${Number(n || 0).toLocaleString('en-PK')}`;
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
  const isOverdue = (c) => c.dueDate && new Date(c.dueDate) < new Date() && c.status !== 'completed';

  if (loading) {
    return (
      <div className="credit__container">
        <Sidebar />
        <div className="credit__loading">
          <div className="credit__spinner"></div>
          <p>Loading credits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="credit__container">
      <Sidebar />
      <div className="credit__content">

        {/* Header */}
        <div className="credit__header">
          <div>
            <h1 className="credit__title">Credit / Loans</h1>
            <p className="credit__subtitle">Track money you borrowed and repayments</p>
          </div>
          <button className="credit__add-btn" onClick={() => setShowAddModal(true)}>
            <FiPlus /> Add Credit
          </button>
        </div>

        {/* Summary Cards */}
        <div className="credit__summary">
          <div className="credit__summary-card credit__summary-card--total">
            <div className="summary-icon"><FiDollarSign /></div>
            <div>
              <div className="summary-label">Total Credit</div>
              <div className="summary-value">{formatCurrency(totalCredit)}</div>
            </div>
          </div>
          <div className="credit__summary-card credit__summary-card--paid">
            <div className="summary-icon"><FiCheckCircle /></div>
            <div>
              <div className="summary-label">Total Paid</div>
              <div className="summary-value">{formatCurrency(totalPaid)}</div>
            </div>
          </div>
          <div className="credit__summary-card credit__summary-card--remaining">
            <div className="summary-icon"><FiClock /></div>
            <div>
              <div className="summary-label">Remaining</div>
              <div className="summary-value">{formatCurrency(totalRemaining)}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="credit__filters">
          <div className="credit__search">
            <FiSearch />
            <input
              type="text"
              placeholder="Search lender name, phone, or purpose..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="credit__status-filter">
            {['all', 'pending', 'partial', 'completed'].map((s) => (
              <button
                key={s}
                className={`credit__filter-btn ${statusFilter === s ? 'active' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {filteredCredits.length === 0 ? (
          <div className="credit__empty">
            <FiDollarSign size={48} />
            <h3>No credits found</h3>
            <p>Click "Add Credit" to record a new loan</p>
          </div>
        ) : (
          <div className="credit__list">
            {filteredCredits.map((c) => {
              const paid = (c.payments || []).reduce((s, p) => s + (p.amount || 0), 0);
              const remaining = c.totalAmount - paid;
              const overdue = isOverdue(c);
              return (
                <div key={c._id} className={`credit__card ${overdue ? 'overdue' : ''}`}>
                  <div className="credit__card-header">
                    <div>
                      <div className="credit__lender"><FiUser /> {c.lenderName}</div>
                      {c.lenderPhone && (
                        <div className="credit__phone"><FiPhone /> {c.lenderPhone}</div>
                      )}
                    </div>
                    <span className={`credit__status-badge ${c.status}`}>{c.status}</span>
                  </div>

                  <div className="credit__card-dates">
                    <div><FiCalendar /><span>Taken: {formatDate(c.receivedDate)}</span></div>
                    <div className={overdue ? 'overdue-text' : ''}>
                      <FiClock /><span>Due: {formatDate(c.dueDate)}</span>
                    </div>
                  </div>

                  {c.purpose && <div className="credit__purpose">📝 {c.purpose}</div>}

                  <div className="credit__amounts">
                    <div className="amount-box">
                      <div className="amount-label">Total</div>
                      <div className="amount-value">{formatCurrency(c.totalAmount)}</div>
                    </div>
                    <div className="amount-box paid">
                      <div className="amount-label">Paid</div>
                      <div className="amount-value">{formatCurrency(paid)}</div>
                    </div>
                    <div className="amount-box remaining">
                      <div className="amount-label">Remaining</div>
                      <div className="amount-value">{formatCurrency(remaining)}</div>
                    </div>
                  </div>

                  <div className="credit__progress">
                    <div
                      className="credit__progress-bar"
                      style={{ width: `${Math.min(100, (paid / c.totalAmount) * 100)}%` }}
                    ></div>
                  </div>

                  {c.payments && c.payments.length > 0 && (
                    <div className="credit__payments-list">
                      <div className="payments-title">Payments ({c.payments.length})</div>
                      {c.payments.map((p) => (
                        <div key={p._id} className="payment-item">
                          <span>{formatDate(p.date)}</span>
                          <span className="payment-amount">{formatCurrency(p.amount)}</span>
                          <button
                            className="payment-delete"
                            onClick={() => handleDeletePayment(c._id, p._id)}
                            title="Delete payment"
                          >
                            <FiX size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="credit__actions">
                    {c.status !== 'completed' && (
                      <button
                        className="credit-btn credit-btn--pay"
                        onClick={() => { setSelectedCredit(c); setShowPaymentModal(true); }}
                      >
                        <FiDollarSign /> Add Payment
                      </button>
                    )}
                    <button
                      className="credit-btn credit-btn--view"
                      onClick={() => navigate(`/credit/${c._id}`)}
                    >
                      <FiArrowRight /> View
                    </button>
                    <button
                      className="credit-btn credit-btn--delete"
                      onClick={() => handleDelete(c._id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddCreditModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); fetchCredits(); }}
        />
      )}

      {showPaymentModal && selectedCredit && (
        <AddPaymentModal
          credit={selectedCredit}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={(data) => handleAddPayment(selectedCredit._id, data)}
        />
      )}
    </div>
  );
};

/* ── Add Credit Modal ── */
const AddCreditModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    lenderName: '',
    lenderPhone: '',
    lenderAddress: '',
    totalAmount: '',
    receivedDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    purpose: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createCredit({
        ...form,
        totalAmount: Number(form.totalAmount),
      });
      onSuccess();
    } catch (err) {
      alert(err?.response?.data?.message || 'Error saving credit');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="credit-modal-overlay" onClick={onClose}>
      <div className="credit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="credit-modal-header">
          <h3>Add Credit / Loan</h3>
          <button onClick={onClose}><FiX /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Lender Name *</label>
              <input
                type="text" name="lenderName" required
                value={form.lenderName} onChange={handleChange}
                placeholder="e.g. Ali Khan"
              />
            </div>
            <div className="form-group">
              <label>Lender Phone</label>
              <input
                type="tel" name="lenderPhone"
                value={form.lenderPhone} onChange={handleChange}
                placeholder="03001234567"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Lender Address</label>
            <input
              type="text" name="lenderAddress"
              value={form.lenderAddress} onChange={handleChange}
              placeholder="Optional"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Total Amount (PKR) *</label>
              <input
                type="number" name="totalAmount" required min="0" step="0.01"
                value={form.totalAmount} onChange={handleChange}
                placeholder="10000"
              />
            </div>
            <div className="form-group">
              <label>Received Date *</label>
              <input
                type="date" name="receivedDate" required
                value={form.receivedDate} onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Due Date *</label>
            <input
              type="date" name="dueDate" required
              value={form.dueDate} onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Purpose</label>
            <input
              type="text" name="purpose"
              value={form.purpose} onChange={handleChange}
              placeholder="e.g. Raw material for order ORD-1234"
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes" rows="2"
              value={form.notes} onChange={handleChange}
              placeholder="Any extra notes..."
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="button" className="credit-btn credit-btn--cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="credit-btn credit-btn--save" disabled={saving}>
              {saving ? 'Saving...' : 'Save Credit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Add Payment Modal ── */
const AddPaymentModal = ({ credit, onClose, onSuccess }) => {
  const paid = (credit.payments || []).reduce((s, p) => s + (p.amount || 0), 0);
  const remaining = credit.totalAmount - paid;

  const [form, setForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(form.amount) > remaining) {
      if (!window.confirm(`Amount exceeds remaining balance (Rs ${remaining}). Continue?`)) return;
    }
    setSaving(true);
    try {
      await onSuccess({ ...form, amount: Number(form.amount) });
    } catch (err) {
      alert(err?.response?.data?.message || 'Error saving payment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="credit-modal-overlay" onClick={onClose}>
      <div className="credit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="credit-modal-header">
          <h3>Add Payment</h3>
          <button onClick={onClose}><FiX /></button>
        </div>
        <div className="credit-modal-info">
          <p>Lender: <strong>{credit.lenderName}</strong></p>
          <p>Remaining: <strong>Rs {remaining.toLocaleString('en-PK')}</strong></p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Amount (PKR) *</label>
              <input
                type="number" name="amount" required min="0" step="0.01"
                value={form.amount} onChange={handleChange}
                placeholder="5000" autoFocus
              />
            </div>
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date" name="date" required
                value={form.date} onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <input
              type="text" name="notes"
              value={form.notes} onChange={handleChange}
              placeholder="Optional"
            />
          </div>
          <div className="form-actions">
            <button type="button" className="credit-btn credit-btn--cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="credit-btn credit-btn--save" disabled={saving}>
              {saving ? 'Saving...' : 'Save Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreditPage;