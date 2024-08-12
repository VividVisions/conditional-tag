
import { expect } from './chai.js';
import { _, _async, _if, _elseif, _else, _endif, _switch, _case, _default, _endswitch, _always } from 'conditional-tag';


describe('_always syntax', function() {
	
	it('Correctly renders _always in rendered block', function() {
		let test = _`${_switch(true)}SWITCH${_case(true)}.CASE1${_always}.ALWAYS${_case(false)}.CASE2`;
		expect(test).to.equal('SWITCH.CASE1.ALWAYS');

		test = _`${_if(true)}IF${_always}.ALWAYS${_elseif(false)}.ELSEIF${_else}.ELSE`;
		expect(test).to.equal('IF.ALWAYS');
	});

	it('Correctly renders _always in unrendered block', function() {
		let test = _`${_switch(false)}SWITCH${_case(true)}.CASE1${_always}.ALWAYS${_case(false)}.CASE2`;
		expect(test).to.equal('SWITCH.ALWAYS.CASE2');

		test = _`${_if(false)}IF${_always}.ALWAYS${_elseif(true)}.ELSEIF${_else}.ELSE`;
		expect(test).to.equal('.ALWAYS.ELSEIF');
	});

});
