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
var fs = require('fs');
var request = require('request');
var stream = require('stream');
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
    _.prototype.process = function (image) {
        if (!(image instanceof stream.Stream)) {
            return Promise.reject(new Error(_.ERRORS.CANNOT_PROCESS(_.MESSAGES.WRONG_IMAGE_FORMAT)));
        }
        if (_.TYPES.indexOf(getFileExtension(image.path)) === -1) {
            return Promise.reject(new Error(_.ERRORS.CANNOT_PROCESS(_.MESSAGES.WRONG_EXTENSION_FORMAT)));
        }
        var stringPathSplit = image.path ? image.path.split('.') : '';
        var imageExtension = getFileExtension(image.path);
        if (imageExtension === 'remote') {
            image.on('data', function (chunk) {
                var remoteImageUrl = chunk.toString();
                var imageName = stringPathSplit[stringPathSplit.length - 3];
                var imageType = stringPathSplit[stringPathSplit.length - 2];
                return downloadRemoteFile(remoteImageUrl, "" + imageName + imageType);
            });
        }
        var writeAbleImg = fs.createWriteStream(image.path ? image.path : '');
        return new Promise(function (resolve, reject) {
            try {
                resolve(image.pipe(writeAbleImg));
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
        return reason ? "Cannot process image because " + reason : "Cannot process image";
    }
};
_.TYPES = ['png', 'jpeg', 'remote', 'gif'];
_.MESSAGES = {
    NO_IMAGE: 'no image retrieved',
    BAD_STATUS_CODE: 'the url returned a error code',
    WRONG_IMAGE_FORMAT: 'wrong format image. Expected a stream',
    WRONG_EXTENSION_FORMAT: "wrong file extension. Expected one of the following:" + _.TYPES.map(function (type) { return " " + type; }) + "."
};
module.exports = _;
//# sourceMappingURL=ImageAdapter.js.map