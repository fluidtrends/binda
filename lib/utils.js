"use strict";
var fs = require('fs');
var request = require('request');
var getFileExtension = function (filePath) {
    if (typeof filePath !== 'string') {
        throw new Error('Expected filePath to be a string.');
    }
    var pathSplit = filePath.split('.');
    return pathSplit[pathSplit.length - 1];
};
var downloadRemoteFile = function (url, fileName) {
    if (!fileName) {
        return Promise.reject(new Error('Cannot load file because fileName is a required argument'));
    }
    if (!url) {
        return Promise.reject(new Error('Cannot load file because url is a required argument'));
    }
    return new Promise(function (resolve, reject) {
        request.head(url, function (err, res, body) {
            if (res.statusCode !== 200) {
                reject(new Error(_.ERRORS.CANNOT_LOAD(_.MESSAGES.BAD_STATUS_CODE)));
            }
            resolve(request(url).pipe(fs.createWriteStream(fileName)));
        });
    });
};
module.exports = {
    getFileExtension: getFileExtension,
    downloadRemoteFile: downloadRemoteFile
};
//# sourceMappingURL=utils.js.map