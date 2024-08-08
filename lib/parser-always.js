
import { _always } from '#lib/syntax-always.js';
import makeDebug from 'debug';
const debug = makeDebug('condtag:always');

/**
 * Parser class for the _always expression.
 * 
 * @since 1.0
 */
export default class AlwaysSyntaxParser {
	
	#isAlways(expr) {
		return (expr === _always);
	}

	canHandle(expr) {
		return this.#isAlways(expr);
	}

	handle(expr, status) {
		// if (this.#isAlways(expr)) {
		status.filterOut = false;
		// }
		debug(`<always> found.`);
		return false;
	}

}
