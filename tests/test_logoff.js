const chai = require("chai");
const chaiHttp = require("chai-http");
const { app, server } = require("../app");
const expect = chai.expect;

chai.use(chaiHttp);

describe("Session Management: Logoff", function () {
  let csrfToken;
  let sessionCookie;

  // Assuming these values are set up in a before hook or retrieved from a successful logon test
  before(async () => {
    // Perform logon to get the sessionCookie and csrfToken
    // Ensure you have this.user.email, this.password, this.csrfToken from a successful logon test
    const dataToPost = {
      email: this.user.email,
      password: this.password,
      _csrf: this.csrfToken,
    };

    try {
      const res = await chai
        .request(app)
        .post("/session/logon")
        .set("content-type", "application/x-www-form-urlencoded")
        .send(dataToPost);

      // Assuming successful logon, capture the sessionCookie and csrfToken
      const cookies = res.headers["set-cookie"];
      csrfToken = cookies.find((element) => element.startsWith("csrfToken"));
      sessionCookie = cookies.find((element) => element.startsWith("connect.sid"));
    } catch (err) {
      console.log("Logon failed:", err);
      throw err;
    }
  });

  after(() => {
    server.close();
  });

  it("should log the user off", async () => {
    try {
      const res = await chai
        .request(app)
        .post("/session/logoff")
        .set("Cookie", `${csrfToken}; ${sessionCookie}`)
        .send();

      expect(res).to.have.status(200);
    } catch (err) {
      console.log("Logoff failed:", err);
      throw err;
    }
  });

  it("should verify user is logged off", (done) => {
    chai.request(app)
      .get("/")
      .set("Cookie", sessionCookie)
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res).to.have.status(200);
        expect(res.text).to.include("Click this link to logon");
        expect(res.text).not.to.include(this.user.name);
        done();
      });
  });
});
