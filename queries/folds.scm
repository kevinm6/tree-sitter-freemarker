;; Foldable block directives
(if) @fold
(elseif) @fold
;;(else) @fold
(switch) @fold
(case) @fold
(default) @fold
(list) @fold
(macro) @fold
(function) @fold
(attempt) @fold
(recover) @fold
(user_defined) @fold
(assign) @fold
(global) @fold
(local) @fold

((assign) @fold (#has-ancestor? closing_tag))
((global) @fold (#has-ancestor? closing_tag))
((local) @fold (#has-ancestor? closing_tag))