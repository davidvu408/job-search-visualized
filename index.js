const con = require("./config/db.js");
const express = require('express')
const app = express();
const path = require("path");
const applicationSankeyJSON = require("./public/applicationSankeyDiagram.json");
const fs = require('fs');
const port = 3000;
const visualizationsController = require("./controllers/visualizationsController.js");

app.use(express.static('public'));

app.get('/applicationSankeyDiagram', visualizationsController.getApplicationSankeyDiagramData);

app.get('/getOdometerData', visualizationsController.getOdometerData);

app.get('/applicationsBubbleMap', visualizationsController.getApplicationBubbleMapData);

app.get('/jobBoardPieChart', visualizationsController.getJobBoardPieChartData);

app.listen(process.env.PORT || port, () => console.log('Listening on a port!'));