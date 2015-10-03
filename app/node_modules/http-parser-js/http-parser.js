var assert = require('assert');

exports.HTTPParser = HTTPParser;
function HTTPParser(type) {
    assert.ok(type === HTTPParser.REQUEST || type === HTTPParser.RESPONSE);
    this.type = type;
    this.state = type + '_LINE';
    this.info = {
        headers: [],
        upgrade: false
    };
    this.trailers = [];
    this.line = '';
    this.isChunked = false;
    this.connection = '';
    this.headerSize = 0; // for preventing too big headers
    this.body_bytes = null;
    this.isUserCall = false;
}
HTTPParser.REQUEST = 'REQUEST';
HTTPParser.RESPONSE = 'RESPONSE';
var kOnHeaders = HTTPParser.kOnHeaders = 0;
var kOnHeadersComplete = HTTPParser.kOnHeadersComplete = 1;
var kOnBody = HTTPParser.kOnBody = 2;
var kOnMessageComplete = HTTPParser.kOnMessageComplete = 3;
var methods = HTTPParser.methods = [
  'DELETE',
  'GET',
  'HEAD',
  'POST',
  'PUT',
  'CONNECT',
  'OPTIONS',
  'TRACE',
  'COPY',
  'LOCK',
  'MKCOL',
  'MOVE',
  'PROPFIND',
  'PROPPATCH',
  'SEARCH',
  'UNLOCK',
  'REPORT',
  'MKACTIVITY',
  'CHECKOUT',
  'MERGE',
  'M-SEARCH',
  'NOTIFY',
  'SUBSCRIBE',
  'UNSUBSCRIBE',
  'PATCH',
  'PURGE'
];
HTTPParser.prototype.reinitialize = HTTPParser;
HTTPParser.prototype.close =
HTTPParser.prototype.pause =
HTTPParser.prototype.resume = function () { };
HTTPParser.prototype._compatMode = false;

var maxHeaderSize = 80 * 1024;
var headerState = {
    REQUEST_LINE: true,
    RESPONSE_LINE: true,
    HEADER: true
};
HTTPParser.prototype.execute = function (chunk, start, length) {
    if (!(this instanceof HTTPParser)) {
        throw new TypeError('not a HTTPParser');
    }

    // backward compat to node < 0.11.4
    // Note: the start and length params were removed in newer version
    start = start || 0;
    length = chunk.byteLength; //typeof length === 'number' ? length : chunk.length;

    this.chunk = chunk;
    this.offset = start;
    var end = this.end = start + length;
    try {
        while (this.offset < end) {
            if (this[this.state]()) {
                break;
            }
        }
    } catch (err) {
        if (this.isUserCall) {
            throw err;
        }
        return err;
    }
    this.chunk = null;
    var length = this.offset - start
    if (headerState[this.state]) {
        this.headerSize += length;
        if (this.headerSize > maxHeaderSize) {
            return new Error('max header size exceeded');
        }
    }
    return length;
};

var stateFinishAllowed = {
    REQUEST_LINE: true,
    RESPONSE_LINE: true,
    BODY_RAW: true
};
HTTPParser.prototype.finish = function () {
    if (!stateFinishAllowed[this.state]) {
        return new Error('invalid state for EOF');
    }
    if (this.state === 'BODY_RAW') {
        this.userCall()(this[kOnMessageComplete]());
    }
};

//For correct error handling - see HTTPParser#execute
//Usage: this.userCall()(userFunction('arg'));
HTTPParser.prototype.userCall = function () {
    this.isUserCall = true;
    var self = this;
    return function (ret) {
        self.isUserCall = false;
        return ret;
    };
};

HTTPParser.prototype.nextRequest = function () {
    this.userCall()(this[kOnMessageComplete]());
    this.reinitialize(this.type);
};

HTTPParser.prototype.consumeLine = function () {
    var end = this.end,
        chunk = this.chunk;
    for (var i = this.offset; i < end; i++) {
        if (chunk[i] === 0x0a) { // \n
            var line = this.line + chunk.toString('ascii', this.offset, i);
            if (line.charAt(line.length - 1) === '\r') {
                line = line.substr(0, line.length - 1);
            }
            this.line = '';
            this.offset = i + 1;
            return line;
        }
    }
    //line split over multiple chunks
    this.line += chunk.toString('ascii', this.offset, this.end);
    this.offset = this.end;
};

var headerExp = /^([^: \t]+):[ \t]*((?:.*[^ \t])|)/;
var headerContinueExp = /^[ \t]+(.*[^ \t])/;
HTTPParser.prototype.parseHeader = function (line, headers) {
    var match = headerExp.exec(line);
    var k = match && match[1];
    if (k) { // skip empty string (malformed header)
        headers.push(k);
        headers.push(match[2]);
    } else {
        var matchContinue = headerContinueExp.exec(line);
        if (matchContinue && headers.length) {
            if (headers[headers.length - 1]) {
                headers[headers.length - 1] += ' ';
            }
            headers[headers.length - 1] += matchContinue[1];
        }
    }
};

var requestExp = /^([A-Z-]+) ([^ ]+) HTTP\/(\d)\.(\d)$/;
HTTPParser.prototype.REQUEST_LINE = function () {
    var line = this.consumeLine();
    if (!line) {
        return;
    }
    var match = requestExp.exec(line);
    if (match === null) {
        var err = new Error('Parse Error');
        err.code = 'HPE_INVALID_CONSTANT';
        throw err;
    }
    this.info.method = this._compatMode ? match[1] : methods.indexOf(match[1]);
    if (this.info.method === -1) {
        throw new Error('invalid request method');
    }
    if (match[1] === 'CONNECT') {
        this.info.upgrade = true;
    }
    this.info.url = match[2];
    this.info.versionMajor = +match[3];
    this.info.versionMinor = +match[4];
    this.body_bytes = 0;
    this.state = 'HEADER';
};

var responseExp = /^HTTP\/(\d)\.(\d) (\d{3}) ?(.*)$/;
HTTPParser.prototype.RESPONSE_LINE = function () {
    var line = this.consumeLine();
    if (!line) {
        return;
    }
    var match = responseExp.exec(line);
    if (match === null) {
        var err = new Error('Parse Error');
        err.code = 'HPE_INVALID_CONSTANT';
        throw err;
    }
    this.info.versionMajor = +match[1];
    this.info.versionMinor = +match[2];
    var statusCode = this.info.statusCode = +match[3];
    this.info.statusMessage = match[4];
    // Implied zero length.
    if ((statusCode / 100 | 0) === 1 || statusCode === 204 || statusCode === 304) {
        this.body_bytes = 0;
    }
    this.state = 'HEADER';
};

HTTPParser.prototype.shouldKeepAlive = function () {
    if (this.info.versionMajor > 0 && this.info.versionMinor > 0) {
        if (this.connection.indexOf('close') !== -1) {
            return false;
        }
    } else if (this.connection.indexOf('keep-alive') === -1) {
        return false;
    }
    if (this.body_bytes !== null || this.isChunked) { // || skipBody
        return true;
    }
    return false;
};

HTTPParser.prototype.HEADER = function () {
    var line = this.consumeLine();
    if (line === undefined) {
        return;
    }
    if (line) {
        this.parseHeader(line, this.info.headers);
    } else {
        var headers = this.info.headers;
        for (var i = 0; i < headers.length; i += 2) {
            switch (headers[i].toLowerCase()) {
                case 'transfer-encoding':
                    this.isChunked = headers[i + 1].toLowerCase() === 'chunked';
                    break;
                case 'content-length':
                    this.body_bytes = +headers[i + 1];
                    break;
                case 'connection':
                    this.connection += headers[i + 1].toLowerCase();
                    break;
                case 'upgrade':
                    this.info.upgrade = true;
                    break;
            }
        }

        this.info.shouldKeepAlive = this.shouldKeepAlive();
        //problem which also exists in original node: we should know skipBody before calling onHeadersComplete
        var skipBody = this.userCall()(this[kOnHeadersComplete](this.info));

        if (this.info.upgrade) {
            this.nextRequest();
            return true;
        } else if (this.isChunked && !skipBody) {
            this.state = 'BODY_CHUNKHEAD';
        } else if (skipBody || this.body_bytes === 0) {
            this.nextRequest();
        } else if (this.body_bytes === null) {
            this.state = 'BODY_RAW';
        } else {
            this.state = 'BODY_SIZED';
        }
    }
};

HTTPParser.prototype.BODY_CHUNKHEAD = function () {
    var line = this.consumeLine();
    if (line === undefined) {
        return;
    }
    this.body_bytes = parseInt(line, 16);
    if (!this.body_bytes) {
        this.state = 'BODY_CHUNKTRAILERS';
    } else {
        this.state = 'BODY_CHUNK';
    }
};

HTTPParser.prototype.BODY_CHUNK = function () {
    var length = Math.min(this.end - this.offset, this.body_bytes);
    this.userCall()(this[kOnBody](this.chunk, this.offset, length));
    this.offset += length;
    this.body_bytes -= length;
    if (!this.body_bytes) {
        this.state = 'BODY_CHUNKEMPTYLINE';
    }
};

HTTPParser.prototype.BODY_CHUNKEMPTYLINE = function () {
    var line = this.consumeLine();
    if (line === undefined) {
        return;
    }
    assert.equal(line, '');
    this.state = 'BODY_CHUNKHEAD';
};

HTTPParser.prototype.BODY_CHUNKTRAILERS = function () {
    var line = this.consumeLine();
    if (line === undefined) {
        return;
    }
    if (line) {
        this.parseHeader(line, this.trailers);
    } else {
        if (this.trailers.length) {
            this.userCall()(this[kOnHeaders](this.trailers, this.info.url));
        }
        this.nextRequest();
    }
};

HTTPParser.prototype.BODY_RAW = function () {
    var length = this.end - this.offset;
    this.userCall()(this[kOnBody](this.chunk, this.offset, length));
    this.offset = this.end;
};

HTTPParser.prototype.BODY_SIZED = function () {
    var length = Math.min(this.end - this.offset, this.body_bytes);
    this.userCall()(this[kOnBody](this.chunk, this.offset, length));
    this.offset += length;
    this.body_bytes -= length;
    if (!this.body_bytes) {
        this.nextRequest();
    }
};

// backward compat to node < 0.11.6
['Headers', 'HeadersComplete', 'Body', 'MessageComplete'].forEach(function (name) {
    var k = HTTPParser['kOn' + name];
    Object.defineProperty(HTTPParser.prototype, 'on' + name, {
        get: function () {
            return this[k];
        },
        set: function (to) {
            // hack for backward compatibility
            this._compatMode = true;
            return (this[k] = to);
        }
    });
});





//var events = require("events"),
//    util = require("util");

//function Packet(type, size) {
//    this.type = type;
//    this.size = +size;
//}

//exports.name = "javascript";
//exports.debug_mode = false;

//function ReplyParser(options) {
//    this.name = exports.name;
//    this.options = options || {};

//    this._buffer = null;
//    this._offset = 0;
//    this._encoding = "utf-8";
//    this._debug_mode = options.debug_mode;
//    this._reply_type = null;
//}

//util.inherits(ReplyParser, events.EventEmitter);

//exports.Parser = ReplyParser;

//function IncompleteReadBuffer(message) {
//    this.name = "IncompleteReadBuffer";
//    this.message = message;
//}
//util.inherits(IncompleteReadBuffer, Error);

//// Buffer.toString() is quite slow for small strings
//function small_toString(buf, start, end) {
//    var tmp = "", i;

//    for (i = start; i < end; i++) {
//        tmp += String.fromCharCode(buf[i]);
//    }

//    return tmp;
//}

//ReplyParser.prototype._parseResult = function (type) {
//    var start, end, offset, packetHeader;

//    if (type === 43 || type === 45) { // + or -
//        // up to the delimiter
//        end = this._packetEndOffset() - 1;
//        start = this._offset;

//        // include the delimiter
//        this._offset = end + 2;

//        if (end > this._buffer.length) {
//            this._offset = start;
//            throw new IncompleteReadBuffer("Wait for more data.");
//        }

//        if (this.options.return_buffers) {
//            return this._buffer.slice(start, end);
//        } else {
//            if (end - start < 65536) { // completely arbitrary
//                return small_toString(this._buffer, start, end);
//            } else {
//                return this._buffer.toString(this._encoding, start, end);
//            }
//        }
//    } else if (type === 58) { // :
//        // up to the delimiter
//        end = this._packetEndOffset() - 1;
//        start = this._offset;

//        // include the delimiter
//        this._offset = end + 2;

//        if (end > this._buffer.length) {
//            this._offset = start;
//            throw new IncompleteReadBuffer("Wait for more data.");
//        }

//        if (this.options.return_buffers) {
//            return this._buffer.slice(start, end);
//        }

//        // return the coerced numeric value
//        return +small_toString(this._buffer, start, end);
//    } else if (type === 36) { // $
//        // set a rewind point, as the packet could be larger than the
//        // buffer in memory
//        offset = this._offset - 1;

//        packetHeader = new Packet(type, this.parseHeader());

//        // packets with a size of -1 are considered null
//        if (packetHeader.size === -1) {
//            return undefined;
//        }

//        end = this._offset + packetHeader.size;
//        start = this._offset;

//        // set the offset to after the delimiter
//        this._offset = end + 2;

//        if (end > this._buffer.length) {
//            this._offset = offset;
//            throw new IncompleteReadBuffer("Wait for more data.");
//        }

//        if (this.options.return_buffers) {
//            return this._buffer.slice(start, end);
//        } else {
//            return this._buffer.toString(this._encoding, start, end);
//        }
//    } else if (type === 42) { // *
//        offset = this._offset;
//        packetHeader = new Packet(type, this.parseHeader());

//        if (packetHeader.size < 0) {
//            return null;
//        }

//        if (packetHeader.size > this._bytesRemaining()) {
//            this._offset = offset - 1;
//            throw new IncompleteReadBuffer("Wait for more data.");
//        }

//        var reply = [];
//        var ntype, i, res;

//        offset = this._offset - 1;

//        for (i = 0; i < packetHeader.size; i++) {
//            ntype = this._buffer[this._offset++];

//            if (this._offset > this._buffer.length) {
//                throw new IncompleteReadBuffer("Wait for more data.");
//            }
//            res = this._parseResult(ntype);
//            if (res === undefined) {
//                res = null;
//            }
//            reply.push(res);
//        }

//        return reply;
//    }
//};

//ReplyParser.prototype.execute = function (buffer) {
//    this.append(buffer);

//    var type, ret, offset;

//    while (true) {
//        offset = this._offset;
//        try {
//            // at least 4 bytes: :1\r\n
//            if (this._bytesRemaining() < 4) {
//                break;
//            }

//            type = this._buffer[this._offset++];

//            if (type === 43) { // +
//                ret = this._parseResult(type);

//                if (ret === null) {
//                    break;
//                }

//                this.send_reply(ret);
//            } else if (type === 45) { // -
//                ret = this._parseResult(type);

//                if (ret === null) {
//                    break;
//                }

//                this.send_error(ret);
//            } else if (type === 58) { // :
//                ret = this._parseResult(type);

//                if (ret === null) {
//                    break;
//                }

//                this.send_reply(ret);
//            } else if (type === 36) { // $
//                ret = this._parseResult(type);

//                if (ret === null) {
//                    break;
//                }

//                // check the state for what is the result of
//                // a -1, set it back up for a null reply
//                if (ret === undefined) {
//                    ret = null;
//                }

//                this.send_reply(ret);
//            } else if (type === 42) { // *
//                // set a rewind point. if a failure occurs,
//                // wait for the next execute()/append() and try again
//                offset = this._offset - 1;

//                ret = this._parseResult(type);

//                this.send_reply(ret);
//            }
//        } catch (err) {
//            // catch the error (not enough data), rewind, and wait
//            // for the next packet to appear
//            if (!(err instanceof IncompleteReadBuffer)) {
//                throw err;
//            }
//            this._offset = offset;
//            break;
//        }
//    }
//};

//ReplyParser.prototype.append = function (newBuffer) {
//    if (!newBuffer) {
//        return;
//    }

//    // first run
//    if (this._buffer === null) {
//        this._buffer = newBuffer;

//        return;
//    }

//    // out of data
//    if (this._offset >= this._buffer.length) {
//        this._buffer = newBuffer;
//        this._offset = 0;

//        return;
//    }

//    // very large packet
//    // check for concat, if we have it, use it
//    if (Buffer.concat !== undefined) {
//        this._buffer = Buffer.concat([this._buffer.slice(this._offset), newBuffer]);
//    } else {
//        var remaining = this._bytesRemaining(),
//            newLength = remaining + newBuffer.length,
//            tmpBuffer = new Buffer(newLength);

//        this._buffer.copy(tmpBuffer, 0, this._offset);
//        newBuffer.copy(tmpBuffer, remaining, 0);

//        this._buffer = tmpBuffer;
//    }

//    this._offset = 0;
//};

//ReplyParser.prototype.parseHeader = function () {
//    var end = this._packetEndOffset(),
//        value = small_toString(this._buffer, this._offset, end - 1);

//    this._offset = end + 1;

//    return value;
//};

//ReplyParser.prototype._packetEndOffset = function () {
//    var offset = this._offset;

//    while (this._buffer[offset] !== 0x0d && this._buffer[offset + 1] !== 0x0a) {
//        offset++;

//        if (offset >= this._buffer.length) {
//            throw new IncompleteReadBuffer("didn't see LF after NL reading multi bulk count (" + offset + " => " + this._buffer.length + ", " + this._offset + ")");
//        }
//    }

//    offset++;
//    return offset;
//};

//ReplyParser.prototype._bytesRemaining = function () {
//    return (this._buffer.length - this._offset) < 0 ? 0 : (this._buffer.length - this._offset);
//};

//ReplyParser.prototype.parser_error = function (message) {
//    this.emit("error", message);
//};

//ReplyParser.prototype.send_error = function (reply) {
//    this.emit("reply error", reply);
//};

//ReplyParser.prototype.send_reply = function (reply) {
//    this.emit("reply", reply);
//};
