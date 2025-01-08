import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';
 
// export default async function Page(props: { params: Promise<{ id: string }> }) {
export default async function Page({ params }: { params: { id: string } }) {
    //const params = await props.params;
    const id = params.id; // read invoice id
    const [invoice, customers] = await Promise.all([
        fetchInvoiceById(id),
        fetchCustomers(),
    ]);
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      {/* Load current invoice data into edit form */}
      <Form invoice={invoice} customers={customers} />
    </main>
  );
}