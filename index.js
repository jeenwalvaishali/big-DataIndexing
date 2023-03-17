const express = require("express");
const dbRedisObject = require("./dbRedis");
const jsonValidator = require("./jsonSchemaValidator");
const bodyParser = require("body-parser");
const auth = require('./auth');
const app = express();
const port = 3000;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }))


app.post("/api/v1/plans", async (req, res) => {
    console.log("auth", auth.validateToken(req))
    if (!auth.validateToken(req)) {
        res.status(400).json({ message: "INVALID TOKEN" });
        return;
    }
    if (jsonValidator.validateSchema(req.body)) {
        console.log("Valid");
        const value = await dbRedisObject.getPlanById(req.body.objectId);
        if (value) {
            res.setHeader("ETag", value.ETag).status(409).json({ "message": "Plan already exists" });
            console.log("Plan already exists");
            return;
        }
        else {
            const result = await dbRedisObject.createNewPlan(req.body);
            const ETag = result.ETag;
            res.setHeader("ETag", ETag).status(201).json({
                "message": "Plan added",
                "objectId": req.body.objectId
            });
            console.log("Plan added");
            return;
        } s
    }
    else {
        console.log("inValid");
        res.status(400).json({ "message": "Plan doesn't valid" });
        console.log("Plan doesn't valid");
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
        console.log("Plan ID doesn't valid");
        return;
    }
    console.log("Pland ID ", req.params.id);
    const value = await dbRedisObject.getPlanById(req.params.planId);
    console.log("req.params.planId", req.params.planId)
    if (value.objectId == req.params.planId) {
        if (req.headers['if-none-match'] && value.ETag == req.headers['if-none-match']) {
            res.setHeader("ETag", value.ETag).status(304).json({
                "message": "Plan changed",
                "plan": JSON.parse(value.plan)
            });
            console.log("Unchanged Plan:");
            console.log(JSON.parse(value.plan));
            return;
        }
        else {
            res.setHeader("ETag", value.ETag).status(200).json(JSON.parse(value.plan));
            console.log("Changed Plan");
            console.log(JSON.parse(value.plan));
            return;
        }
    }
    else {
        res.status(404).json({ "message": "This Plan doesn't exist" });
        console.log("This Plan doesn't exist");
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
        console.log("This Plan doesn't exist");
        return;
    }

});

app.patch('/api/v1/plans/:planId', async (req, res) => {
    console.log("PATCH: plans/");
    console.log(req.params);
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
            const value = await dbRedisObject.createNewPlan(req.body);
            res.setHeader("ETag", value.ETag).status(201).json("Plan Successfully Modified");
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
