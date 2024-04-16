import _https from "https";
import _http from "http";
import _url from "url";
import _fs from "fs";
import _express from "express";
import _dotenv from "dotenv";
import _cors from "cors";
import _fileUpload from "express-fileupload";
import _cloudinary, { UploadApiResponse } from 'cloudinary';
import _axios from "axios";
import _bcrypt from "bcryptjs";
import _jwt from "jsonwebtoken";
import { google } from "googleapis";
import _nodemailer from "nodemailer";
import Replicate from "replicate";

import { MongoClient, ObjectId } from "mongodb";


//#region SERVER SETUP

_dotenv.config({ "path": ".env" });

_cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const DBNAME = process.env.DBNAME;
const CONNECTION_STRING: string = process.env.CONNECTION_STRING;
const app = _express();

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

let error_page;

// HTTPS
/*
const PORT: number = parseInt(process.env.PORT);
const PRIVATE_KEY = _fs.readFileSync("./keys/privateKey.pem", "utf8");
const CERTIFICATE = _fs.readFileSync("./keys/certificate.crt", "utf8");
const ENCRYPTION_KEY = _fs.readFileSync("./keys/encryptionKey.txt", "utf8");
const CREDENTIALS = { "key": PRIVATE_KEY, "cert": CERTIFICATE };
const https_server = _https.createServer(CREDENTIALS, app);

https_server.listen(PORT, () => {
    init();
    console.log(`Server HTTPS in ascolto sulla porta ${PORT}`);
});
*/

// HTTP
const PORT: number = parseInt(process.env.PORT);
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const http_server = _http.createServer(app);

http_server.listen(PORT, () => {
    init();
    console.log(`Server HTTP in ascolto sulla porta ${PORT}`);
});

function init() {
    _fs.readFile("./static/error.html", function (err, data) {
        if (err) {
            error_page = `<h1>Risorsa non trovata</h1>`;
        }
        else {
            error_page = data.toString();
        }
    });
}

//#endregion

//#region MIDDLEWARES

app.use("/", (req: any, res: any, next: any) => {
    console.log(`-----> ${req.method}: ${req.originalUrl}`);
    next();
});

app.use("/", _express.static("./static"));

app.use("/", _express.json({ "limit": "50mb" }));

app.use("/", _express.urlencoded({ "limit": "50mb", "extended": true }));

app.use("/", _fileUpload({ "limits": { "fileSize": (10 * 1024 * 1024) } }));

app.use("/", (req: any, res: any, next: any) => {
    if (Object.keys(req["query"]).length > 0) {
        console.log(`       ${JSON.stringify(req["query"])}`);
    }
    if (Object.keys(req["body"]).length > 0) {
        console.log(`       ${JSON.stringify(req["body"])}`);
    }
    next();
});

const corsOptions = {
    origin: function (origin, callback) {
        return callback(null, true);
    },
    credentials: true
};
app.use("/", _cors(corsOptions));
/*
const whitelist = [
    "http://edoardopizzorno-crudserver.onrender.com",	// porta 80 (default)
    "https://edoardopizzorno-crudserver.onrender.com",	// porta 443 (default)
    "https://localhost:3000",
    "http://localhost:4200" // server angular
];
// Procedura che utilizza la whitelist, accetta solo le richieste presenti nella whitelist
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) // browser direct call
            return callback(null, true);
        if (whitelist.indexOf(origin) === -1) {
            var msg = `The CORS policy for this site does not allow access from the specified Origin.`
            return callback(new Error(msg), false);
        }
        else
            return callback(null, true);
    },
    credentials: true
};
app.use("/", _cors(corsOptions));
*/

//#endregion

//#region AUTHENTICATION

let message = "";

const OAUTH_CREDENTIALS = JSON.parse(process.env.OAUTH_CREDENTIALS as any)
const OAuth2 = google.auth.OAuth2;
const OAuth2Client = new OAuth2(
    OAUTH_CREDENTIALS["client_id"],
    OAUTH_CREDENTIALS["client_secret"]
);
OAuth2Client.setCredentials({
    refresh_token: OAUTH_CREDENTIALS.refresh_token,
});

app.post("/api/login", async (req, res, next) => {
    let user = req["body"]["body"].email;
    let pwd = req["body"]["body"].password;

    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    const collection = client.db(DBNAME).collection("UTENTI");
    let regex = new RegExp(`^${user}$`, "i");
    let rq = collection.findOne(
        { $or: [{ "email": regex }, { "username": regex }] },
        { "projection": { "_id": 1, "email": 1, "password": 1, "avatar": 1 } }
    );
    rq.then((dbUser) => {
        if (!dbUser) {
            res.status(401).send("Username non valido");
        }
        else {
            _bcrypt.compare(pwd, dbUser.password, (err, success) => {
                if (err) {
                    res.status(500).send(`Bcrypt compare error: ${err.message}`);
                }
                else {
                    if (!success) {
                        res.status(401).send("Password non valida");
                    }
                    else {
                        let token = createToken(dbUser);
                        res.setHeader("authorization", token);
                        res.setHeader("access-control-expose-headers", "authorization");
                        res.send({ "user_picture": dbUser.avatar, "_id": dbUser._id });
                    }
                }
            })
        }
    });
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err.message}`));
    rq.finally(() => client.close());
});

app.post("/api/googleLogin", async (req: any, res: any, next: any) => {
    if (!req.headers["authorization"]) {
        res.status(403).send("Token mancante");
    }
    else {
        let token = req.headers["authorization"];
        let payload = _jwt.decode(token);
        let email = payload.email;
        const client = new MongoClient(CONNECTION_STRING);
        await client.connect();
        const collection = client.db(DBNAME).collection("UTENTI");
        let regex = new RegExp(`^${email}$`, "i");
        let rq = collection.findOne({ "email": regex }, { "projection": { "email": 1 } });
        rq.then((dbUser) => {
            if (!dbUser) {
                res.status(403).send("Username non autorizzato all'accesso");
            }
            else {
                let token = createToken(dbUser);
                res.setHeader("authorization", token);
                res.setHeader("access-control-expose-headers", "authorization");
                res.send({ "status": "ok" });
            }
        });
        rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err.message}`));
        rq.finally(() => client.close());
    }
});

app.use("/api/", (req: any, res: any, next: any) => {
    if (!req.headers["authorization"]) {
        res.status(403).send("Token mancante");
    }
    else {
        let token = req.headers["authorization"];
        _jwt.verify(token, ENCRYPTION_KEY, (err, payload) => {
            if (err) {
                res.status(403).send(`Token non valido: ${err}`);
            }
            else {
                let newToken = createToken(payload);
                res.setHeader("authorization", newToken);
                res.setHeader("access-control-expose-headers", "authorization");
                req["payload"] = payload;
                next();
            }
        });
    }
});

function createToken(data) {
    let currentTimeSeconds = Math.floor(new Date().getTime() / 1000);
    let payload = {
        "_id": data._id,
        "username": data.username,
        "iat": data.iat || currentTimeSeconds,
        "exp": currentTimeSeconds + parseInt(process.env.TOKEN_EXPIRE_DURATION)
    }
    let token = _jwt.sign(payload, ENCRYPTION_KEY);
    return token;
}

//#endregion

//#region ROUTES

app.get("/api/perizie", async (req, res, next) => {
    const operator = req.query.operator;
    const date = req.query.date;
    const search = req.query.search;

    let query: any = {};

    if (operator && operator != "all") {
        query = { "operator.username": operator };
    }

    if (date) {
        query["date"] = date;
    }

    if (search) {
        let regex = new RegExp(`^${search}`, "i");
        query["description"] = regex;
    }

    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    const collection = client.db(DBNAME).collection("PERIZIE");
    let rq = collection.find(query).sort({ "_id": 1 }).toArray();
    rq.then((data) => res.send(data));
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err.message}`));
    rq.finally(() => client.close());
});

app.get("/api/operators", async (req, res, next) => {
    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    const collection = client.db(DBNAME).collection("PERIZIE");
    let rq = collection.find().project({ "operator._id": 1, "operator.username": 1, "_id": 0 }).toArray();
    rq.then((data) => {
        let operators = [];
        data.forEach((item) => {
            if (!operators.find((op) => op.username === item.operator.username)) {
                operators.push(item.operator);
            }
        });
        res.send(operators);
    });
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err.message}`));
    rq.finally(() => client.close());
});

app.get("/api/roles", async (req, res, next) => {
    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    const collection = client.db(DBNAME).collection("RUOLI");
    let rq = collection.find().toArray();
    rq.then((data) => res.send(data));
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err.message}`));
    rq.finally(() => client.close());
});

app.get("/api/users", async (req, res, next) => {
    const role = req.query.role;
    const searchText = req.query.search;

    let query: any = {};

    if (role && role != "all")
        query = { "role": role };

    if (searchText) {
        let regex = new RegExp(`^${searchText}`, "i");
        query = { "$or": [{ "name": regex }, { "surname": regex }, { "email": regex }] }
    }

    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    const userCollection = client.db(DBNAME).collection("UTENTI");
    const roleCollection = client.db(DBNAME).collection("RUOLI");

    try {
        let users = await userCollection.find(query).project({ "password": 0 }).sort({ "role": 1, "name": 1 }).toArray();
        for (let i = 0; i < users.length; i++) {
            await manageRole(users[i], roleCollection);
        }
        res.send(users);
    } catch (err) {
        res.status(500).send(`Errore durante la ricerca degli utenti: ${err.message}`);
    } finally {
        client.close();
    }
})

app.get("/api/user/:id", async (req, res, next) => {
    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    const userCollection = client.db(DBNAME).collection("UTENTI");
    const roleCollection = client.db(DBNAME).collection("RUOLI");

    try {
        let data = await userCollection.findOne({ "_id": new ObjectId(req.params.id) }, { "projection": { "password": 0 } });
        if (!data) {
            res.status(404).send("Utente non trovato");
        } else {
            await manageRole(data, roleCollection);
            res.send(data);
        }
    } catch (err) {
        res.status(500).send(`Errore esecuzione query: ${err.message}`);
    } finally {
        client.close();
    }
})

app.post("/api/user", async (req, res, next) => {
    const user = req["body"]["body"].user;
    user["_id"] = new ObjectId();
    user["password"] = generatePassword();

    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    const collection = client.db(DBNAME).collection("UTENTI");

    const existingUser = await collection.findOne({ $or: [{ email: user.email }, { username: user.username }] });
    if (existingUser) {
        res.status(409).send("Email o username già utilizzati");
    } else {
        let payload: any = {
            from: process.env.GMAIL_USER,
            to: user["email"],
            password: user["password"]
        }

        sendPassword(payload, res);
        user["password"] = _bcrypt.hashSync(user["password"]);

        user["avatar"] = "https://www.civictheatre.ie/wp-content/uploads/2016/05/blank-profile-picture-973460_960_720.png"
        //await loadProfilePicture(user);

        let rq = collection.insertOne(user)
        rq.then((data) => res.send(data))
        rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err.message}`));
        rq.finally(() => client.close());
    }

})

app.post("/api/role", async (req, res, next) => {
    const role = req["body"]["body"];
    console.log(role)
    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    const collection = client.db(DBNAME).collection("RUOLI");

    role._id = await collection.countDocuments();
    console.log(role._id)
    findRoleWithSameId(collection, role, res);
})

app.patch("/api/perizia/:id", async (req, res, next) => {
    const perizia = req["body"]["body"].perizia;
    console.log(perizia)
    let _id = perizia._id;
    delete perizia._id;

    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    const collection = client.db(DBNAME).collection("PERIZIE");
    let rq = collection.updateOne({ "_id": _id }, { "$set": perizia });
    rq.then((data) => res.send(data));
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err.message}`));
    rq.finally(() => client.close());
})

app.patch("/api/user/:id", async (req, res, next) => {
    const user = req["body"]["body"].user;
    const _id = new ObjectId(user._id);
    delete user._id;

    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    const collection = client.db(DBNAME).collection("UTENTI");
    let rq = collection.updateOne({ "_id": _id }, { "$set": user });
    rq.then((data) => res.send(data));
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err.message}`));
    rq.finally(() => client.close());
})

app.patch("/api/role/:id", async (req, res, next) => {
    const roleName = req["body"]["body"].name;
    const _id = new ObjectId(req.params.id);
    console.log(_id)
    console.log(roleName)

    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    const collection = client.db(DBNAME).collection("RUOLI");
    let rq = collection.updateOne({ "_id": _id }, { "$set": { "name": roleName } });
    rq.then((data) => res.send(data));
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err.message}`));
    rq.finally(() => client.close());
})

app.delete("/api/user/:id", async (req, res, next) => {
    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    const collection = client.db(DBNAME).collection("UTENTI");
    let rq = collection.deleteOne({ "_id": new ObjectId(req.params.id), "role": { "$ne": "superadmin" } });
    rq.then((data) => {
        if (data.deletedCount === 0) {
            res.status(401).send("Impossibile eliminare l'utente superadmin");
        } else {
            res.send(data);
        }
    });
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err.message}`));
    rq.finally(() => client.close());
})

app.delete("/api/role/:id", async (req, res, next) => {
    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    const collection = client.db(DBNAME).collection("RUOLI");
    let rq = collection.deleteOne({ "_id": new ObjectId(req.params.id) });
    rq.then((data) => res.send(data));
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err.message}`));
    rq.finally(() => client.close());
})

//#endregion

//#region INTERNAL FUNCTIONS

function generatePassword(): string {
    const length: number = 12;
    const printableAsciiChars = Array.from({ length: 95 }, (_, i) => String.fromCharCode(i + 32));
    return Array.from({ length }, () => printableAsciiChars[Math.floor(Math.random() * printableAsciiChars.length)]).join('');
}

async function sendPassword(payload: any, res: any) {
    message = _fs.readFileSync("./message.html", "utf8")
    message = message.replace("__user", payload.to).replace("__password", payload.password);
    const access_token = await OAuth2Client.getAccessToken().catch((err) => {
        res.status(500).send(`Errore richiesta Access_Token a Google: ${err}`);
    });

    const auth = {
        "type": "OAuth2",
        "user": payload.from,
        "clientId": OAUTH_CREDENTIALS.client_id,
        "clientSecret": OAUTH_CREDENTIALS.client_secret,
        "refreshToken": OAUTH_CREDENTIALS.refresh_token,
        "accessToken": access_token
    }
    const transporter = _nodemailer.createTransport({
        "service": "gmail",
        "auth": auth
    });
    let mailOptions = {
        "from": auth.user,
        "to": payload.to,
        "subject": "Nuova password di accesso a Rilievi e Perizie",
        "html": message,
        /*"attachments": [
            {
                "filename": "nuovaPassword.png",
                "path": "./qrCode.png"
            }
        ]*/
    }
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            res.status(500).send(`Errore invio mail:\n${err.message}`);
        }
        else {
            console.log("Email inviata correttamente!");
        }
    });
}

async function loadProfilePicture(user: any) {
    try {
        console.log("Running the model...");
        const input = {
            width: 768,
            height: 768,
            prompt: `a ${user["gender"] == "m" ? "male" : "female"} of ${user["age"]} age (realistic picture)`,
            refine: "expert_ensemble_refiner",
            scheduler: "K_EULER",
            lora_scale: 0.6,
            num_outputs: 1,
            guidance_scale: 7.5,
            apply_watermark: false,
            high_noise_frac: 0.8,
            negative_prompt: "",
            prompt_strength: 0.8,
            num_inference_steps: 25
        };
        const output = await replicate.run(
            "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
            { input }
        );
        user["avatar"] = output[0];
    } catch (err) {
        console.log("--REPLICATE.COM ERROR--");
        console.log(err);
        user["avatar"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Error.svg/1200px-Error.svg.png"
    }
}

async function findRoleWithSameId(collection: any, role: any, res: any) {
    collection.find({ "_id": new ObjectId(role._id) }).toArray().then((data) => {
        console.log(data)
        if (data || data.length == 0) {
            let regex = new RegExp(`^${role.name}$`, "i");
            collection.findOne({ "name": regex }).then((data) => {
                if (data) {
                    res.status(409).send("Ruolo già presente");
                }
                else {
                    let rq = collection.insertOne(role);
                    rq.then((data) => res.send(data));
                    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err.message}`));
                }
            });
        }
        else {
            role._id++;
            findRoleWithSameId(collection, role, res);
        }
    });
}

async function manageRole(user: any, roleCollection: any) {
    let role = await roleCollection.findOne({ "_id": new ObjectId(user.role) });
    user.role = role.name;
}

//#endregion

//#region DEFAULT ROUTES

app.use("/", (req, res, next) => {
    res.status(404);
    if (req.originalUrl.startsWith("/api/")) {
        res.send(`Api non disponibile`);
    }
    else {
        res.send(error_page);
    }
});

app.use("/", (err, req, res, next) => {
    console.log("************* SERVER ERROR ***************\n", err.stack);
    res.status(500).send(err.message);
});

//#endregion