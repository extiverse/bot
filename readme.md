# installation

Copy .env.example to .env and edit the required fields:

- BOT_TOKEN a discord bot app, see https://discordapp.com/developers/applications.
- FLAGROW_TOKEN a personal access token from flagrow.io, enclose with double quotes!
- BOT_OWNER, your unique discord id.

```bash
# install dependencies
$ npm ci
# start bot
$ npm run start
```

## pm2 deployment

```
git pull origin master

npm install
rm -rf package-lock.json

pm2 restart src/index.js --update-env
```
