export abstract class AbstractMessenger {
  private _savedBuffer: string;
  private _messageTerminationChars: string;
  constructor() {
    this._savedBuffer = '';
    this._messageTerminationChars = '\0';
  }
  /**
   * Takes the provided object and returns it as a JSON string with the 
   * specified messageTerminationChars as the terminating characters so that 
   * the server and client can identify the end of each message in the stream.
   * @param object The object to be stringified using JSON
   */
  _stringifyMessageObject(object) {
    return JSON.stringify(object) + this._messageTerminationChars;
  }
  _parseMessageText(string) {
    return JSON.parse(string);
  }
  _tokenizeData(data) {
    this._savedBuffer += data;
    let tokens = this._savedBuffer.split(this._messageTerminationChars);
    if (tokens.pop()) {
      return [];
    }
    this._savedBuffer = '';
    return tokens;
  }
}
