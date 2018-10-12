'use strict';
let bunyan = require('bunyan');
let RotatingFileStream = require('bunyan-rotating-file-stream');

let logger = bunyan.createLogger({
  name: 'ATC_App',
  streams: [{
    level: 'info',
    stream: process.stdout,            // log INFO and above to stdout
  },
  {
    stream: new RotatingFileStream({
      level: 'error',
      path: './server/log/error.log',  // log ERROR and above to a file
      period: '1d',          // daily rotation
      totalFiles: 10,        // keep up to 10 back copies
      rotateExisting: true,  // Give ourselves a clean file when we start up, based on period
      threshold: '10m',      // Rotate log files larger than 10 megabytes
      totalSize: '20m',      // Don't keep more than 20mb of archived log files
      gzip: true,             // Compress the archive log files to save space
    }),
  }],
});
module.exports = logger;

