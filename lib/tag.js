
import { _if, _elseif, _else, _endif } from '#lib/syntax-if.js';
import IfSyntaxParser from '#lib/parser-if.js';
import { _switch, _case, _default, _endswitch } from '#lib/syntax-switch.js';
import SwitchSyntaxParser from '#lib/parser-switch.js';
import { _always } from '#lib/syntax-always.js';
import AlwaysSyntaxParser from '#lib/parser-always.js';
import makeDebug from 'debug';
const debug = makeDebug('condtag:tag');

const
	beforeRgx = /(^|\r?\n)[^\S\r\n]*$/,
	afterRgx = /^[^\S\r\n]*(\r?\n|$)/,
	isNl = (...arr) => arr.every(str => /^[\r\n]+$/.test(str));

/**
 * Tagging function for templates literals/strings. Enables conditional logic 
 * within these strings.
 * 
 * @param {Array} strings - The strings of the template literal.
 * @param {Array} expressions - The expressions of the template literal.
 * @returns {String} The rendered string.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates}
 * @since 1.0
 */
export function _(strings, ...expressions) {
	const 
		ifParser = new IfSyntaxParser(),
		switchParser = new SwitchSyntaxParser(),
		alwaysParser = new AlwaysSyntaxParser(),
		status = {
			filterOut: false
		},
		// Merge strings and expressions into one array [str[0], val[0], str[1], val[1], …].
		// strings.length is always expressions.length + 1.
		// TODO: Benchmarks. Maybe there's a faster/more efficient way?
		items = strings.flatMap((str, idx) => idx < expressions.length ? [str, expressions[idx]] : str);
	
	debug('Parsing %O', items);
	
	const handled = new Set();
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

	// Potentially trim whitespace lines.
	handled.forEach(afterIdx => {
		const 
			beforeIdx = afterIdx - 1,
			beforeMatch = beforeRgx.exec(output[beforeIdx]),
			afterMatch = afterRgx.exec(output[afterIdx]);

		// Only trim if conditions are met on both sides of the conditional-tag expression.
		// If newlines occur on both sides, collapse them into one newline.
		if (beforeMatch !== null && afterMatch !== null) {
			output[beforeIdx] = output[beforeIdx].replace(beforeRgx, isNl(beforeMatch[1], afterMatch[1]) ? beforeMatch[1] : '');
			output[afterIdx] = output[afterIdx].replace(afterRgx, '');
		}
	});

	return output.join('');
}

// For convenience:
_.if = _if;
_.elseif = _elseif;
_.else = _else;
_.endif = _endif;

_.switch = _switch;
_.case = _case;
_.default = _default;
_.endswitch = _endswitch;

_.always = _always;
