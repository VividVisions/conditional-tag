
import { expect } from 'chai';
import { _, _if, _elseif, _else, _endif, _switch, _case, _default, _endswitch, _always } from 'conditional-tag';
import { ConditionalTagSyntaxError } from '#lib/error.js';

describe('Rendering', function() {
	describe('if syntax', function() {
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
			const test = _`${_if(false)}IF1${_elseif(false)}.ELSEIF${_else}.ELSE`;
			expect(test).to.equal('.ELSE');
		});
	});

	describe('switch syntax', function() {
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
	
	describe('always syntax', function() {
		
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

	describe('Line/Whitespace trimming', function() {

		it('trims expression only (linefeed collapse)', function() {
			const test = _`a\n${_if(true)}\nb`;

			expect(test).to.equal('a\nb');
		});

		it('trims when whitespace only before expression', function() {
			const test = _`a\n\t \t${_if(true)}`;

			expect(test).to.equal('a');
		});

		it('trims when whitespace only after expression', function() {
			const test = _`${_if(true)}\t \t\nb`;

			expect(test).to.equal('b');
		});

		it('doesn\`t trim when non-whitespace before expression', function() {
			const test = _`a\nb ${_if(true)} \nc`;

			expect(test).to.equal('a\nb  \nc');
		});

		it('doesn\`t trim when non-whitespace after expression', function() {
			const test = _`a\n  ${_if(true)}b\nc`;

			expect(test).to.equal('a\n  b\nc');
		});

		it('doesn\`t trim additional whitespace lines', function() {
			const test = _`a\n  \n ${_if(true)} \n \nb`;

			expect(test).to.equal('a\n  \n \nb');
		});

		it('handles CRLF', function() {
			const test = _`a\r\n ${_if(true)} \r\nb`;

			expect(test).to.equal('a\r\nb');
		});
	});

});

describe('Syntax errors', function() {
	describe('if syntax', function() {
		it('throws when _if occurs more than once', function() {
			expect(() => _`${_if(true)}${_if(true)}`).to.throw(ConditionalTagSyntaxError);
		});

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

	describe('switch syntax', function() {
		it('throws when _switch occurs more than once', function() {
			expect(() => _`${_switch(1)}${_switch(2)}`).to.throw(ConditionalTagSyntaxError);
		});

		it('throws when _switch occurs more than once (chained)', function() {
			expect(() => _`${_switch(1)}${_switch(2)._case(3)}`).to.throw(ConditionalTagSyntaxError);
		});

		it('throws when _case occurs without preceding _switch', function() {
			expect(() => _`${_case(1)}`).to.throw(ConditionalTagSyntaxError);
		});

		it('throws when _default occurs without preceding _switch', function() {
			expect(() => _`${_default}`).to.throw(ConditionalTagSyntaxError);
		});

		it('throws when _endswitch occurs without preceding _switch', function() {
			expect(() => _`${_endswitch}`).to.throw(ConditionalTagSyntaxError);
		});
	});
});
