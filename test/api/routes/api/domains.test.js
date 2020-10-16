let chai = require("chai");
let server = require("../../../../app");
let expect = chai.expect;

describe("GET api/domains", () => {
  it("Returns an array of domains", async () => {
    const res = await chai.request(server).get("/api/domains");
    expect(res.status).to.equal(200);
    expect(res.body.sort()).to.eql(["begone.email", "example.com"]);
  });
});
