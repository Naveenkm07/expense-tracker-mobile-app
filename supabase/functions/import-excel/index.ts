import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';

serve(async (req) => {
  try {
    // 1. Get the payload from the Webhook
    const payload = await req.json();
    const bucketId = payload.record.bucket_id;
    const fileName = payload.record.name; // This includes the userId folder

    if (bucketId !== 'excel_imports') {
      return new Response(JSON.stringify({ message: 'Ignored, not excel_imports bucket' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = fileName.split('/')[0];

    // 2. Initialize Supabase Admin Client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 3. Download the file
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('excel_imports')
      .download(fileName);

    if (downloadError) {
      throw downloadError;
    }

    // 4. Parse the Excel file
    const arrayBuffer = await fileData.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
    
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert sheet to JSON
    const rows = XLSX.utils.sheet_to_json(worksheet) as any[];

    // 5. Map and Insert rows into the 'expenses' table
    const expensesToInsert = rows.map((row: any) => {
      return {
        user_id: userId,
        amount: row.Amount || row.amount || 0,
        category: row.Category || row.category || 'Uncategorized',
        note: row.Note || row.note || '',
        date: row.Date || row.date ? new Date(row.Date || row.date).toISOString() : new Date().toISOString(),
        is_imported: true,
      };
    });

    if (expensesToInsert.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('expenses')
        .insert(expensesToInsert);

      if (insertError) {
        throw insertError;
      }
    }

    // 6. Delete the file after successful processing
    await supabaseClient.storage.from('excel_imports').remove([fileName]);

    return new Response(
      JSON.stringify({ message: 'Successfully imported ' + expensesToInsert.length + ' rows' }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
