import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { expenses, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { encryptUserKey } from '@/lib/crypto';
import { formatAmount } from '@/utils/format-data.utils';

// DTO (Data Transfer Object): Contrato de lo que esperamos recibir del móvil
interface CreateExpenseDTO {
  amount: number | string;
  concept: string;
  categoryName: string;
  userKey: string; /// User API Key
  expenseDate: string;
  isRecurring?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateExpenseDTO = (await req.json()) as CreateExpenseDTO;

    if (!body.amount || !body.concept || !body.categoryName || !body.userKey || !body.expenseDate) {
      return NextResponse.json({ error: 'Missing input in body' }, { status: 400 });
    }

    const encryptedUserKey = encryptUserKey(body.userKey);
    
    const user = await db.query.users.findFirst({
      where: eq(users.userKey, encryptedUserKey),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const amountFormatted = formatAmount(body.amount);

    await db.insert(expenses).values({
      amount: amountFormatted,
      concept: body.concept,
      categoryId: body.categoryName,
      userId: user.id,
      date: body.expenseDate ? new Date(body.expenseDate) : new Date(),
      expenseDate: body.expenseDate ? body.expenseDate : new Date().toISOString().split('T')[0],
      isRecurring: body.isRecurring || false,
    });

    return NextResponse.json({ success: true, message: 'Expense saved' }, { status: 201 });

  } catch (error) {
    console.error('Error saving expense:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}