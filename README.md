# sense-ebola-contact-sync

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

Use `grunt test:e2e`.

## Author

© 2014 [eHealth Systems Africa](http://ehealthafrica.org)
