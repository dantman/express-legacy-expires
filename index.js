"use strict";
var debug = require('debug')('express-legacy-expires'),
	onHeaders = require('on-headers'),
	directiveRegexp = /^\s*([^\x00-\x1F\x7F()<>@,;:\\"\/\[\]?={} ]+)(?:=(\d+|"[^"]+"))?\s*(,\s*|$)/;

/*
 * Patterns for converting HTTP/1.1 Cache-Control headers to an Expires:
 *   - HTTP/1.0 had no concept of Cache-Control: private so an old Expires date
 *     is used so proxies do not cache anything.
 *   - The Expires header can indicate that something which is not otherwise
 *     cacheable may be cached even when old, so avoid specifying an Expires
 *     when Cache-Control: no-store is used.
 *   - Cache-Control: no-cache are cacheable but must be revalidated so an
 *     old Expires date is used.
 *   - If max-age is specified it can be used to create a future Expires header.
 *   - Cache-Control: public indicates something may be cached so without
 *     max-age use an old Expires header.
 */

module.exports = function legacyRequires(opts) {
	opts = opts || {};
	// This option allows the function that returns the time "now"
	// to be overridden with a different function. It is primarily for testing,
	// where it's used to ensure that all tests work from a fixed time.
	opts.now = opts.now || Date.now.bind(Date);

	function parseCacheControl(cacheControl) {
		var directiveList = [],
			directives = Object.create(null),
			m;

		while ( cacheControl ) {
			m = cacheControl.match(directiveRegexp);
			if ( !m ) {
				throw new Error("invalid directive, could not parse:" + cacheControl);
			}

			directiveList.push({ name: m[1], value: m[2] || true});

			if ( !m[3] ) {
				break;
			}

			cacheControl = cacheControl.slice(m[0].length);
		}

		directiveList.forEach(function(d) {
			if ( d.name in directives ) {
				throw new Error("invalid Cache-Control, duplicate directive " + d.name);
			}

			directives[d.name] = d.value;
		});

		['max-age', 's-maxage'].forEach(function(name) {
			if ( name in directives ) {
				var val = directives[name];
				if ( /^\d+$/.test(val) ) {
					directives[name] = parseInt(val, 10);
				} else {
					throw new Error("invalid Cache-Control, " + name + " must have a number as a value");
				}
			}
		});

		return directives;
	}

	return function legacyRequiresMiddleware(req, res, next) {
		onHeaders(res, function() {
			// Skip middleware if Expires is already set
			if ( this.getHeader('Expires') ) {
				return;
			}

			var cacheControl = this.getHeader('Cache-Control'),
				directives,
				expires = false;

			// Also skip if Cache-Control is not set
			if ( !cacheControl ) {
				return;
			}

			try {
				directives = parseCacheControl(cacheControl);

				if ( directives['no-store'] ) {
					// Do not output Expires when no-store is defined
				} else if ( directives['max-age'] >= 0 ) {
					// Calculate a future Expires based on max-age
					expires = opts.now.call(this) + (1000 * directives['max-age']);
				} else if ( directives['no-cache'] || directives['private'] || directives['public'] ) {
					// Use an Expires in the past
					expires = opts.now.call(this) - (1000 * 60 * 60 * 24);
				}

				if ( expires !== false ) {
					this.setHeader('Expires', (new Date(expires)).toUTCString());
				}
			} catch ( err ) {
				debug('omitting Expires header, error while parsing Cache-Control: %s', err.message);
			}
		});

		next();
	};
};
