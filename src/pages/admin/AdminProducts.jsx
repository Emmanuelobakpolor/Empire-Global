import { useState } from 'react'
import { Plus, Pencil, Trash2, Power } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Table, { Tr, Td } from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import ProductFormModal from '../../components/admin/ProductFormModal'
import { useDataStore } from '../../context/DataStoreContext'
import { useToast } from '../../context/ToastContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { productTypes } from '../../data/products'

export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct, toggleProductStatus } = useDataStore()
  const { showToast } = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const openAdd = () => {
    setEditingProduct(null)
    setModalOpen(true)
  }

  const openEdit = (product) => {
    setEditingProduct(product)
    setModalOpen(true)
  }

  // Returns the result so the form can show the server's field errors
  const handleSave = async (data) => {
    const result = editingProduct ? await updateProduct(editingProduct.id, data) : await addProduct(data)
    if (result.success) {
      showToast(editingProduct ? 'Product updated successfully.' : 'Product added successfully.', 'success')
      setModalOpen(false)
    } else if (!Object.keys(result.fieldErrors).length) {
      showToast(result.error, 'error')
    }
    return result
  }

  const handleDelete = async () => {
    setDeleting(true)
    const result = await deleteProduct(deleteTarget.id)
    setDeleting(false)
    // Products customers have used can only be disabled
    if (result.success) showToast('Product deleted.', 'success')
    else showToast(result.error, 'error')
    setDeleteTarget(null)
  }

  const handleToggle = async (id) => {
    const result = await toggleProductStatus(id)
    if (!result.success) showToast(result.error, 'error')
  }

  const typeLabel = (type) => productTypes.find((t) => t.value === type)?.label || type

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Manage the financial products available to customers."
        actions={<Button icon={Plus} onClick={openAdd}>Add Product</Button>}
      />

      <Table columns={['Product', 'Type', 'Minimum Amount', 'Maximum Amount', 'Status', 'Actions']}>
        {products.map((p) => (
          <Tr key={p.id}>
            <Td>
              <p className="font-semibold text-navy-900">{p.name}</p>
              {p.category && <p className="text-[11px] text-navy-400">{p.category}</p>}
            </Td>
            <Td className="capitalize">{typeLabel(p.type)}</Td>
            <Td>{formatCurrency(p.minAmount)}</Td>
            <Td>{formatCurrency(p.maxAmount)}</Td>
            <Td><Badge status={p.status === 'active' ? 'active' : 'disabled'}>{p.status}</Badge></Td>
            <Td>
              <div className="flex items-center gap-1.5">
                <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-navy-400 hover:text-navy-800 hover:bg-navy-50" title="Edit">
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleToggle(p.id)}
                  className={`p-1.5 rounded-lg hover:bg-navy-50 ${p.status === 'active' ? 'text-amber-500' : 'text-emerald-500'}`}
                  title={p.status === 'active' ? 'Disable' : 'Enable'}
                >
                  <Power size={16} />
                </button>
                <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </Td>
          </Tr>
        ))}
      </Table>

      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingProduct}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this product?"
        description={`"${deleteTarget?.name}" will be permanently removed from the product list.`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  )
}
