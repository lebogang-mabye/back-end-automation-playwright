import { test, expect } from '@playwright/test';
import { z } from 'zod';

const countrySchema = z.object({
  name: z.object({
    common: z.string(),
    official: z.string(),
    nativeName: z.record(
      z.object({
        official: z.string(),
        common: z.string(),
      })
    ).optional(),
  }),
});

test('Ensure Correct API Endpoint Schema Configuration', async ({ request }) => {
  const response = await request.get('https://restcountries.com/v3.1/all?fields=name');
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  
  const result = z.array(countrySchema).safeParse(data);
  console.log("Schema Validation Result:", result.success);
  
  expect(result.success).toBeTruthy();
});

test('Confirm there are 195 countries', async ({ request }) => {
  const response = await request.get('https://restcountries.com/v3.1/all?fields=name');
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  
  console.log(`Total countries returned: ${data.length}`);
  expect(data.length).toBe(195);
});

test('Validate SASL in South Africa official languages', async ({ request }) => {
  const response = await request.get('https://restcountries.com/v3.1/name/southafrica');
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  
  const languages = data[0]?.languages || {};
  const hasSASL = Object.values(languages).includes("South African Sign Language");
  console.log(`SASL present: ${hasSASL}`);
  
  expect(hasSASL).toBeTruthy();
});
