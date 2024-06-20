const chai = require("chai");
const chaiHttp = require("chai-http");
const puppeteer = require("puppeteer");
const { app, server } = require("../app");
const expect = chai.expect;
const { factory, seed_db } = require("../util/seed_db");
const Job = require("../models/Job");

chai.use(chaiHttp);

let browser;
let page;

before(async () => {
  await seed_db();

  browser = await puppeteer.launch({ headless: true }); // Adjust as needed
  page = await browser.newPage();
});

after(async () => {
  await browser.close();
  server.close();
});

describe("CRUD Operations for Jobs", function () {
  let csrfToken;
  let sessionCookie;

  before(async () => {
    // Log in to obtain CSRF token and session cookie
    const userData = {
      email: "testuser@example.com",  // Replace with your test user's email
      password: factory.secrets.userPassword,  // Ensure this matches your setup
    };

    const loginRes = await chai
      .request(app)
      .post("/session/logon")
      .set("content-type", "application/x-www-form-urlencoded")
      .send(userData);

    const cookies = loginRes.headers["set-cookie"];
    csrfToken = cookies.find((cookie) => cookie.startsWith("csrfToken"));
    sessionCookie = cookies.find((cookie) => cookie.startsWith("connect.sid"));
  });

  describe("Navigation and Job Listings", () => {
    it("should navigate to the job listings page and verify entries", async () => {
      await page.setCookie({ name: "connect.sid", value: sessionCookie });
      await page.goto("http://localhost:3000/jobs");

      const jobListHTML = await page.content();
      const jobEntries = jobListHTML.split("<li>").length - 1;

      expect(jobEntries).to.equal(20); // Assuming 20 jobs seeded
    });
  });

  describe("Add Job Form Submission", () => {
    it("should navigate to the add job form and submit a new job", async () => {
      await page.setCookie({ name: "connect.sid", value: sessionCookie });
      await page.goto("http://localhost:3000/jobs");

      // Click on "Add A Job" button
      await page.click("#addJobButton");
      await page.waitForSelector("#jobForm");

      // Verify the form is displayed correctly
      const formTitle = await page.$eval("#jobForm h2", (el) => el.textContent.trim());
      expect(formTitle).to.equal("Add Job");

      // Create new job data using factory
      const newJobData = factory.build("job");

      // Fill form inputs
      await page.type("#titleInput", newJobData.title);
      await page.type("#descriptionInput", newJobData.description);

      // Submit the form
      await page.click("#submitButton");

      // Wait for jobs list to reload
      await page.waitForSelector("#jobList");

      // Verify success message
      const successMessage = await page.$eval("#successMessage", (el) => el.textContent.trim());
      expect(successMessage).to.equal("Job listing added successfully");

      // Check database for the latest job entry
      const addedJob = await Job.findOne({ title: newJobData.title });
      expect(addedJob).to.exist;
      expect(addedJob.description).to.equal(newJobData.description);
    });
  });
});
