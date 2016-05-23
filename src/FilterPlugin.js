// LICENSE : MIT
"use strict";
const traverse = require("txt-ast-traverse").traverse;
// FIXME: a plugin/rule should not depended on textlint module
// It cause problem between textlint ver a and textlint ver b
// e.g.) 5.0 and 6.0 are duplicated installed... sad
const TextLintNodeType = require("textlint").TextLintNodeType;
const EventEmitter = require("events");
import ruleCreator from "./filter/textlint-rule-ignore-comments";
import StatusManager from "./filter/StatusManager";
// this copied from textlint core
import ignoringFilter from "./ignoring-filter"
export default class FilterPlugin {
    /**
     * @param config config is textlint config
     */
    constructor(config) {
        this.config = config;
    }

    /**
     * This plugin filter `messages` using `AST`.
     *
     * @param messages
     * @param AST
     * @returns {Array} filtered messages
     */
    filter(messages, AST) {
        // TODO: this has two issue.
        // 1. depended on textlint module
        // 2. use `raw` property(not recommended)
        const content = AST.raw;
        const statusManager = new StatusManager(content.length);
        const rule = ruleCreator({Syntax: TextLintNodeType, content, statusManager});
        const eventEmitter = new EventEmitter();
        // listen type and handler
        // This implementation is same textlint core
        Object.keys(rule).forEach(nodeType => {
            eventEmitter.on(nodeType, rule[nodeType]);
        });
        // traverse AST and found ignoring point
        traverse(AST, {
            enter(node) {
                eventEmitter.emit(node.type, node);
            },
            leave(node) {
                eventEmitter.emit(node.type + ":exit", node);
            }
        });
        // get result filtering point
        const ignoringMessages = statusManager.getIgnoringMessages();
        // filter messages by ignoringMessages
        const results = ignoringFilter(messages, ignoringMessages);
        return results;
    }
}