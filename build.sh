
cp node_modules/@kronoverse/run/dist/run.browser.min.js client/public
cd client
npm run build
cd ..
tsc -p .
