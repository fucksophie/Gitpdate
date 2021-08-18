import express from "express"
import fs from "fs";
import crypto from "crypto"

import shell from "shelljs"

let config = {};

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
	res.send(`200 OK`)
})

app.post("/", (req, res) => {
	const sig = req.get("X-Hub-Signature-256") || "";
	const hmac = crypto.createHmac('sha256', config.secret);
	const digest = Buffer.from("sha256=" + hmac.update(JSON.stringify(req.body)).digest("hex"), "utf8")
	
	const checksum = Buffer.from(sig, 'utf8')

	if(checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
		return res.send("Failed authenication.").status(401);
	}

	if(req?.body?.repository?.full_name) {
		const location = config.repoToLocation.find(e => e.repo == req.body.repository.full_name);

		if(location) {
			shell.cd(location.location)

			if(fs.existsSync(location.location)) {
				shell.exec(`git pull`, true)				
				console.log("(((: Updating " + location.repo + " at " + new Date().toLocaleTimeString())
			} else {
				console.log("/: Couldn't find " + location.repo + " at " + location.location + ". Attempting to clone it.")
				shell.exec(`git clone https://github.com/${location.repo} .`, true)
			}

			res.send("Yay.").status(200);
			
			setTimeout(() => {
				shell.exec(location.command, true)
			}, 2000)
		} else {
			console.log("): Update sent from " + req.body.repository.full_name + " but couldn't find config.")
			res.send("Error.").status(404); 
		}
	} else {
		console.log("): Receieved weird POST.")
		res.send("Error.").status(500);
	}
})

app.listen(20009, () => {
	if(!fs.existsSync("config.json")) {
		console.log(":/ Couldn't find config.json. Exiting.")
		process.exit(1);
	} else {
		config = JSON.parse(fs.readFileSync("config.json").toString());
	}

	if (!shell.which('git')) {
		console.log("): Couldn't find git.")
		process.exit(1)
	}
	console.log(":) Gitpdate running on port 20009.")
})