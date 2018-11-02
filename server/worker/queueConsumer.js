#!/usr/bin/env node

let rmqChannel = require('./queueClient');
let publish = require('./queuePublisher');

/**
 * Works as router for the workers. connects to the queue and consumes the message.
 * creates an instance of the action class and calls the processing function.
 */
class QueueConsumer {

    /**
     *
     */
  constructor() {
    this.queue = process.argv[2] || undefined;
    this.workerClass = process.argv[3] || undefined;
  }

    /**
     * connects to the queue server channel and triggers the consume function upon successful connection
     */
  connect() {
    try {
      if (!this.queue) throw new Error('Queue name is not set from the supervisor. please fix it in the supervisor configuration.');
      if (!this.workerClass) throw new Error('Worker class name is not set from the supervisor. please fix it in the supervisor configuration.');

      rmqChannel(this.queue, (err, channel, conn) => {
        if (err) {
          console.error(err);
        } else {
          console.log({'channel and queue created with: ': this.queue});
          this._consume(channel);
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

    /**
     * consumes the message and ack it. also pass it to the action class for execution
     * @param {*} channel
     */
  _consume(channel) {
    try {
      channel.prefetch(1);
      console.log('queue Waiting');
            channel.consume(this.queue, async (msg) => {
                try {
                    let data = msg.content.toString();
                     let WorkerClassObj = require(`./${this.workerClass}`);
                     let actionWorkerObj = new WorkerClassObj();
                     let shouldItBeRequeued = await actionWorkerObj.processMessage(data);
                }catch(e) {
                 //   log.error(error);
                 console.log(error);
                }
            }, {noAck: true});
    } catch (error) {
      console.log(error);
         //   log.error(error);
    }
  }
}

let QueueConsumerObj = new QueueConsumer();
QueueConsumerObj.connect();
