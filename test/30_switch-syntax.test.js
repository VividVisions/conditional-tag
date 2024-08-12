
import { expect } from './chai.js';
import { _, _async, _if, _elseif, _else, _endif, _switch, _case, _default, _endswitch, _always } from 'conditional-tag';
import { ConditionalTagSyntaxError } from '#lib/error.js';


describe('_switch syntax', function() {

	describe('Rendering', function() {
		
		it('Correctly renders _switch expression', function() {
			const test = _`${_switch(1)}.`;
			expect(test).to.equal(`.`);
		});

		it('Correctly renders chained _switch._case expression', function() {
			let test = _`${_switch(1)._case(2)}NOPE.${_case(1)}YUP`;
			expect(test).to.equal(`YUP`);

			test = _`${_switch(2)._case(2)}YUP${_case(1)}NOPE`;
			expect(test).to.equal(`YUP`);
		});

		it('Correctly renders _case expression', function() {
			const test = _`.${_switch(1)}${_case(1)}CASE1${_case(2)}CASE2${_default}DEFAULT${_endswitch}.`;
			expect(test).to.equal(`.CASE1.`);
		});

		it('Correctly renders second _case expression', function() {
			const test = _`.${_switch(2)}${_case(1)}CASE1${_case(2)}CASE2${_default}DEFAULT${_endswitch}.`;
			expect(test).to.equal(`.CASE2.`);
		});

		it('Correctly renders _default expression', function() {
			const test = _`.${_switch(3)}${_case(1)}CASE1${_case(2)}CASE2${_default}DEFAULT${_endswitch}.`;
			expect(test).to.equal(`.DEFAULT.`);
		});

		it('Correctly renders even if _endswitch() is omitted at the end', function() {
			const test = _`${_switch(false)}SWITCH${_case(true)}.CASE1${_case(false)}.CASE2`;
			expect(test).to.equal('SWITCH.CASE2');
		});

	});


	describe('Nesting', function() {

		it('Correctly renders nested _switch expression in rendered switch-block', function() {
			const test = _`${_switch(true)._case(true)}CASE1${_switch(false)._case(true)}CASE1.1${_case(false)}.CASE1.2${_endswitch}.AFTERNESTED${_endswitch}`;
			expect(test).to.equal('CASE1.CASE1.2.AFTERNESTED');
		});

		it('Correctly ignores nested switch-block in unrendered switch-block', function() {
			const test = _`${_switch(false)._case(true)}CASE1${_switch(false)._case(true)}CASE1.1${_case(false)}.CASE1.2${_endswitch}.AFTERNESTED${_endswitch}`;
			expect(test).to.equal('');
		});

		it('Correctly renders nested _if expression in rendered switch-block', function() {
			const test = _`${_switch(true)._case(true)}CASE1${_if(true)}.IF${_elseif(false)}.ELSE${_endif}.AFTERNESTED${_endswitch}`;
			expect(test).to.equal('CASE1.IF.AFTERNESTED');
		});

		it('Correctly ignores nested if-block in unrendered switch-block', function() {
			const test = _`${_switch(false)._case(true)}CASE1${_if(true)}IF${_elseif(false)}.ELSEIF${_endif}.AFTERNESTED${_endswitch}`;
			expect(test).to.equal('');
		});

	});


	describe('Syntax errors', function() {

		it('throws when _case occurs without preceding _switch', function() {
			expect(() => _`${_case(1)}`).to.throw(ConditionalTagSyntaxError);
		});

		it('throws when _default occurs without preceding _switch', function() {
			expect(() => _`${_default}`).to.throw(ConditionalTagSyntaxError);
		});

		it('throws when _default occurs without preceding _case', function() {
			expect(() => _`${_switch(true)}${_default}`).to.throw(ConditionalTagSyntaxError);
		});

		it('throws when _endswitch occurs without preceding _switch', function() {
			expect(() => _`${_endswitch}`).to.throw(ConditionalTagSyntaxError);
		});

		it('throws when nested _switch occurs without a _case', function() {
			expect(() => _`${_switch(true)}${_switch(true)}`).to.throw(ConditionalTagSyntaxError);
		});

		it('throws when nested _switch occurs without a _case', function() {
			expect(() => _`${_switch(true)}${_switch(true)}`).to.throw(ConditionalTagSyntaxError);
		});

	});

});
	