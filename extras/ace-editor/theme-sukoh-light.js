ace.define("ace/theme/sukoh-light",["require","exports","module","ace/lib/dom"], function(require, exports, module) {

exports.isDark = false;
exports.cssClass = "ace-sukoh-light";
exports.cssText = "\
.ace-sukoh-light .ace_gutter {\
background: #e8e8e8;\
color: #AAA;\
}\
.ace-sukoh-light .ace_gutter-cell  {\
color: #009ddc;\
}\
.ace-sukoh-light  {\
background: #fff;\
color: #000;\
}\
.ace-sukoh-light .ace_keyword {\
font-weight: bold;\
}\
.ace-sukoh-light .ace_string {\
color: #D14;\
}\
.ace-sukoh-light .ace_variable.ace_class {\
color: teal;\
}\
.ace-sukoh-light .ace_constant.ace_numeric {\
color: #099;\
}\
.ace-sukoh-light .ace_constant.ace_buildin {\
color: #0086B3;\
}\
.ace-sukoh-light .ace_support.ace_function {\
color: #0086B3;\
}\
.ace-sukoh-light .ace_comment {\
color: #998;\
font-style: italic;\
}\
.ace-sukoh-light .ace_variable.ace_language  {\
color: #0086B3;\
}\
.ace-sukoh-light .ace_paren {\
font-weight: bold;\
}\
.ace-sukoh-light .ace_boolean {\
font-weight: bold;\
}\
.ace-sukoh-light .ace_string.ace_regexp {\
color: #009926;\
font-weight: normal;\
}\
.ace-sukoh-light .ace_variable.ace_instance {\
color: teal;\
}\
.ace-sukoh-light .ace_constant.ace_language {\
font-weight: bold;\
}\
.ace-sukoh-light .ace_cursor {\
color: black;\
}\
.ace-sukoh-light.ace_focus .ace_marker-layer .ace_active-line {\
background: rgb(255, 255, 204);\
}\
.ace-sukoh-light .ace_marker-layer .ace_active-line {\
background: rgb(245, 245, 245);\
}\
.ace-sukoh-light .ace_marker-layer .ace_selection {\
background: rgb(181, 213, 255);\
}\
.ace-sukoh-light.ace_multiselect .ace_selection.ace_start {\
box-shadow: 0 0 3px 0px white;\
}\
.ace-sukoh-light.ace_nobold .ace_line > span {\
font-weight: normal !important;\
}\
.ace-sukoh-light .ace_marker-layer .ace_step {\
background: rgb(252, 255, 0);\
}\
.ace-sukoh-light .ace_marker-layer .ace_stack {\
background: rgb(164, 229, 101);\
}\
.ace-sukoh-light .ace_marker-layer .ace_bracket {\
margin: -1px 0 0 -1px;\
border: 1px solid rgb(192, 192, 192);\
}\
.ace-sukoh-light .ace_gutter-active-line {\
background-color : rgba(0, 0, 0, 0.07);\
}\
.ace-sukoh-light .ace_marker-layer .ace_selected-word {\
background: rgb(250, 250, 255);\
border: 1px solid rgb(200, 200, 250);\
}\
.ace-sukoh-light .ace_invisible {\
color: #BFBFBF\
}\
.ace-sukoh-light .ace_print-margin {\
width: 1px;\
background: #e8e8e8;\
}\
.ace-sukoh-light .ace_indent-guide {\
background: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAE0lEQVQImWP4////f4bLly//BwAmVgd1/w11/gAAAABJRU5ErkJggg==\") right repeat-y;\
}";

    var dom = require("../lib/dom");
    dom.importCssString(exports.cssText, exports.cssClass);
});
