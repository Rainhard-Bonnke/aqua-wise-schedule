import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
 
  try {
    // Log the received request body for debugging
    const body = await req.json();
    console.log("Received body:", body);

    const { to, message } = body;

    // Validate input
    if (!to || typeof to !== "string" || !to.trim()) {
      throw new Error("Missing or invalid 'to' (recipient phone number).")
    }
    if (!message || typeof message !== "string" || !message.trim()) {
      throw new Error("Missing or invalid 'message'.")
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const fromPhone = Deno.env.get('TWILIO_PHONE_NUMBER')

    if (!accountSid || !authToken || !fromPhone) {
      throw new Error('Twilio credentials are not set in environment variables.')
    }
    
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const res = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(accountSid + ':' + authToken),
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: new URLSearchParams({
        To: to,
        From: fromPhone,
        Body: message
      })
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Twilio API error:', data);
      throw new Error(`Twilio error: ${data.message}`);
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})