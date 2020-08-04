echo ENV: $1
set -e
npx ts-node ./bin/deploy --app=kronoverse --src=jigs --env=$1
