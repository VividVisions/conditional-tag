
import Parser from '#lib/parser.js';
import { _switch, _case, _default, _endswitch, funcSwitch, funcCase, funcSwitchCase } from '#lib/syntax-switch.js';
import { ConditionalTagSyntaxError } from '#lib/error.js';
import makeDebug from 'debug';
const debug = makeDebug('condtag:switch');

/**
 * Parser class for switch syntax expressions.
 * 
 * @since 1.0
 */
export default class SwitchSyntaxParser extends Parser {
	
	#isSwitch(expr) {
		return (expr?.func === funcSwitch);
	}

	#isCase(expr) {
		return (expr?.func === funcCase);
	}

	#isSwitchCase(expr) {
		return (expr?.func === funcSwitchCase);
	}

	#isDefault(expr) {
		return (expr === _default);
	}

	#isEndSwitch(expr) {
		return (expr === _endswitch);
	}


	/**
	 * Checks if the template literal expression is a _switch syntax expression.
	 * 
	 * @param {object|string} expr - The template literal expression.
	 * @returns {boolean} True if it is. False otherwise.
	 * @since 1.0
	 */
	canHandle(expr) {
		return (
			this.#isSwitch(expr) ||
			this.#isCase(expr) ||
			this.#isSwitchCase(expr) || 
			this.#isDefault(expr) ||
			this.#isEndSwitch(expr)
		);
	}


	/**
	 * Handles the _switch syntax expression.
	 * 
	 * @param {object|string} expr - The _switch syntax expression.
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

		// Nested _switch in unrendered block: Whole switch-block at this depth gets ignored.
		if (s !== undefined && s.ignored === true && !this.#isEndSwitch(expr)) {
			debug('<switch-syntax> ignored due to unrendered block.');
			return false;
		}

		if (this.#isSwitch(expr) || this.#isSwitchCase(expr)) {
			// No _case has been handled yet.
			if (s !== undefined && !s?.case) {
				throw new ConditionalTagSyntaxError('_switch() can only be nested inside other _case () blocks.');
			}

			if (filterStatus.filterOut === true) {
				this.pushStatus({
					ignored: true,
					parentFilter: filterStatus.filterOut
				});

				debug('<switch> found in unrendered block. Ignoring this switch-block.');
				return false;
			}

			s = this.pushStatus({
				switchVar: expr.switchVar,
				parentFilter: filterStatus.filterOut
			});

			if (this.#isSwitchCase(expr)) {
				debug(`<switch.case> found. New depth: ${this.depth}. Setting switchVar.`);
				expr.func = funcCase;
			}
			else {
				debug(`<switch> found. New depth: ${this.depth}. Setting switchVar.`);
			}
		}

		if (this.#isCase(expr)) {
			if (s === undefined) {
				throw new ConditionalTagSyntaxError('_case() must be inside switch-block.');
			}

			// At least one _case has been handled at this depth.
			s.case = true;

			if (expr.caseVars.some(caseVar => (caseVar === s.switchVar))) {
				this.setStatus('anyCondMet', true);
				filterStatus.filterOut = false;
				debug(`<case> found. Depth: ${this.depth}. Condition met.`);
			}
			else {
				filterStatus.filterOut = true;
				debug(`<case> found. Depth: ${this.depth}. Condition NOT met.`);
			}
		}
		else if (this.#isDefault(expr)) {
			if (s === undefined) {
				throw new ConditionalTagSyntaxError('_default must be inside switch-block.');
			}

			if (!s?.case) {
				throw new ConditionalTagSyntaxError('_default must be preceded by at least one _case.');
			}

			filterStatus.filterOut = s.anyCondMet;
			debug(`<default> Depth: ${this.depth}. found. Conditions ${s.anyCondMet === true ? 'ignored' : 'met'}.`);
		}
		else if (this.#isEndSwitch(expr)) {
			if (s === undefined) {
				throw new ConditionalTagSyntaxError('_endswitch must be inside switch-block');
			}

			// filterStatus.filterOut = false;
			// this.#reset();

			const oldS = this.popStatus();
			filterStatus.filterOut = oldS.parentFilter;

			debug(`<endswitch> found. Depth now: ${this.depth}.`);
		}

		return false;
	}
}
