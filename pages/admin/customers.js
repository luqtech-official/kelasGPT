import { useState, useEffect, useCallback } from "react";
import AdminLayout from '@/components/AdminLayout';
import styles from "@/styles/Customers.module.css";

const CUSTOMERS_PER_PAGE = 10;

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    filteredCount: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: CUSTOMERS_PER_PAGE.toString(),
        search: searchTerm,
        status: statusFilter
      });

      const response = await fetch(`/api/admin/customers?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setCustomers(result.data.customers);
        setPagination(result.data.pagination);
      } else {
        throw new Error(result.message || 'Failed to fetch customers');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        filteredCount: 0,
        hasNextPage: false,
        hasPreviousPage: false
      });
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (event) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1);
  };

  const goToNextPage = () => {
    if (pagination.hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (pagination.hasPreviousPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-MY', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#28a745';
      case 'pending': return '#ffc107';
      case 'failed': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const exportCustomers = async () => {
    try {
      // Build query parameters for export
      const params = new URLSearchParams({
        export: 'true',
        search: searchTerm,
        status: statusFilter
      });

      const response = await fetch(`/api/admin/customers?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  return (
    <AdminLayout title="Customer Management">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className={styles.title}>Customer Management</h1>
        <button 
          onClick={exportCustomers}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Export CSV
        </button>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by name, email, or order number..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={handleSearch}
          style={{ flex: 1 }}
        />
        
        <select 
          value={statusFilter} 
          onChange={handleStatusFilter}
          style={{ 
            padding: '8px 12px', 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>

        <button 
          onClick={fetchCustomers}
          style={{
            background: '#0070f3',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading customers...</p>
        </div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Order Number</th>
                  <th>Amount (RM)</th>
                  <th>Date</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.customer_id}>
                    <td style={{ fontWeight: '500' }}>{customer.full_name}</td>
                    <td style={{ color: '#666' }}>{customer.email_address}</td>
                    <td>{customer.phone_number}</td>
                    <td>
                      <span
                        style={{
                          background: getStatusColor(customer.payment_status),
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}
                      >
                        {customer.payment_status}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{customer.order_number}</td>
                    <td style={{ fontWeight: 'bold' }}>{customer.final_amount ? customer.final_amount.toFixed(2) : '0.00'}</td>
                    <td style={{ fontSize: '13px' }}>{formatDate(customer.created_at)}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#666' }}>{customer.masked_ip || customer.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <button onClick={goToPreviousPage} disabled={!pagination.hasPreviousPage}>
              Previous
            </button>
            <span>
              Page {pagination.currentPage} of {pagination.totalPages} ({pagination.filteredCount} customers)
            </span>
            <button onClick={goToNextPage} disabled={!pagination.hasNextPage}>
              Next
            </button>
          </div>
        </>
      )}
    </AdminLayout>
  );
}