
import * as syntax from '#lib/syntax-if.js';
import { ConditionalTagSyntaxError } from '#lib/error.js';
import makeDebug from 'debug';
const debug = makeDebug('condtag:if');


/**
 * Parser class for if syntax expressions.
 * 
 * @since 1.0
 */
export default class IfSyntaxParser {
	
	static steps = {
		NEUTRAL: 0,
		IF: 1,
		ELSEIF: 2,
		ELSE: 3
	};

	withinIf;
	anyCondMet;
	step;

	constructor() {
		this.#reset();
	}

	#reset() {
		this.withinIf = false;
		this.anyCondMet = false;
		this.step = IfSyntaxParser.NEUTRAL;
	}

	#isIf(expr) {
		return (expr?.func === 'if' && (this.#isCondTrue(expr?.cond) || this.#isCondFalse(expr?.cond)));
	}

	#isElseIf(expr) {
		return (expr?.func === 'elseif' && (this.#isCondTrue(expr?.cond) || this.#isCondFalse(expr?.cond)));
	} 

	#isElse(expr) {
		return (expr === syntax._else);
	}

	#isEndIf(expr) {
		return (expr === syntax._endif);
	}

	#isCondTrue(expr) {
		return (expr === syntax.condTrue);
	}	
	
	#isCondFalse(expr) {
		return (expr === syntax.condFalse);
	}

	canHandle(expr) {
		return (
			this.#isIf(expr) ||
			this.#isElseIf(expr) ||
			this.#isElse(expr) ||
			this.#isEndIf(expr)
		);
	}

	handle(expr, status) {
		if (this.#isIf(expr)) {
			if (this.withinIf) {
				throw new ConditionalTagSyntaxError('Only one _if() permitted per if-block.');
			}

			this.anyCondMet = this.#isCondTrue(expr.cond);
			status.filterOut = !this.anyCondMet;
			this.step = IfSyntaxParser.steps.IF;
			this.withinIf = true;

			debug(`<if> found. Conditions ${this.anyCondMet ? '' : 'NOT '}met.`);
		}
		else if (this.#isElseIf(expr)) {
			if (!this.withinIf) {
				throw new ConditionalTagSyntaxError('_elseif() must be inside if-block.'); 
			}
			if (this.step > IfSyntaxParser.steps.ELSEIF) {
				throw new ConditionalTagSyntaxError('_elseif() must not occur after _else.');
			}
			
			this.step = IfSyntaxParser.steps.ELSEIF;
			
			if (!this.anyCondMet) {
				this.anyCondMet = this.#isCondTrue(expr.cond);
				status.filterOut = !this.anyCondMet;
				
				debug(`<elseif> found. Conditions ${this.anyCondMet ? '' : 'NOT '}met.`);
			}
			else {
				status.filterOut = true;
				debug(`<elseif> found. Conditions ignored.`);
			}
		}
		else if (this.#isElse(expr)) {
			if (!this.withinIf) {
				throw new ConditionalTagSyntaxError('_else must be inside if-block.'); 
			}
			if (this.step > IfSyntaxParser.steps.ELSEIF) {
				throw new ConditionalTagSyntaxError('Only one _else permitted per if-block.');
			}

			this.step = IfSyntaxParser.steps.ELSE;

			// No previous conditions have been met.
			if (!this.anyCondMet) {
				status.filterOut = false;
				this.anyCondMet = true;
			}
			// A previous condition has been met, so we filter else out.
			else {
				status.filterOut = true;
			}

			debug(`<else> found.`);
		}
		// Reset everything.
		else if (this.#isEndIf(expr)) {
			if (!this.withinIf) {
				throw new ConditionalTagSyntaxError('_endif must be inside if-block.');
			}

			this.#reset();
			status.filterOut = false;			
			
			debug(`<endif> found.`);
		}

		return false;
	}
}
