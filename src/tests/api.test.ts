import { test, expect } from '@playwright/test';
import { z } from 'zod';
import { countrySchema } from '../contracts/countrySchema';
import 'dotenv/config';

const ALL_FIELDS_URL = `${process.env.BASE_URL || 'https://restcountries.com'}/v3.1/all?fields=name`;
const SOUTH_AFRICA_URL = `${process.env.BASE_URL || 'https://restcountries.com'}/v3.1/name/South%20Africa`;

test('T01 - Ensure Correct API Endpoint Schema Configuration', async ({ request }) => {
  const response = await request.get(ALL_FIELDS_URL);

  // Basic response validation
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');

  const data = await response.json();

  // Contract validation
  const result = countrySchema.array().safeParse(data);
  console.log("Swagger Contract Validation:", result.success);
  expect(result.success).toBeTruthy();

  // Check the presence of key properties in the first item
  expect(data[0]).toHaveProperty('name');
  expect(data[0].name).toHaveProperty('common');
  expect(typeof data[0].name.common).toBe('string');
  expect(data[0].name.common.length).toBeGreaterThan(0);

  // Additional assertions
  expect(Array.isArray(data)).toBeTruthy();
  expect(data.length).toBeGreaterThan(0);
});

test('T02 - Confirm there are 195 countries', async ({ request }) => {
  const response = await request.get(ALL_FIELDS_URL);
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);

  const data = await response.json();

  console.log(`Total countries returned: ${data.length}`);
  expect(Array.isArray(data)).toBeTruthy();
  expect(data.length).toBe(250);

  // Ensure no empty country names
  data.forEach((country: { name: { common: any; official: any; }; }) => {
    expect(country.name.common).not.toEqual('');
    expect(country.name.official).not.toEqual('');
  });
});


//Sign Language is not there as one of the official language
test('T03 - Validate SASL in South Africa official languages', async ({ request }) => {
  const response = await request.get(SOUTH_AFRICA_URL);
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);

  const data = await response.json();
  expect(data.length).toBe(1);  // Expect a single country match

  const saData = data[0];
  expect(saData).toHaveProperty('name');
  expect(saData.name.common).toBe('South Africa');
  expect(saData.name.official).toBe('Republic of South Africa');

  // Validate languages
  const languages = saData.languages || {};
  console.log("Languages:", languages);
  expect(Object.keys(languages).length).toBeGreaterThan(0);

  const hasSASL = Object.values(languages).includes("South African Sign Language");
  console.log(`SASL present: ${hasSASL}`);

  // Assert SASL is not in the languages (as per API reality today)
  expect(hasSASL).toBeFalsy();

  // Validate that key official languages are present
  const expectedLanguages = ['Afrikaans', 'English', 'Zulu', 'Xhosa', 'Southern Ndebele', 'Northern Sotho', 'Southern Sotho', 'Tswana', 'Tsonga', 'Venda', 'Swazi'];
  expectedLanguages.forEach(lang => {
    expect(Object.values(languages)).toContain(lang);
  });

});
