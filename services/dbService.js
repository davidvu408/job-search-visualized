const fs = require('fs');
const con = require("../config/db.js");
const applicationSankeyJSON = require("../public/applicationSankeyDiagram.json");
const path = require("path");


const applicationBubbleMapQuery = async () => {
    return new Promise((resolve, reject) => {
        con.query(`SELECT applications.city, state, country, lng, lat, COUNT(*) as appCount
				  FROM applications INNER JOIN cities on applications.city = cities.city AND applications.state = cities.state_id
				  GROUP BY city;`, function(err, result, fields) {
            if (err) reject(err);
           	resolve(result);
        });
    });
}

const jobBoardPieChartQuery = async () => {
    return new Promise((resolve, reject) => {
        con.query(`SELECT applied_from AS name,COUNT(*) AS value 
            FROM applications GROUP BY applied_from;`, function(err, result, fields) {
            if (err) reject(err);
            resolve(result);
        });
    });
}

const applicationSankeyDiagramQuery = async () => {
    return new Promise((resolve, reject) => {
        con.query(`SELECT ((SELECT COUNT(*) FROM applications ) - (SELECT COUNT(DISTINCT application_id) FROM responses)) AS totalNoReplies,
        (SELECT COUNT(DISTINCT application_id) FROM responses) AS totalReplies,
        (SELECT COUNT(DISTINCT application_id) FROM responses WHERE response_type_to = 'Coding Assessment' ) AS totalCodingAssessments,
        (SELECT COUNT(DISTINCT application_id) FROM responses WHERE response_type_to = 'Rejected' ) AS totalRejections,
        (SELECT COUNT(DISTINCT application_id) FROM responses WHERE response_type_to = 'No Offer' ) AS noOffers,
        (SELECT COUNT(DISTINCT application_id) FROM responses WHERE response_type_from = 'Application Sent' AND response_type_to = 'Interview' ) AS interviewsFromApps,
        (SELECT COUNT(DISTINCT application_id) FROM responses WHERE response_type_from = 'Coding Assessment' AND response_type_to = 'Interview' ) AS interviewsFromCodingAssessments;`,
            function(err, result, fields) {
                if (err) reject(err);
                resolve(result[0]);
            });
    });
}

const rewriteSankeyDiagramJSON = async (sankeyDiagramQueryResult) => {
    // Taking the result of our subqueries and updates the JSON object used for the Sankey Diagram
    let result = sankeyDiagramQueryResult;
    for (const link of applicationSankeyJSON.links) {
        if (link.source === 'Interview' && link.target === 'Awaiting Reply') {
            // Awaiting Reply = Total Interviews - No Offers
            link.value = (result.interviewsFromApps + result.interviewsFromCodingAssessments) - result.noOffers;
        } else if (link.source === 'Interview' && link.target === 'No Offer') {
            link.value = result.noOffers;
        } else if (link.source === 'Coding Assessment' && link.target === 'Interview') {
            link.value = result.interviewsFromCodingAssessments;
        } else if (link.source === 'Applications Sent' && link.target === 'Interview') {
            link.value = result.interviewsFromApps;
        } else if (link.source === 'Applications Sent' && link.target === 'Coding Assessment') {
            link.value = result.totalCodingAssessments;
        } else if (link.source === 'Applications Sent' && link.target === 'Rejections') {
            link.value = result.totalRejections;
        } else if (link.source === 'Applications Sent' && link.target === 'Awaiting Reply') {
            link.value = result.totalNoReplies;
        }
    }

    return new Promise((resolve, reject) => {
        fs.writeFile("./public/applicationSankeyDiagram.json", JSON.stringify(applicationSankeyJSON, null, 2), function(err) {
            if (err) reject(err);
            resolve(applicationSankeyJSON);
        });
    });

}

const totalApplicationsQuery = async () => {
    return new Promise((resolve, reject) => {
        con.query("SELECT (SELECT COUNT(*) FROM applications ) AS totalApplications", function(err, result, fields) {
            if (err) reject(err);
            resolve(result);
        });
    });
};

module.exports.applicationBubbleMapQuery = applicationBubbleMapQuery;
module.exports.jobBoardPieChartQuery = jobBoardPieChartQuery;
module.exports.applicationSankeyDiagramQuery = applicationSankeyDiagramQuery;
module.exports.rewriteSankeyDiagramJSON = rewriteSankeyDiagramJSON;
module.exports.totalApplicationsQuery = totalApplicationsQuery;