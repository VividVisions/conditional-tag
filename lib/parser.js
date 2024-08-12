

/**
 * Base parser class with common functionality.
 *
 * @since 1.2.0
 */
export default class Parser {
	status = [];
	depth = -1;

	getStatus() {
		return this.status[this.depth];
	}

	setStatus(statusObjOrName, value) {
		if (typeof statusObjOrName === 'string' && typeof value !== undefined) {
			this.status[this.depth][statusObjOrName] = value;
		}
		else {
			this.status[this.depth] = statusObjOrName;	
		}

		return this.status[this.depth];
	}

	pushStatus(statusObj) {
		this.depth++;
		this.status.push(statusObj);

		return this.status.at(-1);
	}

	popStatus() {
		this.depth--;

		return this.status.pop();
	}

	/* c8 ignore next 7 */
	canHandle() {
		throw new Error('canHandle() not implemented.');
	}

	handle() {
		throw new Error('handle() not implemented.');
	}
}
