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
    _.prototype.process = function (javascriptFile, options, data) {
        if (options === void 0) { options = {}; }
        if (data === void 0) { data = {}; }
        if (!(javascriptFile instanceof stream.Stream)) {
            return Promise.reject(new Error(_.ERRORS.CANNOT_PROCESS(_.MESSAGES.WRONG_JAVASCRIPT_FORMAT)));
        }
        var fileExtension = getFileExtension(javascriptFile.path);
        if (fileExtension !== 'js' && fileExtension !== 'remote') {
            return Promise.reject(new Error(_.ERRORS.CANNOT_PROCESS(_.MESSAGES.WRONG_EXTENSION_FORMAT)));
        }
        var stringPathSplitted = javascriptFile.path
            ? javascriptFile.path.split('.')
            : '';
        if (fileExtension === 'remote') {
            javascriptFile.on('data', function (chunk) {
                var remoteFileUrl = chunk.toString();
                var fileName = stringPathSplitted[stringPathSplitted.length - 3];
                var fileType = stringPathSplitted[stringPathSplitted.length - 2];
                if (fileType !== 'js') {
                    return Promise.reject(new Error(_.ERRORS.CANNOT_PROCESS(_.MESSAGES.WRONG_EXTENSION_FORMAT)));
                }
                return downloadRemoteFile(remoteFileUrl, "" + fileName + fileType);
            });
        }
        var javascriptData = '';
        return new Promise(function (resolve, reject) {
            try {
                javascriptFile.on('data', function (chunk) {
                    javascriptData = chunk.toString();
                    var compiledJavascript = ejs.compile(javascriptData, options);
                    var output = compiledJavascript(data);
                    try {
                        var outputStream = fs.createWriteStream(javascriptFile.path);
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
            ? "Cannot process javascript file because " + reason
            : "Cannot process javascript file";
    }
};
_.MESSAGES = {
    WRONG_JAVASCRIPT_FORMAT: 'wrong javascript file format. Expected a stream',
    WRONG_EXTENSION_FORMAT: 'wrong file extension. Expected an javascript file'
};
module.exports = _;
//# sourceMappingURL=JavascriptAdapter.js.map