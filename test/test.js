/* jshint unused: false, expr: true */
/* global describe, it */
"use strict";
var util = require('util'),
	expect = require('chai').expect,
	assert = require('better-assert'),
	express = require('express'),
	request = require('supertest'),
	legacyExpires = require('../'),
	nowForTests = Date.parse('2014-07-14T05:05:00Z');

function setup() {
	var app = express();
	app.use(legacyExpires({now: function() { return nowForTests; }}));
	return app;
}

describe('Expires:', function() {
	function test(cacheControl, dateString) {
		var app = setup();
		app.get('/', function(req, res) {
			res.set('Cache-Control', cacheControl);
			res.send('');
		});

		describe(util.format('when Cache-Control is "%s"', cacheControl), function() {
			it(util.format('Expires should be "%s"', dateString), function(done) {
				if ( dateString ) {
					request(app)
						.get('/')
						.expect('Expires', dateString)
						.end(done);
				} else {
					request(app)
						.get('/')
						.end(function(err, res) {
							expect(err).to.not.exist;
							assert(res.get('Expires') === undefined);

							done();
						});
				}
			});
		});
	}

	test("public", "Sun, 13 Jul 2014 05:05:00 GMT");
	test("private", "Sun, 13 Jul 2014 05:05:00 GMT");
	test("no-cache", "Sun, 13 Jul 2014 05:05:00 GMT");
	test("no-store", false);
	test("public, max-age=0", "Mon, 14 Jul 2014 05:05:00 GMT");
	test("public, max-age=300", "Mon, 14 Jul 2014 05:10:00 GMT");
	test("public, max-age=2592000", "Wed, 13 Aug 2014 05:05:00 GMT");
	test("public, max-age=31557600", "Tue, 14 Jul 2015 11:05:00 GMT");
	test("public, max-age=300, must-revalidate", "Mon, 14 Jul 2014 05:10:00 GMT");
	test(",", false);
	test("public, max-age=300, max-age=600", false);
});
