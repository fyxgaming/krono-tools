echo ENV: $1
set -e
# npx ts-node ./bin/deploy.ts --app=kronoverse --src=jigs --env=$1 --catalog=$1-catalog.js
node ./deploy/deploy.js --app=fyx --src=jigs --env=$1 --catalog=$1-catalog.js
