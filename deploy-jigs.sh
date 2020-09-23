echo ENV: $1
set -e
npx ts-node ./bin/deploy.ts --app=kronoverse --src=jigs --env=$1
