"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
class MessageTokenizer {
    constructor() {
        this._savedBuffer = '';
    }
    /**
     * Takes the provided object and returns it as a JSON string with the
     * specified messageTerminationChars as the terminating characters so that
     * the server and client can identify the end of each message in the stream.
     * @param object The object to be stringified using JSON
     */
    _stringifyMessageObject(object) {
        return JSON.stringify(object) + common_1.constants.MESSAGE_TERMINATION_CHARACTER;
    }
    _parseMessageText(string) {
        return JSON.parse(string);
    }
    _tokenizeData(data) {
        this._savedBuffer += data;
        let tokens = this._savedBuffer.split(common_1.constants.MESSAGE_TERMINATION_CHARACTER);
        if (tokens.pop()) {
            return [];
        }
        this._savedBuffer = '';
        return tokens;
    }
}
exports.MessageTokenizer = MessageTokenizer;
