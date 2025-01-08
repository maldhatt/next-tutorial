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

export async function createInvoice(formData: FormData) {
    //const rawFormData = {
    const { customerId, amount, status } = CreateInvoice.parse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });
    // Test it out:
    console.log(rawFormData);
    const amountInCents = amount * 100; // store monetory values to eliminate JS floatin-point errors
    const date = new Date().toISOString().split('T')[0];
    
    // send to db
    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;

    revalidatePath('/dashboard/invoices'); // fetch fresh data from server
    redirect('/dashboard/invoices'); // redirect user back 
    }