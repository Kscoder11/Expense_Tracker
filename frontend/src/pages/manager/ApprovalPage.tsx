import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Calendar, 
  DollarSign, 
  User, 
  FileText,
  Receipt,
  Clock,
  AlertCircle
} from 'lucide-react';
import { PremiumButton } from '../../components/ui/PremiumButton';
import { FloatingLabelInput } from '../../components/ui/FloatingLabelInput';
import { expensesAPI } from '../../lib/api';
import { Expense } from '../../types';
import toast from 'react-hot-toast';

export const ApprovalPage: React.FC = () => {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [comments, setComments] = useState('');
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch pending expenses for approval
  const { data: pendingExpenses, isLoading } = useQuery(
    'pending-expenses',
    () => expensesAPI.getPendingApprovals(),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  // Approve expense mutation
  const approveMutation = useMutation(
    ({ expenseId, comments }: { expenseId: string; comments?: string }) =>
      expensesAPI.approveExpense(expenseId, comments),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pending-expenses');
        toast.success('Expense approved successfully!');
        setShowModal(false);
        setSelectedExpense(null);
        setComments('');
      },
      onError: () => {
        toast.error('Failed to approve expense');
      },
    }
  );

  // Reject expense mutation
  const rejectMutation = useMutation(
    ({ expenseId, comments }: { expenseId: string; comments: string }) =>
      expensesAPI.rejectExpense(expenseId, comments),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pending-expenses');
        toast.success('Expense rejected');
        setShowModal(false);
        setSelectedExpense(null);
        setComments('');
      },
      onError: () => {
        toast.error('Failed to reject expense');
      },
    }
  );

  const handleApprove = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowModal(true);
  };

  const handleReject = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowModal(true);
  };

  const confirmApprove = () => {
    if (selectedExpense) {
      approveMutation.mutate({
        expenseId: selectedExpense.id,
        comments: comments.trim() || undefined,
      });
    }
  };

  const confirmReject = () => {
    if (selectedExpense && comments.trim()) {
      rejectMutation.mutate({
        expenseId: selectedExpense.id,
        comments: comments.trim(),
      });
    } else {
      toast.error('Please provide a reason for rejection');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border border-orange-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Expense Approvals</h1>
          <p className="text-gray-600 mt-2">
            Review and approve team expense submissions
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-200/50">
            <span className="text-sm text-gray-600">Pending: </span>
            <span className="font-bold text-orange-600">
              {pendingExpenses?.filter(e => e.status === 'PENDING').length || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Pending Expenses Grid */}
      {pendingExpenses && pendingExpenses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingExpenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {expense.submittedBy?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {expense.submittedBy?.fullName || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {expense.submittedBy?.email}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(expense.status)}
                </div>

                {/* Amount */}
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">
                    ${expense.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">{expense.currency}</p>
                  
                  {/* Currency conversion info */}
                  {expense.convertedAmount && expense.baseCurrency && expense.currency !== expense.baseCurrency && (
                    <p className="text-sm text-blue-600 mt-1">
                      ≈ ${expense.convertedAmount.toFixed(2)} {expense.baseCurrency}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="w-4 h-4 mr-2" />
                    <span className="font-medium">Category:</span>
                    <span className="ml-1 capitalize">{expense.category}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="font-medium">Date:</span>
                    <span className="ml-1">
                      {new Date(expense.expenseDate).toLocaleDateString()}
                    </span>
                  </div>

                  {expense.vendor && (
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      <span className="font-medium">Vendor:</span>
                      <span className="ml-1">{expense.vendor}</span>
                    </div>
                  )}

                  {expense.ocrExtracted && (
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span className="font-medium">OCR Extracted</span>
                      {expense.ocrConfidence && (
                        <span className="ml-1">
                          ({Math.round(expense.ocrConfidence * 100)}% confidence)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {expense.description}
                  </p>
                </div>

                {/* Receipt indicator */}
                {expense.receiptUrl && (
                  <div className="flex items-center text-sm text-blue-600">
                    <Receipt className="w-4 h-4 mr-2" />
                    <span>Receipt attached</span>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="p-6 pt-0 flex space-x-3">
                <PremiumButton
                  variant="success"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleApprove(expense)}
                  icon={<CheckCircle className="w-4 h-4" />}
                >
                  Approve
                </PremiumButton>
                
                <PremiumButton
                  variant="danger"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleReject(expense)}
                  icon={<XCircle className="w-4 h-4" />}
                >
                  Reject
                </PremiumButton>
                
                <PremiumButton
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedExpense(expense);
                    setShowModal(true);
                  }}
                  icon={<Eye className="w-4 h-4" />}
                >
                  View
                </PremiumButton>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Pending Approvals
          </h3>
          <p className="text-gray-600">
            All expenses have been reviewed. Great job!
          </p>
        </div>
      )}

      {/* Approval/Rejection Modal */}
      {showModal && selectedExpense && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Review Expense
              </h3>
              <p className="text-gray-600 mt-1">
                Submitted by {selectedExpense.submittedBy?.fullName}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Expense Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <p className="text-2xl font-bold text-gray-900">
                    ${selectedExpense.amount.toFixed(2)} {selectedExpense.currency}
                  </p>
                  {selectedExpense.convertedAmount && selectedExpense.baseCurrency && (
                    <p className="text-sm text-blue-600">
                      ≈ ${selectedExpense.convertedAmount.toFixed(2)} {selectedExpense.baseCurrency}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="text-lg font-medium text-gray-900 capitalize">
                    {selectedExpense.category}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="text-lg font-medium text-gray-900">
                    {new Date(selectedExpense.expenseDate).toLocaleDateString()}
                  </p>
                </div>
                
                {selectedExpense.vendor && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Vendor</label>
                    <p className="text-lg font-medium text-gray-900">
                      {selectedExpense.vendor}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-900 mt-1">{selectedExpense.description}</p>
              </div>

              {/* OCR Info */}
              {selectedExpense.ocrExtracted && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-800">OCR Extracted Data</span>
                    {selectedExpense.ocrConfidence && (
                      <span className="ml-2 text-green-700">
                        ({Math.round(selectedExpense.ocrConfidence * 100)}% confidence)
                      </span>
                    )}
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    This expense data was automatically extracted from the receipt image.
                  </p>
                </div>
              )}

              {/* Receipt */}
              {selectedExpense.receiptUrl && (
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Receipt</label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <img
                      src={selectedExpense.receiptUrl}
                      alt="Receipt"
                      className="max-w-full h-auto rounded-lg shadow-md"
                    />
                  </div>
                </div>
              )}

              {/* Comments */}
              <div>
                <FloatingLabelInput
                  label="Comments (optional for approval, required for rejection)"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add any comments about this expense..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex space-x-4">
              <PremiumButton
                variant="secondary"
                onClick={() => {
                  setShowModal(false);
                  setSelectedExpense(null);
                  setComments('');
                }}
                className="flex-1"
              >
                Cancel
              </PremiumButton>
              
              <PremiumButton
                variant="danger"
                onClick={confirmReject}
                loading={rejectMutation.isLoading}
                className="flex-1"
                icon={<XCircle className="w-4 h-4" />}
              >
                Reject
              </PremiumButton>
              
              <PremiumButton
                variant="success"
                onClick={confirmApprove}
                loading={approveMutation.isLoading}
                className="flex-1"
                icon={<CheckCircle className="w-4 h-4" />}
              >
                Approve
              </PremiumButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};