
const funcSwitch = Symbol('switch');
const funcCase = Symbol('case');
const funcSwitchCase = Symbol('switchCase');

function _switch(switchVar) {
	return {
		func: funcSwitch,
		switchVar,
		_case: chainedCase(switchVar, null)
	};
}

function _case(...caseVars) {
	return {
		func: funcCase,
		caseVars
	};
}

const _default = Symbol('default');
const _endswitch = Symbol('endswitch');

function chainedCase(switchVar) {
	return function(...caseVars) {
		return {
			func: funcSwitchCase,
			switchVar,
			caseVars
		}
	}
}

export {
	_switch,
	_case,
	_default,
	_endswitch,
	funcSwitch,
	funcCase,
	funcSwitchCase
};
