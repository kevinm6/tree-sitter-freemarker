/**
 * @file Apache Freemarker
 * @author Kevin M @kevinm6
 * @license MIT
 */

module.exports = grammar({
  name: "freemarker",
  conflicts: ($) => [
    // [$.assign, $.comment],
    // [$.assign, $.directive],
    [$.directive, $.user_defined],
    // [$.string, $.interpolation],
    // [$.string, $.string_escape_sequence],
  ],

  rules: {
    // The production rules of the context-free grammar
    source_file: ($) => repeat($._definition),

    _definition: ($) =>
      choice(
        $.comment,
        $.directive,
        $.cdata,
        $.interpolation,
        // $.user_defined,
        //$.html,
      ),

    comment: (_) =>
      token(
        seq("<#--", repeat(choice(/[^-]/, /-[^-]/, /--[^>]/)), "-->"),
        // repeat(/[^-]|-[^-]/),
      ), // multi-line comments

    interpolation: ($) =>
      prec.right(1, seq("$", "{", repeat($._interp_chunk), "}")),

    _interp_chunk: ($) =>
      choice(
        $.interpolation, // allow nesting
        token(prec(-1, /[^${}]+/)), // plain text that doesn't include braces or dollar
        token(prec(-1, /[^{}$]/)), // single character fallback
      ),

    directive: ($) =>
      choice(
        $.assign,
        $.attempt,
        $.fallback,
        $.flush,
        $.ftl,
        $.global,
        $.if,
        $.import,
        $.include,
        $.function,
        $.list,
        $.local,
        $.lt,
        $.macro,
        $.nt,
        $.recurse,
        $.rt,
        $.setting,
        $.stop,
        $.switch,
        $.t,
        $.user_defined,
        $.visit,
        $.escape,
      ),

    parameter_group: ($) => choice($.as_expression, $.expression, $.built_in),

    as_expression: ($) =>
      prec.right(
        1,
        seq(repeat(prec(2, $.type)), alias("as", $.as), repeat1($.type)),
      ),

    expression: ($) =>
      choice(
        $.interpolation, // interpolation can be a full expression itself!
        prec.right(
          1,
          seq(
            repeat1(prec(2, $.type)),
            optional($.operator),
            optional(repeat1($.type)),
          ),
        ),
        prec.left(1, seq($.operator, repeat($.type))),
        $.interpolation,
      ),

    type: ($) =>
      choice(
        $.boolean,
        $.group,
        $.hash,
        $.number,
        $.sequence,
        $.spec_var,
        $.string,
        $.top_level,
      ),

    built_in: ($) => prec.left(1, seq("?", repeat($.top_level))),

    group: ($) =>
      seq(
        alias("(", $.bracket),
        repeat1($.parameter_group),
        alias(")", $.bracket),
      ),

    operator: (_) =>
      choice(
        "using",
        "is",
        ",",

        //SEQUENCE OPERATIONS
        "..",
        "..<",
        "..!",

        //HASH OPERATIONS
        ":",

        //ARITHMETICAL OPERATIONS
        "*",
        "+",
        "/",
        "-",
        "%",

        //COMPARISON OPERATIONS
        "==",
        "!=",
        "<",
        "<=",
        "lt",
        "lte",
        "gt",
        "gte",
        "eq",
        "neq",

        //LOGICAL OPERATIONS
        "!",
        "&&",
        "||",
        "??",

        //ASSIGNMENT OPERATIONS
        "=",
      ),

    //DIRECT Values
    // string: ($) => choice(token(/\"(\\.|[^\"])*\"/), token(/\'(\\.|[^\'])*\'/)),
    string: ($) =>
      choice(
        seq('"', repeat(choice($.string_text_double, $.string_escape_sequence, $.interpolation)), '"'),
        seq("'", repeat(choice($.string_text_single, $.string_escape_sequence, $.interpolation)), "'"),
      ),

    string_text_double: () => token(prec(1, /[^"\\$]+/)),
    string_text_single: () => token(prec(1, /[^'\\$]+/)),
    string_escape_sequence: () =>  token(seq("\\", /[nrtbfv"'\\]/)),
    // string_text_double: (_) => token(prec(1, /[^"\\$]+|\\['"nrt\\]|\\u[a-fA-F0-9]{4})+/)),
    // string_text_single: (_) => token(prec(1, /[^'\\$]+|\\['"nrt\\]|\\u[a-fA-F0-9]{4})+/)),

    interpolated_string: ($) =>
      choice(
        seq('"', repeat(choice(/[^"\\$]+/, "\\.", $.interpolation, "$")), '"'),
        seq("'", repeat(choice(/[^'\\$]+/, "\\.", $.interpolation, "$")), "'"),
      ),

    number: (_) => token(/[0-9]+(\.[0-9]+)?/),

    boolean: (_) => choice("true", "false"),

    sequence: ($) =>
      seq(
        alias("[", $.bracket),
        choice(seq($.expression, repeat(seq(",", $.expression)))),
        // repeat(seq($.expression, optional(","))),
        alias("]", $.bracket),
      ),

    hash: ($) =>
      seq(alias("{", $.bracket), repeat($.expression), alias("}", $.bracket)),

    cdata: (_) => seq("<![CDATA[", /[^<]+/, "]]>"),

    xml: (_) => token(prec(1, /<[^>]+>/)),

    //RETRIEVE Values
    top_level: ($) =>
      choice(
        alias(token(/\w+/), $.identifier),
        prec.left(1, seq(token(/\w+/), $.group)),
        prec.left(
          1,
          seq(
            token(/\w+/),
            alias(repeat(token(/\.([a-zA-Z0-9\_]+)/)), $.sub_level),
            optional($.group),
          ),
        ),
      ),

    spec_var: ($) => seq(prec.left(1, seq(".", $._spec_var_name))),

    _spec_var_name: (_) =>
      choice(
        "auto_esc",
        "caller_template_name",
        "current_template_name",
        "data_model",
        "error",
        "globals",
        "incompatible_improvements",
        "lang",
        "locale",
        "locale_object",
        "locals",
        "main",
        "main_template_name",
        "namespace",
        "node",
        "now",
        "output_encoding",
        "get_optional_template",
        "pass",
        "template_name",
        "url_escaping_charset",
        "output_format",
        "vars",
        "version",
      ),

    /********** USER DEFINED DIRECTIVES ***********/
    user_defined: ($) =>
      prec.left(
        1,
        choice(
          seq(
            $.user_defined_start,
            repeat($.parameter_group),
            choice(
              $.self_closing_tag,
              seq(
                $.open_tag_end,
                repeat(choice($.raw_text, $._definition, $.user_defined)),
                $.user_defined_end,
              ),
            ),
          ),
          /*
          seq(
            $.user_defined_start,
            repeat($.parameter_group),
            choice(
              $.self_closing_tag,
              seq($.open_tag_end, repeat($._definition), $.user_defined_end),
            ),
          ),
          */
        ),
      ),

    raw_text: ($) => alias(/[^<>{}$\n][^<>{}$]*/, $.text),

    user_defined_start: ($) =>
      choice(
        seq("<@", field("tag_name", alias(token(/\w+(\.\w+)?/), $.user_tag))),
        seq("<", field("tag_name", alias(token(/\w+(\.\w+)?/), $.user_tag))),
      ),

    open_tag_end: (_) => token(">"),

    self_closing_tag: (_) => token("/>"),

    user_defined_end: ($) =>
      choice(
        seq(
          "</@",
          field("tag_name", alias(token(/\w+(\.\w+)?/), $.user_tag)),
          token(">"),
        ),
        seq(
          "</",
          field("tag_name", alias(token(/\w+(\.\w+)?/), $.user_tag)),
          token(">"),
        ),
      ),

    closing_tag: ($) =>
      seq(
        "</",
        field("tag_name", alias(token(/\w+(\.\w+)?/), $.user_tag)),
        ">",
      ),

    /********** END USER DEFINED DIRECTIVES ***********/

    /********** LIST EXPRESSION **************/

    list: ($) =>
      seq(
        seq("<#list", repeat($.parameter_group), ">"),
        repeat($.list_middle),
        optional($.list_else),
        "</#list>",
      ),

    list_middle: ($) =>
      choice(
        $.break,
        $.continue,
        $.directive,
        $.items,
        $.sep,
        $.parameter_group,
      ),

    items_middle: ($) => choice($.break, $.continue, $.directive, $.sep),

    break: (_) => "<#break>",

    continue: (_) => "<#continue>",

    list_else: ($) => seq("<#else>", repeat($.list_middle)),

    items: ($) =>
      seq(
        seq("<#items", $.parameter_group, ">"),
        repeat($.items_middle),
        "</#items>",
      ),

    sep: ($) => choice("<#sep>", $.sep_block),

    sep_block: (_) => seq("<#sep>", "</#sep>"),

    /********** END LIST EXPRESSION **************/

    /********** IF EXPRESSION ***********/

    if: ($) =>
      seq(
        // prec.left(
        //   1,
        seq("<#if", repeat($.parameter_group), ">"),
        // ),
        repeat($._definition),
        repeat($.elseif),
        optional($.if_else),
        "</#if>",
      ),

    elseif: ($) =>
      seq("<#elseif", repeat($.parameter_group), ">", repeat($._definition)),

    if_else: ($) => seq("<#else>", repeat($._definition)),
    // if_else: ($) => seq("<#else>", repeat($.if_middle)),
    //
    // elseif: ($) => seq(prec.left(1, seq("<#elseif", repeat($.parameter_group), ">"))),

    if_middle: ($) => choice($.elseif, $._definition, $.parameter_group),

    /********** END IF EXPRESSION ***********/

    /********** SWITCH EXPRESSION ***********/

    switch: ($) =>
      seq(
        prec.left(1, seq("<#switch", $.parameter_group, ">")),
        repeat($.switch_middle),
        optional($.default),
        "</#switch>",
      ),

    case: ($) =>
      seq(
        prec.left(1, seq("<#case", $.parameter_group, ">")),
        repeat($.directive),
        repeat($.break),
      ),

    default: ($) => seq("<#default>", repeat($.directive)),

    switch_middle: ($) =>
      //choice(
      $.case,
    //$.directive
    //),

    /********** END SWITCH EXPRESSION ***********/

    /*********** FUNCTION EXPRESSION  ***********/

    function: ($) =>
      seq(
        prec.left(1, seq("<#function", repeat($.parameter_group), ">")),
        repeat($.function_middle),
        "</#function>",
      ),

    function_middle: ($) => choice($.return, $.directive),

    return: ($) =>
      seq(prec.left(1, seq("<#return", optional($.parameter_group), ">"))),

    /*********** END FUNCTION EXPRESSION  ***********/

    /*********** MACRO EXPRESSION  ***********/

    macro: ($) =>
      seq(
        prec.left(1, seq("<#macro", repeat($.parameter_group), ">")),
        repeat($.macro_middle),
        "</#macro>",
      ),

    macro_middle: ($) => choice($.nested, $.return, $.directive),

    nested: ($) =>
      seq(prec.left(1, seq("<#nested", repeat($.parameter_group), ">"))),

    /*********** END MACRO EXPRESSION  ***********/

    /*********** ATTEMPT EXPRESSION  ***********/

    attempt: ($) => seq("<#attempt>", repeat($.attempt_middle), "</#attempt>"),

    attempt_middle: ($) => choice($.recover, $.directive),

    recover: (_) => "<#recover>",

    /*********** END ATTEMPT EXPRESSION  ***********/

    /*********** SINGLE EXPRESSIONS  ***********/

    fallback: (_) => "<#fallback>",

    flush: (_) => "<#flush>",

    ftl: ($) => seq(prec.left(1, seq("<#ftl", repeat($.parameter_group), ">"))),

    escape: ($) =>
      seq(
        prec.left(1, seq("<#escape", repeat($.parameter_group), ">")),
        repeat($._definition), // allow nested content
        "</#escape>",
      ),

    import: ($) =>
      seq(prec.left(1, seq("<#import", repeat($.parameter_group), ">"))),

    include: ($) =>
      seq(prec.left(1, seq("<#include", repeat($.parameter_group), ">"))),

    lt: (_) => "<#lt>",

    nt: (_) => "<#nt>",

    recurse: ($) =>
      seq(prec.left(1, seq("<#recurse", repeat($.parameter_group), ">"))),

    rt: (_) => "<#rt>",

    setting: ($) =>
      seq(prec.left(1, seq("<#setting", repeat($.parameter_group), ">"))),

    stop: ($) =>
      choice("<#stop>", seq("<#stop", repeat($.parameter_group), ">")),

    t: (_) => "<#t>",

    visit: ($) =>
      seq(prec.left(1, seq("<#visit", repeat($.parameter_group), ">"))),

    /*********** END SINGLE EXPRESSIONS  ***********/

    /*********** BLOCK EXPRESSIONS  ***********/

    // assign: ($) =>
    //   choice(
    //     seq("<#assign", repeat($.parameter_group), ">"),
    //     prec.right(
    //       1,
    //       seq(
    //         "<#assign",
    //         repeat($.parameter_group),
    //         ">",
    //         repeat($._definition),
    //         "</#assign>"
    //       ),
    //     ),
    //     // prec.left(1, ),
    //     // $.end_assign,
    //   ),

    assign: ($) =>
      choice(
        prec.left(1, seq("<#assign", repeat($.parameter_group), ">")),
        "</#assign>"
      ),

    // end_assign: (_) => "</#assign>",

    global: ($) =>
      choice(
        prec.left(1, seq("<#global", repeat($.parameter_group), ">")),
        $.end_global,
      ),

    end_global: (_) => "</#global>",

    local: ($) =>
      choice(
        prec.left(1, seq("<#local", repeat($.parameter_group), ">")),
        $.end_local,
      ),

    end_local: (_) => "</#local>",

    /*********** END BLOCK EXPRESSIONS  ***********/
  },
});
