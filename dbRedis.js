let dbRedisObject = {};

const redis = require("redis");
const client = redis.createClient();
var hash = require("object-hash");

client.connect();

client.on("connect", function () {
  console.log("Redis client connected");
});

client.on("error", function (err) {
  console.log("Something went wrong " + err);
});

dbRedisObject.getPlanById = async function (id) {
  console.log("ID "+id)
  const value = await client.hGetAll(id);
  if(value.objectId == id){
      return value;
  }
  else{
      return false;
  }
};


dbRedisObject.createNewPlan = async function (reqBody) {
  const ETag = hash(reqBody);
  await client.hSet(reqBody.objectId, "plan", JSON.stringify(reqBody));
  await client.hSet(reqBody.objectId, "ETag", ETag);
  await client.hSet(reqBody.objectId, "objectId", reqBody.objectId);
  return await this.getPlanById(reqBody.objectId);
};

dbRedisObject.deletePlanById = async function(params){
  if(await client.del(params.planId)){
      return true;
  }
  else{
      return false;
  }
}


module.exports = dbRedisObject;
