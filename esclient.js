let elastic = {}
const elasticsearch = require('@elastic/elasticsearch');
elastic.client = new elasticsearch.Client({
    node: 'http://localhost:9200',
});

const indexName = 'plan';

// const mapping = {
//     properties: {
//       plan_join: {
//         type: 'join',
//         relations: {
//           plan: ['planservice', 'membercostshare'],
//           planservice: 'service',
//         },
//       },
//       planCostShares: {
//         properties: {
//           _org: { type: 'keyword' },
//           copay: { type: 'float' },
//           deductible: { type: 'float' },
//           objectId: { type: 'keyword' },
//           objectType: { type: 'keyword' },
//         },
//       },
//       linkedPlanServices: {
//         properties: {
//           _org: { type: 'keyword' },
//           objectId: { type: 'keyword' },
//           objectType: { type: 'keyword' },
//           linkedService: {
//             properties: {
//               _org: { type: 'keyword' },
//               name: { type: 'text' },
//               objectId: { type: 'keyword' },
//               objectType: { type: 'keyword' },
//             },
//           },
//           planserviceCostShares: {
//             properties: {
//               _org: { type: 'keyword' },
//               copay: { type: 'float' },
//               deductible: { type: 'float' },
//               objectId: { type: 'keyword' },
//               objectType: { type: 'keyword' },
//             },
//           },
//         },
//       },
//       _org: { type: 'keyword' },
//       objectId: { type: 'keyword' },
//       objectType: { type: 'keyword' },
//       planType: { type: 'keyword' },
//       creationDate: { type: 'date' },
//     },
//   };
  
  
  elastic.createIndexWithMapping = async function () {
    // Create index with mapping
    await this.client.indices.create({
      index: indexName,
      body: {
        "properties": {
            "join": {
                "type": "join",
                "relations": {
                    "plan": ["planCostShares", "linkedPlanServices"],
                    "linkedPlanServices": ["linkedService", "planserviceCostShares"]
                }
            }
        }
      },
    });
  };


elastic.enter = async function(body, parentId, parentType, objKey){
    let item = {};
    let objectId = body["objectId"];
    let objectType = body["objectType"];
    for(let key in body){
        let value = body[key];
        if(typeof(value) == 'object' && value instanceof Array){
            for(let i = 0; i<value.length; i++){
                console.log(value[i], objectId, objectType);
                await this.enter(value[i], objectId, objectType, key);
            }
        }
        else if(typeof(value) == 'object'){
            console.log(value, objectId, objectType);
            await this.enter(value, objectId, objectType, key);
        }
        else{
            item[key] = value;
        }
    }
    if(parentId){
        item['plan_join'] = {
            'parent' : parentId,
            'name' : objKey,
        }
    }
    await this.client.index({
        index: indexName,
        id: objectId,
        routing: parentId,
        body: item
    });
}

elastic.deleteEachObject = async function(parentId, body){
    let item = {};
    let objectId = body["objectId"];
    let objectType = body["objectType"];
    for(let key in body){
        let value = body[key];
        if(typeof(value) == 'object' && value instanceof Array){
            for(let i = 0; i<value.length; i++){
                console.log(value[i], objectId, objectType);
                await this.deleteEachObject(objectId), body;
            }
        }
        else if(typeof(value) == 'object'){
            console.log(value, objectId, objectType);
            await this.deleteEachObject(objectId, body);
        }
        else{
            item[key] = value;
        }
    }
    if(parentId){
        item['plan_join'] = {
            'parent' : parentId,
            'name' : objKey,
        }
    }
    await this.client.delete({
        index: indexName,
        id: parentId
    });
}


elastic.delete = async function(objectId){
    await this.client.delete({
        index: indexName,
        id: objectId
    });
}



elastic.deleteNested = async function(objectId, objectType){
    await this.delete(objectId);
    let results;
    try{
    results = await this.searchChildren(objectId, objectType);
    }catch(err){
        return null;
    }
    if(results == null){
        return null;
    }
    for(let i=0; i<results.length; i++){
        let result = results[i];
        try{
        await this.deleteNested(result["_id"],result['_source']['plan_join']['name']);
        }catch(err){
            return null;
        }
    }
}

elastic.searchChildren = async function(objectId, objectType){
    let results = await this.client.search({
        index: indexName,
        query : {
            "has_parent" : {
              "parent_type": objectType,
              "query": {
                        "term": {
                            "_id": {
                                "value": objectId
                            }
                        }
                    }
            }
          }
    });
    if(results && results['hits'] && results['hits']['total'] && results['hits']['total']['value']>0){
        return results['hits']['hits'];
    }
    else{
        return null;
    }
    
}


  
module.exports = elastic;