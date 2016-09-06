var assert = require('assert');
var cssSemver = require('./index')

describe('cssSemver', function() {
   
   	// major

    it('Should return major when changed is null', function() {
      assert.equal('major', cssSemver('.test{color: #000;}',null));
    });

    it('Should return major when changed has less selectors than old', function() {
      assert.equal('major', cssSemver('.test{color: #000;} .deleted{display:none}','.test{color: #000;}'));
    });

    it('Should return major when changed has less selectors than old and another rule change occured', function() {
      assert.equal('major', cssSemver('.test{color: #000;} .deleted{display:none}','.test{color: #fff;}'));
    });
    
    it('Should return major when changed has less selectors than old and another selector was added', function() {
      assert.equal('major', cssSemver('.test{color: #000;} .deleted{display:none}','.test{color: #fff;} .added{visibility: hidden}'));
    });

    it('Should return major on nested selector change', function() {
      assert.equal('major', cssSemver('.parent .child{color: #000;}','.parent .other-child {color: #000;}'));
    });

    // minor

    it('Should return minor whit only changed content and old is null', function() {
      assert.equal('minor', cssSemver(null,'.test{color: #000;}'));
    });

    it('Should return minor when changed has more selectors than old', function() {
      assert.equal('minor', cssSemver('.test{color: #000;}', '.test{color: #000;} .added{display:none}'));
    });

    it('Should return minor when changed has more selectors than old and another rule change occured', function() {
      assert.equal('minor', cssSemver('.test{color: #000;}', '.test{color: #fff;} .added{display:none}'));
    });

    it('Should return minor when changed has more selectors on the same rule', function() {
      assert.equal('minor', cssSemver('.test{color: #000;}', '.test, .added{color: #fff;} '));
    });

    // patch

    it('Should return patch when selectors are equal but content of rules is different', function() {
      assert.equal('patch', cssSemver('.test{color: #000;} .unchanged{display:none}','.test{color: #fff;}  .unchanged{display:none}'));
    });

    it('Should return patch when selectors are equal but selectors are grouped differently', function() {
      assert.equal('patch', cssSemver('.a, .b{color: #000;}','.a{color: #000;} .b{color: #000;}'));
    });

    it('Should return patch when selectors are equal but selectors are ordered differently', function() {
      assert.equal('patch', cssSemver('.b{color: #000;} .a{color: #fff;}','.a{color: #fff;} .b{color: #000;}'));
    });

    // null

	it('Should return null when no values are defined', function() {
      assert.equal(null, cssSemver());
    });

	it('Should return null when both values are null', function() {
      assert.equal(null, cssSemver(null, null));
    });

    it('Should return null when old and changed are equal', function() {
      assert.equal(null, cssSemver('.a{display:none} .b{color: #000;} ',' .a {display:none} .b {color: #000;}'));
    });

    it('Should return null when selectors and content are equal but has different withespace', function() {
      assert.equal(null, cssSemver('.a{display:none} .b{color: #000;} ',' .a {display:none} 	.b {color: #000;}'));
    });

    // verbose mode

	var originalLog;
	var logStack = [];
	function enableMockLog (){
		originalLog = console.log;
		console.log = function (message) {
			logStack.push(message);
		};
	}
	function disableMockLog() {
		console.log = originalLog;
		logStack = [];
	}

    it('Should work with verbose mode when changed has less selectors than old and another selector was added', function() {
      enableMockLog();
      assert.equal('major', cssSemver('.test{color: #000;} .deleted{display:none}','.test{color: #fff;} .added{visibility: hidden}', {verbose: true}));
      assert.equal(logStack.length, 2);
      disableMockLog();
    });


    // comments in css
    it('Should not return null and fail when a comment exists in the css', function() {
      assert.equal('patch', cssSemver('.test{color: #000;} .unchanged{display:none} /* this is a comment */','.test{color: #fff;}  .unchanged{display:none}'));
    });

});