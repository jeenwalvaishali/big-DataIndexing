const express = require("express");
const dbRedisObject = require("./dbRedis");
const jsonValidator = require("./jsonSchemaValidator");
const bodyParser = require("body-parser");
const auth = require('./auth');
const elastic = require('./esclient');
const rabbitmqLib = require('./rabbitmq-initconnection');
const { parse } = require("basic-auth");

const rabbitMQHost = 'amqp://localhost';
const rabbitMQQueue = 'plan_queue';




const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }))

async function fnConsumer(msg, callback) {
    console.log("Messaged From Queue");
    // console.log((JSON.stringify(msg.content)));
    // let planJson = JSON.stringify(msg.content);
    //await elastic.enter(planJson, planJson.objectId, null, 'plan');
    let payload = JSON.parse(msg.content.toString());
    await elastic.enter(payload, payload.objectId, null, 'plan');
    console.log("Received message: ", payload);
    // we tell rabbitmq that the message was processed successfully
    callback(true);
}

// InitConnection of rabbitmq
rabbitmqLib.InitConnection(() => {
    console.log("Connection with Rabbitmq was successful")
    rabbitmqLib.StartPublisher();
    rabbitmqLib.StartConsumer("plan-queue", fnConsumer);
});


app.post("/api/v1/plans", async (req, res) => {
    if (!auth.validateToken(req)) {
        res.status(400).json({ message: "INVALID TOKEN" });
        return;
    }
    if (jsonValidator.validateSchema(req.body)) {
      
        const value = await dbRedisObject.getPlanById(req.body.objectId);
        if (value) {
            res.setHeader("ETag", value.ETag).status(409).json({ "message": "Plan already exists" });
            return;
        }
        else {
            const result = await dbRedisObject.createNewPlan(req.body);
            const ETag = result.ETag;
            let payloadAsString = JSON.stringify(req.body);
            rabbitmqLib.PublishMessage("plan-exchange","",payloadAsString);

            //await elastic.enter(req.body, req.body.objectId, req.body.objectType, 'plan');
            res.setHeader("ETag", ETag).status(201).json({
                "message": "Plan added",
                "objectId": req.body.objectId
            });
        
            return;
        } 
    }
    else {
        res.status(400).json({ "message": "Plan doesn't valid" });
        return;
    }
});


app.get("/api/v1/plans/:planId", async (req, res) => {
    if (!auth.validateToken(req)) {
        res.status(400).json({ message: "INVALID TOKEN" });
        return;
    }
    if (req.params.planId == null && req.params.planId == "" && req.params == {}) {
        res.status(400).json({ "message": "Plan ID doesn't valid" });
        return;
    }
    const value = await dbRedisObject.getPlanById(req.params.planId);

    if (value.objectId == req.params.planId) {
        if (req.headers['if-none-match'] && value.ETag == req.headers['if-none-match']) {
            res.setHeader("ETag", value.ETag).status(304).json({
                "message": "Plan changed",
                "plan": JSON.parse(value.plan)
            });
            return;
        }
        else {
            res.setHeader("ETag", value.ETag).status(200).json(JSON.parse(value.plan));
            return;
        }
    }
    else {
        res.status(404).json({ "message": "This Plan doesn't exist" });
        return;
    }

});

app.delete("/api/v1/plans/:planId", async (req, res) => {
    if (!auth.validateToken(req)) {
        res.status(400).json({ message: "INVALID TOKEN" });
        return;
    }
    if (req.params.planId == null && req.params.planId == "" && req.params == {}) {
        res.status(400).json({ "message": "Plan ID doesn't valid" });
        return;
    }
    const value = await dbRedisObject.getPlanById(req.params.planId);
    if (value.objectId == req.params.planId) {
        const ETag = value.ETag;
        if ((!req.headers['if-match'] || ETag != req.headers['if-match']) || (jsonValidator.hash(req.body) == ETag)) {
            res.setHeader("ETag", ETag).status(412).json("Etag not matched");
            return;
        }
        else {
            if (dbRedisObject.deletePlanById(req.params)) {
                await elastic.deleteNested(req.params.planId, "plan");
                res.status(204).json({ "message": "Plan Deleted" });
            }
            else {
                res.status(500).json({ "message": "Unable to delete a plan" });
            }
            return;
        }
    }
    else {
        res.status(404).json({ "message": "This Plan doesn't exist" });
        return;
    }

});

app.patch('/api/v1/plans/:planId', async (req, res) => {
    if (!auth.validateToken(req)) {
        res.status(400).json({ message: "INVALID TOKEN" });
        return;
    }
    if (req.params.planId == null && req.params.planId == "" && req.params == {}) {
        res.status(400).json({ "message": "Plan ID doesn't valid" });
        return;
    }
    if (!jsonValidator.validateSchema(req.body)) {
        res.status(400).json({ "message": "Plan doesn't valid" });
        return;
    }
    const value = await dbRedisObject.getPlanById(req.params.planId);
    if (value.objectId == req.params.planId) {
        const ETag = value.ETag;
        if ((!req.headers['if-match'] || ETag != req.headers['if-match']) || (jsonValidator.hash(req.body) == ETag)) {
            res.setHeader("ETag", ETag).status(412).json("There is no modification in the plan");
            return;
        }
        else {
            const modifiedPlan = await dbRedisObject.createNewPlan(req.body);
           // await elastic.deleteNested(req.params.planId, "plan");
            //await elastic.enter(req.body, req.params.planId, null, "plan");
            await elastic.deleteNested(req.params.planId, "plan");
            await elastic.enter(req.body, req.params.planId, null, "plan");
            res.setHeader("ETag", modifiedPlan.ETag).status(201).json("Plan Successfully Modified");
        }
    }
    else {
        res.status(404).json({ "message": "This Plan doesn't exist" });
        return;
    }
});

app.put('/api/v1/plans/:planId', async (req, res) => {
    if (!auth.validateToken(req)) {
        res.status(400).json({ message: "INVALID TOKEN" });
        return;
    }
    if (req.params.planId == null || req.params.planId == "" || Object.keys(req.body).length === 0) {
        res.status(400).json({ "message": "Plan ID doesn't valid" });
        return;
    }
    if (!jsonValidator.validateSchema(req.body)) {
        res.status(400).json({ "message": "Plan doesn't valid" });
        return;
    }
    const value = await dbRedisObject.getPlanById(req.params.planId);
    if (value.objectId == req.params.planId) {
        const ETag = value.ETag;
        if ((!req.headers['if-match'] || ETag != req.headers['if-match']) || (jsonValidator.hash(req.body) == ETag)) {
            res.setHeader("ETag", ETag).status(412).json("There is no modification in the plan");
            return;
        }
        else {
            const updatedPlan = await dbRedisObject.createNewPlan(req.body);
            res.setHeader("ETag", updatedPlan.ETag).status(201).json(req.body);
        }
    }
    else {
        res.status(404).json({ "message": "This Plan doesn't exist" });
        return;
    }
});



app.get('/api/v1/token', async (req, res) => {
    const token = auth.generateToken();
    res.status(200).json({
        'message': 'SUCCESS!',
        'token': token
    });
});


app.post('/api/v1/validateToken', async (req, res) => {
    validity = auth.validateToken(req);
    if (validity) {
        res.status(200).json({ message: "TOKEN VALID!" });
        return;
    }
    else {
        res.status(400).json({ message: "INVALID TOKEN" });
        return;
    }
});

app.listen(port, () => {
    console.log(`Listening on port http://localhost:${port}`);
});
