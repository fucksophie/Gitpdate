import express from "express"
import fs from "fs";
import shell from "shelljs"

let config = {};

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
	res.send("Git(u)pdate is running! Enjoy your repos being synced!")
})

app.post("/", (req, res) => {
	if(req?.body?.repository?.full_name) {
		const location = config.repoToLocation.find(e => e.repo == req.body.repository.full_name);

		if(location) {
			if(fs.existsSync(location.location)) {
				shell.exec(`git pull ${location.location}`, true)				
				console.log("(((: Updating " + location.repo + " at " + new Date().toLocaleTimeString())
			} else {
				console.log("/: Couldn't find " + location.repo + " at " + location.location + ". Attempting to clone it.")
				shell.exec(`git clone https://github.com/${location.repo} ${location.location}`, true)
			}
			
			setTimeout(() => {
				shell.exec(location.command, true)
			}, 2000)
		} else {
			console.log("): Update sent from " + req.body.repository.full_name + " but couldn't find config.") 
		}
	} else {
		console.log("): Receieved weird POST.")
	}

	res.send(req.body)
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