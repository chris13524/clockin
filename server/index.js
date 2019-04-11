const express = require("express");
const sqlite = require("sqlite3");
const crypto = require("crypto");

const app = express();
app.use(express.json());

app.use(require("cors")());

const CLIENT = process.env.CLIENT || "http://localhost:4200";

const db = new sqlite.Database("./server.sqlite");

const mailgun = require("mailgun-js")({apiKey: process.env.MAILGUN_KEY, domain: process.env.MAILGUN_DOMAIN}).messages();

db.exec(`
  CREATE TABLE IF NOT EXISTS users
  (
    id    integer primary key,
    email varchar(255) not null unique
  );
  CREATE TABLE IF NOT EXISTS tokens
  (
    id      integer primary key,
    user_id integer      not null,
    token   varchar(255) not null unique,
    expire  integer
  );
  CREATE TABLE IF NOT EXISTS projects
  (
    id      integer primary key,
    name    varchar(255) not null,
    user_id integer      not null
  );
  CREATE TABLE IF NOT EXISTS time_entries
  (
    id         integer primary key,
    project_id integer not null,
    "from"     integer not null,
    "to"       integer not null
  );
`, function (err) {
	if (err) throw err;
	main();
});

function main() {
	app.use((req, res, next) => {
		const authorizationHeader = req.headers.authorization;
		if (authorizationHeader) {
			const [type, token] = authorizationHeader.split(" ");
			if (type == "Token") {
				db.get("SELECT user_id FROM tokens WHERE token=?", [token], (err, row) => {
					if (err) throw err;
					if (row == null) {
						res.sendStatus(401);
						return;
					}
					req.userId = row.user_id;
					next();
				});
			} else {
				res.sendStatus(401);
			}
		} else {
			next();
		}
	});

	app.post("/init_login/:email", (req, res) => {
		const email = req.params.email;
		db.get("SELECT id FROM users WHERE email=?", [email], (err, row) => {
			if (err) throw err;
			const callback = userId => {
				const token = genToken();
				const expire = now() + 60 * 60 * 24;

				db.run("INSERT INTO tokens VALUES (NULL, ?, ?, ?)", [userId, token, expire], (err) => {
					if (err) throw err;

					const link = CLIENT + "?login=" + token;

					mailgun.send({
						from: "ClockIn <clockin@clockin.work>",
						to: email,
						subject: "Login to ClockIn",
						text: "Click this link to login to ClockIn: " + link,
						html: "Click this link to login to ClockIn: <a href=\"" + link + "\">" + link + "</a>"
					}, err => {
						if (err == null) {
							res.sendStatus(204);
						} else {
							console.error(err);
							res.sendStatus(500);
						}
					});
				});
			};

			if (row == null) {
				db.run("INSERT INTO users VALUES (NULL, ?)", [email], function (err) { // needs to be a `function` to access `this`
					if (err) throw err;
					const userId = this.lastID;
					callback(userId);
				});
			} else {
				callback(row.id);
			}
		});
	});

	app.post("/finalize_login/:token", (req, res) => {
		db.get("SELECT * FROM tokens WHERE token=?", req.params.token, (err, row) => {
			if (err) throw err;
			if (row == null) {
				res.sendStatus(404);
				return;
			}

			const newToken = genToken();
			db.run("UPDATE tokens SET token=?, expire=NULL WHERE id=?", [newToken, row.id], err => {
				if (err) throw err;
				res.json({token: newToken});
			});
		});
	});

	app.get("/me", (req, res) => {
		const userId = req.userId;
		if (userId == null) {
			res.sendStatus(401);
			return;
		}

		db.get("SELECT * FROM users WHERE id=?", [userId], (err, rows) => {
			if (err) throw err;
			res.json(rows);
		});
	});

	app.get("/projects", (req, res) => {
		const userId = req.userId;
		if (userId == null) {
			res.sendStatus(401);
			return;
		}

		db.all("SELECT * FROM projects WHERE user_id=?", [userId], (err, rows) => {
			if (err) throw err;
			res.json(rows);
		});
	});

	app.post("/projects", (req, res) => {
		const userId = req.userId;
		if (userId == null) {
			res.sendStatus(401);
			return;
		}

		const json = req.body;
		const name = json.name;
		if (name == null) {
			res.sendStatus(400);
			return;
		}

		db.run("INSERT INTO projects VALUES (NULL, ?, ?)", [name, userId], function (err) { // needs to be a `function` to access `this`
			if (err) throw err;
			const projectId = this.lastID;
			db.get("SELECT * FROM projects WHERE id=?", [projectId], (err, row) => {
				if (err) throw err;
				res.json(row);
			});
		});
	});

	app.put("/projects/:id", (req, res) => {
		const userId = req.userId;
		if (userId == null) {
			res.sendStatus(401);
			return;
		}

		const json = req.body;
		const name = json.name;
		if (name == null) {
			res.sendStatus(400);
			return;
		}

		db.run("UPDATE projects SET name=? WHERE id=?", [name, req.params.id], err => {
			if (err) throw err;
			res.sendStatus(204);
		});
	});

	app.delete("/projects/:id", (req, res) => {
		const userId = req.userId;
		if (userId == null) {
			res.sendStatus(401);
			return;
		}

		db.run("DELETE FROM projects WHERE id=?", [req.params.id], err => {
			if (err) throw err;
			res.sendStatus(204);
		});
	});

	app.listen(process.env.PORT || 8080);
}

function genToken() {
	return crypto.randomBytes(48).toString("hex");
}

function now() {
	return Math.floor(new Date() / 1000);
}
