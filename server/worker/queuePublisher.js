'use strict';
let rabbimqPublisher = function(data, queue, publisherChannel) {
   /**
    * Encodes the json data to a string
    * @param  {} doc
    */
  function encode(doc) {
    return new Buffer(JSON.stringify(doc));
  }

  return new Promise((resolve, reject) => {
    try {
      publisherChannel(queue, function(pErr, pChannel, pConn) {
        if (pErr) {
          reject(pErr);
        } else {
          let status = pChannel.sendToQueue(queue, encode(data), {
            persistent: true,
          });
          setTimeout(function() {
            pChannel.close();
            pConn.close();
          }, 500);

          if (status) {
            resolve(true);
          } else {
            reject('Channel write buffer is full');
          }
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = rabbimqPublisher;
