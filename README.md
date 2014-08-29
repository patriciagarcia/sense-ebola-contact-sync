# sense-ebola-contact-sync

[![Build Status][travis-image]][travis-url]
[![devDependency Status][daviddm-image]][daviddm-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Code Climate][codeclimate-image]][codeclimate-url]
[![Sauce Labs][saucelabs-image]][saucelabs-url]

[travis-url]: https://travis-ci.org/eHealthAfrica/sense-ebola-contact-sync
[travis-image]: https://travis-ci.org/eHealthAfrica/sense-ebola-contact-sync.png?branch=master
[daviddm-url]: https://david-dm.org/eHealthAfrica/sense-ebola-contact-sync#info=devDependencies
[daviddm-image]: https://david-dm.org/eHealthAfrica/sense-ebola-contact-sync/dev-status.png?theme=shields.io
[coveralls-url]: https://coveralls.io/r/eHealthAfrica/sense-ebola-contact-sync
[coveralls-image]: https://coveralls.io/repos/eHealthAfrica/sense-ebola-contact-sync/badge.png
[codeclimate-url]: https://codeclimate.com/github/eHealthAfrica/sense-ebola-contact-sync
[codeclimate-image]: https://codeclimate.com/github/eHealthAfrica/sense-ebola-contact-sync.png
[saucelabs-url]: https://saucelabs.com/u/sense-ebola-dash
[saucelabs-image]: https://saucelabs.com/buildstatus/sense-ebola-dash

> Data management console for sensed Ebola data.

## Usage

0. Install [Node.js][] and [Git][]
1. `npm install -g karma grunt-cli bower`
2. `git clone https://github.com/eHealthAfrica/sense-ebola-contact-sync.git`
3. `cd sense-ebola-contact-sync && npm install; bower install`
4. `grunt serve`

If your browser hasn't already launched, browse to <http://localhost:9000>.

[Node.js]: http://nodejs.org
[Git]: http://git-scm.com

## Testing

Use `grunt test` for the complete test suite. `npm test` is reserved for our
continuous integration server (TravisCI).

### Unit

Use `grunt test:unit`.

### End-to-end

Use `grunt test:e2e`. You may also find our automated e2e test results at
[Sauce Labs][saucelabs-url].

## Author

© 2014 [eHealth Systems Africa](http://ehealthafrica.org)
