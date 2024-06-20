import { expect } from 'chai';
import multiply from '../util/multiply.mjs';
// const multiply = require('../util/multiply')
// const expect = require('chai').expect

describe('testing multiply', () => {
  it('should give 7*6 is 42', (done) => {
    expect(multiply(7,6)).to.equal(42)
    done()
  })
  // it('should give 7*6 is 42', (done) => {
  //   expect(multiply(7,6)).to.equal(97)
  //   done()
  // })
})