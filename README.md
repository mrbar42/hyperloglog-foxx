# hyperloglog-foxx

 **hyperloglog-foxx adds HyperLogLog algorithm implementation as arangodb foxx app.**

hyperloglog algorithm - by [optimizely/hyperloglog](https://github.com/optimizely/hyperloglog)

murmurhash3 hash algorithm by [karanlyons/murmurHash.js](http://github.com/karanlyons/murmurHash.js)


the state of each instance is stored as serialized JSON (string) under `_hll` key.

each instance weight is ~8kb at 12 registers with a mathematical error of ~1.6%.

 The actual errors you might experience are 0.5-3%.

## Quick Overview

#### GET /hll
 Lists of all HyperLogLog instances.
 
 echo instance have a `_card` key that denotes the count of unique
  values that were added to the instance. e.g cardinality.
 Request:
 
    curl -X GET -H "Accept: application/json" "http://localhost:8529/_db/_system/hll/hll"
 Response:
 
    [
      {
        "_key": "abcd",
        "_card": 176
      }
    ]
 
 
#### POST /hll/add
 add value/s to a HyperLogLog instance.

 to add multiple values use `values` key in body and add multiple values in an array of strings
   Request:
   
      curl -X POST -d @- http://localhost:8529/_db/_system/hll/hll/add <<EOF
      { 
        "_key_" : "abcd",
         "value": "my unique value"
      }
      EOF
   Response:
   
      [
        {
          "_key": "abcd",
          "_card": 176
        }
      ]
   Return Codes:

   - `200`: added value/s and cardinality was changed.
   - `208`: added value/s but cardinality wasn't changed.
   
   
#### DELETE /hll/{id}
 Removes an HyperLogLog instance.
  Request:
  
    curl -X DELETE -H "Accept: application/json" "http://localhost:8529/_db/_system/hll/hll/abcd"
  Response:
  
    {
    "success": true
    }
  
   
#### GET /hll/{id}
 get specific instance by id.
  Request:
  
     curl -X GET -H "Accept: application/json" "http://localhost:8529/_db/_system/hll/hll/abcd"
  Response:
  
    {
        "_key": "abcd",
        "_card": 176
    }
  