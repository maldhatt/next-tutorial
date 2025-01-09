'use server'; // Server Actions
import { z } from 'zod'; // TypeScript-first validation library to ensure right data types passed to db
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache'; // to clear browser cache & trigger call to server
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(), // coerce string input to number
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});
 
const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
    //const rawFormData = {
    const { customerId, amount, status } = CreateInvoice.parse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });
    // Test it out:
    //console.log(rawFormData);
    const amountInCents = amount * 100; // store monetory values to eliminate JS floatin-point errors
    const date = new Date().toISOString().split('T')[0];
    
    try {
      // send to db
      await sql`
          INSERT INTO invoices (customer_id, amount, status, date)
          VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
      `;
    } catch (error) {
      return {
        message: 'Database Error: Failed to Create Invoice.',
      };
    }

    revalidatePath('/dashboard/invoices'); // fetch fresh data from server
    redirect('/dashboard/invoices'); // redirect user back, will catch error from catch block 
    }

    
export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
 
  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Create Invoice.'};
  }
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}


export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
  // No need to call redirect since action is getting called on /dashboard/invoices path
  // revalidatePath will trigger a new server request and re-render table
}