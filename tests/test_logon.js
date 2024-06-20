it("should log the user on", async () => {
    const dataToPost = {
      email: this.user.email,
      password: this.password,
      _csrf: this.csrfToken,
    };
    try {
      const request = chai
        .request(app)
        .post("/session/logon")
        .set("Cookie",this.csrfCookie)
        .set("content-type", "application/x-www-form-urlencoded")
        .redirects(0)
        .send(dataToPost);
      res = await request;
      expect(res).to.have.status(302);
      expect(res.headers.location).to.equal('/')
      const cookies = res.headers["set-cookie"];
      this.sessionCookie = cookies.find((element) =>
      element.startsWith("connect.sid"),
    );
    expect(this.sessionCookie).to.not.be.undefined;
    } catch (err) {
      console.log(err);
      expect.fail("Logon request failed");
    }
  });
  it("should get the index page", (done)=>{
    chai.request(app).get("/")
    .set('Cookie',this.sessionCookie)
    .send()
    .end((err,res)=>{
        expect(err).to.equal(null)
        expect(res).to.have.status(200)
        expect(res).to.have.property("text")
        expect(res.text).to.include(this.user.name)
        done()
    }) 
  });