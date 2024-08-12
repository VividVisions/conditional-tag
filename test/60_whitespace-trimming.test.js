
import { expect } from './chai.js';
import { _, _async, _if, _elseif, _else, _endif, _switch, _case, _default, _endswitch, _always } from 'conditional-tag';


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
