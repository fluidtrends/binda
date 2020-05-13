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
    _.prototype.process = function (htmlFile, options, data) {
        if (options === void 0) { options = {}; }
        if (data === void 0) { data = {}; }
        if (!(htmlFile instanceof stream.Stream)) {
            return Promise.reject(new Error(_.ERRORS.CANNOT_PROCESS(_.MESSAGES.WRONG_HTML_FORMAT)));
        }
        var fileExtension = getFileExtension(htmlFile.path);
        if (fileExtension !== 'html' && fileExtension !== 'remote') {
            return Promise.reject(new Error(_.ERRORS.CANNOT_PROCESS(_.MESSAGES.WRONG_EXTENSION_FORMAT)));
        }
        var stringPathSplitted = htmlFile.path ? htmlFile.path.split('.') : '';
        if (fileExtension === 'remote') {
            htmlFile.on('data', function (chunk) {
                var remoteFileUrl = chunk.toString();
                var fileName = stringPathSplitted[stringPathSplitted.length - 3];
                var fileType = stringPathSplitted[stringPathSplitted.length - 2];
                if (fileType !== 'html') {
                    return Promise.reject(new Error(_.ERRORS.CANNOT_PROCESS(_.MESSAGES.WRONG_EXTENSION_FORMAT)));
                }
                return downloadRemoteFile(remoteFileUrl, "" + fileName + fileType);
            });
        }
        var htmlData = '';
        return new Promise(function (resolve, reject) {
            try {
                htmlFile.on('data', function (chunk) {
                    htmlData = chunk.toString();
                    var compiledHtml = ejs.compile(htmlData, options);
                    var output = compiledHtml(data);
                    try {
                        var outputStream = fs.createWriteStream(htmlFile.path);
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
            ? "Cannot process html file because " + reason
            : "Cannot process html file";
    }
};
_.MESSAGES = {
    WRONG_HTML_FORMAT: 'wrong html file format. Expected a stream',
    WRONG_EXTENSION_FORMAT: 'wrong file extension. Expected an html file'
};
module.exports = _;
//# sourceMappingURL=HtmlAdapter.js.map