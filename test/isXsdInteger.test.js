/* global describe, it */

const assert = require('assert')
const isXsdInteger = require('../lib/isXsdInteger')

describe('isXsdInteger', function () {
  it('xsd:integer with int value should be integer', () => {
    const input = {
      datatype: { value: 'http://www.w3.org/2001/XMLSchema#integer' },
      value: '42'
    }
    assert.strictEqual(isXsdInteger(input), true)
  })
  it('xsd:integer with string value should not be integer', () => {
    const input = {
      datatype: { value: 'http://www.w3.org/2001/XMLSchema#integer' },
      value: 'text'
    }
    assert.strictEqual(isXsdInteger(input), false)
  })
  it('xsd:integer with decimal value should not be integer', () => {
    const input = {
      datatype: { value: 'http://www.w3.org/2001/XMLSchema#integer' },
      value: '3.14159'
    }
    assert.strictEqual(isXsdInteger(input), false)
  })
  it('xsd:integer with 16 digits should be integer', () => {
    const input = {
      datatype: { value: 'http://www.w3.org/2001/XMLSchema#integer' },
      value: '1234567890123456'
    }
    assert.strictEqual(isXsdInteger(input), true)
  })

  // parseInt gets imprecise with large numbers
  it('xsd:integer with value longer than 16 digits should not be integer', () => {
    const input = {
      datatype: { value: 'http://www.w3.org/2001/XMLSchema#integer' },
      value: '12345678901234567'
    }
    assert.strictEqual(isXsdInteger(input), false)
  })
})
