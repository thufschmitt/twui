# twui

Taskwarrior UI - a responsive web interface to [taskwarrior](http://taskwarrior.org/) written with [Node.js](http://nodejs.org/).

[![Build Status badge](http://img.shields.io/travis/rampantmonkey/twui.svg?style=flat)](https://travis-ci.org/rampantmonkey/twui) [![npm package version badge](http://img.shields.io/npm/v/twui.svg?style=flat)](https://www.npmjs.org/package/twui) [![license badge](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](http://opensource.org/licenses/MIT)

## Installing

    npm install -g twui

## Usage

To start simply type `twui` and navigate to `localhost:2718`.

If you want twui to run as a background process use the following:

    twui &>/dev/null &

## Contributing

### Setting up the development environment

0. Install node [http://nodejs.org/](http://nodejs.org/)
1. Clone the repo `git clone https://github.com/rampantmonkey/twui.git`
2. Move to directory `cd twui`
3. Download dependencies (angular.js) `make deploy`
4. Start server `bin/twui`

### Updating to most recent version

1. Download latest changes `git pull origin master`
2. Start server `bin/twui`

## License
_This software - &copy; Casey Robinson 2014 - is released under the MIT license._
You can find a copy in [LICENSE.txt](LICENSE.txt) or at [opensource.org](http://opensource.org/licenses/MIT).
