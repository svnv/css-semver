# css-semver
[![Build Status](https://travis-ci.org/svnv/css-semver.svg?branch=master)](https://travis-ci.org/svnv/css-semver)
[![Greenkeeper badge](https://badges.greenkeeper.io/svnv/css-semver.svg)](https://greenkeeper.io/)

Use this module to compare builds of css files, and get the corresponding [semver](http://semver.org/) upgrade increment based on changes in the stylesheets.



## How to use


`cssSemver(oldCss, newCss, options)`

Arguments:

- `oldCss` string 
- `newCss` string 
- `options` object, can be used to activate verbose mode


The exported function returns:

- `null` when there is no change in the styles
- `"major"` when the old build contains selecors not present in the new build. _The api has changed and things depending of the old css structure might break._
- `"minor"` when new selectors are added to the new build. _A new feature has been added to the api._  
- `"patch"` when the selectors are equal but there are other changes to the stylesheet. _A bug has been fixed but the api is unchanged._


### Example

	var cssSemver = require('css-semver')
	cssSemver('.old { color: #fff }', '.changed { color: #fff }');
	// returns "major"

### Example with verbose mode

Verbose mode will log a diff of the changes in the build to the console. 

	var cssSemver = require('css-semver')
	cssSemver('.old { color: #fff }', '.added { color: #fff }', {verbose: true});
	// - .old
	// + .added
	// returns "major"

## Tests

See [tests.js](https://github.com/svnv/css-semver/blob/master/tests.js) for the test suite.

To run the test suite use this command.

	npm test


## TODO

### Better verbose mode logging for _patch_ 

- Check if order of selectors is the same, and log changes
- Do a deep comparison on each rule and log changed rules
