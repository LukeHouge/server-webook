/*
Created from this guide https://www.digitalocean.com/community/tutorials/how-to-use-node-js-and-github-webhooks-to-keep-remote-projects-in-sync 
*/
let prodDirectory = "/var/www/badgerloop.org";
let devDirectory = "/var/www/dev.badgerloop.org";
let lukeDirectory = "/var/www/lukehouge.com";
let aiDirectory = "/var/www/ai";
let creds = require("./creds.json");
let port = 3001;

let http = require('http');
let crypto = require('crypto');
let fs = require('fs');
z
const exec = require('child_process').exec;

http.createServer((req, res) => {
        console.log("req received");
        let body = "";  

        req.on('data', (chunk) => {
                body += chunk;
        });

        req.on('end', () => {
                let sig = "sha1=" + crypto.createHmac('sha1', creds.secret).update(body).digest('hex');

                let jsonData = JSON.parse(body);
                let ref = jsonData.ref.split("/");
                let repo = jsonData.repository.name;
                if (repo === "website-condor") {
                    if (ref[ref.length - 1] === "dev") {
                        console.log("Badgerloop.com dev");
                        if (req.headers['x-hub-signature'] === sig) {
                                exec(`cd ${devDirectory} && git pull`, (err, stdout, stderr) => {
                                //      if (err) // TODO: report error.
                                });
                        }
                    } else if (ref[ref.length - 1] === "master") {
                            console.log("Badgerloop.com prod")
                            if (req.headers['x-hub-signature'] === sig) {
                                    console.log("executing master pull");
                                    exec(`cd ${prodDirectory} && git pull`, (err, stdout, stderr) => {
                                            if (err) console.log(err);
                                    });
                            }
                    }
                }
                else if (repo === "Personal-Site") {
                        console.log("lukehouge.com");
                        if (req.headers['x-hub-signature'] === sig) {
                                exec(`cd ${lukeDirectory} && git pull`, (err, stdout, stderr) => {
                                //      if (err) // TODO: report error.
                                });
                        }
                }
                else if (repo === "AI-UW-Website") {
                        console.log("ai.cs.wisc.edu");
                        if (req.headers['x-hub-signature'] === sig) {
                                exec(`cd ${aiDirectory} && git pull && npm run build`, (err, stdout, stderr) => {
                                //      if (err) // TODO: report error.
                                });
                        }
                }
                
        });

        res.end();

}).listen(port);