/* global locations */
var assert = require('chai').assert;
var httpMock = require(locations.mock + '/http');
var controller = require(locations.controllers + '/status/pingController.v1');

describe("controllers:PingController", function () {

	it("should return 'API server is working'", function (done) {

		var req = httpMock.createRequest({
			method: 'GET'
		});
		var res = httpMock.createResponse();
		controller.ping(req, res);
		
		assert.equal(200, res.statusCode);
		assert.isTrue(res._isJSON());
		
		var result = JSON.parse(res._getData());
		assert.equal(result.message, 'API server is working');
		
		done();
	})
});
