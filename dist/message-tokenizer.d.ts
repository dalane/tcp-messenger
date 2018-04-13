export declare abstract class MessageTokenizer {
    private _savedBuffer;
    constructor();
    /**
     * Takes the provided object and returns it as a JSON string with the
     * specified messageTerminationChars as the terminating characters so that
     * the server and client can identify the end of each message in the stream.
     * @param object The object to be stringified using JSON
     */
    _stringifyMessageObject(object: any): string;
    _parseMessageText(string: any): any;
    _tokenizeData(data: any): string[];
}
