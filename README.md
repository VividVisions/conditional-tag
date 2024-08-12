# conditional-tag
Clean, easily readable conditional statements in [template literals/strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) for Node.js and browsers. Provides `if` / `elseif` / `else` and `switch` / `case` / `default` syntax options.

```javascript
const html = _`<ul>
  ${_if(aVariable === 1)}
  <li>First</li>
  <li>Second</li>
  ${_elseif(aVariable === 2)}
  <li>Third</li>
  <li>Fourth</li>
  ${_else}
  <li>Fifth</li>
  ${_endif}
  <li>Last</li>
 </ul>`;
```

## Table of Contents
- [Why?](#why)
- [ES module](#es-module)
- [Installation](#installation)
  - [Node.js](#nodejs)
  - [Browser](#browser)
- [Usage](#usage)
  - [Tag function \_\(\)](#tag-function-_)
  - [if syntax](#if-syntax)
    - [\_if\(condition\)](#_ifcondition) 
    - [\_elseif\(condition\)](#_elseifcondition)
    - [\_else](#_else)
    - [\_endif](#_endif)
    - [Examples](#examples)
  - [switch syntax](#switch-syntax)
    - [\_switch\(value\)](#_switchvalue)
    - [\_case\(_value_ \[, _value_, …\]\)](#_casevalue--value-)
    - [\_default](#_default)
    - [\_endswitch](#_endswitch)
    - [Examples](#examples-2)
  - [\_always expression](#_always-expression)
  - [Other expression functions](#other-expression-functions)
    - [Prevent unnecessary function calls](#prevent-unnecessary-function-calls)
    - [Asynchronous functions](#asynchronous-functions)
  - [Nesting](#nesting)
  - [Whitespace\/Line trimming](#whitespaceline-trimming)
- [Importing convenience](#importing-convenience)
- [License](#license)


## Why?
Simple conditional statements in template literals are no problem:

```javascript
const str = `This is a sentence ${(true) ? 'with' : 'without'} a conditional statement.`;
````

Things can get messy and hard to read/maintain when you're working with multi-line strings, longer conditional strings and/or more possible conditions and therefore nested literals:

```javascript
const c = 2;
const str = `Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
tempor incididunt ut labore et dolore magna aliqua. ${(c === 1) ? `Ut enim ad minim veniam,
quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
consequat. ` : (c > 2) ? `Duis aute irure dolor in reprehenderit in voluptate velit esse
cillum dolore eu fugiat nulla pariatur.` : `Excepteur sint occaecat cupidatat non
proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`} Alea iacta est.`;
```

This is where one would likely implement other solutions like splitting up the string or writing a function to handle all cases. But this would render the template literal obsolete or would take parts of the string creation to another place. This library tries to solve these problems:

```javascript
const str = _`Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
tempor incididunt ut labore et dolore magna aliqua. ${_if(c === 1)}Ut enim ad minim veniam,
quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
consequat. ${_elseif(c > 2)}Duis aute irure dolor in reprehenderit in voluptate velit esse
cillum dolore eu fugiat nulla pariatur.${_else}Excepteur sint occaecat cupidatat non
proident, sunt in culpa qui officia deserunt mollit anim id est laborum.${_endif} Alea iacta est.`;
```

## ES module
conditional-tag has been written as an ECMAScript module and all examples will use ES module syntax. If you want to use conditional-tag within a CommonJS application, use dynamic [`import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) instead of `require()`.


## Installation

### Node.js

```shell
npm install conditional-tag
```

### Browser
You'll find a browser-ready, minimized file in the `browser` directory: `conditional-tag.min.js`. 

```html
<script type="module">
  import { _, _if, _else, _endif } from './conditional-tag.min.js';
  
  console.log(_`This is working in the browser too! ${_if(true)}Yay${_else}Boo${_endif}!`);
</script>
```

## Usage

### Tag function \_\(\)
conditional-tag provides the tag function `_()`. If a template string is tagged with this function, all conditional-tag expressions described further below can be used within the string.

```javascript
import { _ } from 'conditional-tag';

const str = _`This string is tagged and ready for conditional-tag expressions.`;
```

⚠️ If you forget to tag the template string, the conditional logic will *not* work. You may see "[object Object]" in your string as a result. A `TypeError` will likely get thrown ("Cannot convert a Symbol value to a string").

### if syntax
conditional-tag provides the following expressions for conditional blocks using *if* syntax.

#### \_if\(_condition_\)
Opens an if-block and evaluates the passed condition. If it produces a [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) result, the strings and (non-if-block) expressions following the `${_if(…)}` expression will be rendered until another if-block expression or the end of the template string is encountered.

#### \_elseif\(_condition_\)
Evaluates the passed condition if no preceding condition has been met. If the condition produces a truthy result, the strings and (non-if-block) expressions following the `${_elseif(…)}` expression will be rendered until another if-block expression or the end of the template string is encountered.

#### \_else
If no preceding condition has been met, the strings and (non-if-block) expressions following the `${_else}` expression will be rendered until an `${_endif}` expression or the end of the template string is encountered.

#### \_endif
Closes the if-block. Can be omitted if `${_endif}` would be at the very end of the template string but it is not recommended, especially with nested conditional-tag blocks.

_Note_: While `_if()` and `_elseif()` are functions, `_else` and `_endif` are variables.

A `ConditionalTagSyntaxError` is thrown when there's something wrong with the syntax, like using `_elseif(…)` after `_else`.

#### Examples

```javascript
import { _, _if, _elseif, _else, _endif } from 'conditional-tag';

let x = 1;
let str = _`X is ${_if(x === 1)}one${_elseif(x === 2)}two${_else}neither one nor two${_endif}.`;
// Result: 'X is one.'

x = 2;
str = _`X is ${_if(x === 1)}one${_elseif(x === 2)}two${_else}neither one nor two${_endif}.`;
// Result: 'X is two.'

x = 3;
str = _`X is ${_if(x === 1)}one${_elseif(x === 2)}two${_else}neither one nor two${_endif}.`;
// Result: 'X is neither one nor two.'
```

### switch syntax
conditional-tag provides the following expressions for conditional blocks using *switch* syntax.

⚠️ **Attention**: Unlike the actual `switch(…)` statement in JavaScript, there is *no* fall-through and *no* `break`. Each `_case(…)` will be evaluated independently. However, `_case(…)` can be passed multiple values, all of which will be compared to the switch-value. The condition is met, when at least one value is equal to it.  
Another difference is that `_default` must come after the `_case()` expressions.

#### \_switch\(_value_\)
Opens a switch-block. Stores the value for further comparison. Does not affect the directly following strings and (non-switch-block) expressions.

#### \_case\(_value_ \[, _value_, …\]\)
Tests the passed value(s) and the one stored in `${_switch(…)}` for strict equality. If at least one of the values are equal, the strings and (non-switch-block) expressions following the `${_case(…)}` expression will be rendered until another switch-block expression or the end of the template string is encountered.

If there's no string or expression between `${_switch(…)}` and `${_case(…)}`, they can be chained together as one expression: `${_switch(…)._case(…)}`.

#### \_default
If no preceding `${_case(…)}` expression had values equal to the switch, the strings and (non-switch-block) expressions following the `${_default}` expression will be rendered until an `${_endswitch}` expression or the end of the template string is encountered.

#### \_endswitch
Closes the switch-block. Can be omitted if `${_endswitch}` would be at the very end of the template string but it is not recommended, especially with nested conditional-tag blocks.

_Note_: While `_switch()` and `_case()` are functions, `_default` and `_endswitch` are variables.

A `ConditionalTagSyntaxError` is thrown when there's something wrong with the syntax, like using `_case([…])` without a preceding `_switch([…])`.

#### Examples

```javascript
import { _, _switch, _case, _default, _endswitch } from 'conditional-tag';

let x = 1;
let str = _`${_switch(x)}X is ${_case(1)}one${_case(2)}two${_default}neither one nor two${_endswitch}.`;
// Result: 'X is one.

// _case() with multiple values:
x = 1;
str = _`When x is 1, 
${_switch(x)._case(1)}this will be shown. 
${_case(1, 2)}This will be shown when x is 1 or 2.
${_case(3)}Shown when x is 3.
${_default}Shown when x is anything but 1, 2 or 3.`;
// Result:
// 'When x is 1,
// this will be shown.
// This will be shown, when x is 1 or 2.'
```

### \_always expression
conditional-tag also provides a special `_always` expression. Strings and (non-conditional-tag) expressions following `${_always}` will **always** be rendered until a conditional-tag expression or the end of the template string is encountered, even if they are within a block which would otherwise stay unrendered (no matter the nesting depth).

```js
import { _, _switch, _case, _default, _endswitch, _always } from 'conditional-tag';

let x = 1;
let str = _`${_switch(x)}X is ${_case(1)}one${_case(2)}two${_always} (This will be rendered anyway!)${_default}neither one nor two${_endswitch}.`;
// Result: 'X is one (This will be rendered anyway!).' 
```

### Other expression functions
Naturally, you can use non-condtional-tag expressions in tagged template literals.  
⚠️ **BUT**: If you call a function in an expression, the call is triggered regardless of being in a rendered or unerendered conditional-tag block:

```javascript
import { _, _if } from 'conditional-tag';

function test() {
  return 'called';
}

const str = _`${_if(false)} not rendered ${test()}`;
// Result: '' but test() has been called despite being in an unrendered block.
```

#### Prevent unnecessary function calls

To prevent this from happening, just wrap your function call in an arrow function. The tag function will recognize them and only trigger a call in rendered blocks.

```javascript
import { _, _if } from 'conditional-tag';

function test() {
  return 'called';
}

const str = _`${_if(false)} not rendered ${() => test()}`;
// Result: '' and test() will NOT have been called.
```

This may make the template literal a bit harder to read but it saves precious CPU time.

#### Asynchronous functions

If you have to call asynchronous functions in an expression, use the special `_async()` tag function. It works exactly as the `_()` tag function but is able to handle Promises. There's no need to change the wrapping arrow function.

```javascript
import { _async, _if } from 'conditional-tag';

function asyncTest() {
  return Promise.resolve('called');
}

const str = await _async`${_if(true)}${() => asyncTest()}`;
// Result: 'called'
```

_Note_: If you use the synchronous tag function `_()` and call asynchronous functions in expressions, you will get errors.


### Nesting
Both, if-blocks and switch-blocks can be nested in other if- or switch-blocks:

```javascript
import { _, _if, _else, _endif, _switch, _case, _endswitch } from 'conditional-tag';

const x = true;
const y = false;

const str =  _`
${_switch(x)._case(true)}
x is true.
${_if(y === true)}
y is true as well.
${_else}
y is NOT true as well.
${_endif}
${_case(false)}
x is false.
${_endswitch}
`;
// Result: 
// 'x is true.
// y is NOT true as well.'
```

Be mindful of your `${_endif}` and `${_switch}` expressions because forgetting or misplacing them will lead to confusing results and/or errors!

### Whitespace\/line trimming
Conditional-tag expressions don't add any whitespace to the resulting string. Furthermore, if a conditional-tag expression is the only expression in a line of a multi-line template string and is only - if at all - surrounded by whitespace characters, the whole line gets trimmed.

```javascript
import { _, _switch, _case, _default, _endswitch, _always } from 'conditional-tag';

const x = 1;
const html = _`${_switch(x)}
<ul>
  <li>First item</li>
  <li>Second item</li>
  ${_case(1)}
  <li>Third item</li>
  ${_case(2)}
  <li>Forth item</li>
  ${_case(3)}
  <li>Fifth item</li>
  <li>Sixth item</li>
  ${_always}
</ul>
${_endswitch}`;

/*
Result:
`<ul>
  <li>First item</li>
  <li>Second item</li>
  <li>Third item</li>
</ul>`
*/
```

### Importing convenience
All conditional-tag expressions are also available through the tag function itself (without the leading underscore), so they don't have to be imported individually. This could however throw off syntax highlighting in your editor of choice (and also be considered a tad less readable).

```javascript
import { _ } from 'conditional-tag';

let x = 2;
str = _`X is ${_.if(x === 1)}one${_.elseif(x === 2)}two${_.else}neither one nor two${_.endif}.`;
// Result: 'X is two.'
```

## License
conditional-tag is © 2024 Walter Krivanek and released under the [MIT license](https://mit-license.org).
