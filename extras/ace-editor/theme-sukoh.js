ace.define("ace/theme/sukoh",["require","exports","module","ace/lib/dom"], function(require, exports, module) {

exports.isDark = true;
exports.cssClass = "ace-sukoh";
exports.cssText = ".ace-sukoh .ace_gutter {\
background: RGBA(255,255,255,.07);\
color: #8F908A\
}\
.ace-sukoh .ace_print-margin {\
width: 1px;\
background: #555651\
}\
.ace-sukoh {\
background-color: rgb(30, 23, 41);\
color: #F8F8F2\
}\
.ace-sukoh .ace_cursor {\
color: #F8F8F0\
}\
.ace-sukoh .ace_marker-layer .ace_selection {\
background: RGBA(50, 92, 212, 0.35)\
}\
.ace-sukoh.ace_multiselect .ace_selection.ace_start {\
box-shadow: 0 0 3px 0px #272822;\
}\
.ace-sukoh .ace_marker-layer .ace_step {\
background: rgb(102, 82, 0)\
}\
.ace-sukoh .ace_marker-layer .ace_bracket {\
margin: -1px 0 0 -1px;\
border: 1px solid #49483E\
}\
.ace-sukoh .ace_marker-layer .ace_active-line {\
background: RGBA(0,0,0,.3)\
}\
.ace-sukoh .ace_gutter-active-line {\
background-color: RGBA(0,0,0,.3)\
}\
.ace-sukoh .ace_marker-layer .ace_selected-word {\
border: 1px solid #49483E\
}\
.ace-sukoh .ace_invisible {\
color: #52524d\
}\
.ace-sukoh .ace_entity.ace_name.ace_tag,\
.ace-sukoh .ace_keyword,\
.ace-sukoh .ace_meta.ace_tag,\
.ace-sukoh .ace_storage {\
color: #F92672\
}\
.ace-sukoh .ace_punctuation,\
.ace-sukoh .ace_punctuation.ace_tag {\
color: #fff\
}\
.ace-sukoh .ace_constant.ace_character,\
.ace-sukoh .ace_constant.ace_language,\
.ace-sukoh .ace_constant.ace_numeric,\
.ace-sukoh .ace_constant.ace_other {\
color: #AE81FF\
}\
.ace-sukoh .ace_invalid {\
color: #F8F8F0;\
background-color: #F92672\
}\
.ace-sukoh .ace_invalid.ace_deprecated {\
color: #F8F8F0;\
background-color: #AE81FF\
}\
.ace-sukoh .ace_support.ace_constant,\
.ace-sukoh .ace_support.ace_function {\
color: #66D9EF\
}\
.ace-sukoh .ace_fold {\
background-color: #A6E22E;\
border-color: #F8F8F2\
}\
.ace-sukoh .ace_storage.ace_type,\
.ace-sukoh .ace_support.ace_class,\
.ace-sukoh .ace_support.ace_type {\
font-style: italic;\
color: #66D9EF\
}\
.ace-sukoh .ace_entity.ace_name.ace_function,\
.ace-sukoh .ace_entity.ace_other,\
.ace-sukoh .ace_entity.ace_other.ace_attribute-name,\
.ace-sukoh .ace_variable {\
color: #A6E22E\
}\
.ace-sukoh .ace_variable.ace_parameter {\
font-style: italic;\
color: #FD971F\
}\
.ace-sukoh .ace_string {\
color: #E6DB74\
}\
.ace-sukoh .ace_comment {\
color: #75715E\
}\
.ace-sukoh .ace_indent-guide {\
background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWPQ0FD0ZXBzd/wPAAjVAoxeSgNeAAAAAElFTkSuQmCC) right repeat-y\
}";

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});
