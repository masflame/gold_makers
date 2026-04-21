/**
 * POST /api/payfast/notify
 * PayFast ITN (Instant Transaction Notification) handler.
 *
 * Required server-side env vars (set in Vercel dashboard, NOT prefixed with VITE_):
 *   PAYFAST_PASSPHRASE   – same passphrase set in your PayFast merchant account
 *   SUPABASE_URL         – same value as VITE_PROJECT_URL
 *   SUPABASE_SERVICE_KEY – your Supabase service-role key (Settings → API)
 *
 * PayFast will POST here after every payment event (COMPLETE, FAILED, CANCELLED).
 * This is the authoritative source for order status — do not rely solely on the
 * frontend /payment/success page.
 */

import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function phpUrlencode(str) {
  return encodeURIComponent(str)
    .replace(/%20/g, '+')
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/~/g, '%7E');
}

function buildSignatureString(body, passphrase = '') {
  const pairs = Object.entries(body)
    .filter(([k, v]) => k !== 'signature' && v !== undefined && v !== null && String(v).trim() !== '')
    .map(([k, v]) => `${phpUrlencode(k)}=${phpUrlencode(String(v).trim())}`)
    .join('&');

  return passphrase ? `${pairs}&passphrase=${phpUrlencode(passphrase.trim())}` : pairs;
}

function md5hex(s) {
  return crypto.createHash('md5').update(s).digest('hex');
}

/* ── Map PayFast payment_status → Orders.status ─────────────────────────── */
function resolveStatus(pfStatus) {
  switch (pfStatus) {
    case 'COMPLETE':   return 'paid';
    case 'FAILED':     return 'failed';
    case 'CANCELLED':  return 'cancelled';
    default:           return pfStatus?.toLowerCase() ?? 'unknown';
  }
}

/* ── Handler ─────────────────────────────────────────────────────────────── */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const body = req.body ?? {};

    /* 1. Validate signature ------------------------------------------------ */
    const passphrase = process.env.PAYFAST_PASSPHRASE ?? '';
    const expectedSignature = md5hex(buildSignatureString(body, passphrase));
    const receivedSignature = body.signature ?? '';

    if (!receivedSignature || expectedSignature !== receivedSignature) {
      console.error('[PayFast ITN] Signature mismatch:', {
        expected: expectedSignature,
        received: receivedSignature,
      });
      return res.status(400).send('Invalid signature');
    }

    /* 2. Extract fields from ITN payload ----------------------------------- */
    const {
      payment_status,   // COMPLETE | FAILED | CANCELLED
      m_payment_id,     // our internal GM-... order id
      pf_payment_id,    // PayFast's own transaction reference
      amount_gross,     // amount charged by PayFast (string, e.g. "1500.00")
      email_address,    // buyer email echoed back by PayFast
    } = body;

    if (!m_payment_id) {
      console.error('[PayFast ITN] Missing m_payment_id');
      return res.status(400).send('Missing m_payment_id');
    }

    const newStatus = resolveStatus(payment_status);

    /* 3. Update Orders table in Supabase ----------------------------------- */
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[PayFast ITN] Supabase env vars not set');
      // Still return 200 so PayFast doesn't keep retrying; log the event
      return res.status(200).send('OK');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build update payload using only columns that exist in the Orders table
    const updatePayload = {
      status: newStatus,
    };

    // Optionally store PayFast's own transaction id if you add a pf_payment_id
    // column to your Orders table later. Safe to include now — Supabase will
    // ignore unknown columns if the column does not exist.
    if (pf_payment_id) {
      updatePayload.pf_payment_id = pf_payment_id;
    }

    const { error } = await supabase
      .from('Orders')
      .update(updatePayload)
      .eq('order_id', m_payment_id);

    if (error) {
      console.error('[PayFast ITN] Supabase update error:', error);
      // Return 200 to prevent PayFast from retrying endlessly;
      // the error is logged and can be investigated manually.
      return res.status(200).send('OK');
    }

    console.log(`[PayFast ITN] Order ${m_payment_id} → ${newStatus} (pf: ${pf_payment_id})`);
    return res.status(200).send('OK');

  } catch (err) {
    console.error('[PayFast ITN] Unhandled error:', err);
    return res.status(500).send('Server error');
  }
}
