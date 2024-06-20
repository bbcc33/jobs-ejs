// const chai = require("chai");
// chai.use(require("chai-http"));
// const { app, server } = require("../app");
// const expect = chai.expect;

import { expect, use } from 'chai';
import chaiHttp from 'chai-http';
import { app, server } from '../app.js';

// chai.use(chaiHttp);
const chai = use(chaiHttp)

describe("test getting a page", function () {
  after(() => {
    server.close();
  });
  it("should get the index page", (done) => {
    chai
      .request.execute(app)
      .get("/")
      .send()
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res).to.have.status(200);
        expect(res).to.have.property("text");
        expect(res.text).to.include("Click this link");
        done();
      });
  });
});