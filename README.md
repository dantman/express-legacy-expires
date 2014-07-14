# express-legacy-expires

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
