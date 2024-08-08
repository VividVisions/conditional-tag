
import { expect } from 'chai';
import * as iftag from 'conditional-tag';

const importedModules = { iftag };
const expectedModules = {
	iftag: [
		'_',
		'_if',
		'_elseif',
		'_else',
		'_endif',
		'_switch',
		'_case',
		'_default',
		'_endswitch',
		'_always',
		'ConditionalTagSyntaxError'
	]
};

function sameMembers(arr1, arr2) {
	const set1 = new Set(arr1);
	const set2 = new Set(arr2);
	return arr1.every(item => set2.has(item)) &&
		arr2.every(item => set1.has(item));
}

describe('Package', function() {
	const modName = 'iftag';

	expectedModules[modName].forEach(name => {
		it(`${name} should be exposed`, function() {
			expect(importedModules[modName][name]).to.exist;
		});
	});

	it(`Nothing else should be exposed`, function() {
		expect(sameMembers(Object.keys(importedModules[modName]), expectedModules[modName])).to.be.true;
	});

	expectedModules.iftag
		.filter(name => name !== '_' && name.startsWith('_'))
		.forEach(name => {
			name = name.substring(1);
			it(`_${name} should be exposed through tag function as _.${name}`, function() {
				expect(importedModules.iftag['_' + name]).to.be.satisfy(val => (typeof val === 'function' || typeof val === 'symbol'));
				expect(importedModules.iftag._[name]).to.equal(importedModules.iftag['_' + name]);
			});
		});


});
