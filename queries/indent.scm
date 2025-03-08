;; Increase indent for block-like directives
((if) @indent.begin)
((elseif) @indent.begin)
((else) @indent.begin)
((switch) @indent.begin)
((case) @indent.begin)
((default) @indent.begin)
((list) @indent.begin)
((macro) @indent.begin)
((function) @indent.begin)
((attempt) @indent.begin)
((recover) @indent.begin)

;; Decrease indent at the end of a block
((if) @indent.end)
((switch) @indent.end)
((list) @indent.end)
((macro) @indent.end)
((function) @indent.end)
((attempt) @indent.end)

;; No indent change for inline/single-line directives
((assign) @indent.ignore)
((import) @indent.ignore)
((include) @indent.ignore)
((stop) @indent.ignore)
((flush) @indent.ignore)
((t) @indent.ignore)