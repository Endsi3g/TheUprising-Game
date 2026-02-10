import { test, expect } from '@playwright/test';

test('generate-pdf returns a PDF payload', async ({ request }) => {
  const response = await request.post('/api/game/generate-pdf', {
    data: {
      title: 'Rapport de Test',
      report: {
        mode: 'startup',
        language: 'fr',
        sector: 'marketing_web',
        summary: 'Synthese courte pour valider la generation PDF.',
        sections: [
          {
            title: 'Section Test',
            bullets: ['Point A', 'Point B', 'Point C'],
          },
        ],
        cta: 'Planifier un appel.',
      },
    },
  });

  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type']).toContain('application/pdf');

  const body = await response.body();
  expect(body.byteLength).toBeGreaterThan(500);
});
