import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import Table, { Tr, Td } from '../ui/Table'
import Badge from '../ui/Badge'
import EmptyState from '../ui/EmptyState'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { Receipt } from 'lucide-react'

export default function TransactionTable({ transactions, basePath = '/customer/transactions', showCustomer = false }) {
  if (!transactions.length) {
    return <EmptyState icon={Receipt} title="No transactions found" description="Transactions you create will show up here." />
  }

  const columns = [
    'Reference',
    ...(showCustomer ? ['Customer'] : []),
    'Product',
    'Amount',
    'Date',
    'Status',
    '',
  ]

  return (
    <Table columns={columns}>
      {transactions.map((t) => (
        <Tr key={t.id}>
          <Td className="font-semibold text-navy-800">{t.reference}</Td>
          {showCustomer && <Td>{t.customerName}</Td>}
          <Td>{t.productName}</Td>
          <Td className="font-semibold">{formatCurrency(t.amount)}</Td>
          <Td>{formatDate(t.date)}</Td>
          <Td>
            <Badge status={t.status}>{t.status}</Badge>
          </Td>
          <Td>
            <Link
              to={`${basePath}/${t.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              <Eye size={14} /> View
            </Link>
          </Td>
        </Tr>
      ))}
    </Table>
  )
}
