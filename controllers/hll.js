'use strict';
var _ = require('underscore');
var joi = require('joi');
var Foxx = require('org/arangodb/foxx');
var ArangoError = require('org/arangodb').ArangoError;
var HllRepo = require('../repositories/hll');
var controller = new Foxx.Controller(applicationContext);

var hllIdSchema = joi.string().required()
    .description('The id of the hll')
    .meta({allowMultiple: false});

var hllModel = Foxx.Model.extend({
    schema: {
        // Describe the attributes with joi here
        _key: joi.string(),
        _card: joi.number(),
        _register: joi.number().min(1).max(24),
        _hll: joi.string()
    }
});

var hllRepo = new HllRepo(
    applicationContext.collection('hll'),
    {model: hllModel}
);

/** Lists of all HyperLogLog instances.
 *
 * This function simply returns the list of all Hll.
 */
controller.get('/', function (req, res) {
    res.json(_.map(hllRepo.all(), function (model) {
        var record = model.forClient();
        delete record._hll;
        delete record._register;
        return record;
    }));
});

/** add value/s to a HyperLogLog instance.
 *
 * add value or list of values and get new cardinality.
 * if document doesn't exists its implicitly created.
 * Returns status 200 if cardinality actually changed or 208 if it wasn't
 */
controller.post('/add', function (req, res) {
        var key = req.parameters.hll._key;
        var values = [].concat(
            req.parameters.hll.value ||
            req.parameters.hll.values
        );

        var data = hllRepo.add(key, values);
        var status = data.changed ? 200 : 208;
        delete data.changed;

        res.status(status);
        return res.json(data);
    })
    .bodyParam('hll', {
        description: 'Document key and values to add',
        type: joi.object().keys({
            _key: joi.string().min(1).required(),
            value: joi.string(),
            values: joi.array()
                .items(
                    joi.string().min(1).required()
                )
        }).or('value', 'values')
    });

/** Get cardinality of an HyperLogLog instance.
 *
 * Reads an HyperLogLog instance.
 */
controller.get('/:id', function (req, res) {
        var id = req.urlParameters.id;
        var record = hllRepo.byId(id).forClient();
        delete record._hll;
        delete record._register;
        res.json(record);
    })
    .pathParam('id', hllIdSchema)
    .errorResponse(ArangoError, 404, 'The hll could not be found');


/** Removes an HyperLogLog instance.
 *
 * Removes an HyperLogLog instance.
 */
controller.delete('/:id', function (req, res) {
        var id = req.urlParameters.id;
        hllRepo.removeById(id);
        res.json({success: true});
    })
    .pathParam('id', hllIdSchema)
    .errorResponse(ArangoError, 404, 'The hll could not be found');
