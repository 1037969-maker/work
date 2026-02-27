import Server from 'bare-server-node';
import http from 'http';
import nodeStatic from 'node-static';

// 1. Initialize Bare and Static servers
const bare = new Server('/bare/', '');
// Removed the trailing slash from 'static'
const serve = new nodeStatic.Server('./static'); 

const server = http.createServer();

server.on('request', (request, response) => {
    // 2. Handle Bare requests
    if (bare.route_request(request, response)) return;

    // 3. Handle Static files with a small log for debugging
    request.addListener('end', () => {
        serve.serve(request, response, (e) => {
            if (e && (e.status === 404)) { 
                // This will show up in your Railway logs if a file is missing
                console.log(`404 Not Found: ${request.url}`);
                serve.serveFile('/404.html', 404, {}, request, response);
            }
        });
    }).resume();
});

server.on('upgrade', (req, socket, head) => {
    if (bare.route_upgrade(req, socket, head)) return;
    socket.end();
});

// 4. Bind to 0.0.0.0 for Railway
const port = process.env.PORT || 8080;
server.listen(port, '0.0.0.0', () => {
  console.log(`Server is live at http://0.0.0.0:${port}`);
});
