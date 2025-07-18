import { useState, useEffect, useCallback } from "react";
import AdminLayout from '@/components/AdminLayout';
import styles from "@/styles/Admin.module.css";

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

  // Status change functionality
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

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
      case 'refunded': return '#8b5cf6';
      default: return '#6c757d';
    }
  };

  const getAvailableStatuses = (currentStatus) => {
    const allStatuses = {
      pending: 'Pending Payment',
      paid: 'Payment Successful',
      failed: 'Payment Failed',
      refunded: 'Refunded'
    };

    // Define allowed transitions
    const transitions = {
      pending: ['paid', 'failed'],
      paid: ['failed', 'refunded'],
      failed: ['paid'],
      refunded: []
    };

    return transitions[currentStatus]?.map(status => ({
      value: status,
      label: allStatuses[status],
      isDangerous: status === 'failed' || status === 'refunded'
    })) || [];
  };

  const handleStatusClick = (customerId) => {
    setActiveDropdown(activeDropdown === customerId ? null : customerId);
  };

  const handleStatusChange = async (customer, newStatus) => {
    const isDangerous = newStatus === 'failed' || 
                       (customer.payment_status === 'paid' && newStatus !== 'paid');

    if (isDangerous) {
      setConfirmModal({
        customer,
        newStatus,
        title: `Change Status to ${newStatus.toUpperCase()}`,
        message: `Are you sure you want to change ${customer.full_name}'s payment status from "${customer.payment_status}" to "${newStatus}"? This action will affect their access to the product.`
      });
    } else {
      await updateCustomerStatus(customer.customer_id, newStatus);
    }
    
    setActiveDropdown(null);
  };

  const updateCustomerStatus = async (customerId, newStatus) => {
    try {
      setUpdating(customerId);
      
      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          payment_status: newStatus
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update status');
      }

      // Update the customer in the local state
      setCustomers(prev => prev.map(customer => 
        customer.customer_id === customerId 
          ? { ...customer, payment_status: newStatus, updated_at: new Date().toISOString() }
          : customer
      ));

      // Show success feedback
      console.log('Status updated successfully');
      
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status: ' + error.message);
    } finally {
      setUpdating(null);
      setConfirmModal(null);
    }
  };

  const handleConfirmStatusChange = () => {
    if (confirmModal) {
      updateCustomerStatus(confirmModal.customer.customer_id, confirmModal.newStatus);
    }
  };

  const handleCancelStatusChange = () => {
    setConfirmModal(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
      {/* Header */}
      <div className={styles.customersHeader}>
        <h1 className={styles.customersTitle}>Customer Management</h1>
        <button 
          onClick={exportCustomers}
          className={styles.exportButton}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filtersRow}>
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={handleSearch}
        />
        
        <select 
          value={statusFilter} 
          onChange={handleStatusFilter}
          className={styles.filterSelect}
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>

        <button 
          onClick={fetchCustomers}
          className={styles.refreshBtn}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className={styles.loadingSpinner}>
          <div className={styles.loadingSpinner}></div>
          Loading customer data...
        </div>
      ) : (
        <>
          {/* Customers Table */}
          <div className={styles.customersTable}>
            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead className={styles.tableHead}>
                  <tr>
                    <th className={styles.tableHeadCell}>Customer</th>
                    <th className={styles.tableHeadCell}>Contact</th>
                    <th className={styles.tableHeadCell}>Status</th>
                    <th className={styles.tableHeadCell}>Order</th>
                    <th className={styles.tableHeadCell}>Amount</th>
                    <th className={styles.tableHeadCell}>Date</th>
                    <th className={styles.tableHeadCell}>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length > 0 ? customers.map((customer) => (
                    <tr key={customer.customer_id} className={styles.tableBodyRow}>
                      {/* Customer Name & Email */}
                      <td className={styles.tableBodyCell}>
                        <div className={styles.customerName}>{customer.full_name}</div>
                        <div className={styles.customerEmail}>{customer.email_address}</div>
                      </td>
                      
                      {/* Phone */}
                      <td className={styles.tableBodyCell}>
                        <div className={styles.phoneNumber}>{customer.phone_number}</div>
                      </td>
                      
                      {/* Interactive Status Badge */}
                      <td className={styles.tableBodyCell}>
                        <div style={{ position: 'relative' }}>
                          <div
                            className={`${styles.statusBadge} ${styles[customer.payment_status]}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusClick(customer.customer_id);
                            }}
                            style={{ 
                              opacity: updating === customer.customer_id ? 0.6 : 1,
                              cursor: updating === customer.customer_id ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {updating === customer.customer_id ? (
                              <div className={styles.loginSpinner}></div>
                            ) : (
                              customer.payment_status
                            )}
                          </div>
                          
                          {/* Status Dropdown */}
                          {activeDropdown === customer.customer_id && updating !== customer.customer_id && (
                            <div className={styles.statusDropdown}>
                              {getAvailableStatuses(customer.payment_status).map((status) => (
                                <button
                                  key={status.value}
                                  className={`${styles.statusOption} ${status.isDangerous ? styles.danger : styles.success}`}
                                  onClick={() => handleStatusChange(customer, status.value)}
                                >
                                  {status.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      {/* Order Number */}
                      <td className={styles.tableBodyCell}>
                        <span className={styles.orderNumber}>{customer.order_number}</span>
                      </td>
                      
                      {/* Amount */}
                      <td className={styles.tableBodyCell}>
                        <span className={styles.amount}>
                          RM {customer.final_amount ? customer.final_amount.toFixed(2) : '0.00'}
                        </span>
                      </td>
                      
                      {/* Date */}
                      <td className={styles.tableBodyCell}>
                        <div className={styles.dateTime}>{formatDate(customer.created_at)}</div>
                      </td>
                      
                      {/* IP Address */}
                      <td className={styles.tableBodyCell}>
                        <span className={styles.ipAddress}>
                          {customer.masked_ip || customer.ip_address}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr className={styles.tableBodyRow}>
                      <td className={styles.tableBodyCell} colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>
                        No customers found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className={styles.pagination}>
            <button 
              onClick={goToPreviousPage} 
              disabled={!pagination.hasPreviousPage}
              className={styles.paginationButton}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            
            <span className={styles.paginationInfo}>
              Page {pagination.currentPage} of {pagination.totalPages} 
              <span style={{ display: 'block', fontSize: '11px', marginTop: '2px' }}>
                ({pagination.filteredCount} customers)
              </span>
            </span>
            
            <button 
              onClick={goToNextPage} 
              disabled={!pagination.hasNextPage}
              className={styles.paginationButton}
            >
              Next
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className={styles.confirmModal}>
          <div className={styles.confirmContent}>
            <h3 className={styles.confirmTitle}>{confirmModal.title}</h3>
            <p className={styles.confirmMessage}>{confirmModal.message}</p>
            <div className={styles.confirmActions}>
              <button 
                onClick={handleCancelStatusChange}
                className={`${styles.confirmButton} ${styles.confirmCancel}`}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmStatusChange}
                className={`${styles.confirmButton} ${styles.confirmDelete}`}
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}