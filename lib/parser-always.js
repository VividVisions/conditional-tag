
import { _always } from '#lib/syntax-always.js';
import makeDebug from 'debug';
const debug = makeDebug('condtag:always');

/**
 * Parser class for the _always expression.
 * 
 * @since 1.0
 */
export default class AlwaysSyntaxParser {
	
	canHandle(expr) {
		return (expr === _always);
	}

	handle(expr, status) {
		status.beforeAlways = status.filterOut;
		status.filterOut = false;

		debug(`<always> found. %o`, status);
		return false;
	}

}
