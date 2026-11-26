#!/usr/bin/env node
/**
 * Local checks for POST /api/contacts validation.
 * Invalid payloads return 400 before any spreadsheet write.
 * A valid payload passes validation and is not rejected as 400.
 * This script never calls Google; if credentials are present it still
 * only exercises the validator and the 400 path.
 */

const assert = require('assert');
const { validateContactPayload } = require('../api/contact-validation');
const handler = require('../api/contacts');

function mockRes() {
  return {
    statusCode: 200,
    body: null,
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    end() {
      return this;
    }
  };
}

function validBody(overrides = {}) {
  return Object.assign({
    inquiry_type: 'consultation',
    name: '山田 太郎',
    company: '株式会社サンプル',
    email: 'taro@example.com',
    phone: '',
    budget: '',
    referral_source: 'web_search',
    message: '小紅書の運用について相談したいです。',
    status: '未対応'
  }, overrides);
}

async function expectStatus(body, status) {
  const res = mockRes();
  await handler({ method: 'POST', headers: {}, body }, res);
  assert.strictEqual(res.statusCode, status, JSON.stringify(res.body));
  return res;
}

(async () => {
  const empty = validateContactPayload({});
  assert.strictEqual(empty.ok, false);
  assert.ok(empty.fields.name);
  assert.ok(empty.fields.email);
  assert.ok(empty.fields.message);
  assert.ok(empty.fields.company);
  assert.ok(empty.fields.inquiry_type);

  const badEmail = validateContactPayload(validBody({ email: 'not-an-email' }));
  assert.strictEqual(badEmail.ok, false);
  assert.strictEqual(badEmail.fields.email, 'Email must be a valid email address.');

  const blankMessage = validateContactPayload(validBody({ message: '   ' }));
  assert.strictEqual(blankMessage.ok, false);
  assert.ok(blankMessage.fields.message);

  const accepted = validateContactPayload(validBody());
  assert.strictEqual(accepted.ok, true);
  assert.strictEqual(accepted.value.email, 'taro@example.com');
  assert.strictEqual(accepted.value.name, '山田 太郎');

  const travel = validateContactPayload({
    inquiry_type: 'travel_custom',
    name: 'Li Wei',
    company: 'PROTECH Travel Concierge',
    email: 'li@example.com',
    message: '出行日期：2026-12-01\n人数：2',
    travel: { people: '2', source: 'travel_page' }
  });
  assert.strictEqual(travel.ok, true);
  assert.strictEqual(travel.value.inquiry_type, 'travel_custom');
  assert.deepStrictEqual(travel.value.travel, { people: '2', source: 'travel_page' });

  const emptyRes = await expectStatus({}, 400);
  assert.ok(emptyRes.body && emptyRes.body.error);
  assert.ok(emptyRes.body.fields.name);
  assert.strictEqual(emptyRes.body.success, undefined);

  const missingRes = await expectStatus(validBody({ email: '', message: '' }), 400);
  assert.ok(missingRes.body.fields.email);
  assert.ok(missingRes.body.fields.message);

  const invalidEmailRes = await expectStatus(validBody({ email: 'bad' }), 400);
  assert.ok(invalidEmailRes.body.fields.email);

  const nullRes = await expectStatus(null, 400);
  assert.ok(nullRes.body.fields.body);

  const stringRes = mockRes();
  await handler({ method: 'POST', headers: {}, body: '{not json' }, stringRes);
  assert.strictEqual(stringRes.statusCode, 400);

  const checked = validateContactPayload(validBody());
  assert.strictEqual(checked.ok, true, 'valid JP contact payload must be accepted');
  const en = validateContactPayload(validBody({
    name: 'Alex Morgan',
    company: 'Northwind',
    email: 'alex@northwind.example',
    message: 'I would like a quote for Dianping support.'
  }));
  assert.strictEqual(en.ok, true);
  const cn = validateContactPayload(validBody({
    name: '王伟',
    company: '示例公司',
    email: 'wang@example.cn',
    message: '想咨询小红书运营。'
  }));
  assert.strictEqual(cn.ok, true);

  console.log('contact validation checks passed');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
