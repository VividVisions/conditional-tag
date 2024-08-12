
import { expect } from './chai.js';
import isArrowFunc from '#lib/is-arrow-func.js';

describe('isArrowFunc()', function() {

	it('recognizes arrow function', function() {
		expect(isArrowFunc(() => null)).to.be.true;
	});

	it('recognizes async arrow function', function() {
		expect(isArrowFunc(async () => null)).to.be.true;
	});

	it('rules out named functions', function() {
		expect(isArrowFunc(function test() { return null; })).to.be.false;
	});

	it('rules out anonymous functions', function() {
		expect(isArrowFunc(function() { return null; })).to.be.false;
	});

	it('rules out classes (functions)', function() {
		expect(isArrowFunc(class Test {})).to.be.false;
	});

	it('rules out built-in functions', function() {
		expect(isArrowFunc(Math.min)).to.be.false;
		expect(isArrowFunc(setTimeout)).to.be.false;
	});

});
