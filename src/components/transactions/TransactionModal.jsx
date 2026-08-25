import React from 'react';
import { useExpense } from '../../context/ExpenseContext';
import Modal from '../common/Modal';
import TransactionForm from './TransactionForm';

export default function TransactionModal() {
  const { modalState, closeModal } = useExpense();
  const { isOpen, mode, data } = modalState;

  const isEditing = mode === 'EDIT';
  const initialType = mode === 'ADD_INCOME' ? 'INCOME' : 'EXPENSE';

  const getTitle = () => {
    if (isEditing) return `Edit ${data?.type === 'INCOME' ? 'Income' : 'Expense'}`;
    if (mode === 'ADD_INCOME') return 'Add Income';
    return 'Add Expense';
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title={getTitle()} maxWidth="560px">
      <TransactionForm
        initialData={data}
        initialType={initialType}
        onSuccess={closeModal}
        onCancel={closeModal}
        isModal={true}
      />
    </Modal>
  );
}
