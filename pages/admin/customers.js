import { useState, useEffect, useCallback } from "react";
import AdminLayout from '@/components/AdminLayout';
import styles from "@/styles/Admin.module.css";
import { useSearchDebounce } from '@/lib/hooks/useDebounce';

const CUSTOMERS_PER_PAGE = 10;

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  
  // ✅ PERFORMANCE: Debounce search to prevent excessive API calls
  const { debouncedSearchTerm, isSearching } = useSearchDebounce(searchTerm, 400);
  const [csrfToken, setCsrfToken] = useState(null);
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
  
  // Email resend functionality
  const [resendingEmail, setResendingEmail] = useState(null);
  const [resendModal, setResendModal] = useState(null);

  const fetchCSRFToken = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/csrf-token');

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          setCsrfToken(result.csrfToken);
        }
      }
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: CUSTOMERS_PER_PAGE.toString(),
        search: debouncedSearchTerm,  // ✅ Use debounced value for API calls
        status: statusFilter
      });

      const response = await fetch(`/api/admin/customers?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        throw new Error('Server returned invalid response format');
      }
      
      if (result.success) {
        setCustomers(result.data.customers);
        setPagination({
          currentPage: result.data.currentPage,
          totalPages: result.data.totalPages,
          totalCount: result.data.totalCustomers,
          filteredCount: result.data.totalFiltered,
          hasNextPage: result.data.hasNextPage,
          hasPreviousPage: result.data.hasPreviousPage
        });
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
  }, [currentPage, debouncedSearchTerm, statusFilter]);  // ✅ Use debounced value in dependency

  useEffect(() => {
    fetchCSRFToken();
    fetchCustomers();
  }, [fetchCSRFToken, fetchCustomers]);

  const handleSearch = (event) => {
    const newSearchTerm = event.target.value;

    setSearchTerm(newSearchTerm);  // ✅ Immediate UI update for responsiveness
    setCurrentPage(1);             // ✅ Reset pagination immediately
  };

  const handleStatusFilter = (event) => {
    const newStatusFilter = event.target.value;

    setStatusFilter(newStatusFilter);
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
      refunded: 'Refunded',
      cancelled: 'Cancelled',
      abandoned: 'Abandoned'
    };

    // More flexible transitions for admin control
    const transitions = {
      pending: ['paid', 'failed', 'cancelled', 'abandoned'],
      paid: ['pending', 'failed', 'refunded', 'cancelled'],
      failed: ['pending', 'paid', 'cancelled', 'abandoned'],
      refunded: ['pending', 'paid', 'failed'], // Allow reverting refunds
      cancelled: ['pending', 'paid', 'failed'],
      abandoned: ['pending', 'paid', 'failed']
    };

    return transitions[currentStatus]?.map(status => ({
      value: status,
      label: allStatuses[status],
      isDangerous: ['failed', 'refunded', 'cancelled'].includes(status),
      isReversible: ['pending', 'paid'].includes(status),
      description: getStatusDescription(status, currentStatus)
    })) || [];
  };

  // Helper function to provide context for status changes
  const getStatusDescription = (newStatus, currentStatus) => {
    const descriptions = {
      pending: 'Mark as awaiting payment',
      paid: 'Mark as successfully paid',
      failed: 'Mark payment as failed',
      refunded: 'Mark as refunded to customer',
      cancelled: 'Mark order as cancelled',
      abandoned: 'Mark as abandoned by customer'
    };

    if (currentStatus === 'paid' && ['failed', 'refunded', 'cancelled'].includes(newStatus)) {
      return descriptions[newStatus] + ' (will revoke access)';
    }
    
    if (['failed', 'cancelled', 'abandoned'].includes(currentStatus) && newStatus === 'paid') {
      return descriptions[newStatus] + ' (will grant access)';
    }

    return descriptions[newStatus];
  };

  const handleStatusClick = (customerId) => {
    setActiveDropdown(activeDropdown === customerId ? null : customerId);
  };

  const handleStatusChange = async (customer, newStatus) => {
    const statusInfo = getAvailableStatuses(customer.payment_status).find(s => s.value === newStatus);
    const isSignificantChange = statusInfo?.isDangerous || 
                               (customer.payment_status === 'paid' && newStatus !== 'paid') ||
                               (['failed', 'cancelled', 'abandoned'].includes(customer.payment_status) && newStatus === 'paid');

    if (isSignificantChange) {
      const impact = getStatusChangeImpact(customer.payment_status, newStatus);
      setConfirmModal({
        customer,
        newStatus,
        title: `Change Status: ${customer.payment_status} → ${newStatus}`,
        message: `Change ${customer.full_name}'s status from "${customer.payment_status}" to "${newStatus}"?`,
        description: statusInfo?.description || '',
        impact: impact,
        isReversible: statusInfo?.isReversible
      });
      setActiveDropdown(null);
    } else {
      try {
        await updateCustomerStatus(customer.customer_id, newStatus);
        setActiveDropdown(null);
      } catch (error) {
        console.error('Error updating status:', error);
      }
    }
  };

  // Helper function to describe the impact of status changes
  const getStatusChangeImpact = (fromStatus, toStatus) => {
    if (fromStatus === 'paid' && ['failed', 'refunded', 'cancelled'].includes(toStatus)) {
      return {
        type: 'warning',
        text: '⚠️ This will revoke customer access to the product'
      };
    }
    
    if (['failed', 'cancelled', 'abandoned'].includes(fromStatus) && toStatus === 'paid') {
      return {
        type: 'success', 
        text: '✅ This will grant customer access to the product'
      };
    }

    if (toStatus === 'refunded') {
      return {
        type: 'info',
        text: '💰 This indicates money was returned to customer'
      };
    }

    return {
      type: 'info',
      text: 'ℹ️ Status will be updated in the system'
    };
  };

  async function updateCustomerStatus(customerId, newStatus) {
    try {
      setUpdating(customerId);

      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          customer_id: customerId,
          payment_status: newStatus
        }),
      });

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error('Server returned invalid response format');
      }

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update status');
      }

      // Update the customer in the local state
      setCustomers(prev => prev.map(customer => customer.customer_id === customerId
        ? { ...customer, payment_status: newStatus, updated_at: new Date().toISOString() }
        : customer
      ));

      // Show success feedback
      console.log('Status updated successfully');

    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status: ' + error.message);
      throw error; // Re-throw to allow caller to handle
    } finally {
      setUpdating(null);
      // Only close confirm modal if it exists (successful updates)
      // Keep it open on errors so user can retry
    }
  }

  const handleConfirmStatusChange = async () => {
    if (confirmModal) {
      try {
        await updateCustomerStatus(confirmModal.customer.customer_id, confirmModal.newStatus);
        setConfirmModal(null); // Only close modal on success
      } catch (error) {
        // Error is already shown in updateCustomerStatus, keep modal open for retry
        console.error('Status change failed, keeping modal open for retry:', error);
      }
    }
  };

  const handleCancelStatusChange = () => {
    setConfirmModal(null);
  };

  // Email resend functionality
  const handleResendEmail = (customer) => {
    setResendModal({
      customer,
      orderNumber: customer.order_number
    });
  };

  const handleConfirmResendEmail = async () => {
    if (!resendModal) return;

    const { customer, orderNumber } = resendModal;
    
    try {
      setResendingEmail(customer.customer_id);
      setResendModal(null);

      const response = await fetch('/api/admin/resend-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          order_number: orderNumber
        })
      });

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error('Server returned invalid response format');
      }

      if (result.success) {
        alert(`Email resent successfully to ${customer.email_address}`);
        // Refresh the customers list to update email status
        fetchCustomers();
      } else {
        alert(`Failed to resend email: ${result.message}`);
      }
    } catch (error) {
      console.error('Resend email error:', error);
      alert('Failed to resend email. Please try again.');
    } finally {
      setResendingEmail(null);
    }
  };

  const handleCancelResendEmail = () => {
    setResendModal(null);
  };

  // Email status helper function
  const getEmailStatusDisplay = (emailStatus) => {
    if (!emailStatus || emailStatus.delivery_status === 'not_sent') {
      return { 
        icon: '📧', 
        text: 'Not Sent', 
        color: '#6b7280',
        detail: 'No email sent yet'
      };
    }

    const deliveryCount = emailStatus.delivery_count || 1;
    const lastSentDate = emailStatus.last_sent_at ? new Date(emailStatus.last_sent_at).toLocaleDateString() : '';

    switch (emailStatus.delivery_status) {
      case 'delivered':
        return { 
          icon: '✅', 
          text: 'Delivered', 
          color: '#10b981',
          detail: `Sent ${deliveryCount}x${lastSentDate ? ` (${lastSentDate})` : ''}`
        };
      case 'sent':
        return { 
          icon: '📤', 
          text: 'Sent', 
          color: '#3b82f6',
          detail: `Sent ${deliveryCount}x${lastSentDate ? ` (${lastSentDate})` : ''}`
        };
      case 'pending':
        return { 
          icon: '⏳', 
          text: 'Pending', 
          color: '#f59e0b',
          detail: 'Email queued for delivery'
        };
      case 'failed':
        return { 
          icon: '❌', 
          text: 'Failed', 
          color: '#ef4444',
          detail: `Failed ${deliveryCount}x${lastSentDate ? ` (last: ${lastSentDate})` : ''}`
        };
      case 'bounced':
        return { 
          icon: '🔄', 
          text: 'Bounced', 
          color: '#f97316',
          detail: 'Email bounced back'
        };
      case 'blocked':
        return { 
          icon: '🚫', 
          text: 'Blocked', 
          color: '#dc2626',
          detail: 'Email blocked by provider'
        };
      default:
        return { 
          icon: '❓', 
          text: 'Unknown', 
          color: '#9ca3af',
          detail: `Status: ${emailStatus.delivery_status || 'unknown'}`
        };
    }
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
        search: debouncedSearchTerm,  // ✅ Use debounced value for export consistency
        status: statusFilter
      });

      const response = await fetch(`/api/admin/customers?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const filename = `customers-${new Date().toISOString().split('T')[0]}.csv`;
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Export failed:', error);
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
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            className={`${styles.searchInput} ${isSearching ? styles.searchInputSearching : ''}`}
            value={searchTerm}
            onChange={handleSearch}
          />
          {isSearching && (
            <div className={styles.searchIndicator}>
              <div className={styles.searchSpinner}></div>
            </div>
          )}
        </div>
        
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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px', color: '#6b7280', fontSize: '14px', flexDirection: 'column', gap: '12px' }}>
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
                    <th className={styles.tableHeadCell}>Status</th>
                    <th className={styles.tableHeadCell}>Contact</th>
                    <th className={styles.tableHeadCell}>Email Status</th>
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
                      
                      {/* Payment Status */}
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
                              <div className={styles.buttonSpinner}></div>
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
                                  className={`${styles.statusOption} ${status.isDangerous ? styles.danger : (status.isReversible ? styles.success : styles.neutral)}`}
                                  onClick={() => handleStatusChange(customer, status.value)}
                                  title={status.description}
                                >
                                  <div className={styles.statusOptionMain}>{status.label}</div>
                                  <div className={styles.statusOptionDesc}>{status.description}</div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      {/* Contact (Phone) */}
                      <td className={styles.tableBodyCell}>
                        <div className={styles.phoneNumber}>{customer.phone_number}</div>
                      </td>
                      
                      {/* Email Status */}
                      <td className={styles.tableBodyCell}>
                        <div className={styles.emailStatusContainer}>
                          <div className={styles.emailStatusBadge}>
                            {(() => {
                              const emailStatus = getEmailStatusDisplay(customer.email_status);
                              return (
                                <span 
                                  className={styles.emailStatusIndicator}
                                  style={{ color: emailStatus.color }}
                                  title={emailStatus.detail}
                                >
                                  {emailStatus.icon} {emailStatus.text}
                                </span>
                              );
                            })()}
                          </div>
                          {customer.payment_status === 'paid' && (
                            <button
                              onClick={() => handleResendEmail(customer)}
                              disabled={resendingEmail === customer.customer_id}
                              className={styles.resendButton}
                              title="Resend email"
                            >
                              {resendingEmail === customer.customer_id ? (
                                <div className={styles.buttonSpinner}></div>
                              ) : (
                                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      
                      {/* Order Number */}
                      <td className={styles.tableBodyCell}>
                        <span className={styles.orderNumber}>{customer.latest_order_number || 'No orders'}</span>
                      </td>
                      
                      {/* Amount */}
                      <td className={styles.tableBodyCell}>
                        <span className={styles.amount}>
                          RM {customer.latest_order_total ? customer.latest_order_total.toFixed(2) : '0.00'}
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
                      <td className={styles.tableBodyCell} colSpan={8} style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>
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

      {/* Resend Email Modal */}
      {resendModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Resend Email</h3>
            <p className={styles.modalMessage}>
              Are you sure you want to resend the purchase confirmation email to{' '}
              <strong>{resendModal.customer.email_address}</strong>?
            </p>
            <div className={styles.modalButtons}>
              <button
                onClick={handleCancelResendEmail}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResendEmail}
                className={styles.confirmButton}
              >
                Resend Email
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}