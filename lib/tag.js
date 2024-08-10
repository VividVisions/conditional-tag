
import { _if, _elseif, _else, _endif } from '#lib/syntax-if.js';
import IfParser from '#lib/parser-if.js';
import { _switch, _case, _default, _endswitch } from '#lib/syntax-switch.js';
import SwitchParser from '#lib/parser-switch.js';
import { _always } from '#lib/syntax-always.js';
import AlwaysParser from '#lib/parser-always.js';
import FunctionParser from '#lib/parser-function.js';
import isArrowFunc from '#lib/is-arrow-func.js';
import makeDebug from 'debug';
const debug = makeDebug('condtag:tag');

const
	beforeRgx = /(^|\r?\n)[^\S\r\n]*$/,
	afterRgx = /^[^\S\r\n]*(\r?\n|$)/,
	nlRgx = /^[\r\n]+$/,
	isNl = (...arr) => arr.every(str => nlRgx.test(str));


/**
 * Interleaves strings and expressions of a template literal into one array [str[0], val[0], str[1], val[1], …].
 * In template literals, an expression is always surrounded by strings, even if they are empty. 
 * Therefore, strings.length is always expressions.length + 1.
 * 
 * @param {Array} strings - The strings.
 * @param {Array} expressions - The expressions.
 * @returns {Array} The interleaved array of both strings and expressions.
 * @todo Benchmarks. Maybe there's a faster/more efficient way?
 * @since 1.1
 */
function interleave(strings, expressions) {
	return strings.flatMap((str, idx) => idx < expressions.length ? [str, expressions[idx]] : str);
}


/**
 * Result of the `parse()` function.
 * 
 * @typedef {Object} ParsedResult
 * @property {Array} output - Array of parsed and filtered strings.
 * @property {Array} handled - Array of indices where condition-tag expressions were encountered in the output array.
 */


/**
 * Parses an array of interleaved template literal strings and expressions.
 * Checks for conditional-tag expressions and filters out items where conditions are not met.
 * 
 * @param {Array} items - The array of interleaved items.
 * @returns {ParsedResult} The result.
 * @since 1.1
 */
function parse(items) {
	const 
		ifParser = new IfParser(),
		switchParser = new SwitchParser(),
		alwaysParser = new AlwaysParser(),
		functionParser = new FunctionParser(),
		status = {
			filterOut: false
		},
		handled = new Set();

	let index = 0;

	const output = items.filter((item, idx) => {
		debug('Looking at item %d.', idx);
		
		if (typeof item !== 'string') {
			if (ifParser.canHandle(item)) {
				handled.add(index);
				return ifParser.handle(item, status);
			}
			else if (switchParser.canHandle(item)) {
				handled.add(index);
				return switchParser.handle(item, status);
			}
			else if (alwaysParser.canHandle(item)) {
				handled.add(index);
				return alwaysParser.handle(item, status);
			}
			else if (functionParser.canHandle(item)) {
				functionParser.handle(item, status);
			}
			/* c8 ignore next 3*/
			else {
				debug('Expression found.');
			}
		}
		/* c8 ignore next 3*/
		else {
			debug('String found.');
		}

		// Filter out.
		if (status.filterOut) {
			debug('› Filterting.');
			return false;
		}

		// Don't filter out.
		debug('› Not filterting.');
		index++;
		return true;
	});

	return { output, handled }
}


/**
 * Trims lines of a multi-line template literal in the case that a condition-tag expression
 * was surrounded by only whitespace characters on that line.
 * 
 * @param {Array} strings - Array of parsed strings.
 * @param {Array} handled - Array of indices where condition-tag expressions were encountered in the strings array.
 * @since 1.1
 */
function trim(strings, handled) {
	// Potentially trim whitespace lines.
	handled.forEach(afterIdx => {
		const 
			beforeIdx = afterIdx - 1,
			beforeMatch = beforeRgx.exec(strings[beforeIdx]),
			afterMatch = afterRgx.exec(strings[afterIdx]);

		// Only trim if conditions are met on both sides of the conditional-tag expression.
		// If newlines occur on both sides, collapse them into one newline.
		if (beforeMatch !== null && afterMatch !== null) {
			strings[beforeIdx] = strings[beforeIdx].replace(beforeRgx, isNl(beforeMatch[1], afterMatch[1]) ? beforeMatch[1] : '');
			strings[afterIdx] = strings[afterIdx].replace(afterRgx, '');
		}
	});
}


/**
 * Tag function for templates literals/strings. Enables conditional logic 
 * within these strings.
 * 
 * @param {Array} strings - The strings of the template literal.
 * @param {Array} expressions - The expressions of the template literal.
 * @returns {string} The rendered string.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates}
 * @since 1.0
 */
export function _(strings, ...expressions) {
	const items = interleave(strings, expressions);
	
	debug('Parsing %O', items);

	try {
		const { output, handled } = parse(items);
		trim(output, handled);
		return output.join('');
	}
	catch(err) {
		// Trying to be a bit more helpful. 
		if (err instanceof TypeError) {
			throw new Error(`${err.message} (Maybe there's an async function in an expression? Use tag function _.a with await.)`, { cause: err });
		}
		
		throw err;
	}
}


/**
 * Asynchronous tag function for templates literals/strings. Enables conditional logic 
 * within these strings.
 * 
 * @param {Array} strings - The strings of the template literal.
 * @param {Array} expressions - The expressions of the template literal.
 * @returns {string} The rendered string.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates}
 * @since 1.1
 */
export async function _async(strings, ...expressions) {
	const items = interleave(strings, expressions);
	
	debug('Parsing (async) %O', items);

	const { output, handled } = parse(items);
	const resolved = await Promise.all(output.map(item => {
		if (isArrowFunc(item)) {
			// In case of async functions, this will be a Promise.
			return item[Symbol.toPrimitive]();
		}
		else {
			return item;
		}
	}));
	trim(resolved, handled);
	return resolved.join('');

}


// For convenience:
_.if = _if;
_.async = _async;
_.elseif = _elseif;
_.else = _else;
_.endif = _endif;

_.switch = _switch;
_.case = _case;
_.default = _default;
_.endswitch = _endswitch;

_.always = _always;
