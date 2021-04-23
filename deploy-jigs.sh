echo ENV: $1
set -e
node ./deploy/deploy.js --app=fyx --src=jigs --env=$1 --catalog=$1-catalog.js
