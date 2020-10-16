let mongoose = require("mongoose");
let { Email } = require("../../../../src/models/Email");
let EmailBox = require("../../../../src/models/EmailBox");

//Require the dev-dependencies
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../../../../server");
let expect = chai.expect;

chai.use(chaiHttp);

const emailOneId = new mongoose.Types.ObjectId();
const emailTwoId = new mongoose.Types.ObjectId();
//Our parent block
describe("api/mailbox", () => {
  beforeEach(async () => {
    //Before each test we empty the database
    await EmailBox.deleteMany({});
    const emailOne = new Email({
      _id: emailOneId,
      to: "test1@example.com",
      from: "begone-tester@localhost",
      subject: "Test email 1",
      htmlBody: "The Body 1",
    });
    const emailTwo = new Email({
      _id: emailTwoId,
      to: "test1@example.com",
      from: "begone-tester@localhost",
      subject: "Test email 2",
      htmlBody: "The Body 2",
    });
    const mailbox = new EmailBox({
      _id: "test1@example.com",
      emails: [emailOne, emailTwo],
    });
    await mailbox.save();
  });

  describe("GET /:email", () => {
    it("it should return return a default empty mailbox for the email provided if no email boxes are found", (done) => {
      chai
        .request(server)
        .get("/api/mailbox/hi@begone.email")
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.a("Object");
          expect(res.body.emails).to.be.an("array");
          expect(res.body.emails).to.be.empty;
          expect(res.body._id).to.equal("hi@begone.email");
          done();
        });
    });

    it("it should return the mailbox for the email provided if found", (done) => {
      chai
        .request(server)
        .get("/api/mailbox/test1@example.com")
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.a("Object");
          expect(res.body.emails).to.be.an("array");
          expect(res.body.emails.length).to.equal(2);
          expect(res.body._id).to.equal("test1@example.com");
          done();
        });
    });
    it("it should return status 400, bad request, for a malformed email", (done) => {
      chai
        .request(server)
        .get("/api/mailbox/test1@example")
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.error.text).to.contain("isn't a valid email");
          done();
        });
    });
    it("it should return status 422, unprocessable entity, for a domain not permitted", (done) => {
      chai
        .request(server)
        .get("/api/mailbox/test1@google.com")
        .end((err, res) => {
          expect(res.status).to.equal(422);
          expect(res.error.text).to.contain("is not available");
          done();
        });
    });
  });

  describe("GET /:email/:emailId", () => {
    it("it should return a mailbox with the email requested", (done) => {
      chai
        .request(server)
        .get("/api/mailbox/test1@example.com/" + emailOneId)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.a("Object");
          expect(res.body.emails).to.be.an("array");
          expect(res.body.emails.length).to.equal(1);
          expect(res.body.emails[0]._id).to.equal(emailOneId.toString());
          expect(res.body.emails[0].to).to.equal("test1@example.com");
          expect(res.body.emails[0].from).to.equal("begone-tester@localhost");
          expect(res.body.emails[0].subject).to.equal("Test email 1");
          expect(res.body.emails[0].htmlBody).to.equal("The Body 1");
          expect(res.body.emails[0].isRead).to.be.true;
          done();
        });
    });

    it("it should return status 404, not found, when a specific email is not found", async () => {
      await chai
        .request(server)
        .get("/api/mailbox/test1@example.com/" + new mongoose.Types.ObjectId())
        .then((res) => {
          expect(res.status).to.equal(404);
          expect(res.error.text).to.contain("Specific email not found.");
        });
      await chai
        .request(server)
        .get("/api/mailbox/test3@example.com/" + new mongoose.Types.ObjectId())
        .then((res) => {
          expect(res.status).to.equal(404);
          expect(res.error.text).to.contain("Specific email not found.");
        });
    });
    it("it should return status 400, bad request, for a malformed email", (done) => {
      chai
        .request(server)
        .get("/api/mailbox/test1@example/" + emailOneId)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.error.text).to.contain("isn't a valid email");
          done();
        });
    });
    it("it should return status 422, unprocessable entity, for a domain not permitted", (done) => {
      chai
        .request(server)
        .get("/api/mailbox/test1@google.com/" + emailOneId)
        .end((err, res) => {
          expect(res.status).to.equal(422);
          expect(res.error.text).to.contain("is not available");
          done();
        });
    });
  });

  describe("POST /:email/", () => {
    it("it should return status 400, bad request, for a malformed email", (done) => {
      chai
        .request(server)
        .post("/api/mailbox/test1@example")
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.error.text).to.contain("isn't a valid email");
          done();
        });
    });
    it("it should return status 422, unprocessable entity, for a domain not permitted", (done) => {
      chai
        .request(server)
        .post("/api/mailbox/test1@google.com")
        .end((err, res) => {
          expect(res.status).to.equal(422);
          expect(res.error.text).to.contain("is not available");
          done();
        });
    });
    it("it should send an email to the specified box", async () => {
      const email = "test@begone.email";
      const res = await chai.request(server).post(`/api/mailbox/${email}`);
      expect(res.status).to.equal(201);

      // Arbitrary 750ms delay to await for database write as there is an async
      // call behind the scenes to deliver email
      await new Promise((resolve) => setTimeout(() => resolve(), 750));

      const mailbox = await EmailBox.findById(email, {
        createdAt: false,
        updatedAt: false,
        __v: false,
        "emails.htmlBody": false,
        "emails.createdAt": false,
        "emails.updatedAt": false,
      });
      expect(mailbox._id).to.equal(email);
      expect(mailbox.emails.length).to.equal(1);
      expect(mailbox.emails[0].to).to.equal(email);
      expect(mailbox.emails[0].from).to.equal("alive-test@begone.email");
      expect(mailbox.emails[0].isRead).to.be.false;
    });
  });

  describe("DELETE :email/:emailId", () => {
    it("it should delete the specified email, if last email, delete mailbox", async () => {
      const res = await chai
        .request(server)
        .delete("/api/mailbox/test1@example.com/" + emailOneId);

      expect(res.status).to.equal(202);
      let mailbox = await EmailBox.findById("test1@example.com");
      expect(mailbox.emails.length).to.equal(1);
      await chai
        .request(server)
        .delete("/api/mailbox/test1@example.com/" + emailTwoId);

      mailbox = await EmailBox.findById("test1@example.com");
      expect(mailbox).to.be.null;
    });
    it("it should return 202 whether the mailbox exists or not", async () => {
      const res = await chai
        .request(server)
        .delete("/api/mailbox/test2@example.com/" + emailOneId);

      expect(res.status).to.equal(202);
    });
    it("it should return status 400, bad request, for a malformed email", (done) => {
      chai
        .request(server)
        .delete("/api/mailbox/test1@example/" + emailOneId)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(res.error.text).to.contain("isn't a valid email");
          done();
        });
    });
    it("it should return status 422, unprocessable entity, for a domain not permitted", (done) => {
      chai
        .request(server)
        .delete("/api/mailbox/test1@google.com/" + emailOneId)
        .end((err, res) => {
          expect(res.status).to.equal(422);
          expect(res.error.text).to.contain("is not available");
          done();
        });
    });
  });
});
