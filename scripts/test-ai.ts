
// Use explicit dotenv config if running standalone
import dotenv from 'dotenv';
dotenv.config();

import { chat } from '../src/lib/llm';

async function test() {
    console.log('--------------------------------------------------');
    console.log('🧪 TESTING AI CONNECTION & BROWSING TOOL');
    console.log('--------------------------------------------------');

    // Test 1: Simple Chat
    console.log('\n1. Testing OpenAI Chat (gpt-4o)...');
    try {
        const res = await chat({
            mode: 'startup',
            niche: 'marketing_web',
            language: 'en',
            history: [],
            userMessage: 'Please confirm verify your model version. Are you gpt-4o?',
        });
        console.log('✅ [SUCCESS] Response:', res.text);
        console.log('   Provider:', res.provider);
    } catch (error) {
        console.error('❌ [FAIL] Chat Error:', error);
        process.exit(1);
    }

    // Test 2: Browsing Tool
    console.log('\n2. Testing Web Browsing (visiting example.com)...');
    try {
        const res = await chat({
            mode: 'audit',
            niche: 'marketing_web',
            language: 'en',
            history: [],
            userMessage: 'Please browse https://example.com and tell me exactly what the H1 title says.',
        });
        console.log('✅ [SUCCESS] Response:', res.text);
        if (res.text.includes('Example Domain')) {
            console.log('   [Verification] Found expected content "Example Domain".');
        } else {
            console.warn('⚠️ [WARNING] Did not explicitly mention "Example Domain". Check output.');
        }
    } catch (error) {
        console.error('❌ [FAIL] Browsing Error:', error);
        process.exit(1);
    }

    console.log('\n--------------------------------------------------');
    console.log('🎉 ALL SYSTEMS GO.');
    console.log('--------------------------------------------------');
}

test();
