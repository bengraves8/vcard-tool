import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface VCardRecord {
  shortcode: string;
  first_name: string;
  last_name: string;
  organization?: string;
  title?: string;
  phone?: string;
  email?: string;
  website?: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
  address_country?: string;
  linkedin_url?: string;
  twitter_url?: string;
  photo_url?: string;
}

function generateVCardString(vcard: VCardRecord): string {
  const lines: string[] = [];

  lines.push('BEGIN:VCARD');
  lines.push('VERSION:3.0');
  lines.push(`FN:${vcard.first_name} ${vcard.last_name}`);
  lines.push(`N:${vcard.last_name};${vcard.first_name};;;`);

  if (vcard.organization) {
    lines.push(`ORG:${vcard.organization}`);
  }

  if (vcard.title) {
    lines.push(`TITLE:${vcard.title}`);
  }

  if (vcard.phone) {
    lines.push(`TEL;TYPE=CELL:${vcard.phone}`);
  }

  if (vcard.email) {
    lines.push(`EMAIL:${vcard.email}`);
  }

  if (vcard.website) {
    lines.push(`URL:${vcard.website}`);
  }

  if (vcard.linkedin_url) {
    lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${vcard.linkedin_url}`);
  }

  if (vcard.twitter_url) {
    lines.push(`X-SOCIALPROFILE;TYPE=twitter:${vcard.twitter_url}`);
  }

  if (vcard.address_street || vcard.address_city || vcard.address_state || vcard.address_zip || vcard.address_country) {
    lines.push(`ADR;TYPE=WORK:;;${vcard.address_street || ''};${vcard.address_city || ''};${vcard.address_state || ''};${vcard.address_zip || ''};${vcard.address_country || ''}`);
  }

  if (vcard.photo_url && vcard.photo_url.startsWith('data:image')) {
    const match = vcard.photo_url.match(/^data:image\/(\w+);base64,(.+)$/);
    if (match) {
      lines.push(`PHOTO;ENCODING=b;TYPE=${match[1].toUpperCase()}:${match[2]}`);
    }
  }

  lines.push('END:VCARD');
  lines.push('');

  return lines.join('\r\n');
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    const url = new URL(req.url);
    const shortcode = url.searchParams.get('shortcode');

    if (!shortcode) {
      return new Response(
        JSON.stringify({ error: 'Missing shortcode parameter' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: vcard, error } = await supabase
      .from('vcards')
      .select('*')
      .eq('shortcode', shortcode)
      .maybeSingle();

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Database error', details: error.message }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (!vcard) {
      return new Response(
        JSON.stringify({ error: 'vCard not found' }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const vcardString = generateVCardString(vcard as VCardRecord);

    return new Response(vcardString, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/vcard; charset=utf-8',
        'Content-Disposition': `attachment; filename="${vcard.first_name}_${vcard.last_name}.vcf"`,
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
