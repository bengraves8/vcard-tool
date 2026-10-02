import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

const source = readFileSync(new URL('../src/lib/vcard.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } })
const { initialData, generateVCard, recordLinks, safeLinkUrl } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)

test('exports multiple named links and a correctly structured second address line', () => {
  const result = generateVCard({ ...initialData, firstName: 'Jamie', addressStreet: '123 Main Street', addressLine2: 'Suite 2; East, Wing', addressCity: 'Chicago', links: [
    { label: 'Book a meeting', url: 'example.com/book' },
    { label: 'Portfolio', url: 'https://example.com/work' },
    { label: 'Empty', url: '' },
  ] })
  assert.ok(result.includes('item1.URL:https://example.com/book\r\nitem1.X-ABLabel:Book a meeting'))
  assert.ok(result.includes('item2.URL:https://example.com/work\r\nitem2.X-ABLabel:Portfolio'))
  assert.ok(!result.includes('Empty'))
  assert.ok(result.includes('ADR;TYPE=WORK:;Suite 2\\; East\\, Wing;123 Main Street;Chicago;;;'))
})

test('legacy links load, renamed links win, and deleted links stay deleted', () => {
  const old = { website: 'https://example.com', linkedin: 'https://linkedin.com/in/test', twitter: 'https://x.com/test' }
  assert.equal(recordLinks(old).length, 3)
  assert.equal(recordLinks(old)[1].label, 'LinkedIn')
  assert.deepEqual(recordLinks({ ...old, links: [] }), [])
  const links = [{ label: 'New name', url: 'https://example.com/new' }]
  assert.deepEqual(recordLinks({ ...old, links }), links)
})

test('unsafe URLs cannot become clickable links or injected vCard properties', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,test', 'https://example.com\r\nFN:Injected']) {
    assert.equal(safeLinkUrl(url), null)
    assert.ok(!generateVCard({ ...initialData, links: [{ label: 'Bad', url }] }).includes('.URL:'))
  }
  assert.ok(generateVCard({ ...initialData, links: [{ label: 'Book\nFN:Injected', url: 'https://example.com' }] }).includes('X-ABLabel:Book\\nFN:Injected'))
})

test('second-line-only address exports and QR output omits photos', () => {
  const data = { ...initialData, addressLine2: 'Building B', photo: 'data:image/jpeg;base64,YWJj' }
  assert.ok(generateVCard(data).includes('ADR;TYPE=WORK:;Building B;;;;;'))
  assert.ok(generateVCard(data).includes('PHOTO;'))
  assert.ok(!generateVCard(data, { includePhoto: false }).includes('PHOTO;'))
})
