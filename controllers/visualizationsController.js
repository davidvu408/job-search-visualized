const dbService = require("../services/dbService.js");

const getApplicationBubbleMapData = async(req, res) => {
    dbService.applicationBubbleMapQuery()
        .then((data) => {
            res.send(data);
        }).catch((e) => {
            res.status(500).send('Can not get bubble map data');
        });
}

const getJobBoardPieChartData = async(req, res) => {
    dbService.jobBoardPieChartQuery()
        .then((data) => {
            res.send(data);
        }).catch((e) => {
            res.status(500).send('Can not get job board pie chart data');
        });
}

const getApplicationSankeyDiagramData = async(req, res) => {
    dbService.applicationSankeyDiagramQuery()
        .then((data) => {
            return dbService.rewriteSankeyDiagramJSON(data);
        }).then((sankeyDiagramJSON) => {
            res.json(sankeyDiagramJSON);
        }).catch((e) => {
            res.status(500).send('Can not get sankey diagram data');
        });
}

const getOdometerData = async(req, res) => {
    // Query for total appliications
    dbService.totalApplicationsQuery()
        // Attatch total applications
        .then((numApplications) => {
            return { 'totalApplications': numApplications[0].totalApplications.toString() };
            // Attatch num days job searching
        }).then(obj => {
            // Started job search on November 26, 2019
            obj['numDaysJobSearch'] = Math.floor((new Date(2020, 2, 17) - new Date(2019, 11, 26)) / (1000 * 3600 * 24)).toString();
            return obj;
            // Attatch average apps per day
        }).then(obj => {
            obj['averageAppsPerDay'] = (obj.totalApplications / obj.numDaysJobSearch).toFixed(2);
            res.json(obj);
        }).catch((e) => {
            res.status(500).send('Can not get odometer data');
        });
}

module.exports.getApplicationBubbleMapData = getApplicationBubbleMapData;
module.exports.getJobBoardPieChartData = getJobBoardPieChartData;
module.exports.getApplicationSankeyDiagramData = getApplicationSankeyDiagramData;
module.exports.getOdometerData = getOdometerData;
