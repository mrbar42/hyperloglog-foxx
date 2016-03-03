'use strict';
var Foxx = require('org/arangodb/foxx');
var HyperLogLog = require('../lib/hyperloglog');
var cfg = applicationContext.configuration;

module.exports = Foxx.Repository.extend({
    add: function (key, values) {
        var record;
        var exists = this.collection.exists(key);
        var changed = false;
        if (exists) {
            record = this.collection.document(key);
        }

        if (!record) {
            record = {
                _key: key,
                _card: 1,
                _register: parseInt(cfg.defaultRegisterSize) || 12
            };
            changed = true;
        }

        // instantiate new instance
        var hll = HyperLogLog(record._register);

        // merge with existing data
        if (record._hll) {
            try {
                hll.merge(JSON.parse(record._hll));
            } catch(e) {
                delete record._hll
            }
        }

        // add values
        values.forEach(function (value) {
            hll.add(value);
        });

        // update record
        var newCount = hll.count();
        if (record._card !== newCount) {
            changed = true;
            record._card = newCount;
        }
        record._hll = JSON.stringify(hll.output());

        if (exists) {
            this.collection.update(key, record);
        }
        else {
            this.collection.save(record);
        }

        // return
        return {
            _key: key,
            _card: record._card,
            changed: changed
        }
    }
});