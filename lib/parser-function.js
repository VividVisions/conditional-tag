
import isArrowFunc from '#lib/is-arrow-func.js';
import makeDebug from 'debug';
const debug = makeDebug('condtag:function');

/**
 * Parser class for arrow function expressions.
 * This mechanism is used to prevent unneccesary function
 * calls in unrendered blocks.
 * 
 * @since 1.1
 */
export default class FunctionSyntaxParser {
	
	canHandle(expr) {
		return isArrowFunc(expr);
	}

	handle(expr, status) {
		if (!status.filterOut) {
			debug('<function> found. Evaluating.');

			// expr.toString = function() {
			// 	return this();
			// }

			expr[Symbol.toPrimitive] = function() {
				debug('toPrimitive()');
				return this();
			}
		}
		else {
			debug('<function> found. Skipping.');	
		}
	}

}
