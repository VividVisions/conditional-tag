
import { expect, spy } from './chai.js';
import { _, _async, _if, _elseif, _else, _endif, _switch, _case, _default, _endswitch, _always } from 'conditional-tag';

	
describe('Function syntax', function() {

	describe('Wrapped function expressions', function() {
		
		const func = function() {
			return '.CALLED';
		}

		beforeEach(function () {
			this.spiedFunc = spy(func);
		});

		it('Only calls wrapped functions if condition is met', function() {
			const test = _`${_switch(true)}SWITCH${_case(true)}.CASE1${() => this.spiedFunc()}${_case(false)}.CASE2${() => this.spiedFunc()}`;
			
			expect(test).to.equal('SWITCH.CASE1.CALLED');
			expect(this.spiedFunc).to.have.been.called.once;
		});

	});


	describe('Wrapped async function expressions', function() {
		
		const func = function() {
			return Promise.resolve('.CALLED');
		}

		beforeEach(function () {
			this.spiedFunc = spy(func);
		});

		it('Only calls wrapped functions if condition is met', async function() {
			const test = await _async`${_switch(true)}SWITCH${_case(true)}.CASE1${() => this.spiedFunc()}${_case(false)}.CASE2${() => this.spiedFunc()}`;
			
			expect(test).to.equal('SWITCH.CASE1.CALLED');
			expect(this.spiedFunc).to.have.been.called.once;
		});

		it('Throws error if async function expression is used with sync _', async function() {
			
			expect(function() {
				const test = _`${() => func()}`;	
			}).to.throw(Error);
		});

	});

});