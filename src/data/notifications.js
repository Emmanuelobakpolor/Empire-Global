export const initialNotifications = [
  {
    id: 'n1',
    title: 'Payment Approved',
    message: 'Your Hire-Purchase Electronics payment of ₦45,000 (EMP-HP-20260815-045) has been approved.',
    date: '2026-08-16T10:05:00',
    read: false,
    type: 'success',
  },
  {
    id: 'n2',
    title: 'Payment Rejected',
    message: 'Your Thrift Gold Plan payment (EMP-THR-20260801-018) was rejected. Reason: Receipt image was unclear.',
    date: '2026-08-02T09:10:00',
    read: false,
    type: 'error',
  },
  {
    id: 'n3',
    title: 'Receipt Uploaded',
    message: 'We received your receipt for EMP-INV-20260818-102. It is now under review.',
    date: '2026-08-18T09:30:00',
    read: true,
    type: 'info',
  },
  {
    id: 'n4',
    title: 'Welcome to Empire Global',
    message: 'Your account has been created successfully. Explore our Savings, Investment and Loan products.',
    date: '2024-11-02T09:00:00',
    read: true,
    type: 'info',
  },
]
