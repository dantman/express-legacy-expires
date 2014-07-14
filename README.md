# express-legacy-expires

  [![NPM version](https://badge.fury.io/js/express-legacy-expires.svg)](http://badge.fury.io/js/express-legacy-expires)
  [![Build Status](https://travis-ci.org/dantman/express-legacy-expires.svg?branch=develop)](https://travis-ci.org/dantman/express-legacy-expires)
  [![Coverage Status](https://coveralls.io/repos/dantman/express-legacy-expires/badge.png?branch=develop)](https://coveralls.io/r/dantman/express-legacy-expires?branch=develop)
  [![dependencies](https://david-dm.org/dantman/express-legacy-expires/status.svg)](https://david-dm.org/dantman/express-legacy-expires)
  [![devDependencies](https://david-dm.org/dantman/express-legacy-expires/dev-status.svg)](https://david-dm.org/dantman/express-legacy-expires#info=devDependencies)

Middleware for ExpressJS that automatically adds Expires headers for legacy browsers based on your Cache-Control headers.

Adding this middleware means you never need to define Expires headers for compatibility, you just set normal modern Cache-Control headers and a corresponding Expires header for older HTTP clients is automatically set.

This middleware doesn't help define Cache-Control, try combining it with [express-cache-response-directive](https://github.com/dantman/express-cache-response-directive) for that.

## Install

```bash
$ npm install express-legacy-expires
```

## Usage

```js
var legacyExpires = require('express-legacy-expires');
```

```js
app.use(legacyExpires());
```

## License

[MIT](LICENSE)
