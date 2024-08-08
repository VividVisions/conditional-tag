
const condTrue = Symbol('condTrue');
const condFalse = Symbol('condFalse');

function _if(condition) {
	return {
		func: 'if',
		cond: (condition) ? condTrue : condFalse
	};
}

function _elseif(condition) {
	return {
		func: 'elseif',
		cond: (condition) ? condTrue : condFalse
	};
}

const _else = Symbol('else');
const _endif = Symbol('endif');

export {
	_if,
	_elseif,
	_else,
	_endif,
	condTrue,
	condFalse
};
