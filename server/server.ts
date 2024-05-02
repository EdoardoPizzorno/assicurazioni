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
const PORT: number = parseInt(process.env.PORT) || 4000;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const http_server = _http.createServer(app);

http_server.listen(PORT, () => {
    init();
    console.log(`Server HTTP in ascolto sulla porta ${PORT}`);
});

function init() {
    _fs.readFile("./error.html", function (err, data) {
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
    let user = req["body"].email;
    let pwd = req["body"].password;

    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    const collection = client.db(DBNAME).collection("UTENTI");
    let regex = new RegExp(`^${user}$`, "i");
    let rq = collection.findOne(
        { $or: [{ "email": regex }, { "username": regex }] },
        { "projection": { "_id": 1, "email": 1, "password": 1, "avatar": 1, "role": 1, "username": 1, "firstLogin": 1 } }
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
                        res.send({ "user_picture": dbUser.avatar, "_id": dbUser._id, "username": dbUser.username, "role": dbUser.role, "firstLogin": dbUser.firstLogin });
                    }
                }
            })
        }
    });
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err.message}`));
    rq.finally(() => client.close());
});

app.post("/api/forgot-password", async (req, res) => {
    const email = req.body.email;

    const client = new MongoClient(CONNECTION_STRING);
    try {
        await client.connect();

        const collection = client.db(DBNAME).collection("UTENTI");
        const user = await collection.findOne({ "email": email });

        if (!user) {
            return res.status(404).send("Email non valida");
        }

        const newPassword = generatePassword();
        const hashedPassword = _bcrypt.hashSync(newPassword);

        let payload = {
            from: process.env.GMAIL_USER,
            to: email,
            password: newPassword
        }
        sendPassword(payload, res);

        const updateResult = await collection.updateOne({ "_id": new ObjectId(user._id) }, { "$set": { "password": hashedPassword, "firstLogin": true } });

        return res.send(updateResult);
    } catch (error) {
        console.error(error);
        return res.status(500).send(`Errore interno del server: ${error.message}`);
    } finally {
        await client.close(); // Assicurati di chiudere la connessione al database dopo l'uso
    }
});

app.post("/api/change-password", async (req, res) => {
    const { userId, oldPassword, newPassword, confirmPassword } = req.body;

    const client = new MongoClient(CONNECTION_STRING);
    try {
        await client.connect();

        const collection = client.db(DBNAME).collection("UTENTI");
        const user = await collection.findOne({ "_id": new ObjectId(userId) });

        if (!user) {
            return res.status(404).send("Utente non trovato");
        }

        const passwordMatch = _bcrypt.compareSync(oldPassword, user.password);

        if (!passwordMatch) {
            return res.status(401).send("Password errata");
        }

        const hashedPassword = _bcrypt.hashSync(newPassword);
        const updateResult = await collection.updateOne({ "_id": new ObjectId(userId) }, { "$set": { "password": hashedPassword, "firstLogin": false } });

        return res.send(updateResult);
    } catch (error) {
        console.error(error);
        return res.status(500).send(`Errore interno del server: ${error.message}`);
    } finally {
        await client.close();
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

//#endregion

//#region ROUTES

//#region GET

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

app.get("/api/role/:id", async (req, res, next) => {
    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    const collection = client.db(DBNAME).collection("RUOLI");
    let rq = collection.findOne({ "_id": new ObjectId(req.params.id) });
    rq.then((data) => res.send(data));
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err.message}`));
    rq.finally(() => client.close());
})

//#endregion

//#region POST

app.post("/api/perizia", async (req, res, next) => {
    const perizia = req["body"].perizia;
    perizia["_id"] = new ObjectId();

    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    const collection = client.db(DBNAME).collection("PERIZIE");
    let rq = collection.insertOne(perizia);
    rq.then((data) => res.send(data));
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err.message}`));
    rq.finally(() => client.close());
})

app.post("/api/user", async (req, res, next) => {
    const user = req["body"].user;
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
        user["firstLogin"] = true;

        let oldRole = user.role._id;
        user.role = "";
        user.role = oldRole;

        user["avatar"] = "https://www.civictheatre.ie/wp-content/uploads/2016/05/blank-profile-picture-973460_960_720.png"
        await loadProfilePicture(user);

        let rq = collection.insertOne(user)
        rq.then((data) => res.send(data))
        rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err.message}`));
        rq.finally(() => client.close());
    }

})

app.post("/api/user/generateImageProfile", async (req, res, next) => {
    const user = req["body"].user;
    await loadProfilePicture(user);

    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    const collection = client.db(DBNAME).collection("UTENTI");
    let rq = collection.updateOne({ "_id": new ObjectId(user._id) }, { "$set": { "avatar": user.avatar } });
    rq.then((data) => res.send(data));
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err.message}`));
    rq.finally(() => client.close());
})

app.post("/api/user/uploadImageProfile", async (req, res, next) => {
    let userId = req["body"].userId;
    let imgBase64 = req["body"].imgBase64;

    _cloudinary.v2.uploader.upload(imgBase64, { "folder": "rilievi_perizie.profile_pictures" })
        .catch((err) => {
            res.status(500).send(`Error while uploading file on Cloudinary: ${err}`);
        })
        .then(async function (response: UploadApiResponse) {
            const client = new MongoClient(CONNECTION_STRING);
            await client.connect();
            let collection = client.db(DBNAME).collection("UTENTI");
            let rq = collection.updateOne({ "_id": new ObjectId(userId) }, { "$set": { "avatar": response.secure_url } });
            rq.then((data) => res.send(data));
            rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err}`));
            rq.finally(() => client.close());
        });
})

app.post("/api/images", async (req, res, next) => {
    let imagesBase64 = req["body"].imagesBase64;
    let secure_urls = [];

    for (let imgBase64 of imagesBase64) {
        if (!imgBase64.url.startsWith("data:image"))
            imgBase64.url = "data:image/jpeg;base64," + imgBase64.url;
        await _cloudinary.v2.uploader.upload(imgBase64.url, { "folder": "rilievi_perizie.photos" })
            .catch((err) => {
                res.status(500).send(`Error while uploading file on Cloudinary: ${err}`);
            })
            .then(function (response: UploadApiResponse) {
                secure_urls.push(response.secure_url);
            });
    }
    res.send(secure_urls);
})

app.post("/api/role", async (req, res, next) => {
    const role = req["body"];
    role["canAccessToWebApp"] = false;

    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    const collection = client.db(DBNAME).collection("RUOLI");
    let rq = collection.insertOne(role);
    rq.then((data) => res.send(data));
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err.message}`));
})

//#endregion

//#region PATCH

app.patch("/api/perizia/:id", async (req, res, next) => {
    const perizia = req["body"].perizia;
    delete perizia._id;

    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    const collection = client.db(DBNAME).collection("PERIZIE");
    let rq = collection.updateOne({ "_id": new ObjectId(req.params.id) }, { "$set": perizia });
    rq.then((data) => res.send(data));
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err.message}`));
    rq.finally(() => client.close());
})

app.patch("/api/user/:id", async (req, res, next) => {
    const user = req["body"].user;
    const _id = new ObjectId(user._id);

    delete user._id;
    const roleId = user.role._id;
    user.role = "";
    user.role = roleId;

    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    const collection = client.db(DBNAME).collection("UTENTI");
    let rq = collection.updateOne({ "_id": _id }, { "$set": user });
    rq.then((data) => res.send(data));
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err.message}`));
    rq.finally(() => client.close());
})

app.patch("/api/role/:id", async (req, res, next) => {
    const role = req["body"].role;
    const _id = new ObjectId(req.params.id);
    console.log(role)
    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    const collection = client.db(DBNAME).collection("RUOLI");
    let rq = collection.updateOne({ "_id": _id }, { "$set": { "name": role.name, "canAccessToWebApp": role.canAccessToWebApp } });
    rq.then((data) => res.send(data));
    rq.catch((err) => res.status(500).send(`Errore esecuzione query: ${err.message}`));
    rq.finally(() => client.close());
})

//#endregion

//#region DELETE

app.delete("/api/perizia/:id", async (req, res, next) => {
    const client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    const collection = client.db(DBNAME).collection("PERIZIE");
    let rq = collection.deleteOne({ "_id": new ObjectId(req.params.id) });
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

//#endregion

//#region INTERNAL FUNCTIONS

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
        console.log("Model executed successfully!")
    } catch (err) {
        console.log("--REPLICATE.COM ERROR--");
        console.log(err);
        user["avatar"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Error.svg/1200px-Error.svg.png"
    }
}

async function manageRole(user: any, roleCollection: any) {
    let role = await roleCollection.findOne({ "_id": new ObjectId(user.role) });
    user.role = {};
    user.role._id = role._id;
    user.role.name = role.name;
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