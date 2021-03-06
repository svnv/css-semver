'use strict'
// predict version based on changes in the css ast

// the general idea here is that is that if unique selecors in prev version
// are equal to the changed version, then the change is a 'patch', if there
// are more selectors in the new versio the change is a 'minor' and if there
// are some selectors from the old version not present in the changed version
// the change is a 'major'.

var css = require('css');
var colors = require("colors/safe");
var _ = require('underscore');
var deepEqual = require('deep-equal')

const DIFF_ADDED = 0;
const DIFF_REMOVED = 1;
const DIFF_FORMATS= [{color:colors.green, prefix: '+ '}, {color:colors.red, prefix:'- '}]

module.exports = function (old, changed, options){
	try{

		var oldAst = css.parse(old || '');
		var changedAst = css.parse(changed || '');
		
		if(areProgramaticallyEqual(oldAst.stylesheet.rules,changedAst.stylesheet.rules)){
			return null;
		} else {
			var prediction = predictChangeType(oldAst, changedAst, options || {});
			return prediction;
		}	
	} catch(e){
		console.log('Oh no, something went wrong during css comparison.');
		// console.error(e, e.stack.split("\n"));
	}
};

function areProgramaticallyEqual(oldRuleSet, changedRuleSet){
	var oldMapped = oldRuleSet.map(ruleDiffMap)
	var changedMapped = changedRuleSet.map(ruleDiffMap)
	return deepEqual(oldMapped, changedMapped)
}

function ruleDiffMap(elem){
	// returns a subset of the css needed for successfull deep comparison even if the
	// rules have different whitespace
	return {
		'type': elem.type,
		'declarations': elem.declarations ? elem.declarations.map(declarationDiffMap) : null,
		'selectors': elem.selectors || null 
	}
}

function declarationDiffMap(elem){
	return {
		'type': elem.type,
		'property': elem.property,
		'value': elem.value
	}
}

function predictChangeType(oldAst, changedAst, options){
	var oldUniques = extractUniqueCssSelectors(oldAst);
	var changedUniques = extractUniqueCssSelectors(changedAst);

	// note that underscores difference is not symetric
	// but only removes x elements from the y array in difference(y,x)
	var oldsNotInChanged = _.difference(oldUniques, changedUniques);
	var changedsNotInOld = _.difference(changedUniques, oldUniques);

	// log changes that are detected 
	if(changedsNotInOld.length > 0){
		changedsNotInOld.forEach(function(elem){
			logElem(DIFF_ADDED, elem, options)
		});		
	}
	if(oldsNotInChanged.length > 0){
		oldsNotInChanged.forEach(function(elem){
			logElem(DIFF_REMOVED, elem, options)
		});
	}
	
	logChanged(oldAst, changedAst, options)
	
	if( oldsNotInChanged.length ===  0 && changedsNotInOld.length === 0){
		// the files contain an eqaul amount of rules
		return 'patch';
	}
	if(oldsNotInChanged.length == 0 && changedsNotInOld.length > 0){
		// there are more rules in the changed file
		return 'minor';
	}
	if (oldsNotInChanged.length > 0){
		// there is something defined in the old file not present in the new file
		return 'major';
	}
	throw "Unable to predict version";
}

function jsonLog(thing){
	console.log(JSON.stringify(thing))
}

function logChanged(a, b, options){
	try{
		if(!options.verbose) return
		var aRules = a.stylesheet.rules
		var bRules = b.stylesheet.rules
		var aBySelectors = getDelclerationsBySelectors(aRules)
		var bBySelectors = getDelclerationsBySelectors(bRules)
		var selectors = Object.keys(aBySelectors)
		selectors.forEach( selector =>{
			// we only care about changed rules
			if(!bBySelectors[selector]) return 
			var eq =  deepEqual( aBySelectors[selector], bBySelectors[selector])
			if(eq) return
			console.log(colors.yellow('~ '+ selector))
			compareDeclerations(aBySelectors[selector][0], bBySelectors[selector][0])
		})
	} catch(e){
		console.log('Error in css-semver verbose mode: ', e)
	}
}

function compareDeclerations(a, b){
	var aKeys = Object.keys(a)
	var bKeys = Object.keys(b)
	var allKeys = new Set(aKeys.concat(bKeys))
	allKeys.forEach(key =>{
		if(a[key] === b[key]) return;
		console.log(colors.yellow(`    ${key}: ${a[key]} -> ${b[key]}`))
	})
}

function getDelclerationsBySelectors(rules){
	if(!rules) return {}
	var bySelectors = {}
	rules.forEach((rule)=>{
		if(!rule.selectors) return
		rule.selectors.forEach(selector =>{
			if(!bySelectors[selector]){
				bySelectors[selector] = []
			}
			var elem = {}
			rule.declarations.forEach(d => {
				elem[d.property] = d.value
			})
			bySelectors[selector].push(elem)
		})
	})
	return bySelectors
}

function extractUniqueCssSelectors(ast) {
	var rules = ast.stylesheet.rules.filter(r => {return r.type === 'rule'});
	var selectorsList = rules.map(r => {return r.selectors});
	var selectors = _.flatten(selectorsList);
	var uniques = _.uniq(selectors);
	return uniques;
}

function logElem(type, elem, options){
	if(options.verbose){
		let format = DIFF_FORMATS[type];
		let text = format.prefix + elem;
		let output = format.color(text)
		console.log(output);
	}
}




