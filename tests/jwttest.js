import tokenService from "../api/services/tokenService";
import TokenService from "../api/services/tokenService";
// import { assert } from "assert";

let service = new TokenService();

// var assert = require("assert");
// let chai = require("chai");
// let chaiHttp = require("chai-http");
// let server = require("../api/server");
// let should = chai.should();
// chai.use(chaiHttp);

let tokenString =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ii1MemI0ajg3RUZ6d0VpNGhOVzZVIiwiaWF0IjoxNTkzMDgxOTU5LCJleHAiOjE1OTQwODE5NTl9.HI4HbmLlOpbeUG8j-Yt4aLN0PLJnfijY_hR8p8DKO4c";
let id = "-Lzb4j87EFzwEi4hNW6U";
let expire = 1000000;

describe("TokenService", function () {
  describe("createToken", function () {
    it("shound create token", function () {
      // assert.equal(tokenService.createToken({ id }, expire), tokenString);
    });
  });
});

// describe("Array", function () {
//   describe("#indexOf()", function () {
//     it("should return -1 when the value is not present", function () {
//       assert.equal([1, 2, 3].indexOf(4), -1);
//     });
//   });
// });
