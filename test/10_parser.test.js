
import { expect } from './chai.js';
import Parser from '#lib/parser.js';


describe('Parser base class', function() {
	
	beforeEach(function() {
		this.p = new Parser();
	});

	it('starts with -1 depth', function() {
		expect(this.p.depth).to.equal(-1);
	});

	it('pushStatus() adds one depth, stores new status and returns it.', function() {
		const s = this.p.pushStatus({ foo: 'bar' });

		expect(s).to.deep.equal({ foo: 'bar' });
		expect(this.p.depth).to.equal(0);
		expect(this.p.status.length).to.equal(1);
	});

	it('getStatus() returns status of current depth', function() {
		this.p.pushStatus({ foo: 'bar' }); // depth 0
		this.p.pushStatus({ bar: 'baz' }); // depth 1
		const s = this.p.getStatus();
		
		expect(s).to.deep.equal({ bar: 'baz' });
	});

	it('setStatus(name, value) sets name and value of current status and returns full status.', function() {
		this.p.pushStatus({ 
			foo: 'bar',
			bar: 'baz' 
		});
		const s = this.p.setStatus('foo', 'yeah');
		
		expect(s).to.deep.equal({
			foo: 'yeah',
			bar: 'baz'
		});
	});

	it('setStatus(obj) sets current status to obj and returns full status.', function() {
		this.p.pushStatus({ foo: 'bar' });
		const s = this.p.setStatus({ 'four': 'lights!' });
		
		expect(s).to.deep.equal({ four: 'lights!' });
	});

	it('popStatus() subtracts one depth, removes last status and returns it', function() {
		this.p.pushStatus({ foo: 'bar' }); // depth 0
		this.p.pushStatus({ bar: 'baz' }); // depth 1

		expect(this.p.depth).to.equal(1);

		const s = this.p.popStatus();
		expect(s).to.deep.equal({ bar: 'baz' });
		expect(this.p.depth).to.equal(0);
		expect(this.p.status.length).to.equal(1);
	});

});
