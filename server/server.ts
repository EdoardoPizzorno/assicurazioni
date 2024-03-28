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

let message = _fs.readFileSync("./message.html", "utf8");

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
    let email = req["body"]["body"].email;
    let pwd = req["body"]["body"].password;

    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    const collection = client.db(DBNAME).collection("UTENTI");
    let regex = new RegExp(`^${email}$`, "i");
    let rq = collection.findOne({ "email": regex }, { "projection": { "email": 1, "password": 1 } });
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
                        res.send({ "status": "ok" });
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
    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    const collection = client.db(DBNAME).collection("PERIZIE");
    let rq = collection.find().toArray();
    rq.then((data) => res.send(data));
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err.message}`));
    rq.finally(() => client.close());
});

app.get("/api/users", async (req, res, next) => {
    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    const collection = client.db(DBNAME).collection("UTENTI");
    let rq = collection.find().project({ "name": 1, "surname": 1, "email": 1 }).toArray();
    rq.then((data) => res.send(data));
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err.message}`));
    rq.finally(() => client.close());
})

app.post("/api/user", async (req, res, next) => {
    const user = req["body"]["body"].user;
    user["_id"] = new ObjectId();
    user["password"] = generatePassword();

    sendNewPassword(user["email"], user["password"], res);
    user["password"] = _bcrypt.hashSync(user["password"]);

    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    const collection = client.db(DBNAME).collection("UTENTI");
    let rq = collection.insertOne(user)
    rq.then((data) => res.send(data))
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

async function sendNewPassword(username: string, password: string, res: any) {
    message = message.replace("__user", username).replace("__password", password);
    const access_token = await OAuth2Client.getAccessToken().catch((err) => {
        res.status(500).send(`Errore richiesta Access_Token a Google: ${err}`);
    });

    const auth = {
        "type": "OAuth2",
        "user": username,
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
        "to": username,
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
            res.send("Email inviata correttamente!");
        }
    });
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