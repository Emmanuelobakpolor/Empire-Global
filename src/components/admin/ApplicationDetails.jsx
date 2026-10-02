import { FileText, ShieldCheck, Users, Landmark, ShoppingBag } from 'lucide-react'
import Card from '../ui/Card'
import { DetailList, documentRows, guarantorRows, nextOfKinRows, itemRows } from '../customer/ApplicationForms'

function Section({ icon: Icon, title, children }) {
  return (
    <Card className="mb-6">
      <h3 className="text-sm font-bold text-navy-800 mb-4 flex items-center gap-2">
        <Icon size={16} className="text-navy-400" /> {title}
      </h3>
      {children}
    </Card>
  )
}

// Customer-supplied details attached to a transaction: loan / hire-purchase documents and
// guarantor, savings / investment next of kin, and the account the customer paid into.
export default function ApplicationDetails({ transaction }) {
  const { application, nextOfKin, receipt } = transaction
  const paidTo = receipt?.paidTo

  return (
    <>
      {application && (
        <>
          {application.item && (
            <Section icon={ShoppingBag} title="Hire-Purchase Item">
              <DetailList rows={itemRows(application.item)} />
            </Section>
          )}
          <Section icon={FileText} title="Application Documents">
            <DetailList rows={documentRows(application.documents)} />
          </Section>
          <Section icon={ShieldCheck} title="Guarantor">
            <DetailList rows={guarantorRows(application.guarantor)} />
          </Section>
        </>
      )}
      {nextOfKin && (
        <Section icon={Users} title="Next of Kin">
          <DetailList rows={nextOfKinRows(nextOfKin)} />
        </Section>
      )}
      {paidTo && (
        <Section icon={Landmark} title="Paid Into">
          <DetailList
            rows={[
              { label: 'Bank', value: paidTo.bankName },
              { label: 'Account Name', value: paidTo.accountName },
              { label: 'Account Number', value: paidTo.accountNumber },
            ]}
          />
        </Section>
      )}
    </>
  )
}
