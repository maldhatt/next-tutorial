'use server'; // Server Actions
import { z } from 'zod'; // TypeScript-first validation library to ensure right data types passed to db
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache'; // to clear browser cache & trigger call to server
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.', // Form Validation message
  }),
  amount: z.coerce
    .number() // coerce string input to number
    .gt(0, { message: 'Please enter an amount greater than $0.' }), // Form Validation message
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.', // Form Validation message
  }),
  date: z.string(),
});
 
const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// State value for form validation, passed from useActionState hook
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
    //const rawFormData = {
    const validatedFields = CreateInvoice.safeParse({ // safeParse returns success or error
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });
    // Test it out:
    //console.log(rawFormData);

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create Invoice.',
      };
    }

    // Prepare data for insertion into the database
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100; // store monetory values to eliminate JS floatin-point errors
    const date = new Date().toISOString().split('T')[0];
    
    // Send to db
    try {
      await sql`
          INSERT INTO invoices (customer_id, amount, status, date)
          VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
      `;
    } catch (error) {
      return {
        message: 'Database Error: Failed to Create Invoice.',
      };
    }

    // Revalidate the cache for the invoices page and redirect the user.
    revalidatePath('/dashboard/invoices'); // fetch fresh data from server
    redirect('/dashboard/invoices'); // redirect user back, will catch error from catch block 
    }

    
export async function updateInvoice(
  id: string,
  prevState: State, 
  formData: FormData,
  ) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }
 
  const { customerId, amount, status } = validatedFields.data;
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
    //return { message: 'Deleted Invoice.' };
  } catch (error) {
    // return { message: 'Database Error: Failed to Delete Invoice.' };
    throw new Error('Database Error: Failed to Delete Invoice.');
  }
  // No need to call redirect since action is getting called on /dashboard/invoices path
  // revalidatePath will trigger a new server request and re-render table
}