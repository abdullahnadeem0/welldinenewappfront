// src/pages/PrivatePage/Invoice/PrintInvoice.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiPrinter, FiDownload, FiArrowLeft, FiAlertCircle,
  FiEdit2, FiClock, FiCheckCircle, FiActivity, FiMessageCircle
} from 'react-icons/fi';
import { getOrderById } from '../../../api/orderApi';
import { getProfile } from '../../../api/profileApi';

/* ─────────────────────────────────────────────────────────────
   ALL STYLES — Quotation style (same paper look)
───────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Open Sans', Arial, sans-serif; background: #f0f2f5; color: #333; }

  /* ── Action Bar ── */
  .pi-action-bar {
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 28px; background: #fff;
    border-bottom: 1px solid #dde3ec;
    position: sticky; top: 0; z-index: 200;
    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  }
  .pi-action-bar .action-group { display: flex; gap: 10px; flex-wrap: wrap; }

  /* ── Buttons ── */
  .pi-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 20px; border: none; border-radius: 5px;
    cursor: pointer; font-size: 13px; font-weight: 600;
    font-family: 'Open Sans', Arial, sans-serif;
    transition: filter 0.15s, transform 0.15s;
  }
  .pi-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
  .pi-btn--gray  { background: #607d8b; color: #fff; }
  .pi-btn--blue  { background: #1565C0; color: #fff; }
  .pi-btn--green { background: #2e7d32; color: #fff; }
  .pi-btn--purple { background: #9c27b0; color: #fff; }
  .pi-btn--whatsapp { background: #25D366; color: #fff; }

  /* ── Page wrapper ── */
  .pi-page-wrap {
    background: #f0f2f5; min-height: 100vh;
    padding: 30px 20px; display: flex; justify-content: center;
  }

  /* ── White "paper" ── */
  .pi-paper {
    background: #fff; width: 100%; max-width: 870px;
    padding: 38px 44px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.10);
    border-radius: 4px;
    font-family: 'Open Sans', Arial, sans-serif; font-size: 13px;
  }

  /* ── Header ── */
  .pi-header {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 26px; padding-bottom: 18px;
    border-bottom: 2px solid #1565C0;
    position: relative;
  }
  .pi-logo-box { display: flex; flex-direction: column; align-items: center; gap: 8px; max-width: 220px; }
  .company-logo-img { max-height: 60px; max-width: 180px; object-fit: contain; display: block; }
  .brand-name-text { font-size: 14px; font-weight: 700; color: #1a237e; text-align: center; letter-spacing: 0.5px; margin-top: 5px; }
  .pi-logo-icon {
    width: 44px; height: 44px; background: #1565C0; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 20px; font-weight: 700; flex-shrink: 0; margin-bottom: 5px;
  }
  .pi-logo-name { font-size: 14px; font-weight: 700; color: #1a237e; text-align: center; letter-spacing: 0.5px; line-height: 1.2; }
  .pi-logo-sub { font-size: 9px; color: #1565C0; letter-spacing: 2px; font-weight: 600; text-transform: uppercase; margin-top: 2px; text-align: center; }
  .pi-quote-title {
    font-size: 26px; font-weight: 700; color: #1565C0;
    letter-spacing: 1.5px; text-transform: uppercase;
    text-align: right; margin-bottom: 10px;
  }
  .pi-meta-table { font-size: 12px; }
  .pi-meta-table td { padding: 2px 0; vertical-align: top; }
  .pi-meta-table .meta-label { color: #888; padding-right: 14px; white-space: nowrap; }
  .pi-meta-table .meta-val { font-weight: 600; color: #1565C0; text-align: right; }

  /* ── Sender / Receiver ── */
  .pi-address-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 22px; }
  .pi-section-label {
    background: #1565C0; color: #fff;
    font-size: 11px; font-weight: 700;
    padding: 6px 12px; letter-spacing: 1.2px; text-transform: uppercase;
  }
  .pi-address-box {
    border: 1px solid #d0d7e3; border-top: none;
    font-size: 12px; line-height: 1.8;
    padding: 8px 12px 10px;
  }
  .pi-address-box .addr-name { font-weight: 700; color: #1a237e; }
  .pi-address-box p { color: #444; }

  /* ── Items table ── */
  .pi-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 22px; }
  .pi-table thead tr th {
    background: #1565C0; color: #fff; font-weight: 700;
    font-size: 11px; letter-spacing: 0.6px; text-transform: uppercase;
    padding: 10px 10px; border: 1px solid #1565C0;
  }
  .pi-table thead tr th.c { text-align: center; }
  .pi-table thead tr th.r { text-align: right; }
  .pi-table tbody tr td { padding: 8px 10px; border: 1px solid #d0d7e3; color: #333; vertical-align: middle; }
  .pi-table tbody tr td.c { text-align: center; }
  .pi-table tbody tr td.r { text-align: right; }
  .pi-table tbody tr:nth-child(even) td { background: #f4f7ff; }
  .pi-table tbody tr:nth-child(odd) td { background: #fff; }

  /* ── Payment Status Boxes ── */
  .pi-status-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin: 22px 0;
  }
  .pi-status-card {
    border-radius: 8px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    border: 1px solid #d0d7e3;
    background: #f9fafc;
  }
  .pi-status-card .status-icon {
    width: 42px; height: 42px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    color: #fff;
    flex-shrink: 0;
  }
  .pi-status-card.paid .status-icon { background: #2e7d32; }
  .pi-status-card.partial .status-icon { background: #8b5cf6; }
  .pi-status-card.pending .status-icon { background: #f59e0b; }
  .pi-status-card.inprogress .status-icon { background: #3b82f6; }
  .pi-status-card.completed .status-icon { background: #2e7d32; }
  .pi-status-card .status-info { flex: 1; min-width: 0; }
  .pi-status-card .status-label {
    font-size: 10px; font-weight: 600; color: #888;
    text-transform: uppercase; letter-spacing: 0.05em;
    margin-bottom: 3px;
  }
  .pi-status-card .status-value {
    font-size: 16px; font-weight: 700; color: #222;
  }
  .pi-status-card .status-sub {
    font-size: 11px; color: #666; margin-top: 2px;
  }

  /* ── Notes + Totals ── */
  .pi-bottom { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-bottom: 30px; }
  .pi-notes-box {
    flex: 1; border: 1px solid #d0d7e3; min-height: 90px;
    padding: 10px 14px; font-size: 12px; color: #555; line-height: 1.6;
  }
  .pi-notes-box .notes-placeholder { color: #bbb; font-style: italic; }

  .pi-totals { border-collapse: collapse; min-width: 320px; font-size: 13px; }
  .pi-totals td { padding: 8px 16px; border: 1px solid #d0d7e3; }
  .pi-totals .t-label { color: #555; font-weight: 600; width: 170px; }
  .pi-totals .t-amount { text-align: right; font-weight: 600; color: #222; }
  .pi-totals .tr-paid td { background: #e8f5e9; color: #2e7d32; }
  .pi-totals .tr-remaining td { background: #fff3e0; color: #f57c00; }
  .pi-totals .tr-grand td {
    background: #1565C0 !important; color: #fff !important;
    font-weight: 700; font-size: 14px; border-color: #1565C0;
  }

  /* ── Signature Section ── */
  .pi-signature-section {
    margin: 30px 0 20px 0;
    padding: 20px;
    background: #fafafa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
  }
  .pi-signature-header {
    display: flex; align-items: center; justify-content: center;
    gap: 10px; margin-bottom: 20px; padding-bottom: 10px;
    border-bottom: 2px solid #e0e0e0;
  }
  .pi-signature-icon { font-size: 20px; color: #1565C0; }
  .pi-signature-header h3 { margin: 0; font-size: 16px; font-weight: bold; color: #333; letter-spacing: 1px; }
  .pi-signature-grid { display: flex; gap: 40px; justify-content: space-between; }
  .pi-signature-box { flex: 1; text-align: center; }
  .pi-signature-line { border-bottom: 1px solid #999; margin: 10px 0 5px 0; width: 100%; min-height: 40px; }
  .pi-signature-name { font-size: 12px; font-weight: 600; color: #1a237e; margin-bottom: 5px; }
  .pi-signature-title { font-size: 10px; color: #666; }
  .pi-signature-date { font-size: 10px; color: #888; margin-top: 5px; }
  .pi-edit-signature-btn {
    margin-top: 10px; background: #9c27b0; color: white; border: none;
    border-radius: 4px; padding: 4px 12px; font-size: 10px; cursor: pointer;
    display: inline-flex; align-items: center; gap: 4px;
  }

  /* ── Footer ── */
  .pi-footer {
    text-align: center; padding-top: 18px;
    border-top: 1px solid #e8e8e8;
    font-size: 13px; color: #777; font-style: italic;
  }

  /* ── Loading & Error ── */
  .pi-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; background: #f0f2f5; }
  .pi-spinner {
    width: 46px; height: 46px; border: 3px solid #dde3ec;
    border-top-color: #1565C0; border-radius: 50%;
    animation: piSpin 0.9s linear infinite; margin-bottom: 16px;
  }
  @keyframes piSpin { to { transform: rotate(360deg); } }
  .pi-error { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; text-align: center; padding: 40px; background: #f0f2f5; }
  .pi-error h2 { margin: 14px 0 6px; color: #333; }
  .pi-error p { color: #666; margin-bottom: 20px; }

  /* ── Signature Modal ── */
  .pi-modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000;
  }
  .pi-modal {
    background: #fff; border-radius: 12px; padding: 24px;
    width: 90%; max-width: 500px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  }
  .pi-modal h3 { margin-bottom: 20px; color: #333; }
  .pi-modal input {
    width: 100%; padding: 10px 12px;
    border: 1px solid #ddd; border-radius: 6px;
    font-size: 14px; margin-bottom: 15px;
  }
  .pi-modal-buttons { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

  /* ── Print ── */
  @media print {
    .pi-action-bar, .pi-modal-overlay, .pi-edit-signature-btn { display: none !important; }
    .pi-page-wrap { background: #fff; padding: 0; }
    .pi-paper { box-shadow: none; padding: 12mm 15mm; max-width: 100%; }
    .pi-table thead tr th,
    .pi-totals .tr-grand td,
    .pi-totals .tr-paid td,
    .pi-totals .tr-remaining td,
    .pi-section-label,
    .pi-status-card .status-icon,
    .pi-status-card .status-info {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .company-logo-img { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .pi-signature-line { border-bottom: 1px solid #000 !important; }
  }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .pi-action-bar { flex-direction: column; gap: 10px; align-items: stretch; }
    .pi-action-bar .action-group { flex-wrap: wrap; justify-content: center; }
    .pi-paper { padding: 20px 16px; }
    .pi-header { flex-direction: column; gap: 14px; }
    .pi-quote-title { text-align: left; font-size: 20px; }
    .pi-address-grid { grid-template-columns: 1fr; }
    .pi-status-section { grid-template-columns: 1fr; }
    .pi-bottom { flex-direction: column; }
    .pi-totals { min-width: 100%; width: 100%; }
    .pi-signature-grid { flex-direction: column; gap: 20px; }
  }
`;

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
const PrintInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Signature states
  const [authorizedSignatory, setAuthorizedSignatory] = useState('');
  const [customerSignatory, setCustomerSignatory] = useState('');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [tempAuthorizedSignatory, setTempAuthorizedSignatory] = useState('');
  const [tempCustomerSignatory, setTempCustomerSignatory] = useState('');

  useEffect(() => { loadBusinessProfile(); }, []);
  useEffect(() => { if (id) fetchOrderDetails(); }, [id]);

  const loadBusinessProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await getProfile();
      let profile = null;
      if (response?.data?.data) profile = response.data.data;
      else if (response?.data) profile = response.data;
      else if (response) profile = response;
      setProfileData(profile);

      if (profile?.ownerName) {
        setAuthorizedSignatory(profile.ownerName);
        setTempAuthorizedSignatory(profile.ownerName);
      }
      const savedCustomer = localStorage.getItem('customerSignatory');
      if (savedCustomer && savedCustomer !== 'undefined' && savedCustomer !== 'null') {
        setCustomerSignatory(savedCustomer);
        setTempCustomerSignatory(savedCustomer);
      }
    } catch (err) {
      console.error('Profile load error:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOrderById(id);
      const data = response?.data?.data || response?.data || response;
      setOrder(data);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.message || 'Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureClick = () => {
    setTempAuthorizedSignatory(authorizedSignatory);
    setTempCustomerSignatory(customerSignatory);
    setShowSignatureModal(true);
  };

  const handleSaveSignatures = () => {
    if (tempAuthorizedSignatory?.trim()) {
      setAuthorizedSignatory(tempAuthorizedSignatory.trim());
      localStorage.setItem('authorizedSignatory', tempAuthorizedSignatory.trim());
    }
    if (tempCustomerSignatory?.trim()) {
      setCustomerSignatory(tempCustomerSignatory.trim());
      localStorage.setItem('customerSignatory', tempCustomerSignatory.trim());
    }
    setShowSignatureModal(false);
  };

  const formatCurrency = (amount) => {
    const n = Number(amount || 0);
    return n.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  const formatPKR = (amount) => `PKR ${formatCurrency(amount)}`;
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-PK', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch { return 'Invalid Date'; }
  };

  const handlePrint = () => window.print();

  const handleDownloadPDF = () => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    window.open(`${base}/api/orders/print/${id}`, '_blank');
  };

  // ✅ WhatsApp share
  const handleWhatsAppShare = () => {
    if (!order) return;
    const customerPhone = (order.customer?.phone || '').replace(/\D/g, '');
    const phoneWithCountry = customerPhone.startsWith('92')
      ? customerPhone
      : `92${customerPhone.replace(/^0/, '')}`;

    const text =
      `*INVOICE — ${shopName}*\n\n` +
      `Invoice #: ${order.billNumber || order._id?.slice(-6)}\n` +
      `Date: ${formatDate(order.date || order.createdAt)}\n` +
      `Customer: ${order.customer?.name || 'N/A'}\n\n` +
      `*Total Amount:* ${formatPKR(totalAmount)}\n` +
      `*Paid:* ${formatPKR(totalReceived)}\n` +
      `*Remaining:* ${formatPKR(remaining)}\n\n` +
      `*Order Status:* ${order.status || 'pending'}\n` +
      `*Payment Status:* ${order.paymentStatus || 'pending'}\n\n` +
      `Thank you for your business!`;

    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (loading || profileLoading) {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <div className="pi-loading">
          <div className="pi-spinner" />
          <p style={{ color: '#666' }}>Loading invoice…</p>
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <div className="pi-error">
          <FiAlertCircle size={50} color="#f44336" />
          <h2>Error Loading Invoice</h2>
          <p>{error || 'Invoice not found'}</p>
          <button className="pi-btn pi-btn--gray" onClick={() => navigate(-1)}>
            <FiArrowLeft /> Back
          </button>
        </div>
      </>
    );
  }

  // ── Derived data ──
  const getLogoUrl = () => {
    if (!profileData) return null;
    if (profileData.logoUrl) return profileData.logoUrl;
    if (profileData.logo) {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      return `${base}/${profileData.logo}`;
    }
    return null;
  };
  const logoUrl = getLogoUrl();
  const shopName = profileData?.shopName || 'Haider Velding Wala';
  const ownerName = profileData?.ownerName || 'Muhammad Haider';
  const businessPhone = profileData?.phone || '';
  const businessWhatsapp = profileData?.whatsapp || '';
  const businessAddress = profileData?.address || '';
  const businessGst = profileData?.gstNumber || '';
  const businessFooterNote = profileData?.footerNote || 'Thank you for your business!';

  const totalAmount = order.finalTotal || 0;
  const advance = order.advancePayment || 0;
  const embedded = (order.payments || []).reduce((s, p) => s + (p.amount || 0), 0);
  const totalReceived = advance + embedded;
  const remaining = totalAmount - totalReceived;

  const paymentStatus = order.paymentStatus || 'pending';
  const orderStatus = order.status || 'pending';

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {showSignatureModal && (
        <div className="pi-modal-overlay" onClick={() => setShowSignatureModal(false)}>
          <div className="pi-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Signature Settings</h3>
            <input
              type="text"
              placeholder="Authorized Signatory Name"
              value={tempAuthorizedSignatory}
              onChange={(e) => setTempAuthorizedSignatory(e.target.value)}
            />
            <input
              type="text"
              placeholder="Customer Signatory Name (optional)"
              value={tempCustomerSignatory}
              onChange={(e) => setTempCustomerSignatory(e.target.value)}
            />
            <div className="pi-modal-buttons">
              <button className="pi-btn pi-btn--blue" onClick={handleSaveSignatures}>Save</button>
              <button className="pi-btn pi-btn--gray" onClick={() => setShowSignatureModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="pi-action-bar">
        <button className="pi-btn pi-btn--gray" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </button>
        <div className="action-group">
          <button className="pi-btn pi-btn--purple" onClick={handleSignatureClick}>
            <FiEdit2 /> Signatures
          </button>
          <button className="pi-btn pi-btn--whatsapp" onClick={handleWhatsAppShare}>
            <FiMessageCircle /> WhatsApp
          </button>
          <button className="pi-btn pi-btn--blue" onClick={handlePrint}>
            <FiPrinter /> Print
          </button>
          <button className="pi-btn pi-btn--green" onClick={handleDownloadPDF}>
            <FiDownload /> Download PDF
          </button>
        </div>
      </div>

      <div className="pi-page-wrap">
        <div className="pi-paper">
          {/* ── Header ── */}
          <div className="pi-header">
            <div className="pi-logo-box">
              {logoUrl ? (
                <>
                  <img src={logoUrl} alt="Logo" className="company-logo-img" crossOrigin="anonymous" />
                  <div className="brand-name-text">{shopName}</div>
                </>
              ) : (
                <>
                  <div className="pi-logo-icon">✦</div>
                  <div className="pi-logo-name">{shopName}</div>
                  <div className="pi-logo-sub">Workforce Software</div>
                </>
              )}
            </div>
            <div>
              <div className="pi-quote-title">Invoice</div>
              <table className="pi-meta-table">
                <tbody>
                  <tr>
                    <td className="meta-label">Invoice Number:</td>
                    <td className="meta-val">{order.billNumber || `INV-${order._id?.slice(-6)}`}</td>
                  </tr>
                  <tr>
                    <td className="meta-label">Issue Date:</td>
                    <td className="meta-val">{formatDate(order.date || order.createdAt)}</td>
                  </tr>
                  {order.dueDate && (
                    <tr>
                      <td className="meta-label">Due Date:</td>
                      <td className="meta-val">{formatDate(order.dueDate)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Sender / Receiver ── */}
          <div className="pi-address-grid">
            <div>
              <div className="pi-section-label">From</div>
              <div className="pi-address-box">
                <p className="addr-name">{shopName}</p>
                {businessAddress && <p>{businessAddress}</p>}
                {businessPhone && <p>Phone: {businessPhone}</p>}
                {businessWhatsapp && <p>WhatsApp: {businessWhatsapp}</p>}
                {businessGst && <p>GST/NTN: {businessGst}</p>}
              </div>
            </div>
            <div>
              <div className="pi-section-label">Bill To</div>
              <div className="pi-address-box">
                <p className="addr-name">{order.customer?.name || 'N/A'}</p>
                {order.customer?.address && <p>{order.customer.address}</p>}
                {order.customer?.phone && <p>Phone: {order.customer.phone}</p>}
                {order.customer?.email && <p>Email: {order.customer.email}</p>}
              </div>
            </div>
          </div>

          {/* ── Items Table ── */}
          <table className="pi-table">
            <thead>
              <tr>
                <th>Description</th>
                <th className="c">QTY</th>
                <th className="r">Unit Price</th>
                <th className="r">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      {item.title || item.name || `Item ${idx + 1}`}
                      {item.notes && <span style={{ fontSize: '11px', color: '#666' }}> — {item.notes}</span>}
                    </td>
                    <td className="c">{item.quantity || 1}</td>
                    <td className="r">{formatPKR(item.pricePerUnit || item.price || 0)}</td>
                    <td className="r">{formatPKR(item.subtotal || (item.quantity * (item.pricePerUnit || item.price || 0)))}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    No items
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* ── Payment / Order Status ── */}
          <div className="pi-status-section">
            <div className={`pi-status-card ${orderStatus === 'completed' ? 'completed' : orderStatus === 'in-progress' ? 'inprogress' : 'pending'}`}>
              <div className="status-icon">
                {orderStatus === 'completed' ? <FiCheckCircle /> : orderStatus === 'in-progress' ? <FiActivity /> : <FiClock />}
              </div>
              <div className="status-info">
                <div className="status-label">Order Status</div>
                <div className="status-value">
                  {orderStatus === 'in-progress' ? 'In Progress' : orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
                </div>
              </div>
            </div>

            <div className={`pi-status-card ${paymentStatus === 'paid' ? 'paid' : paymentStatus === 'partial' ? 'partial' : 'pending'}`}>
              <div className="status-icon">
                {paymentStatus === 'paid' ? <FiCheckCircle /> : paymentStatus === 'partial' ? <FiActivity /> : <FiClock />}
              </div>
              <div className="status-info">
                <div className="status-label">Payment Status</div>
                <div className="status-value">
                  {paymentStatus === 'paid' ? 'Paid' : paymentStatus === 'partial' ? 'Partial' : 'Pending'}
                </div>
                <div className="status-sub">
                  Paid: {formatPKR(totalReceived)}
                </div>
              </div>
            </div>

            <div className={`pi-status-card ${remaining > 0 ? 'pending' : 'paid'}`}>
              <div className="status-icon">
                {remaining > 0 ? <FiClock /> : <FiCheckCircle />}
              </div>
              <div className="status-info">
                <div className="status-label">Remaining Balance</div>
                <div className="status-value">{formatPKR(remaining)}</div>
              </div>
            </div>
          </div>

          {/* ── Notes + Totals ── */}
          <div className="pi-bottom">
            <div className="pi-notes-box">
              {order.notes
                ? <><strong>Notes: </strong>{order.notes}</>
                : <span className="notes-placeholder">[Notes]</span>}
            </div>
            <div>
              <table className="pi-totals">
                <tbody>
                  <tr>
                    <td className="t-label">TOTAL AMOUNT</td>
                    <td className="t-amount">{formatPKR(totalAmount)}</td>
                  </tr>
                  <tr className="tr-paid">
                    <td className="t-label">PAID</td>
                    <td className="t-amount">{formatPKR(totalReceived)}</td>
                  </tr>
                  <tr className="tr-grand">
                    <td className="t-label">REMAINING</td>
                    <td className="t-amount">{formatPKR(remaining)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Signatures ── */}
          <div className="pi-signature-section">
            <div className="pi-signature-header">
              <FiEdit2 className="pi-signature-icon" />
              <h3>AUTHORIZED SIGNATURES</h3>
              <button className="pi-edit-signature-btn" onClick={handleSignatureClick}>
                <FiEdit2 /> Edit
              </button>
            </div>
            <div className="pi-signature-grid">
              <div className="pi-signature-box">
                <div className="pi-signature-line"></div>
                <div className="pi-signature-name">{authorizedSignatory || ownerName}</div>
                <div className="pi-signature-title">Authorized Signatory</div>
                <div className="pi-signature-date">Date: {formatDate(new Date())}</div>
              </div>
              <div className="pi-signature-box">
                <div className="pi-signature-line"></div>
                <div className="pi-signature-name">{customerSignatory || '_________________________'}</div>
                <div className="pi-signature-title">Customer Signatory</div>
                <div className="pi-signature-date">Date: {formatDate(new Date())}</div>
              </div>
            </div>
          </div>

          <div className="pi-footer">{businessFooterNote}</div>
        </div>
      </div>
    </>
  );
};

export default PrintInvoice;