"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var ejs = require('ejs');
var stream = require('stream');
var fs = require('fs');
var _a = require('./utils'), getFileExtension = _a.getFileExtension, downloadRemoteFile = _a.downloadRemoteFile;
var _ = /** @class */ (function () {
    function _(props) {
        this._props = __assign(__assign({}, props), {});
    }
    Object.defineProperty(_.prototype, "props", {
        get: function () {
            return this._props;
        },
        enumerable: true,
        configurable: true
    });
    _.prototype.process = function (cssFile, options, data) {
        if (options === void 0) { options = {}; }
        if (data === void 0) { data = {}; }
        if (!(cssFile instanceof stream.Stream)) {
            return Promise.reject(new Error(_.ERRORS.CANNOT_PROCESS(_.MESSAGES.WRONG_HTML_FORMAT)));
        }
        var fileExtension = getFileExtension(cssFile.path);
        if (fileExtension !== 'css' && fileExtension !== 'remote') {
            return Promise.reject(new Error(_.ERRORS.CANNOT_PROCESS(_.MESSAGES.WRONG_EXTENSION_FORMAT)));
        }
        var stringPathSplitted = cssFile.path ? cssFile.path.split('.') : '';
        if (fileExtension === 'remote') {
            cssFile.on('data', function (chunk) {
                var remoteFileUrl = chunk.toString();
                var fileName = stringPathSplitted[stringPathSplitted.length - 3];
                var fileType = stringPathSplitted[stringPathSplitted.length - 2];
                if (fileType !== 'css') {
                    return Promise.reject(new Error(_.ERRORS.CANNOT_PROCESS(_.MESSAGES.WRONG_EXTENSION_FORMAT)));
                }
                return downloadRemoteFile(remoteFileUrl, "" + fileName + fileType);
            });
        }
        var cssData = '';
        return new Promise(function (resolve, reject) {
            try {
                cssFile.on('data', function (chunk) {
                    cssData = chunk.toString();
                    var compiledCss = ejs.compile(cssData, options);
                    var output = compiledCss(data);
                    try {
                        var outputStream = fs.createWriteStream(cssFile.path);
                        outputStream.write(output);
                        resolve(outputStream);
                    }
                    catch (error) {
                        reject(new Error(_.ERRORS.CANNOT_PROCESS(error.message)));
                    }
                });
            }
            catch (error) {
                reject(new Error(_.ERRORS.CANNOT_PROCESS(error.message)));
            }
        });
    };
    return _;
}());
_.ERRORS = {
    CANNOT_PROCESS: function (reason) {
        return reason
            ? "Cannot process css file because " + reason
            : "Cannot process css file";
    }
};
_.MESSAGES = {
    WRONG_HTML_FORMAT: 'wrong css file format. Expected a stream',
    WRONG_EXTENSION_FORMAT: 'wrong file extension. Expected an css file'
};
module.exports = _;
//# sourceMappingURL=CssAdapter.js.map