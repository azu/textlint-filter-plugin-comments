// LICENSE : MIT
"use strict";
/**
 * the `index` is in the `range` and return true.
 * @param {Number} index
 * @param {Number[]} range
 * @returns {boolean}
 */
const isContainedRange = (index, range) => {
    const [start, end] = range;
    return start <= index && index <= end;
};
/**
 * filter messages by ignore messages
 */
export default function filterMessages(lintingMessages = [], ignoreMessages = []) {
    // if match, reject the message
    return lintingMessages.filter(message => {
        return !ignoreMessages.some(ignoreMessage => {
            const isInIgnoringRange = isContainedRange(message.index, ignoreMessage.range);
            if (isInIgnoringRange && ignoreMessage.ignoringRuleId) {
                // "*" is wildcard that match any rule
                if (ignoreMessage.ignoringRuleId === "*") {
                    return true;
                }
                return message.ruleId === ignoreMessage.ignoringRuleId;
            }
            return isInIgnoringRange;
        });
    });
}
