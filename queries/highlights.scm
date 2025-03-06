(comment) @comment
; === Comments ===

; === Directives ===
(directive) @keyword
(user_defined) @function.builtin
(assign) @keyword
(global) @keyword
(local) @keyword
(if) @conditional
(elseif) @conditional
(if_else) @conditional
(list) @repeat
(switch) @keyword
(case) @keyword
(default) @keyword
(macro) @function
(function) @function
(attempt) @exception
(recover) @exception
(fallback) @exception
(stop) @keyword
(include) @include
(import) @include
(setting) @keyword
(recurse) @keyword
(visit) @keyword
(return) @keyword
(break) @keyword
(continue) @keyword
(sep) @keyword

; === Expressions ===
(expression) @variable
(type) @type
(boolean) @boolean
(number) @number
(string) @string
(sequence) @constant
(hash) @constant

; === Operators ===
(operator) @operator
(operator "using") @keyword
(operator "is") @keyword
(operator "=") @operator.assignment
(operator ["==" "!=" "<" "<=" ">"]) @operator.comparison
(operator) @operator.comparison
(operator ["&&" "||" "!"]) @operator.logical
(operator [".." "..<" "..!"]) @operator
(operator ["*" "+" "-" "/" "%"]) @operator.arithmetic

; === Interpolations ===
(interpolation) @string.special
(bracket) @punctuation.bracket

; === Variables and Built-ins ===
(top_level) @variable
(spec_var) @constant.builtin
;(_spec_var_name) @constant.builtin
(built_in) @function.builtin

; === Blocks ===
(end_assign) @keyword
(end_global) @keyword
(end_local) @keyword

; === Miscellaneous ===
(parameter_group) @parameter
(group) @punctuation.bracket