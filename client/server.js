const express = require('express');
const httpProxy = require('express-http-proxy');


const app = new express();

app.use('/wallet', httpProxy('http://localhost:5000'));
app.use(httpProxy('https://adhoc.aws.kronoverse.io'));

app.listen(8000, (err) => {
    if (err) {
        console.error('Express Error', err);
        process.exit(0);
    }
    console.log(`App listening on port ${8000}`);
}); 