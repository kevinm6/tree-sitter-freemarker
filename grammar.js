/**
 * @file Apache Freemarker
 * @author Kevin M @kevinm6
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "freemarker",

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

    comment: ($) => token(seq("<#--", repeat(/[^-]|-[^-]/), "-->")), // multi-line comments

    interpolation: ($) =>
      // seq(
      //   prec.left(
          // 1,
          seq(
            "$",
            alias("{", $.bracket),
            repeat($.expression),
            alias("}", $.bracket),
          ),
      //   ),
      // ),

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
        prec.right(
          1,
          seq(
            repeat1(prec(2, $.type)),
            optional($.operator),
            optional(repeat1($.type)),
          ),
        ),
        prec.left(1, seq($.operator, repeat($.type))),
        $.interpolation
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

    // html: $ => seq(
    //   seq(prec.left(1,seq('<', $.top_level)),  optional(repeat($.parameter_group)), '>'),
    //   repeat($._definition),
    //   seq('</', $.top_level, '>'),
    // ),

    built_in: ($) => prec.left(1, seq("?", $.top_level, optional($.group))),

    group: ($) =>
      seq(
        alias("(", $.bracket),
        repeat1($.parameter_group),
        alias(")", $.bracket),
      ),

    operator: ($) =>
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
        token(/\"(\\.|[^"])*"/),  // Regular double-quoted string
        token(/\'(\\.|[^'])*'/),  // Regular single-quoted string
        $.interpolated_string       // Support for string interpolation
      ),

    interpolated_string: ($) =>
      choice(
        seq(
          '"',   // Start of string
          repeat(choice(
            /[^"\\${}\\]+/, // Normal string content, allowing HL7 chars
            $.interpolation, // Embedded FreeMarker expressions
            /\\./, // Escaped characters
            "$" // Literal dollar signs
          )),
          '"',   // End of string
        ),
        seq(
          "'",   // Start of string
          repeat(choice(
            /[^'\\${}\\]+/, // Normal string content
            $.interpolation, // Embedded FreeMarker expressions
            /\\./, // Escaped characters
            "$" // Literal dollar signs
          )),
          "'"   // End of string
        ),
      ),

    number: ($) => /[0-9]/,

    boolean: ($) => seq("true", "false"),

    sequence: ($) =>
      seq(
        alias("[", $.bracket),
        repeat(seq($.expression, optional(","))),
        alias("]", $.bracket),
      ),

    hash: ($) =>
      seq(alias("{", $.bracket), repeat($.expression), alias("}", $.bracket)),

    // special_character: $ => token(/[\^~\\|]/),

    cdata: ($) => seq(
      "<![CDATA[",
      /[^<]+/,
      "]]>"
    ),

    // cdata: ($) => seq(
    //   "<![CDATA[",
    //   choice(
    //     /[^]]*/,
    //   ),
    // "]]>"
    // ),
    // cdata_as_xml: ($) => seq(
    //   "<![CDATA[",
    //   choice(
    //     /[^]]*/,
    //     $.xml,
    //   ),
    // "]]>"
    // ),

    xml: ($) => token(prec(1, /<[^>]+>/)),

    //RETRIEVE Values
    top_level: ($) =>
      choice(
        token(/\w+/),
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

    _spec_var_name: ($) =>
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

    //METHOD Call
    // method: $ => seq(
    //   $.group
    // ),


    /********** USER DEFINED DIRECTIVES ***********/
    user_defined: ($) =>
      prec.left(
        1,
        choice(
          seq("<@", token(/\w+(\.\w+)?/), repeat($.parameter_group), choice(">", "/>")),
          seq(
            "<",
            token(/\w+(\.\w+)?/) /*$.cdata)*/,
            repeat($.parameter_group),
            choice("/>", seq(">", repeat($._definition), $.closing_tag)),
            // token($.cdata)
          ),
        ),
      ),

    closing_tag: ($) => seq("</", token(/\w+(\.\w+)?/), ">"),

    /********** END USER DEFINED DIRECTIVES ***********/

    /********** LIST EXPRESSION **************/

    list: ($) =>
      seq(
        seq(prec.left(1, seq("<#", "list")), repeat($.parameter_group), ">"),
        repeat($.list_middle),
        optional($.list_else),
        "</#list>",
      ),

    list_middle: ($) =>
      choice($.break, $.continue, $.directive, $.items, $.sep),

    items_middle: ($) => choice($.break, $.continue, $.directive, $.sep),

    break: ($) => "<#break>",

    continue: ($) => "<#continue>",

    list_else: ($) => seq("<#else>", repeat($.list_middle)),

    items: ($) =>
      seq(
        seq("<#items", $.parameter_group, ">"),
        repeat($.items_middle),
        "</#items>",
      ),

    sep: ($) => choice("<#sep>", $.sep_block),

    sep_block: ($) => seq("<#sep>", "</#sep>"),

    /********** END LIST EXPRESSION **************/

    /********** IF EXPRESSION ***********/

    if: ($) =>
      seq(
        prec.left(1, seq("<#if", repeat1($.parameter_group), ">")),
        repeat($.if_middle),
        optional($.if_else),
        "</#if>",
      ),

    if_else: ($) => seq("<#else>", repeat($.if_middle)),

    elseif: ($) =>
      seq(prec.left(1, seq("<#elseif", repeat($.parameter_group), ">"))),

    if_middle: ($) => choice($.elseif, $.directive),

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

    recover: ($) => "<#recover>",

    /*********** END ATTEMPT EXPRESSION  ***********/

    /*********** SINGLE EXPRESSIONS  ***********/

    fallback: ($) => "<#fallback>",

    flush: ($) => "<#flush>",

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

    lt: ($) => "<#lt>",

    nt: ($) => "<#nt>",

    recurse: ($) =>
      seq(prec.left(1, seq("<#recurse", repeat($.parameter_group), ">"))),

    rt: ($) => "<#rt>",

    setting: ($) =>
      seq(prec.left(1, seq("<#setting", repeat($.parameter_group), ">"))),

    stop: ($) => "<#stop>",

    t: ($) => "<#t>",

    visit: ($) =>
      seq(prec.left(1, seq("<#visit", repeat($.parameter_group), ">"))),

    /*********** END SINGLE EXPRESSIONS  ***********/

    /*********** BLOCK EXPRESSIONS  ***********/

    assign: ($) =>
      choice(
        prec.left(1, seq("<#assign", repeat($.parameter_group), ">")),
        $.end_assign,
      ),

    end_assign: ($) => "</#assign>",

    global: ($) =>
      choice(
        prec.left(1, seq("<#global", repeat($.parameter_group), ">")),
        $.end_global,
      ),

    end_global: ($) => "</#global>",

    local: ($) =>
      choice(
        prec.left(1, seq("<#local", repeat($.parameter_group), ">")),
        $.end_local,
      ),

    end_local: ($) => "</#local>",

    /*********** END BLOCK EXPRESSIONS  ***********/
  },
});
