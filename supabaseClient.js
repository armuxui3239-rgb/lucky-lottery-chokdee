/**
 * @file supabaseClient.js
 * @description World-class Supabase initialization with robust AJV validation.
 */

import { createClient } from '@supabase/supabase-js';
import Ajv from 'ajv';
import stringify from 'fast-json-stable-stringify';
import { Retrier } from '@humanwhocodes/retry';

// 1. Configuration - Use environment variables in production
const SUPABASE_URL = 'https://qitdcchnszvlvszzdajy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_O4f0nj6cxJjvBw4w30AgBw_gfhIsBdH';

// 2. Initialize Supabase Client
export const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 3. Initialize AJV for high-performance JSON Schema validation
const ajv = new Ajv({
    allErrors: true,
    useDefaults: true,
    coerceTypes: true
});

/**
 * Example Schema for a 'Lottery' or 'Lotto' entry based on folder name
 */
const lottoSchema = {
    type: 'object',
    properties: {
        ticket_number: { type: 'string', pattern: '^[0-9]{6}$' },
        amount: { type: 'integer', minimum: 1 },
        purchaseDate: { type: 'string', format: 'date-time' }
    },
    required: ['ticket_number', 'amount'],
    additionalProperties: false
};

const validateLotto = ajv.compile(lottoSchema);

/**
 * Securely insert data with pre-validation
 * @param {Object} data - The data to insert into Supabase
 */
export const safeInsertLotto = async (data) => {
    const retrier = new Retrier(error => error.message.includes('fetch'), { maxRetries: 3 });

    // Validation check before network request
    const isValid = validateLotto(data);

    if (!isValid) {
        console.error('Validation Errors:', validateLotto.errors);
        return { error: validateLotto.errors, data: null };
    }

    // Deterministic logging for debugging
    console.log(`Inserting deterministic payload: ${stringify(data)}`);

    // Use Retry for flaky network connections
    const payload = {
        ...data,
        status: 'pending',
        created_at: new Date().toISOString()
    };

    const result = await retrier.retry(async () => {
        const { data: res, error } = await _supabase.from('lotto_tickets').insert([payload]);
        if (error) throw error;
        return res;
    });

    return { error: null, data: result };
};

export default {
    _supabase,
    safeInsertLotto
};