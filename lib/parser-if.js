
import Parser from '#lib/parser.js';
import * as syntax from '#lib/syntax-if.js';
import { ConditionalTagSyntaxError } from '#lib/error.js';
import makeDebug from 'debug';
const debug = makeDebug('condtag:if');


/**
 * Parser class for if syntax expressions.
 * 
 * @since 1.0
 */
export default class IfSyntaxParser extends Parser {
	
	static steps = {
		IGNORED: 0,
		IF: 1,
		ELSEIF: 2,
		ELSE: 3
	};

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


	/**
	 * Checks if the template literal expression is an _if syntax expression.
	 * 
	 * @param {object|string} expr - The template literal expression.
	 * @returns {boolean} True if it is. False otherwise.
	 * @since 1.0
	 */
	canHandle(expr) {
		return (
			this.#isIf(expr) ||
			this.#isElseIf(expr) ||
			this.#isElse(expr) ||
			this.#isEndIf(expr)
		);
	}


	/**
	 * Handles the _if syntax expression.
	 * 
	 * @param {object|string} expr - The _if syntax expression.
	 * @param {object} filterStatus - The status of the filter of the calling tag function.
	 * @returns {boolean} Always false.
	 * @since 1.0
	 */
	handle(expr, filterStatus) {
		let s = this.getStatus();

		// Check if the last conditional-tag was an _always tag and restore
		// original filter status.
		// @TODO Move to tag function to avoid repetition?
		if('beforeAlways' in filterStatus) {
			debug(`beforeAlways (${filterStatus.beforeAlways}) encountered. Setting filter status.`);
			filterStatus.filterOut = filterStatus.beforeAlways;
			delete filterStatus.beforeAlways;
		}

		// Nested _if in unrendered block: Whole if-block at this depth gets ignored.
		if (s !== undefined && s.step === IfSyntaxParser.steps.IGNORED && !this.#isEndIf(expr)) {
			debug('<if-syntax> ignored due to unrendered block.');
		}
		else if (this.#isIf(expr)) {

			if (filterStatus.filterOut === true) {
				this.pushStatus({
					anyCondMet: null,
					step: IfSyntaxParser.steps.IGNORED,
					parentFilter: filterStatus.filterOut
				});

				debug('<if> found in unrendered block. Ignoring this if-block.');
				return false;
			}

			s = this.pushStatus({
				anyCondMet: this.#isCondTrue(expr.cond),
				step: IfSyntaxParser.steps.IF,
				parentFilter: filterStatus.filterOut
			});

			filterStatus.filterOut = !s.anyCondMet;

			debug(`<if> found. New depth: ${this.depth}. Conditions ${s.anyCondMet ? '' : 'NOT '}met.`);
		}
		else if (this.#isElseIf(expr)) {
			if (s === undefined) {
				throw new ConditionalTagSyntaxError('_elseif() must be inside if-block.'); 
			}
			if (s.step > IfSyntaxParser.steps.ELSEIF) {
				throw new ConditionalTagSyntaxError('_elseif() must not occur after _else.');
			}
			
			s.step = IfSyntaxParser.steps.ELSEIF;
			
			if (!s.anyCondMet) {
				this.setStatus('anyCondMet', this.#isCondTrue(expr.cond));
				filterStatus.filterOut = !s.anyCondMet;
				
				debug(`<elseif> found. Depth: ${this.depth}. Conditions ${s.anyCondMet ? '' : 'NOT '}met.`);
			}
			else {
				filterStatus.filterOut = true;
				debug(`<elseif> found. Depth: ${this.depth}. Conditions ignored.`);
			}
		}
		else if (this.#isElse(expr)) {
			if (s === undefined) {
				throw new ConditionalTagSyntaxError('_else must be inside if-block.'); 
			}

			if (s.step > IfSyntaxParser.steps.ELSEIF) {
				throw new ConditionalTagSyntaxError('Only one _else permitted per if-block.');
			}

			s.step = IfSyntaxParser.steps.ELSE;

			// No previous conditions have been met.
			if (!s.anyCondMet) {
				this.setStatus('anyCondMet', true);
				filterStatus.filterOut = false;
				debug(`<else> found. Depth: ${this.depth}. Conditions met.`);
			}
			// A previous condition has been met, so we filter else out.
			else {
				filterStatus.filterOut = true;
				debug(`<else> found. Depth: ${this.depth}. Conditions ignored.`);
			}
		}
		// Reset everything.
		else if (this.#isEndIf(expr)) {
			if (s === undefined) {
				throw new ConditionalTagSyntaxError('_endif must be inside if-block.');
			}

			const oldS = this.popStatus();
			filterStatus.filterOut = oldS.parentFilter;

			debug(`<endif> found. Depth now: ${this.depth}.`);
		}

		return false;
	}
}
