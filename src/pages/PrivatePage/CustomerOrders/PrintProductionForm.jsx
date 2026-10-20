// src/pages/PrivatePage/Production/PrintProductionForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiPrinter, FiArrowLeft, FiAlertCircle, FiClock,
  FiCalendar, FiUser, FiPhone, FiFileText, FiCheckSquare
} from 'react-icons/fi';
import { getOrderById } from '../../../api/orderApi';
import { getProfile } from '../../../api/profileApi';

/* ─────────────────────────────────────────────────────────────
   STYLES — Quotation/Invoice جیسا paper look
───────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Open Sans', Arial, sans-serif; background: #f0f2f5; color: #333; }

  /* ── Action Bar ── */
  .pf-action-bar {
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 28px; background: #fff;
    border-bottom: 1px solid #dde3ec;
    position: sticky; top: 0; z-index: 200;
    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  }
  .pf-action-bar .action-group { display: flex; gap: 10px; flex-wrap: wrap; }

  .pf-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 20px; border: none; border-radius: 5px;
    cursor: pointer; font-size: 13px; font-weight: 600;
    font-family: 'Open Sans', Arial, sans-serif;
    transition: filter 0.15s, transform 0.15s;
  }
  .pf-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
  .pf-btn--gray  { background: #607d8b; color: #fff; }
  .pf-btn--blue  { background: #1565C0; color: #fff; }
  .pf-btn--green { background: #2e7d32; color: #fff; }
  .pf-btn--orange { background: #ff9800; color: #fff; }

  /* ── Page wrapper ── */
  .pf-page-wrap {
    background: #f0f2f5; min-height: 100vh;
    padding: 30px 20px; display: flex; justify-content: center;
  }

  .pf-paper {
    background: #fff; width: 100%; max-width: 870px;
    padding: 38px 44px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.10);
    border-radius: 4px;
    font-family: 'Open Sans', Arial, sans-serif; font-size: 13px;
  }

  /* ── Header ── */
  .pf-header {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 26px; padding-bottom: 18px;
    border-bottom: 2px solid #ff9800;
  }
  .pf-logo-box { display: flex; flex-direction: column; align-items: center; gap: 8px; max-width: 220px; }
  .company-logo-img { max-height: 60px; max-width: 180px; object-fit: contain; display: block; }
  .brand-name-text { font-size: 14px; font-weight: 700; color: #1a237e; text-align: center; letter-spacing: 0.5px; margin-top: 5px; }
  .pf-logo-icon {
    width: 44px; height: 44px; background: #ff9800; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 20px; font-weight: 700; flex-shrink: 0; margin-bottom: 5px;
  }
  .pf-logo-name { font-size: 14px; font-weight: 700; color: #1a237e; text-align: center; letter-spacing: 0.5px; line-height: 1.2; }
  .pf-logo-sub { font-size: 9px; color: #ff9800; letter-spacing: 2px; font-weight: 600; text-transform: uppercase; margin-top: 2px; text-align: center; }
  .pf-quote-title {
    font-size: 26px; font-weight: 700; color: #ff9800;
    letter-spacing: 1.5px; text-transform: uppercase;
    text-align: right; margin-bottom: 10px;
  }
  .pf-meta-table { font-size: 12px; }
  .pf-meta-table td { padding: 2px 0; vertical-align: top; }
  .pf-meta-table .meta-label { color: #888; padding-right: 14px; white-space: nowrap; }
  .pf-meta-table .meta-val { font-weight: 600; color: #e65100; text-align: right; }

  /* ── Info Boxes ── */
  .pf-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 22px;
  }
  .pf-info-box {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
  }
  .pf-info-box .info-header {
    background: #f5f5f5;
    padding: 8px 14px;
    font-size: 11px;
    font-weight: 700;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    border-bottom: 1px solid #e0e0e0;
    display: flex; align-items: center; gap: 6px;
  }
  .pf-info-box .info-body {
    padding: 12px 14px;
    font-size: 13px;
    line-height: 1.7;
    color: #333;
  }
  .pf-info-box .info-body .info-name {
    font-weight: 700;
    color: #1a237e;
    font-size: 14px;
    margin-bottom: 4px;
  }
  .pf-info-box .info-body .info-row {
    display: flex;
    gap: 8px;
    margin: 3px 0;
  }
  .pf-info-box .info-body .info-row .row-label {
    color: #888;
    min-width: 70px;
    font-weight: 600;
  }
  .pf-info-box .info-body .info-row .row-value {
    color: #333;
    font-weight: 500;
  }

  /* ── Deadline Highlight ── */
  .pf-deadline {
    background: #fff3e0;
    border: 2px solid #ff9800;
    border-radius: 8px;
    padding: 16px 20px;
    margin-bottom: 22px;
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .pf-deadline .deadline-icon {
    width: 52px; height: 52px;
    background: #ff9800;
    color: #fff;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 26px;
    flex-shrink: 0;
  }
  .pf-deadline .deadline-info { flex: 1; }
  .pf-deadline .deadline-label {
    font-size: 11px;
    font-weight: 700;
    color: #e65100;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 4px;
  }
  .pf-deadline .deadline-value {
    font-size: 20px;
    font-weight: 800;
    color: #e65100;
    line-height: 1.2;
  }
  .pf-deadline .deadline-note {
    font-size: 12px;
    color: #bf360c;
    margin-top: 4px;
    font-style: italic;
  }
  .pf-deadline.overdue {
    background: #ffebee;
    border-color: #f44336;
  }
  .pf-deadline.overdue .deadline-icon { background: #f44336; }
  .pf-deadline.overdue .deadline-label { color: #c62828; }
  .pf-deadline.overdue .deadline-value { color: #c62828; }
  .pf-deadline.overdue .deadline-note { color: #b71c1c; }

  /* ── Items / Work Table ── */
  .pf-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 22px; }
  .pf-table thead tr th {
    background: #ff9800; color: #fff; font-weight: 700;
    font-size: 11px; letter-spacing: 0.6px; text-transform: uppercase;
    padding: 10px 10px; border: 1px solid #ff9800;
  }
  .pf-table thead tr th.c { text-align: center; }
  .pf-table tbody tr td { padding: 10px 12px; border: 1px solid #d0d7e3; color: #333; vertical-align: top; }
  .pf-table tbody tr td.c { text-align: center; }
  .pf-table tbody tr:nth-child(even) td { background: #fffaf3; }
  .pf-table tbody tr:nth-child(odd) td { background: #fff; }

  .pf-table .item-title {
    font-weight: 700;
    color: #1a237e;
    font-size: 13px;
    margin-bottom: 4px;
  }
  .pf-table .item-notes {
    font-size: 11px;
    color: #666;
    font-style: italic;
  }
  .pf-table .material-list {
    list-style: none;
    padding: 0;
    margin: 4px 0 0 0;
  }
  .pf-table .material-list li {
    font-size: 11px;
    color: #444;
    padding: 2px 0 2px 12px;
    position: relative;
  }
  .pf-table .material-list li::before {
    content: '•';
    position: absolute;
    left: 0;
    color: #ff9800;
    font-weight: 700;
  }

  /* ── Checklist ── */
  .pf-checklist {
    margin: 22px 0;
    padding: 16px 20px;
    background: #f9f9f9;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
  }
  .pf-checklist h4 {
    font-size: 12px;
    font-weight: 700;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 12px;
  }
  .pf-checklist-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px 24px;
  }
  .pf-checklist-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    color: #333;
  }
  .pf-checklist-item .check-box {
    width: 18px;
    height: 18px;
    border: 2px solid #ff9800;
    border-radius: 4px;
    flex-shrink: 0;
  }

  /* ── Notes ── */
  .pf-notes-section {
    margin: 22px 0;
    padding: 16px 20px;
    background: #fff8e1;
    border-left: 4px solid #ff9800;
    border-radius: 4px;
  }
  .pf-notes-section .notes-label {
    font-size: 11px;
    font-weight: 700;
    color: #e65100;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }
  .pf-notes-section .notes-text {
    font-size: 12px;
    color: #333;
    line-height: 1.7;
  }

  /* ── Signature ── */
  .pf-signature-section {
    margin: 30px 0 20px 0;
    padding: 20px;
    background: #fafafa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
  }
  .pf-signature-header {
    display: flex; align-items: center; justify-content: center;
    gap: 10px; margin-bottom: 20px; padding-bottom: 10px;
    border-bottom: 2px solid #e0e0e0;
  }
  .pf-signature-header h3 { margin: 0; font-size: 16px; font-weight: bold; color: #333; letter-spacing: 1px; }
  .pf-signature-icon { font-size: 20px; color: #ff9800; }
  .pf-signature-grid { display: flex; gap: 40px; justify-content: space-between; }
  .pf-signature-box { flex: 1; text-align: center; }
  .pf-signature-line { border-bottom: 1px solid #999; margin: 10px 0 5px 0; width: 100%; min-height: 40px; }
  .pf-signature-name { font-size: 12px; font-weight: 600; color: #1a237e; margin-bottom: 5px; }
  .pf-signature-title { font-size: 10px; color: #666; }

  /* ── Footer ── */
  .pf-footer {
    text-align: center; padding-top: 18px;
    border-top: 1px solid #e8e8e8;
    font-size: 13px; color: #777; font-style: italic;
    margin-top: 20px;
  }

  /* ── Status ribbon ── */
  .pf-status-ribbon {
    display: inline-block;
    padding: 4px 14px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #fff;
    margin-top: 6px;
  }
  .pf-status-ribbon.pending { background: #f59e0b; }
  .pf-status-ribbon.in-progress { background: #3b82f6; }
  .pf-status-ribbon.completed { background: #2e7d32; }
  .pf-status-ribbon.delayed { background: #ef4444; }

  /* ── Loading & Error ── */
  .pf-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; background: #f0f2f5; }
  .pf-spinner {
    width: 46px; height: 46px; border: 3px solid #dde3ec;
    border-top-color: #ff9800; border-radius: 50%;
    animation: pfSpin 0.9s linear infinite; margin-bottom: 16px;
  }
  @keyframes pfSpin { to { transform: rotate(360deg); } }
  .pf-error { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; text-align: center; padding: 40px; background: #f0f2f5; }
  .pf-error h2 { margin: 14px 0 6px; color: #333; }
  .pf-error p { color: #666; margin-bottom: 20px; }

  /* ── Print ── */
  @media print {
    @page { size: A4; margin: 1.2cm; }
    .pf-action-bar { display: none !important; }
    .pf-page-wrap { background: #fff; padding: 0; }
    .pf-paper { box-shadow: none; padding: 12mm 15mm; max-width: 100%; }
    .pf-table thead tr th,
    .pf-deadline,
    .pf-deadline .deadline-icon,
    .pf-status-ribbon,
    .pf-notes-section,
    .pf-checklist,
    .pf-info-box .info-header {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .company-logo-img { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .pf-signature-line { border-bottom: 1px solid #000 !important; }
  }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .pf-action-bar { flex-direction: column; gap: 10px; align-items: stretch; }
    .pf-action-bar .action-group { flex-wrap: wrap; justify-content: center; }
    .pf-paper { padding: 20px 16px; }
    .pf-header { flex-direction: column; gap: 14px; }
    .pf-quote-title { text-align: left; font-size: 20px; }
    .pf-info-grid { grid-template-columns: 1fr; }
    .pf-checklist-grid { grid-template-columns: 1fr; }
    .pf-signature-grid { flex-direction: column; gap: 20px; }
    .pf-deadline { flex-direction: column; text-align: center; }
  }
`;

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
const PrintProductionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

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
      setError(err.message || 'Failed to load production form');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-PK', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch { return 'Invalid Date'; }
  };

  const handlePrint = () => window.print();

  if (loading || profileLoading) {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <div className="pf-loading">
          <div className="pf-spinner" />
          <p style={{ color: '#666' }}>Loading production form…</p>
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <div className="pf-error">
          <FiAlertCircle size={50} color="#f44336" />
          <h2>Error Loading Production Form</h2>
          <p>{error || 'Production form not found'}</p>
          <button className="pf-btn pf-btn--gray" onClick={() => navigate(-1)}>
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
  const businessAddress = profileData?.address || '';

  const orderStatus = order.status || 'pending';
  const dueDate = order.dueDate || order.deliveryDate || null;
  const isOverdue = dueDate && new Date(dueDate) < new Date() && orderStatus !== 'completed';

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {/* ── Action Bar ── */}
      <div className="pf-action-bar">
        <button className="pf-btn pf-btn--gray" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </button>
        <div className="action-group">
          <button className="pf-btn pf-btn--blue" onClick={handlePrint}>
            <FiPrinter /> Print Production Form
          </button>
        </div>
      </div>

      <div className="pf-page-wrap">
        <div className="pf-paper">

          {/* ── Header ── */}
          <div className="pf-header">
            <div className="pf-logo-box">
              {logoUrl ? (
                <>
                  <img src={logoUrl} alt="Logo" className="company-logo-img" crossOrigin="anonymous" />
                  <div className="brand-name-text">{shopName}</div>
                </>
              ) : (
                <>
                  <div className="pf-logo-icon">⚙</div>
                  <div className="pf-logo-name">{shopName}</div>
                  <div className="pf-logo-sub">Production</div>
                </>
              )}
            </div>
            <div>
              <div className="pf-quote-title">Production Form</div>
              <table className="pf-meta-table">
                <tbody>
                  <tr>
                    <td className="meta-label">Job Number:</td>
                    <td className="meta-val">
                      {order.billNumber || order.jobNumber || `JOB-${order._id?.slice(-6)}`}
                    </td>
                  </tr>
                  <tr>
                    <td className="meta-label">Order Date:</td>
                    <td className="meta-val">{formatDate(order.date || order.createdAt)}</td>
                  </tr>
                  <tr>
                    <td className="meta-label">Issued On:</td>
                    <td className="meta-val">{formatDate(new Date())}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Deadline Highlight ── */}
          <div className={`pf-deadline ${isOverdue ? 'overdue' : ''}`}>
            <div className="deadline-icon">
              <FiCalendar />
            </div>
            <div className="deadline-info">
              <div className="deadline-label">
                {isOverdue ? '⚠ OVERDUE — Deliver Immediately' : 'Deadline / Delivery Date'}
              </div>
              <div className="deadline-value">{formatDate(dueDate)}</div>
              {isOverdue ? (
                <div className="deadline-note">
                  This job is past its deadline. Please prioritize!
                </div>
              ) : (
                <div className="deadline-note">
                  Complete without any delay. No excuses.
                </div>
              )}
            </div>
          </div>

          {/* ── Customer & Job Info ── */}
          <div className="pf-info-grid">
            {/* Customer Info */}
            <div className="pf-info-box">
              <div className="info-header">
                <FiUser size={13} /> Customer Information
              </div>
              <div className="info-body">
                <div className="info-name">{order.customer?.name || 'N/A'}</div>
                <div className="info-row">
                  <span className="row-label">Customer ID:</span>
                  <span className="row-value">
                    {order.customer?.customerId || order.customer?._id?.slice(-6) || 'N/A'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="row-label">Phone:</span>
                  <span className="row-value">{order.customer?.phone || 'N/A'}</span>
                </div>
                {order.customer?.address && (
                  <div className="info-row">
                    <span className="row-label">Address:</span>
                    <span className="row-value">{order.customer.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Job Info */}
            <div className="pf-info-box">
              <div className="info-header">
                <FiFileText size={13} /> Job Information
              </div>
              <div className="info-body">
                <div className="info-row">
                  <span className="row-label">Job No:</span>
                  <span className="row-value">
                    {order.billNumber || `JOB-${order._id?.slice(-6)}`}
                  </span>
                </div>
                <div className="info-row">
                  <span className="row-label">Total Items:</span>
                  <span className="row-value">{order.items?.length || 0}</span>
                </div>
                <div className="info-row">
                  <span className="row-label">Priority:</span>
                  <span className="row-value" style={{ color: isOverdue ? '#c62828' : '#2e7d32', fontWeight: 700 }}>
                    {isOverdue ? 'URGENT' : 'Normal'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="row-label">Status:</span>
                  <span className="row-value">
                    <span className={`pf-status-ribbon ${orderStatus}`}>
                      {orderStatus === 'in-progress' ? 'In Progress' : orderStatus}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Items / Work Detail ── */}
          <table className="pf-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }} className="c">#</th>
                <th>Work Description</th>
                <th className="c" style={{ width: '100px' }}>Qty</th>
              </tr>
            </thead>
            <tbody>
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="c">{idx + 1}</td>
                    <td>
                      <div className="item-title">
                        {item.title || item.name || `Item ${idx + 1}`}
                      </div>
                      {item.notes && (
                        <div className="item-notes">Note: {item.notes}</div>
                      )}
                      {item.materials && item.materials.length > 0 && (
                        <ul className="material-list">
                          {item.materials.map((m, mi) => (
                            <li key={mi}>
                              {m.name} — {m.quantity} {m.unit || ''}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="c" style={{ fontWeight: 700, fontSize: 14 }}>
                      {item.quantity || 1}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="c" style={{ padding: '30px', color: '#999' }}>
                    No work items listed
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* ── Production Checklist ── */}
          <div className="pf-checklist">
            <h4>Production Checklist</h4>
            <div className="pf-checklist-grid">
              <div className="pf-checklist-item">
                <div className="check-box"></div>
                <span>Material received & verified</span>
              </div>
              <div className="pf-checklist-item">
                <div className="check-box"></div>
                <span>Measurement / Design confirmed</span>
              </div>
              <div className="pf-checklist-item">
                <div className="check-box"></div>
                <span>Work started on time</span>
              </div>
              <div className="pf-checklist-item">
                <div className="check-box"></div>
                <span>Quality check completed</span>
              </div>
              <div className="pf-checklist-item">
                <div className="check-box"></div>
                <span>Final finishing done</span>
              </div>
              <div className="pf-checklist-item">
                <div className="check-box"></div>
                <span>Ready for delivery</span>
              </div>
            </div>
          </div>

          {/* ── Special Notes ── */}
          {order.notes && (
            <div className="pf-notes-section">
              <div className="notes-label">
                <FiFileText size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Special Instructions
              </div>
              <div className="notes-text">{order.notes}</div>
            </div>
          )}

          {/* ── Signatures ── */}
          <div className="pf-signature-section">
            <div className="pf-signature-header">
              <FiCheckSquare className="pf-signature-icon" />
              <h3>PRODUCTION SIGN-OFF</h3>
            </div>
            <div className="pf-signature-grid">
              <div className="pf-signature-box">
                <div className="pf-signature-line"></div>
                <div className="pf-signature-name">{ownerName}</div>
                <div className="pf-signature-title">Issued By</div>
              </div>
              <div className="pf-signature-box">
                <div className="pf-signature-line"></div>
                <div className="pf-signature-name">_________________________</div>
                <div className="pf-signature-title">Production Supervisor</div>
              </div>
            </div>
          </div>

          <div className="pf-footer">
            This is a production form only. No payment details included.
          </div>
        </div>
      </div>
    </>
  );
};

export default PrintProductionForm;