
/**
 * Checks if func is an arrow function.
 * This is a simple test to discern the most common cases.
 * I'm sure it produces false positives if one puts their mind to it.
 *
 * @param {function} func - The function to test.
 * @returns {boolean} true if func is an arrow function. false otherwise.
 */
export default function isArrowFunction(func) {
	return (typeof func === 'function' 
		&& typeof func.prototype === 'undefined' 
		&& func.name === '');
}
