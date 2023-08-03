'use strict'
const SimpleSchema = require('simpl-schema');

class QueryRequest {
    static fieldSchema = new SimpleSchema({
        orderInfo            : { type: String, max: 255 },
        orderType            : { type: String, max: 100 },
        transDate            : { type: SimpleSchema.Integer, max: 20150101000000, max: 99999999999999 },
        transactionRef       : { type: String, max: 100 },
        transactionNo        : { type: SimpleSchema.Integer, optional: true, min: 1, max: 999999999999999 }
    });

    static validate (inputs) {
        return this.fieldSchema.validate(inputs)
    }
}
module.exports = QueryRequest;

