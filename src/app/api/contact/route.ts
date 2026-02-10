import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { z } from 'zod';

const ContactSchema = z.object({
    firstName: z.string().min(2),
    email: z.string().email(),
    companyName: z.string().optional(),
    projectType: z.enum(['audit', 'startup', 'portfolio', 'other']),
    message: z.string().min(10),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validated = ContactSchema.parse(body);

        const supabase = createServiceClient();

        // Insert into leads table
        const { data, error } = await supabase
            .from('leads')
            .insert({
                first_name: validated.firstName,
                email: validated.email,
                sector: validated.projectType, // We'll use sector to store the project type for contact leads
                notes: `Company: ${validated.companyName || 'N/A'}\n\nMessage:\n${validated.message}`,
            })
            .select()
            .single();

        if (error) {
            console.error('[API] Failed to save contact lead:', error);
            return NextResponse.json({ error: 'Failed to save contact request' }, { status: 500 });
        }

        return NextResponse.json({ success: true, leadId: data.id });
    } catch (error) {
        console.error('[API] Contact submission error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
