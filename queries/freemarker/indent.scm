;; Increase indent for block-like directives
(if
  (">" @indent.begin)
  ("</#if>" @indent.end))
(switch
  (">" @indent.begin)
  ("</#switch>" @indent.end))
; (case
;   (">" @indent.begin)
;   ("</#case>" @indent.end))
((case) @indent.begin)
((default) @indent.begin)
(list 
  (">" @indent.begin)
  ("</#list>" @indent.end))
(macro 
  (">" @indent.begin)
  ("</#macro>" @indent.end))
(function 
  (">" @indent.begin)
  ("</#function>" @indent.end))
((attempt) @indent.begin)
(escape 
  (">" @indent.begin)
  ("</#escape>" @indent.end))
; ((user_defined) @indent.begin)
; (assign
;   (">" @indent.begin)
;   ("/>" @indent.end))

((user_defined_start) ">" @indent.begin)
((user_defined_end) @indent.end)

;; Increase only for opening 'else' or 'elseif'
;;((else) @indent.begin)
((elseif) @indent.begin)
((recover) @indent.begin)

;; Decrease indent at the end of a block
; ((closing_tag) @indent.end)
((if) @indent.end)
((switch) @indent.end)
((list) @indent.end)
((macro) @indent.end)
((function) @indent.end)
((attempt) @indent.end)
((user_defined) @indent.end)
((escape) @indent.end)

;; No indent change for inline/single-line directives
; ((assign) @indent.ignore)
((import) @indent.ignore)
((include) @indent.ignore)
((stop) @indent.ignore)
((flush) @indent.ignore)
((t) @indent.ignore)
