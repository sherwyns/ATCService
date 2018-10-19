let app = require('../../../server/server');
const FlclError = require('../../components/flclLogging/flclError');
let FileParser = require('../../invoiceparsers/FileParser');
let FileOperations = require('../../invoiceparsers/fileoperations');


/**
 * @class TallyInvoiceWorker
 */
class TallyInvoiceWorker {
    /**
     * 
     * @param {*} data
     * @param {*} logger
     * @param {*} i18Object
     * @param {*} redisObject
     * @param {*} dutyProviderObj
     */
    constructor(logger, i18Object, redisObject, dutyProviderObj) {
        this.logger = logger || app.get('logger');
        this.i18Object = i18Object;
        this.redisObject = redisObject;
        this.dutyProviderObj = dutyProviderObj;
        
        /** FedEx */
        // this.processMessage({fileName: 'FedEx_SHIPMENT.csv'});
        // this.processMessage({fileName: 'FedEx_DUTY.csv'});

        /** UPS */
        // this.processMessage({fileName: 'UPS_File_Duty.xlsx'});

        /** DHL */
        // this.processMessage({fileName: 'DHL_Shipment.xlsx'});
        // this.processMessage({fileName: 'DHL_DUTY.csv'});

        /** APC */
        // this.processMessage({fileName: 'DHL_Shipment.csv', cdnPath: 'http://cdn.flavorcloud.com/int/DHL_Shipment.csv'});
    }

    /**
     * @param {*} dataIn
     * @memberof TallyInvoiceWorker
     */
    async processMessage(dataIn) {
        let mFileOperations = new FileOperations(app);
        let fileName = '';
        let cdnPath = '';
        try {
            this.logger.debug('processMessage started');
            this.logger.debug(dataIn);
            if(typeof dataIn === 'string')
                dataIn = JSON.parse(dataIn);
            // let utilData = {};
            // utilData.event = 'order-fulfill-cancelled';
            // utilData.appId = dataIn.appID;
            // let utilObj = new Utils();
            // utilObj.processComplete(utilData, {redisObj: this.redisObject});
            fileName = dataIn.fileName;
            cdnPath = dataIn.cdnPath;
            if(!fileName)
                throw new Error('File name is missing in queue');
            if(!cdnPath)
                throw new Error('File CDN Path is not available');
            if(fileName) {
                this.logger.debug({'tally-worker-process': fileName});
                let mFileParser = new FileParser(app, this.logger, dataIn.fileName, cdnPath);
                await mFileParser.initConstructor();
                let carrierType = await mFileParser.doParse();
                this.logger.debug({'carrier Name and Type': carrierType});
                await mFileOperations.updateFileInfoInDB(fileName, 0, 'Success', carrierType, '');
                this.logger.debug('success');
            }
        } catch (error) {
            let errMsg = '';
            errMsg = error.message || error;
            if(errMsg === 'dString.slice is not a function') {
                errMsg = '';
            }
            await mFileOperations.updateFileInfoInDB(fileName, 0, 'ERROR', '', 'TallyInvoice ' + errMsg);
            let flclError = new FlclError({className: 'TallyInvoiceWorker', methodName: 'processMessage', cause: error, message: 'error received.'});
            throw flclError;
        }
    }
}
module.exports = TallyInvoiceWorker;
new TallyInvoiceWorker();
