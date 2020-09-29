/*
Created from this guide https://www.digitalocean.com/community/tutorials/how-to-use-node-js-and-github-webhooks-to-keep-remote-projects-in-sync 
*/
let http = require('http');
let crypto = require('crypto');

const exec = require('child_process').exec;

const { prodDirectory, devDirectory, lukeDirectory, aiDirectory } = require('./config');
const CREDS = require("./creds.json");
const PORT = process.env.PORT || 3001; // Use enviroment variable PORT or default to 3001


const app = (req, res) => {
        console.log("[INFO] req received");
        let body = "";

        req.on('data', (chunk) => {
                body += chunk;
        });

        req.on('end', () => {
                let sig = "sha1=" + crypto.createHmac('sha1', CREDS.secret).update(body).digest('hex');

                let jsonData = JSON.parse(body);
                let ref = jsonData.ref.split("/");
                let repo = jsonData.repository.name;
                if (repo === "website-condor") {
                        if (ref[ref.length - 1] === "dev") {
                                console.log("[INFO] Recieved Badgerloop.com dev");
                                if (req.headers['x-hub-signature'] === sig) {
                                        exec(`cd ${devDirectory} && git pull`, (err, stdout, stderr) => {
                                                if (err) console.log(`[ERROR] ${err}`);
                                        });
                                }
                        } else if (ref[ref.length - 1] === "master") {
                                console.log("[INFO] Recieved Badgerloop.com prod")
                                if (req.headers['x-hub-signature'] === sig) {
                                        console.log("executing master pull");
                                        exec(`cd ${prodDirectory} && git pull`, (err, stdout, stderr) => {
                                                if (err) console.log(`[ERROR] ${err}`);
                                        });
                                }
                        }
                }
                else if (repo === "Personal-Site") {
                        console.log("[INFO] Recieved lukehouge.com");
                        if (req.headers['x-hub-signature'] === sig) {
                                exec(`cd ${lukeDirectory} && git pull`, (err, stdout, stderr) => {
                                        if (err) console.log(`[ERROR] ${err}`);
                                });
                        }
                }
                else if (repo === "AI-UW-Website") {
                        console.log("[INFO] Recieved ai.cs.wisc.edu");
                        if (req.headers['x-hub-signature'] === sig) {
                                exec(`cd ${aiDirectory} && git pull && npm run build`, (err, stdout, stderr) => {
                                        if (err) console.log(`[ERROR] ${err}`)
                                });
                        }
                }
                else if (repo === "BOM-Webapp") {
                        console.log("[INFO] Recieved apps.badgerloop.org");
                        if (req.headers['x-hub-signature'] === sig) {
                                exec(`cd ${appsDirectory} && git pull && pm2 restart prodBOM`, (err, stdout, stderr) => {
                                        if (err) console.log(`[ERROR] ${err}`)
                                });
                        }
                }

        });

        res.end();

}

http.createServer(app).listen(PORT);