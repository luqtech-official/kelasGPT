import { useState, useEffect, useCallback } from "react";
import AdminLayout from '@/components/AdminLayout';
import styles from "@/styles/Admin.module.css";

export default function AgentsManagement() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null); 
  const [deletingAgent, setDeletingAgent] = useState(null);
  
  // Payout Manager State
  const [payoutManager, setPayoutManager] = useState(null); // { agent: agentObj, orders: [], selectedIds: [], loading: false }

  // Form State
  const [formData, setFormData] = useState({
    agent_id: '',
    discount_code: '',
    agent_name: '',
    email: '',
    phone: '',
    discount_amount: 0,
    comm_per_sale: 10,
    bank_name: '',
    bank_account_number: '',
    bank_holder_name: ''
  });

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      // Cache-busting: append timestamp to prevent caching issues
      const response = await fetch('/api/admin/agents?t=' + Date.now());
      const result = await response.json();
      
      if (result.success) {
        setAgents(result.agents);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Derived Stats
  const totalPendingPayout = agents.reduce((sum, a) => sum + (Number(a.pending_settlement) || 0), 0);
  const totalPaid = agents.reduce((sum, a) => sum + (Number(a.comm_paid) || 0), 0);
  const totalSales = agents.reduce((sum, a) => sum + (Number(a.total_sales_count) || 0), 0);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      
      if (result.success) {
        setIsCreateModalOpen(false);
        setFormData({ agent_id: '', discount_code: '', agent_name: '', email: '', phone: '', discount_amount: 0, comm_per_sale: 10, bank_name: '', bank_account_number: '', bank_holder_name: '' });
        fetchAgents();
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Failed to create agent');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/agents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: editingAgent.agent_id,
          ...formData
        })
      });
      const result = await response.json();
      
      if (result.success) {
        setEditingAgent(null);
        fetchAgents();
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Failed to update agent');
    }
  };

  const openPayoutManager = async (agent) => {
    setPayoutManager({ agent, orders: [], selectedIds: [], loading: true, showHistory: false });
    try {
        // Cache-busting: append timestamp
        const response = await fetch(`/api/admin/agents?action=orders&agent_id=${agent.agent_id}&t=${Date.now()}`);
        const result = await response.json();
        if (result.success) {
            // By default, we load all and let the UI filter
            setPayoutManager({ 
                agent, 
                orders: result.orders, 
                selectedIds: [], // Start with empty selection
                loading: false,
                showHistory: false
            });
        }
    } catch (error) {
        console.error(error);
        alert("Failed to load orders");
        setPayoutManager(null);
    }
  };

  const toggleOrderSelection = (orderId) => {
    if (!payoutManager) return;
    const current = payoutManager.selectedIds;
    const updated = current.includes(orderId) 
        ? current.filter(id => id !== orderId)
        : [...current, orderId];
    
    setPayoutManager({ ...payoutManager, selectedIds: updated });
  };

  const handlePayoutAction = async () => {
    if (!payoutManager || payoutManager.selectedIds.length === 0) return;
    
    const isRevert = payoutManager.showHistory;
    const action = isRevert ? 'revert_payout' : 'settle_payout';
    
    // Calculate total amount from selected orders
    const totalAmount = payoutManager.orders
        .filter(o => payoutManager.selectedIds.includes(o.order_id))
        .reduce((sum, o) => sum + (o.commission_amount || 10), 0);

    try {
      const response = await fetch('/api/admin/agents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action,
          agent_id: payoutManager.agent.agent_id,
          order_ids: payoutManager.selectedIds,
          total_amount: totalAmount
        })
      });
      const result = await response.json();
      
      if (result.success) {
        setPayoutManager(null);
        fetchAgents();
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert(`Failed to ${isRevert ? 'revert' : 'process'} payout`);
    }
  };

  const handleDelete = async () => {
    if (!deletingAgent) return;
    try {
      const response = await fetch('/api/admin/agents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: deletingAgent.agent_id })
      });
      const result = await response.json();
      
      if (result.success) {
        setDeletingAgent(null);
        fetchAgents();
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Failed to delete agent');
    }
  };

  const handleToggleStatus = async (agent) => {
    try {
      const response = await fetch('/api/admin/agents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: agent.agent_id,
          is_active: !agent.is_active
        })
      });
      const result = await response.json();
      
      if (result.success) {
        fetchAgents();
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const openEditModal = (agent) => {
    setFormData({
      agent_id: agent.agent_id, // Read only
      discount_code: agent.discount_code || '',
      agent_name: agent.agent_name || '',
      email: agent.email || '',
      phone: agent.phone || '',
      discount_amount: agent.discount_amount,
      comm_per_sale: agent.comm_per_sale,
      bank_name: agent.bank_name || '',
      bank_account_number: agent.bank_account_number || '',
      bank_holder_name: agent.bank_holder_name || ''
    });
    setEditingAgent(agent);
  };

  // Filter agents
  const filteredAgents = agents.filter(agent => 
    agent.agent_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (agent.agent_name && agent.agent_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AdminLayout title="Agent Management">
      <div className={styles.newDashboardContainer}>
        {/* Header */}
        <div className={styles.newDashboardHeader}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <h1 className={styles.newTitle}>Agent & Affiliate Management</h1>
              <p className={styles.newSubtitle}>Manage discount codes, track sales, and handle commission payouts.</p>
            </div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className={styles.refreshBtn}
              style={{background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'}}
            >
              + Create New Agent
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={styles.cardsSection}>
          <div className={styles.cardsGrid} style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
            {/* Pending Payouts */}
            <div className={styles.newMetricCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Pending Payouts</h3>
                <span className={styles.cardIcon}>💰</span>
              </div>
              <div className={styles.cardValue} style={{color: '#fbbf24'}}>RM {totalPendingPayout.toFixed(2)}</div>
              <div className={styles.cardSubtext}>
                Amount waiting to be settled
              </div>
            </div>

            {/* Total Paid */}
            <div className={styles.newMetricCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Total Paid Out</h3>
                <span className={styles.cardIcon}>✅</span>
              </div>
              <div className={styles.cardValue} style={{color: '#34d399'}}>RM {totalPaid.toFixed(2)}</div>
              <div className={styles.cardSubtext}>
                Lifetime commissions paid
              </div>
            </div>

            {/* Total Sales */}
            <div className={styles.newMetricCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Total Agent Sales</h3>
                <span className={styles.cardIcon}>📈</span>
              </div>
              <div className={styles.cardValue}>{totalSales}</div>
              <div className={styles.cardSubtext}>
                Successful transactions via agents
              </div>
            </div>
          </div>
        </div>

        {/* Agents Table */}
        <div className={styles.tableSection}>
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader} style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <h3 className={styles.tableTitle}>All Agents</h3>
                <p className={styles.tableSubtitle}>View performance and manage accounts</p>
              </div>
              <input 
                type="text" 
                placeholder="Search agents..." 
                className={styles.searchInput}
                style={{maxWidth: '250px', background: 'rgba(30, 41, 59, 0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.1)'}}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.newTable}>
                <thead>
                  <tr className={styles.tableHeadRow}>
                    <th className={styles.tableHeadCell}>Agent Details</th>
                    <th className={styles.tableHeadCell}>Performance</th>
                    <th className={styles.tableHeadCell}>Commission</th>
                    <th className={styles.tableHeadCell}>Status</th>
                    <th className={styles.tableHeadCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgents.map(agent => (
                    <tr key={agent.agent_id} className={styles.tableBodyRow}>
                      <td className={styles.tableBodyCell}>
                        <div className={styles.customerInfo}>
                          <span className={styles.customerName} style={{fontSize: '14px'}}>{agent.agent_name || 'No Name'}</span>
                          <span className={styles.customerEmail}>ID (Secret): {agent.agent_id}</span>
                          <span className={styles.customerEmail} style={{color: '#60a5fa', fontWeight: 'bold'}}>Code (Public): {agent.discount_code}</span>
                        </div>
                      </td>
                      <td className={styles.tableBodyCell}>
                        <div className={styles.statusInfo}>
                          <span className={styles.statusBadge} style={{background: 'rgba(52, 211, 153, 0.2)', color: '#34d399'}}>
                            {agent.total_sales_count} Sales
                          </span>
                          <span className={styles.statusBadge} style={{background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24'}}>
                            {agent.pending_sales_count} Pending
                          </span>
                        </div>
                      </td>
                      <td className={styles.tableBodyCell}>
                        <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
                          <div style={{fontSize:'14px', fontWeight:'700', color: '#fbbf24'}}>
                            RM {agent.pending_settlement}
                            <span style={{fontSize:'10px', color:'#94a3b8', fontWeight:'400', marginLeft:'4px'}}>pending</span>
                          </div>
                          <div style={{fontSize:'12px', color: '#94a3b8'}}>
                            RM {agent.total_comm} lifetime
                          </div>
                          <div style={{fontSize:'11px', color: '#64748b'}}>
                            Rate: RM{agent.comm_per_sale}/sale
                          </div>
                        </div>
                      </td>
                      <td className={styles.tableBodyCell}>
                        <button 
                          onClick={() => handleToggleStatus(agent)}
                          className={`${styles.statusBadge} ${agent.is_active ? styles.paid : styles.failed}`}
                          style={{cursor: 'pointer', border: 'none', width: '100%'}}
                          title={`Click to ${agent.is_active ? 'deactivate' : 'activate'}`}
                        >
                          {agent.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className={styles.tableBodyCell}>
                        <div style={{display:'flex', gap:'8px'}}>
                          <button 
                            onClick={() => openPayoutManager(agent)}
                            className={styles.exportButton}
                            style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '6px 12px', fontSize: '11px'}}
                          >
                            Manage Payouts
                          </button>
                          <button   
                            onClick={() => openEditModal(agent)}
                            className={styles.refreshBtn}
                            style={{background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '6px 12px', fontSize: '11px'}}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => setDeletingAgent(agent)}
                            className={styles.refreshBtn}
                            style={{background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '6px 12px', fontSize: '11px'}}
                            title="Delete Agent"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className={styles.confirmModal}>
          <div className={styles.confirmContent} style={{background: '#1e293b', border: '1px solid #334155', color: 'white', maxWidth:'500px'}}>
            <h3 className={styles.confirmTitle} style={{color: 'white'}}>Create New Agent</h3>
            <form onSubmit={handleCreate}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px'}}>
                <div>
                  <label style={{fontSize:'12px', color:'#94a3b8', display:'block', marginBottom:'4px'}}>Agent ID (Secret / Tracking)</label>
                  <input required type="text" value={formData.agent_id} onChange={e => setFormData({...formData, agent_id: e.target.value})} className={styles.searchInput} style={{background: '#0f172a', border: '1px solid #334155', color: 'white'}} placeholder="e.g. agent_sarah_001" />
                </div>
                <div>
                  <label style={{fontSize:'12px', color:'#94a3b8', display:'block', marginBottom:'4px'}}>Discount Code (Public / Customer)</label>
                  <input required type="text" value={formData.discount_code} onChange={e => setFormData({...formData, discount_code: e.target.value.toUpperCase()})} className={styles.searchInput} style={{background: '#0f172a', border: '1px solid #334155', color: 'white'}} placeholder="e.g. SARAH50" />
                </div>
              </div>
              <div style={{marginBottom:'16px'}}>
                  <label style={{fontSize:'12px', color:'#94a3b8', display:'block', marginBottom:'4px'}}>Agent Name</label>
                  <input required type="text" value={formData.agent_name} onChange={e => setFormData({...formData, agent_name: e.target.value})} className={styles.searchInput} style={{background: '#0f172a', border: '1px solid #334155', color: 'white'}} placeholder="John Doe" />
              </div>
              
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px'}}>
                <div>
                  <label style={{fontSize:'12px', color:'#94a3b8', display:'block', marginBottom:'4px'}}>Discount Amount (RM)</label>
                  <input type="number" value={formData.discount_amount} onChange={e => setFormData({...formData, discount_amount: e.target.value})} className={styles.searchInput} style={{background: '#0f172a', border: '1px solid #334155', color: 'white'}} />
                </div>
                <div>
                  <label style={{fontSize:'12px', color:'#94a3b8', display:'block', marginBottom:'4px'}}>Commission per Sale (RM)</label>
                  <input type="number" value={formData.comm_per_sale} onChange={e => setFormData({...formData, comm_per_sale: e.target.value})} className={styles.searchInput} style={{background: '#0f172a', border: '1px solid #334155', color: 'white'}} />
                </div>
              </div>

              <div style={{marginBottom:'16px'}}>
                  <label style={{fontSize:'12px', color:'#94a3b8', display:'block', marginBottom:'4px'}}>Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={styles.searchInput} style={{background: '#0f172a', border: '1px solid #334155', color: 'white'}} />
              </div>

              <div style={{marginTop:'24px', paddingTop:'16px', borderTop:'1px solid #334155'}}>
                <h4 style={{fontSize:'14px', color:'#cbd5e1', marginBottom:'12px'}}>Bank Details (Optional)</h4>
                <div style={{display:'grid', gap:'12px'}}>
                    <input type="text" placeholder="Bank Name" value={formData.bank_name} onChange={e => setFormData({...formData, bank_name: e.target.value})} className={styles.searchInput} style={{background: '#0f172a', border: '1px solid #334155', color: 'white'}} />
                    <input type="text" placeholder="Account Number" value={formData.bank_account_number} onChange={e => setFormData({...formData, bank_account_number: e.target.value})} className={styles.searchInput} style={{background: '#0f172a', border: '1px solid #334155', color: 'white'}} />
                    <input type="text" placeholder="Holder Name" value={formData.bank_holder_name} onChange={e => setFormData({...formData, bank_holder_name: e.target.value})} className={styles.searchInput} style={{background: '#0f172a', border: '1px solid #334155', color: 'white'}} />
                </div>
              </div>

              <div className={styles.confirmActions} style={{marginTop:'24px'}}>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className={`${styles.confirmButton} ${styles.confirmCancel}`} style={{background:'transparent', color:'#cbd5e1', border:'1px solid #475569'}}>Cancel</button>
                <button type="submit" className={styles.confirmButton} style={{background: '#3b82f6', color: 'white'}}>Create Agent</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingAgent && (
        <div className={styles.confirmModal}>
          <div className={styles.confirmContent} style={{background: '#1e293b', border: '1px solid #334155', color: 'white', maxWidth:'500px'}}>
            <h3 className={styles.confirmTitle} style={{color: 'white'}}>Edit Agent: {editingAgent.agent_id}</h3>
            <form onSubmit={handleUpdate}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px'}}>
                <div>
                  <label style={{fontSize:'12px', color:'#94a3b8', display:'block', marginBottom:'4px'}}>Agent ID (Secret - Fixed)</label>
                  <input disabled type="text" value={formData.agent_id} className={styles.searchInput} style={{background: '#0f172a', border: '1px solid #1e293b', color: '#64748b'}} />
                </div>
                <div>
                  <label style={{fontSize:'12px', color:'#94a3b8', display:'block', marginBottom:'4px'}}>Discount Code (Public)</label>
                  <input required type="text" value={formData.discount_code} onChange={e => setFormData({...formData, discount_code: e.target.value.toUpperCase()})} className={styles.searchInput} style={{background: '#0f172a', border: '1px solid #334155', color: 'white'}} />
                </div>
              </div>
              <div style={{marginBottom:'16px'}}>
                  <label style={{fontSize:'12px', color:'#94a3b8', display:'block', marginBottom:'4px'}}>Agent Name</label>
                  <input required type="text" value={formData.agent_name} onChange={e => setFormData({...formData, agent_name: e.target.value})} className={styles.searchInput} style={{background: '#0f172a', border: '1px solid #334155', color: 'white'}} />
              </div>
              
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px'}}>
                <div>
                  <label style={{fontSize:'12px', color:'#94a3b8', display:'block', marginBottom:'4px'}}>Discount Amount (RM)</label>
                  <input type="number" value={formData.discount_amount} onChange={e => setFormData({...formData, discount_amount: e.target.value})} className={styles.searchInput} style={{background: '#0f172a', border: '1px solid #334155', color: 'white'}} />
                </div>
                <div>
                  <label style={{fontSize:'12px', color:'#94a3b8', display:'block', marginBottom:'4px'}}>Commission per Sale (RM)</label>
                  <input type="number" value={formData.comm_per_sale} onChange={e => setFormData({...formData, comm_per_sale: e.target.value})} className={styles.searchInput} style={{background: '#0f172a', border: '1px solid #334155', color: 'white'}} />
                </div>
              </div>

              <div style={{marginBottom:'16px'}}>
                  <label style={{fontSize:'12px', color:'#94a3b8', display:'block', marginBottom:'4px'}}>Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={styles.searchInput} style={{background: '#0f172a', border: '1px solid #334155', color: 'white'}} />
              </div>

              <div style={{marginTop:'24px', paddingTop:'16px', borderTop:'1px solid #334155'}}>
                <h4 style={{fontSize:'14px', color:'#cbd5e1', marginBottom:'12px'}}>Bank Details</h4>
                <div style={{display:'grid', gap:'12px'}}>
                    <input type="text" placeholder="Bank Name" value={formData.bank_name} onChange={e => setFormData({...formData, bank_name: e.target.value})} className={styles.searchInput} style={{background: '#0f172a', border: '1px solid #334155', color: 'white'}} />
                    <input type="text" placeholder="Account Number" value={formData.bank_account_number} onChange={e => setFormData({...formData, bank_account_number: e.target.value})} className={styles.searchInput} style={{background: '#0f172a', border: '1px solid #334155', color: 'white'}} />
                    <input type="text" placeholder="Holder Name" value={formData.bank_holder_name} onChange={e => setFormData({...formData, bank_holder_name: e.target.value})} className={styles.searchInput} style={{background: '#0f172a', border: '1px solid #334155', color: 'white'}} />
                </div>
              </div>

              <div className={styles.confirmActions} style={{marginTop:'24px'}}>
                <button type="button" onClick={() => setEditingAgent(null)} className={`${styles.confirmButton} ${styles.confirmCancel}`} style={{background:'transparent', color:'#cbd5e1', border:'1px solid #475569'}}>Cancel</button>
                <button type="submit" className={styles.confirmButton} style={{background: '#3b82f6', color: 'white'}}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYOUT MANAGER MODAL */}
      {payoutManager && (
        <div className={styles.confirmModal}>
          <div className={styles.confirmContent} style={{background: '#1e293b', border: '1px solid #334155', color: 'white', maxWidth:'700px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #334155', paddingBottom:'12px', marginBottom:'16px'}}>
                <h3 className={styles.confirmTitle} style={{color: 'white', margin:0}}>
                  Payout Manager: {payoutManager.agent.agent_name}
                </h3>
                <div style={{display:'flex', gap:'8px', background:'rgba(0,0,0,0.2)', padding:'4px', borderRadius:'6px'}}>
                    <button 
                        onClick={() => setPayoutManager({...payoutManager, showHistory: false, selectedIds: []})}
                        style={{
                            background: !payoutManager.showHistory ? '#3b82f6' : 'transparent',
                            color: !payoutManager.showHistory ? 'white' : '#94a3b8',
                            border:'none', padding:'6px 12px', borderRadius:'4px', fontSize:'12px', cursor:'pointer', fontWeight:'500'
                        }}
                    >
                        Unpaid Orders
                    </button>
                    <button 
                        onClick={() => setPayoutManager({...payoutManager, showHistory: true, selectedIds: []})}
                        style={{
                            background: payoutManager.showHistory ? '#3b82f6' : 'transparent',
                            color: payoutManager.showHistory ? 'white' : '#94a3b8',
                            border:'none', padding:'6px 12px', borderRadius:'4px', fontSize:'12px', cursor:'pointer', fontWeight:'500'
                        }}
                    >
                        Payment History
                    </button>
                </div>
            </div>
            
            {payoutManager.loading ? (
                <div style={{padding:'40px', textAlign:'center', color:'#94a3b8'}}>Loading orders...</div>
            ) : (
                <>
                    <div style={{maxHeight:'300px', overflowY:'auto', marginBottom:'20px', border:'1px solid #334155', borderRadius:'6px'}}>
                        <table style={{width:'100%', fontSize:'13px', borderCollapse:'collapse'}}>
                            <thead style={{background:'#0f172a', position:'sticky', top:0}}>
                                <tr>
                                    <th style={{padding:'8px', textAlign:'left', color:'#94a3b8'}}>Select</th>
                                    <th style={{padding:'8px', textAlign:'left', color:'#94a3b8'}}>Date</th>
                                    <th style={{padding:'8px', textAlign:'left', color:'#94a3b8'}}>Order ID</th>
                                    <th style={{padding:'8px', textAlign:'right', color:'#94a3b8'}}>Comm. (RM)</th>
                                    <th style={{padding:'8px', textAlign:'center', color:'#94a3b8'}}>{payoutManager.showHistory ? 'Settled Date' : 'Status'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payoutManager.orders.filter(o => payoutManager.showHistory ? o.payout_status === 'paid' : o.payout_status === 'unpaid').length === 0 ? (
                                    <tr><td colSpan={5} style={{padding:'20px', textAlign:'center', color:'#64748b'}}>
                                        {payoutManager.showHistory ? 'No payment history found.' : 'No unpaid orders found.'}
                                    </td></tr>
                                ) : (
                                    payoutManager.orders
                                        .filter(o => payoutManager.showHistory ? o.payout_status === 'paid' : o.payout_status === 'unpaid')
                                        .map(order => {
                                            const daysOld = Math.floor((new Date() - new Date(order.created_at)) / (1000 * 60 * 60 * 24));
                                            const isRecent = daysOld < 7;
                                            
                                            return (
                                                <tr key={order.order_id} style={{borderBottom:'1px solid #334155', background: payoutManager.selectedIds.includes(order.order_id) ? 'rgba(59, 130, 246, 0.1)' : 'transparent'}}>
                                                    <td style={{padding:'8px'}}>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={payoutManager.selectedIds.includes(order.order_id)} 
                                                            onChange={() => toggleOrderSelection(order.order_id)}
                                                        />
                                                    </td>
                                                    <td style={{padding:'8px', color:'#cbd5e1'}}>
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                        {!payoutManager.showHistory && isRecent && (
                                                            <span title="Less than 7 days old (Grace Period)" style={{marginLeft:'6px', fontSize:'10px', background:'#fbbf24', color:'black', padding:'1px 4px', borderRadius:'4px', cursor:'help'}}>
                                                                ⚠️ {daysOld}d
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{padding:'8px', fontFamily:'monospace', color:'#cbd5e1'}}>{order.order_number}</td>
                                                    <td style={{padding:'8px', textAlign:'right', fontWeight:'600', color:'#fbbf24'}}>
                                                        {order.commission_amount.toFixed(2)}
                                                    </td>
                                                    <td style={{padding:'8px', textAlign:'center', color:'#94a3b8', fontSize:'11px'}}>
                                                        {payoutManager.showHistory && order.payout_settled_at 
                                                            ? new Date(order.payout_settled_at).toLocaleDateString() 
                                                            : <span style={{color:'#fbbf24'}}>PENDING</span>}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(0,0,0,0.2)', padding:'12px', borderRadius:'8px'}}>
                        <div>
                            <div style={{fontSize:'12px', color:'#94a3b8'}}>Selected for {payoutManager.showHistory ? 'Reversal' : 'Payout'}</div>
                            <div style={{fontSize:'18px', fontWeight:'700', color:'#white'}}>
                                {payoutManager.selectedIds.length} Orders
                            </div>
                        </div>
                        <div style={{textAlign:'right'}}>
                            <div style={{fontSize:'12px', color:'#94a3b8'}}>Total Amount</div>
                            <div style={{fontSize:'24px', fontWeight:'700', color: payoutManager.showHistory ? '#f87171' : '#fbbf24'}}>
                                RM {payoutManager.orders
                                    .filter(o => payoutManager.selectedIds.includes(o.order_id))
                                    .reduce((sum, o) => sum + (o.commission_amount || 0), 0)
                                    .toFixed(2)}
                            </div>
                        </div>
                    </div>

                    <div className={styles.confirmActions} style={{marginTop:'24px'}}>
                        <button onClick={() => setPayoutManager(null)} className={`${styles.confirmButton} ${styles.confirmCancel}`} style={{background:'transparent', color:'#cbd5e1', border:'1px solid #475569'}}>Cancel</button>
                        <button 
                            onClick={handlePayoutAction} 
                            className={styles.confirmButton} 
                            style={{background: payoutManager.showHistory ? '#ef4444' : '#10b981', color: 'white'}}
                            disabled={payoutManager.selectedIds.length === 0}
                        >
                            {payoutManager.showHistory ? 'Revert Payment' : 'Confirm Settlement'}
                        </button>
                    </div>
                </>
            )}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingAgent && (
        <div className={styles.confirmModal}>
          <div className={styles.confirmContent} style={{background: '#1e293b', border: '1px solid #334155', color: 'white'}}>
            <h3 className={styles.confirmTitle} style={{color: '#ef4444'}}>Delete Agent?</h3>
            <p className={styles.confirmMessage} style={{color: '#cbd5e1'}}>
              Are you sure you want to delete agent <strong>{deletingAgent.agent_name}</strong> ({deletingAgent.agent_id})?
            </p>
            <p className={styles.confirmMessage} style={{color: '#94a3b8', fontSize: '12px', marginTop: '-10px'}}>
              This action cannot be undone. Agents with existing orders cannot be deleted.
            </p>
            <div className={styles.confirmActions} style={{marginTop:'24px'}}>
              <button onClick={() => setDeletingAgent(null)} className={`${styles.confirmButton} ${styles.confirmCancel}`} style={{background:'transparent', color:'#cbd5e1', border:'1px solid #475569'}}>Cancel</button>
              <button onClick={handleDelete} className={styles.confirmButton} style={{background: '#ef4444', color: 'white'}}>Delete Permanently</button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
