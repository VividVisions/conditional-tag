
import { _switch, _case, _default, _endswitch, funcSwitch, funcCase, funcSwitchCase } from '#lib/syntax-switch.js';
import { ConditionalTagSyntaxError } from '#lib/error.js';
import makeDebug from 'debug';
const debug = makeDebug('condtag:switch');

/**
 * Parser class for switch syntax expressions.
 * 
 * @since 1.0
 */
export default class SwitchSyntaxParser {
	
	switchVar;
	anyCondMet;

	constructor() {
		this.#reset();
	}

	#reset() {
		this.switchVar = undefined;
		this.anyCondMet = false;
	}

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

	canHandle(expr) {
		return (
			this.#isSwitch(expr) ||
			this.#isCase(expr) ||
			this.#isSwitchCase(expr) || 
			this.#isDefault(expr) ||
			this.#isEndSwitch(expr)
		);
	}

	handle(expr, status) {
		if (this.#isSwitch(expr)) {
			if (this.switchVar !== undefined) {
				throw new ConditionalTagSyntaxError('Only one _switch() permitted per switch-block.');
			}
			this.switchVar = expr.switchVar;
			debug(`<switch> found. Setting switchVar.`);
		}
		else if (this.#isSwitchCase(expr)) {
			if (this.switchVar !== undefined) {
				throw new ConditionalTagSyntaxError('Only one _switch() permitted per switch-block.');
			}
			this.switchVar = expr.switchVar;
			debug(`<switch.case> found. Setting switchVar.`);
			expr.func = funcCase;
		}
		
		if (this.#isCase(expr)) {
			if (this.switchVar === undefined) {
				throw new ConditionalTagSyntaxError('_case() must be inside switch-block.');
			}

			if (expr.caseVars.some(caseVar => (caseVar === this.switchVar))) {
				this.anyCondMet = true;
				status.filterOut = false;
				debug('<case> found. Condition met.');
			}
			else {
				status.filterOut = true;
				debug('<case> found. Condition NOT met.');
			}
		}
		else if (this.#isDefault(expr)) {
			if (this.switchVar === undefined) {
				throw new ConditionalTagSyntaxError('_default must be inside switch-block.');
			}
			
			status.filterOut = this.anyCondMet;	
			
			debug(`<default> found.`);
		}
		else if (this.#isEndSwitch(expr)) {
			if (this.switchVar === undefined) {
				throw new ConditionalTagSyntaxError('_endswitch must be inside switch-block');
			}

			status.filterOut = false;
			this.#reset();

			debug(`<endswitch> found.`);
		}

		return false;
	}
}
