module.exports = {
	"asi"           : true,     // true: Tolerate Automatic Semicolon Insertion (no semicolons)
	"boss"          : true,     // true: Tolerate assignments where comparisons would be expected
	"debug"         : true,     // true: Allow debugger statements e.g. browser breakpoints.
	"eqnull"        : true,     // true: Tolerate use of `== null`
	"es5"           : false,     // true: Allow ES5 syntax (ex: getters and setters)
	"esnext"        : true,     // true: Allow ES.next (ES6) syntax (ex: `const`)
	"evil"          : true,     // true: Tolerate use of `eval` and `new Function()`
	"expr"          : true,     // true: Tolerate `ExpressionStatement` as Programs
	"funcscope"     : true,     // true: Tolerate defining variables inside control statements"
	"globalstrict"  : false,     // true: Allow global "use strict" (also enables 'strict')
	"iterator"      : true,     // true: Tolerate using the `__iterator__` property
	"lastsemic"     : true,     // true: Tolerate omitting a semicolon for the last statement of a 1-line block
	"laxbreak"      : true,     // true: Tolerate possibly unsafe line breakings
	"laxcomma"      : true,     // true: Tolerate comma-first style coding
	"loopfunc"      : true,     // true: Tolerate functions being defined in loops
	"multistr"      : true,     // true: Tolerate multi-line strings
	"proto"         : true,     // true: Tolerate using the `__proto__` property
	"scripturl"     : true,     // true: Tolerate script-targeted URLs
	"smarttabs"     : true,     // true: Tolerate mixed tabs/spaces when used for alignment
	"shadow"        : true,     // true: Allows re-define variables later in code e.g. `var x=1; x=2;`
	"sub"           : true,     // true: Tolerate using `[]` notation when it can still be expressed in dot notation
	"supernew"      : true,     // true: Tolerate `new function () { ... };` and `new Object;`
	"validthis"     : true     // true: Tolerate using this in a non-constructor function
}

/*module.exports = {
    // Settings
    "passfail"      : false,  // Stop on first error.
    "maxerr"        : 100,    // Maximum error before stopping.
 
 
    // Predefined globals whom JSHint will ignore.
    "browser"       : true,   // Standard browser globals e.g. `window`, `document`.
 
    "node"          : false,
    "rhino"         : false,
    "couch"         : false,
    "wsh"           : true,   // Windows Scripting Host.
 
    "jquery"        : true,
    "ender"         : true,
    "prototypejs"   : false,
    "mootools"      : false,
    "dojo"          : false,
 
    "predef"        : [  // Custom globals.
        //"exampleVar",
        //"anotherCoolGlobal",
        //"iLoveDouglas"
    ],
 
 
    // Development.
    "debug"         : false,  // Allow debugger statements e.g. browser breakpoints.
    "devel"         : true,   // Allow developments statements e.g. `console.log();`.
 
 
    // ECMAScript 5.
    "es5"           : true,   // Allow ECMAScript 5 syntax.
    "strict"        : false,  // Require `use strict` pragma  in every file.
    "globalstrict"  : false,  // Allow global "use strict" (also enables 'strict').
 
 
    // The Good Parts.
    "asi"           : true,  // Tolerate Automatic Semicolon Insertion (no semicolons).
    "laxbreak"      : true,   // Tolerate unsafe line breaks e.g. `return [\n] x` without semicolons.
    "bitwise"       : true,   // Prohibit bitwise operators (&, |, ^, etc.).
    "boss"          : false,  // Tolerate assignments inside if, for & while. Usually conditions & loops are for comparison, not assignments.
    "curly"         : true,   // Require {} for every new block or scope.
    "eqeqeq"        : true,   // Require triple equals i.e. `===`.
    "eqnull"        : false,  // Tolerate use of `== null`.
    "evil"          : false,  // Tolerate use of `eval`.
    "expr"          : false,  // Tolerate `ExpressionStatement` as Programs.
    "forin"         : false,  // Tolerate `for in` loops without `hasOwnPrototype`.
    "immed"         : true,   // Require immediate invocations to be wrapped in parens e.g. `( function(){}() );`
    "latedef"       : true,   // Prohipit variable use before definition.
    "loopfunc"      : false,  // Allow functions to be defined within loops.
    "noarg"         : true,   // Prohibit use of `arguments.caller` and `arguments.callee`.
    "regexp"        : true,   // Prohibit `.` and `[^...]` in regular expressions.
    "regexdash"     : false,  // Tolerate unescaped last dash i.e. `[-...]`.
    "scripturl"     : true,   // Tolerate script-targeted URLs.
    "shadow"        : false,  // Allows re-define variables later in code e.g. `var x=1; x=2;`.
    "supernew"      : false,  // Tolerate `new function () { ... };` and `new Object;`.
    "undef"         : true,   // Require all non-global variables be declared before they are used.
 
 
    // Personal styling preferences.
    "newcap"        : true,   // Require capitalization of all constructor functions e.g. `new F()`.
    "noempty"       : true,   // Prohibit use of empty blocks.
    "nonew"         : true,   // Prohibit use of constructors for side-effects.
    "nomen"         : true,   // Prohibit use of initial or trailing underbars in names.
    "onevar"        : false,  // Allow only one `var` statement per function.
    "plusplus"      : false,  // Prohibit use of `++` & `--`.
    "sub"           : false,  // Tolerate all forms of subscript notation besides dot notation e.g. `dict['key']` instead of `dict.key`.
    "trailing"      : true,   // Prohibit trailing whitespaces.
    "white"         : false,  // Check against strict whitespace and indentation rules.
    "indent"        : 2       // Specify indentation spacing
}*/