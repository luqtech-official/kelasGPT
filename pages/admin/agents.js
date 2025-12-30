import { useState, useEffect, useCallback } from "react";
import AdminLayout from '@/components/AdminLayout';
import styles from "@/styles/Admin.module.css";

export default function AgentsManagement() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null); // If null, modal is closed
  const [payingAgent, setPayingAgent] = useState(null); // Confirmation for payment

  // Form State
  const [formData, setFormData] = useState({
    agent_id: '',
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
      const response = await fetch('/api/admin/agents');
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
        setFormData({ agent_id: '', agent_name: '', email: '', phone: '', discount_amount: 0, comm_per_sale: 10, bank_name: '', bank_account_number: '', bank_holder_name: '' });
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

  const handleMarkPaid = async () => {
    if (!payingAgent) return;
    try {
      const response = await fetch('/api/admin/agents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_paid',
          agent_id: payingAgent.agent_id
        })
      });
      const result = await response.json();
      
      if (result.success) {
        setPayingAgent(null);
        fetchAgents();
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Failed to process payment');
    }
  };

  const openEditModal = (agent) => {
    setFormData({
      agent_id: agent.agent_id, // Read only
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
                          <span className={styles.customerName} style={{fontSize: '14px'}}>{agent.agent_id}</span>
                          <span className={styles.customerEmail}>{agent.agent_name || 'No Name'}</span>
                          <span className={styles.customerEmail} style={{opacity: 0.7}}>Code: {agent.agent_id}</span>
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
                        <span className={`${styles.statusBadge} ${agent.is_active ? styles.paid : styles.failed}`}>
                          {agent.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className={styles.tableBodyCell}>
                        <div style={{display:'flex', gap:'8px'}}>
                          <button 
                            onClick={() => setPayingAgent(agent)}
                            className={styles.exportButton}
                            style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '6px 12px', fontSize: '11px'}}
                            disabled={Number(agent.pending_settlement) <= 0}
                          >
                            Mark Paid
                          </button>
                          <button 
                            onClick={() => openEditModal(agent)}
                            className={styles.refreshBtn}
                            style={{background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '6px 12px', fontSize: '11px'}}
                          >
                            Edit
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
                  <label style={{fontSize:'12px', color:'#94a3b8', display:'block', marginBottom:'4px'}}>Agent Code (ID)</label>
                  <input required type="text" value={formData.agent_id} onChange={e => setFormData({...formData, agent_id: e.target.value.toUpperCase()})} className={styles.searchInput} style={{background: '#0f172a', border: '1px solid #334155', color: 'white'}} placeholder="e.g. SUMMER2025" />
                </div>
                <div>
                  <label style={{fontSize:'12px', color:'#94a3b8', display:'block', marginBottom:'4px'}}>Agent Name</label>
                  <input required type="text" value={formData.agent_name} onChange={e => setFormData({...formData, agent_name: e.target.value})} className={styles.searchInput} style={{background: '#0f172a', border: '1px solid #334155', color: 'white'}} placeholder="John Doe" />
                </div>
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

      {/* PAYMENT CONFIRMATION MODAL */}
      {payingAgent && (
        <div className={styles.confirmModal}>
          <div className={styles.confirmContent} style={{background: '#1e293b', border: '1px solid #334155', color: 'white'}}>
            <h3 className={styles.confirmTitle} style={{color: 'white'}}>Confirm Payment Settlement</h3>
            <p className={styles.confirmMessage} style={{color: '#cbd5e1'}}>
              You are about to mark <strong>RM {payingAgent.pending_settlement}</strong> as PAID for agent <strong>{payingAgent.agent_name}</strong>.
            </p>
            <div style={{background: 'rgba(0,0,0,0.2)', padding:'12px', borderRadius:'8px', marginBottom:'20px', fontSize:'13px', color:'#94a3b8'}}>
              <p style={{margin:'0 0 4px 0'}}><strong>Bank:</strong> {payingAgent.bank_name || 'N/A'}</p>
              <p style={{margin:'0 0 4px 0'}}><strong>Account:</strong> {payingAgent.bank_account_number || 'N/A'}</p>
              <p style={{margin:'0'}}><strong>Holder:</strong> {payingAgent.bank_holder_name || 'N/A'}</p>
            </div>
            <p style={{fontSize:'12px', color:'#ef4444', fontStyle:'italic'}}>
              Note: This action only updates the system records. You must manually transfer the money via your bank.
            </p>
            <div className={styles.confirmActions} style={{marginTop:'24px'}}>
              <button onClick={() => setPayingAgent(null)} className={`${styles.confirmButton} ${styles.confirmCancel}`} style={{background:'transparent', color:'#cbd5e1', border:'1px solid #475569'}}>Cancel</button>
              <button onClick={handleMarkPaid} className={styles.confirmButton} style={{background: '#10b981', color: 'white'}}>Confirm Paid</button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
