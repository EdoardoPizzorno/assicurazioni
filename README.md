# assicurazioni
Progetto Assicurazioni

Il progetto è un'applicazione web composta da due parti: un lato amministrativo e un lato utente.

Lato Admin:
Questa parte dell'applicazione è riservata agli amministratori o agli utenti con privilegi speciali.
Gli amministratori possono accedere a un'interfaccia amministrativa dedicata per visualizzare le perizie effettuate dagli utenti.
L'interfaccia amministrativa dovrebbe consentire di filtrare e ordinare le perizie, visualizzare i dettagli di ciascuna perizia e, eventualmente, eseguire azioni come l'approvazione, la modifica o la cancellazione delle perizie.
Lato Utente:
Questa parte dell'applicazione è accessibile agli utenti registrati che desiderano inserire nuove perizie.
Gli utenti possono accedere a un'interfaccia utente dedicata per inserire i dettagli delle perizie che desiderano effettuare.
L'interfaccia utente dovrebbe guidare gli utenti attraverso il processo di inserimento delle informazioni richieste per la perizia, come data, ora, descrizione e altri dettagli pertinenti.

Per poter utilizzare l'applicazione, è necessario impostare il file ```.env```: 
```
MAPS_API_KEY = ""
CONNECTION_STRING = ""
TOKEN_EXPIRE_DURATION = 3600
DBNAME = ""
ENCRYPTION_KEY = ""
GMAIL_USER = ""
CLOUDINARY_CLOUD_NAME = ""
CLOUDINARY_API_KEY = ""
CLOUDINARY_API_SECRET = ""
REPLICATE_API_TOKEN = ""
PORT = 3000
OAUTH_CREDENTIALS = {
    "client_id": "",
    "project_id": "",
    "auth_uri": "",
    "token_uri": "",
    "auth_provider_x509_cert_url": "",
    "client_secret": "",
    "scope": "",
    "redirect_uris": [],
    "javascript_origins": [],
    "access_token": "", 
    "scope": "", 
    "token_type": "", 
    "expires_in": , 
    "refresh_token": ""
}`
```
