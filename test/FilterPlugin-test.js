const assert = require("power-assert");
const parse = require("markdown-to-ast").parse;
const TextLintNodeType = require("textlint").TextLintNodeType;
const TextLintCore = require("textlint").TextLintCore;
const report = require("textlint-rule-report-node-types");
import FilterPlugin from "../src/FilterPlugin";
describe("FilterPlugin-test", function () {
    it("should filter messages", function () {
        const textlint = new TextLintCore();
        textlint.setupRules({
            report: report
        }, {
            report: {
                nodeTypes: [TextLintNodeType.Str]
            }
        });
        // this is not error - ignored
        const text = `
<!-- textlint-disable -->

This is text.

<!-- textlint-enable -->
`;
        return textlint.lintMarkdown(text).then(result => {
            const messages = result.messages;
            assert.equal(messages.length, 1);
            // filter by plugin
            // TODO: This AST should provided by textlint.
            // It is very high cost
            const AST = parse(text);
            const filterPlugin = new FilterPlugin({});
            const filteredMessages = filterPlugin.filter(messages, AST);
            // should be filtered
            assert.equal(filteredMessages.length, 0);
        });
    });
});