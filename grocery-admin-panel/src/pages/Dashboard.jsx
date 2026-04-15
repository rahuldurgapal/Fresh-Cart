import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Users, Package, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import './Dashboard.css';

import API_BASE from '../config.js';

const Dashboard = () => {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/dashboard/stats.php`)
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const admin = JSON.parse(localStorage.getItem('admin_user') || '{}');

  const formatCurrency = (val) => '₹' + Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 });

  const statCards = stats ? [
    { title: 'Total Revenue',    value: formatCurrency(stats.total_revenue),    sub: `Today: ${formatCurrency(stats.revenue_today)}`,  icon: <DollarSign size={22} />,    color: '#22c55e' },
    { title: 'Total Orders',     value: stats.total_orders,                     sub: `Today: ${stats.orders_today} new`,               icon: <ShoppingBag size={22} />,   color: '#3b82f6' },
    { title: 'Customers',        value: stats.total_customers,                  sub: 'Registered users',                               icon: <Users size={22} />,         color: '#f59e0b' },
    { title: 'Products',         value: stats.total_products,                   sub: `${stats.low_stock} low · ${stats.out_of_stock} out`, icon: <Package size={22} />,  color: '#8b5cf6' },
  ] : [];

  const weeklyChartData = stats?.weekly_sales?.map(row => ({
    name: new Date(row.date).toLocaleDateString('en-IN', { weekday: 'short' }),
    revenue: parseFloat(row.revenue),
    orders: parseInt(row.orders)
  })) || [];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Welcome back, <strong>{admin.name || 'Admin'}</strong> — here's your store summary.</p>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={14} /> Live data
        </div>
      </div>

      {/* Alert: Low Stock */}
      {stats?.low_stock > 0 && (
        <div style={{
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: '12px', padding: '12px 18px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '10px', color: '#d97706'
        }}>
          <AlertTriangle size={18} />
          <span><strong>{stats.low_stock}</strong> products are running low on stock! 
            &nbsp;<a href="/products" style={{ color: '#d97706', fontWeight: 600 }}>View Products →</a>
          </span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="stat-card" style={{ opacity: 0.5 }}>
              <div className="stat-icon" style={{ backgroundColor: '#f3f4f6' }}></div>
              <div className="stat-details"><h3>Loading...</h3><h2>—</h2></div>
            </div>
          ))
        ) : statCards.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
              {s.icon}
            </div>
            <div className="stat-details">
              <h3>{s.title}</h3>
              <div className="stat-value-row">
                <h2>{s.value}</h2>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="dashboard-charts">
        {/* Weekly Revenue Chart */}
        <div className="chart-container glass">
          <div className="chart-header">
            <h3>Weekly Revenue</h3>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Last 7 days</span>
          </div>
          <div className="chart-body" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-6} tickFormatter={v => '₹' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v)} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} formatter={v => ['₹' + Number(v).toLocaleString('en-IN'), 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#22c55e' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#22c55e' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="chart-container glass">
          <div className="chart-header">
            <h3>Top Selling Products</h3>
          </div>
          <div className="chart-body" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.top_products || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.06)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} width={100} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                <Bar dataKey="sold" fill="#22c55e" radius={[0, 4, 4, 0]} name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      {stats?.recent_orders?.length > 0 && (
        <div className="chart-container glass" style={{ marginTop: '20px' }}>
          <div className="chart-header">
            <h3>Recent Orders</h3>
            <a href="/orders" style={{ fontSize: '0.85rem', color: '#22c55e', textDecoration: 'none' }}>View All →</a>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Order ID', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#9ca3af', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recent_orders.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-dark)' }}>#ORD-{o.id}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-dark)' }}>{o.customer_name}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: '#22c55e' }}>₹{Number(o.final_total).toFixed(2)}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600,
                      background: o.status === 'Delivered' ? 'rgba(34,197,94,0.1)' : o.status === 'Cancelled' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                      color: o.status === 'Delivered' ? '#22c55e' : o.status === 'Cancelled' ? '#ef4444' : '#f59e0b'
                    }}>{o.status}</span>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#9ca3af' }}>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
