import TokenService from "../api/services/tokenService";
import { ErrorWithHttpCode } from "../api/error/ErrorWithHttpCode";
import assert from "assert";

let service = new TokenService();

// var assert = require("assert");
// let chai = require("chai");
// let chaiHttp = require("chai-http");
// let server = require("../api/server");
// let should = chai.should();
// chai.use(chaiHttp);

const tokenString =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ii1MemI0ajg3RUZ6d0VpNGhOVzZVIiwiaWF0IjoxNTkzMDgxOTU5LCJleHAiOjE1OTQwODE5NTl9.HI4HbmLlOpbeUG8j-Yt4aLN0PLJnfijY_hR8p8DKO4c";
const id = "-Lzb4j87EFzwEi4hNW6U";
const expire = 1000000;
const expiredToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ii1MemI0ajg3RUZ6d0VpNGhOVzZVIiwiaWF0IjoxNTkzMDg4NTY2LCJleHAiOjE1OTMwODg1Njd9.jxnxfGMmVxSwJ3heBlnypDd6Z4B-mjiJ_8F32wOZxpA";

describe("TokenService", function () {
  describe("create Token", function () {
    it("shound be different tokens", function () {
      assert.notEqual(service.createToken({ id }, expire), tokenString);
    });
  });
  describe("validate Token", function () {
    this.timeout(10);
    it("should validate token", function () {
      assert.equal(service.validateToken(tokenString).id, id);
    });

    it("invalid token string", function () {
      assert.throws(
        service.validateToken.bind(this, tokenString + "asd"),
        function (error) {
          if (
            error instanceof ErrorWithHttpCode &&
            error.message === "Failed to authenticate token"
          ) {
            return true;
          }
        }
      );
    });

    it("token expired", function () {
      assert.throws(service.validateToken.bind(this, expiredToken), function (
        error
      ) {
        console.log("error", error.message);
        if (
          error instanceof ErrorWithHttpCode &&
          error.message === "Token has expired"
        ) {
          return true;
        }
      });
    });
  });
});
