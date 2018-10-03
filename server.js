// static_server.js
// =========================================

// Simple node.js server to serve static file content
// Node.js HTTP static file server with ES6+
// REF : https://adrianmejia.com/blog/2016/08/24/building-a-node-js-static-file-server-files-over-http-using-es6/

const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');
var request = require('request');
var querystring = require('querystring');

// you can pass the parameter in the command line. e.g. node static_server.js 3000
const port = process.argv[2] || 3001;

http.createServer(function (req, res) {

    console.log(`${req.method} ${req.url}`);

    // parse URL
    const parsedUrl = url.parse(req.url);

    // extract URL path
    let pathname = `.${parsedUrl.pathname}`;

    // maps file extention to MIME types
    const mimeType = {
        '.ico': 'image/x-icon',
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.wav': 'audio/wav',
        '.mp3': 'audio/mpeg',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.eot': 'appliaction/vnd.ms-fontobject',
        '.ttf': 'aplication/font-sfnt'
    };

    fs.exists(pathname, function (exist) {
        if (!exist) {
            // if the file is not found, return 404
            res.statusCode = 404;
            res.end(`File ${pathname} not found!`);
            return;
        }
        // if is a directory, then look for index.html
        if (fs.statSync(pathname).isDirectory()) {
            pathname += './index.html';
        }
        // read file from file system
        fs.readFile(pathname, function (err, data) {
            if (err) {
                res.statusCode = 500;
                res.end(`Error getting the file: ${err}.`);
            } else {
                // based on the URL path, extract the file extention. e.g. .js, .doc, ...
                const ext = path.parse(pathname).ext;
                // if the file is found, set Content-type and send data
                res.setHeader('Content-type', mimeType[ext] || 'text/plain');
                res.end(data);
            }
        });
    });

    if (req.method === 'POST') {

        let body = [];

        req.
            on('error', (err) => {
                console.error(err);
            }).
            on('data', (chunk) => {
                body.push(chunk);
            }).on('end', () => {
                body = Buffer.concat(body).toString();

                let parsedData = JSON.parse(body);


                let imageNewName = cleanImageName(parsedData.coverImage);

                // Save image to disk from URL
                if (imageNewName) {
                    saveImageToDisk(parsedData.coverImage, `../src/assets/images/${imageNewName}`);
                    // downloadImageToUrl(parsedData.coverImage, `../src/assets/images/${'123_'+imageNewName}`, function () {});
                }

                generateMarkdownFile(parsedData);



                /* let responseBody = {
                    'message': 'success'
                }
                res.write(JSON.stringify(responseBody));
				res.end(); */
            });
    } else {
        // res.statusCode = 404;
        //res.end();
    }

}).listen(parseInt(port));


// Cleanup image name
// ==============================
function cleanImageName(imagename) {
    let imageName = imagename.split('/').pop();
    if (imageName.includes('?')) {
        imageName = imageName.split('?')[0]
    }
    imageName = imageName.replace(/[*!@#$%^&()\[\]_]/, '-');
    return imageName;
}


// Generate Markdown file from HTML and save to disk
// ==============================
function generateMarkdownFile(parsedData) {

    let filePath = '../src/' + parsedData.filePath || '../src/pages/test.html'
    let markdownCode = parsedData.frontmatter + parsedData.markdownCode;
    let dirName = parsedData.category.toLowerCase().trim();

    fs.exists(path.join(__dirname, `../src/pages/${dirName}`), function (exists) {

        if (!exists) {
            fs.mkdirSync(path.join(__dirname, `../src/pages/${dirName}`));
            // Generate .md file
            fs.writeFile(filePath, markdownCode, 'utf8', function (err) {

                if (err) {
                    return console.log(err);
                }
                console.log(`Markdown file generated successfully in ${filePath}`);
            });
        } else {
            // Generate .md file
            fs.writeFile(filePath, markdownCode, 'utf8', function (err) {

                if (err) {
                    return console.log(err);
                }
                console.log(`Markdown file generated successfully in ${filePath}`);
            });
        }
    });
}


// Method 1 : Node.js Function to save image from External URL.
// Note : Getting error in writing file to local disk while behind VPN
// ==============================

function saveImageToDisk(url, localPath) {
    // var fullUrl = url;
    var file = fs.createWriteStream(localPath);

    var client = http;
    if (url.toString().indexOf("https") === 0) {
        client = https;
    }

    var request = client.get(url, function (resp, body, error) {
        if (error) return resp.end('Resp Error :', error.message);
        resp.pipe(file);
    }).on('error', function (e) {
        console.log(e)
    }).end();

    // this is the classic api
    file
        .on('data', function (data) { console.log('Data!', data); })
        .on('error', function (err) { console.error('Error', err); })
        .on('end', function () { console.log('All done!'); });
}


/*
// Method 2 :
// Note : Getting error in writing file to local disk while behind VPN
// ==============================

var Stream = require('stream').Transform;

var downloadImageToUrl = (url, filename, callback) => {

    var client = http;
    if (url.toString().indexOf("https") === 0) {
        client = https;
    }

    client.request(url, function (response) {
        var data = new Stream();

        response.on('data', function (chunk) {
            data.push(chunk);
        });

        response.on('end', function () {
            fs.writeFileSync(filename, data.read());
        });
    }).end();
};
*/

console.log(`Server listening on port http://localhost:${port}`);
