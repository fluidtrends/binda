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
    _.prototype.process = function (template, options, data) {
        if (options === void 0) { options = {}; }
        if (data === void 0) { data = {}; }
        if (!(template instanceof stream.Stream)) {
            return Promise.reject(new Error(_.ERRORS.CANNOT_PROCESS(_.MESSAGES.WRONG_TEMPLATE_FORMAT)));
        }
        var fileExtension = getFileExtension(template.path);
        var stringPathSplitted = template.path ? template.path.split('.') : '';
        if (fileExtension === 'remote') {
            template.on('data', function (chunk) {
                var remoteFileUrl = chunk.toString();
                var fileName = stringPathSplitted[stringPathSplitted.length - 3];
                var fileType = stringPathSplitted[stringPathSplitted.length - 2];
                return downloadRemoteFile(remoteFileUrl, "" + fileName + fileType);
            });
        }
        var templateData = '';
        return new Promise(function (resolve, reject) {
            try {
                template.on('data', function (chunk) {
                    templateData = chunk.toString();
                    var compiledTemplate = ejs.compile(templateData, options);
                    var output = compiledTemplate(data);
                    try {
                        var outputStream = fs.createWriteStream(template.path);
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
            ? "Cannot process template because " + reason
            : "Cannot process template";
    }
};
_.MESSAGES = {
    WRONG_TEMPLATE_FORMAT: 'wrong template format. Expected a stream'
};
module.exports = _;
//# sourceMappingURL=TemplateAdapter.js.map