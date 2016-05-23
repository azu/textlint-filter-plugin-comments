// LICENSE : MIT
"use strict";
import {parseRuleIds, getValueFromHTMLComment, isHTMLComment} from "./parse-comment";
const defaultOptions = {
    // enable comment directive
    // if comment has the value, then enable textlint rule
    "enablingComment": "textlint-enable",
    // disable comment directive
    // if comment has the value, then disable textlint rule
    "disablingComment": "textlint-disable"
};
// { Syntax, content} is `context` like object
export default function filter({Syntax, content, statusManager}, options = defaultOptions) {
    const enablingComment = options.enablingComment || defaultOptions.enablingComment;
    const disablingComment = options.disablingComment || defaultOptions.disablingComment;
    // Get comment value
    return {
        /*

This is wrong format.
https://github.com/wooorm/remark treat as one html block.

<!-- textlint-disable -->
This is ignored.
<!-- textlint-enable -->

should be

<!-- textlint-disable -->

This is ignored.

<!-- textlint-enable -->
         */
        [Syntax.Html](node){
            const nodeValue = content.slice(node.range[0], node.range[1]); //  `getSource(node)` 
            if (!isHTMLComment(nodeValue)) {
                return;
            }
            const commentValue = getValueFromHTMLComment(nodeValue);
            if (commentValue.indexOf(enablingComment) !== -1) {
                const configValue = commentValue.replace(enablingComment, "");
                statusManager.enableReporting(node, parseRuleIds(configValue));
            } else if (commentValue.indexOf(disablingComment) !== -1) {
                const configValue = commentValue.replace(disablingComment, "");
                statusManager.disableReporting(node, parseRuleIds(configValue));
            }
        },
        [Syntax.Comment](node){
            const commentValue = node.value || "";
            if (commentValue.indexOf(enablingComment) !== -1) {
                const configValue = commentValue.replace(enablingComment, "");
                statusManager.enableReporting(node, parseRuleIds(configValue));
            } else if (commentValue.indexOf(disablingComment) !== -1) {
                const configValue = commentValue.replace(disablingComment, "");
                statusManager.disableReporting(node, parseRuleIds(configValue));
            }
        }
    }
}