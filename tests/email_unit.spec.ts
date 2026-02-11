import { test, expect, mock, beforeEach, afterEach, describe } from 'bun:test';

// Mocking 'resend' module
mock.module("resend", () => {
  return {
    Resend: class {
        emails = {
            send: mock(() => Promise.resolve({ data: { id: 'test-email-id' }, error: null }))
        }
    },
  };
});

// Mocking 'pdfkit' module to bypass missing dependency
mock.module("pdfkit", () => {
    return {
        default: class {
            constructor() {}
            on(event, cb) {
                if (event === 'end') this._onEnd = cb;
                if (event === 'data') {
                    // Using setImmediate or setTimeout to simulate async data stream
                    setTimeout(() => cb(Buffer.from('mock-pdf-chunk')), 0);
                }
                return this;
            }
            fontSize() { return this; }
            fillColor() { return this; }
            text() { return this; }
            moveDown() { return this; }
            strokeColor() { return this; }
            lineWidth() { return this; }
            moveTo() { return this; }
            lineTo() { return this; }
            stroke() { return this; }
            addPage() { return this; }
            roundedRect() { return this; }
            fill() { return this; }
            end() {
                if (this._onEnd) this._onEnd();
                return this;
            }
            _onEnd = null;
        }
    };
});

// Mocking the local pdf module to avoid complex pdfkit mocking side effects
// Using multiple possible path formats for better compatibility
const mockPdf = {
    generatePdf: mock(() => Promise.resolve(Buffer.from('mock-pdf-content')))
};
mock.module("../src/lib/pdf", () => mockPdf);
mock.module("./pdf", () => mockPdf);

import { sendReportEmail } from '../src/lib/email';

const mockReport = {
    mode: 'startup',
    language: 'fr',
    sector: 'test-sector',
    summary: 'test-summary',
    sections: [],
    cta: 'test-cta'
} as any;

describe('sendReportEmail', () => {
    const originalEnv = { ...process.env };

    afterEach(() => {
        process.env.RESEND_API_KEY = originalEnv.RESEND_API_KEY;
    });

    test('throws error when RESEND_API_KEY is missing', async () => {
        delete process.env.RESEND_API_KEY;

        await expect(sendReportEmail({
            to: 'test@example.com',
            report: mockReport,
            sessionId: 'test-session'
        })).rejects.toThrow('Missing RESEND_API_KEY');
    });

    test('returns an ID when RESEND_API_KEY is present', async () => {
        process.env.RESEND_API_KEY = 're_test_123';

        const result = await sendReportEmail({
            to: 'test@example.com',
            report: mockReport,
            sessionId: 'test-session'
        });

        expect(result).toEqual({ id: 'test-email-id' });
    });
});
