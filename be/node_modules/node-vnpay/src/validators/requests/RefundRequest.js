'use strict'
const SimpleSchema = require('simpl-schema');

class RefundRequest {
    static fieldSchema = new SimpleSchema({
        amount               : { type: SimpleSchema.Integer, max: 9999999999 },
        transactionType      : { type: String, allowedValues: ['02', '03']},
        transactionRef       : { type: String, max: 100 },
        transDate            : { type: SimpleSchema.Integer, max: 20150101000000, max: 99999999999999 },
        orderInfo            : { type: String, optional: true, max: 255 }
    });

    static validate (inputs) {
        return this.fieldSchema.validate(inputs)
    }
}
module.exports = RefundRequest;

