import TokenService from "../api/services/tokenService";
import chai, { assert } from "chai";
import chaiHttp from "chai-http";
import server from "../api/server";

chai.use(chaiHttp);
const should = chai.should();

let service = new TokenService();
const id = 2;
const validTokenString = service.createToken({ id }, 100);
const expiredTokenString =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ii1MemI0ajg3RUZ6d0VpNGhOVzZVIiwiaWF0IjoxNTkzMDg4NTY2LCJleHAiOjE1OTMwODg1Njd9.jxnxfGMmVxSwJ3heBlnypDd6Z4B-mjiJ_8F32wOZxpA";

describe("Authentication", function () {
  describe("validate Token", function () {
    it("validate token request", function (done) {
      chai
        .request(server)
        .post("/auth/validate")
        .send({ token: validTokenString })
        .end((err, res) => {
          res.should.have.status(200);
          assert.equal(res.body.id, id);
          done();
        });
    });

    it("empty token", function (done) {
      chai
        .request(server)
        .post("/auth/validate")
        .send({ token: "" })
        .end((err, res) => {
          res.should.have.status(401);
          assert.equal(res.body.message, "Token is invalid");
          done();
        });
    });

    it("invalid token", function (done) {
      chai
        .request(server)
        .post("/auth/validate")
        .send({ token: "asdasdasdds" })
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });

    it("expired token", function (done) {
      chai
        .request(server)
        .post("/auth/validate")
        .send({ token: expiredTokenString })
        .end((err, res) => {
          res.should.have.status(401);
          assert.equal(res.body.message, "Token has expired");
          done();
        });
    });
  });
});
