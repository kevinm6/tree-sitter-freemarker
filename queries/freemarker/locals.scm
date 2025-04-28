; Local query for identifying blocks and expressions

; Identifying blocks (assign, if, etc.)
; (
;   (if) @block
;   (assign) @block
;   (list) @block
;   (macro) @block
;   (function) @block
;   (switch) @block
; )

; Recognize expressions inside blocks, like assignments and conditions
; (
;   ; Inside an assignment, treat it as a variable
;   ; (assign
;   ;   (parmeter_group) @variable
;   ;   (expression) @expression
;   ; )
;
;   ; Inside an <#if> block, recognize the condition expression
;   (if
;     (expression) @condition
;     (expression) @condition
;   )
;
;   ; Recognize operators
;   (operator) @operator
; )

; Indentation rules for blocks
; (define-indentation
;   ; <#if> and <#assign> should have the same indenting rule
;   (if) @block
;   (assign) @block
;   (macro) @block
; )
