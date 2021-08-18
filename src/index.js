import express from "express"
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
	res.send("Gitpdate OK")
})

app.post("/", (req, res) => {
	console.log(req.body)
	res.send(req.body)
})

app.listen(20009, () => {
	console.log(":) Gitpdate running on port 20009.")
})