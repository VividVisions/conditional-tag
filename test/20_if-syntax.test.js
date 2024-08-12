
import { expect } from './chai.js';
import { _, _async, _if, _elseif, _else, _endif, _switch, _case, _default, _endswitch, _always } from 'conditional-tag';
import { ConditionalTagSyntaxError } from '#lib/error.js';

describe('_if syntax', function() {


	describe('Rendering', function() {
		
		it('Correctly renders _if expression', function() {
			const test = _`.${_if(true)}IF${_elseif(false)}ELSEIF${_elseif(false)}ELSEIF2${_else}ELSE${_endif}.`;
			expect(test).to.equal(`.IF.`);
		});

		it('Correctly renders _elseif expression', function() {
			const test = _`.${_if(false)}IF${_elseif(true)}ELSEIF${_elseif(false)}ELSEIF2${_else}ELSE${_endif}.`;
			expect(test).to.equal(`.ELSEIF.`);
		});

		it('Correctly renders second _elseif expression', function() {
			const test = _`.${_if(false)}IF${_elseif(false)}ELSEIF${_elseif(true)}ELSEIF2${_else}ELSE${_endif}.`;
			expect(test).to.equal(`.ELSEIF2.`);
		});

		it('Correctly renders _else expression', function() {
			const test = _`.${_if(false)}IF${_elseif(false)}ELSEIF${_elseif(false)}ELSEIF2${_else}ELSE${_endif}.`;
			expect(test).to.equal(`.ELSE.`);
		});

		it('Correctly renders two consecutive _if/_endif expressions', function() {
			const test = _`${_if(true)}IF1${_endif}.${_if(true)}IF2${_endif}`;
			expect(test).to.equal(`IF1.IF2`);
		});

		it('Correctly renders even if _endif() is omitted at the end', function() {
			const test = _`${_if(false)}IF${_elseif(false)}.ELSEIF${_else}.ELSE`;
			expect(test).to.equal('.ELSE');
		});

	});

	describe('Nesting', function() {

		it('Correctly renders nested _if expression in rendered if-block', function() {
			const test = _`${_if(true)}IF${_if(true)}.NESTEDIF${_endif}.AFTERNESTED${_endif}`;
			expect(test).to.equal('IF.NESTEDIF.AFTERNESTED');
		});

		it('Correctly ignores nested if-block in unrendered if-block', function() {
			const test = _`${_if(false)}IF${_if(true)}.NESTEDIF${_elseif(true)}.NESTEDELSEIF${_else}.NESTEDELSE${_endif}.AFTERNESTED${_endif}`;
			expect(test).to.equal('');
		});

		it('Correctly renders nested _switch expression in rendered if-block', function() {
			const test = _`${_if(true)}IF${_switch(true)._case(true)}.NESTEDCASE${_endswitch}.AFTERNESTED${_endif}`;
			expect(test).to.equal('IF.NESTEDCASE.AFTERNESTED');
		});

		it('Correctly ignores nested switch-block in unrendered if-block', function() {
			const test = _`${_if(false)}IF${_switch(true)._case(true)}.NESTEDCASE1${_case(false)}.NESTEDCASE2${_default}.NESTEDDEFAULT${_endswitch}.AFTERNESTED${_endif}`;
			expect(test).to.equal('');
		});

	});

	describe('Syntax errors', function() {
		
		it('throws when _elseif, _else or _endif occur without preceding _if', function() {
			expect(() => _`${_elseif(true)}`).to.throw(ConditionalTagSyntaxError);
			expect(() => _`${_else}`).to.throw(ConditionalTagSyntaxError);
			expect(() => _`${_endif}`).to.throw(ConditionalTagSyntaxError);
		});

		it('throws when _elseif occurs after _else', function() {
			expect(() => _`${_if(true)}${_else}${_elseif(true)}`).to.throw(ConditionalTagSyntaxError);
		});

		it('throws when _else occurs more than once', function() {
			expect(() => _`${_if(true)}${_else}${_else}`).to.throw(ConditionalTagSyntaxError);
		});

	});

});