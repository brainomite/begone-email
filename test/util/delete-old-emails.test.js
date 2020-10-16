const { expect } = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../app");
const mongoose = require("mongoose");
const { Email } = require("../../src/models/Email");
const EmailBox = require("../../src/models/EmailBox");
const dayjs = require("dayjs");
const deleteOldEmails = require("../../src/util/delete-old-emails");

const emailOneId = new mongoose.Types.ObjectId();
const emailTwoId = new mongoose.Types.ObjectId();
const emailThreeId = new mongoose.Types.ObjectId();

describe.only("deleteOldEmails()", () => {
  beforeEach(async () => {
    //Before each test we empty the database
    await EmailBox.deleteMany({});
    const fiveHoursAgo = dayjs().subtract(5, "hour").toDate();
    const emailOne = new Email({
      _id: emailOneId,
      to: "test1@example.com",
      from: "begone-tester@localhost",
      subject: "Test email 1",
      htmlBody: "The Body 1",
      date: fiveHoursAgo,
    });
    const emailTwo = new Email({
      _id: emailTwoId,
      to: "test1@example.com",
      from: "begone-tester@localhost",
      subject: "Test email 2",
      htmlBody: "The Body 2",
      date: Date.now(),
    });
    const emailThree = new Email({
      _id: emailThreeId,
      to: "test1@example.com",
      from: "begone-tester@localhost",
      subject: "Test email 1",
      htmlBody: "The Body 1",
      date: fiveHoursAgo,
    });
    const mailbox1 = new EmailBox({
      _id: "test1@example.com",
      emails: [emailOne, emailTwo],
    });
    const mailbox2 = new EmailBox({
      _id: "test2@example.com",
      emails: [emailThree],
    });
    await mailbox1.save();
    await mailbox2.save();
  });

  it("It finds and delete old emails, and if no more remains, delete the mailbox", async () => {
    await deleteOldEmails(240);
    const mailbox1 = await EmailBox.findById("test1@example.com");
    expect(mailbox1.emails).to.have.length(1);
    expect(mailbox1.emails[0]._id.toString()).to.equal(emailTwoId.toString());
    const mailbox2 = await EmailBox.findById("test2@example.com");
    expect(mailbox2).to.be.null;
  });
});
