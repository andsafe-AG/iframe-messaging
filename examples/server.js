import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to set permissive headers for iframing
app.use((_req, res, next) => {
  // Allow iframing from any origin
  res.removeHeader('X-Frame-Options');

  // Set permissive Content Security Policy for framing
  res.setHeader('Content-Security-Policy', 'frame-ancestors *');

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  next();
});

// Serve static files from project root
app.use(express.static(projectRoot));

// Serve examples directory
app.use('/examples', express.static(join(__dirname)));

// Serve dist directory
app.use('/dist', express.static(join(projectRoot, 'dist')));

// Root route - show available examples
app.get('/', (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>IFrame Resizing Examples</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.6;
        }
        h1 { color: #333; }
        .examples {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }
        .card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          background: #f9f9f9;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .card h2 { margin-top: 0; color: #007bff; }
        .card a {
          display: inline-block;
          margin-top: 10px;
          padding: 10px 20px;
          background: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          transition: background 0.2s;
        }
        .card a:hover { background: #0056b3; }
        .info {
          background: #e7f3ff;
          border-left: 4px solid #007bff;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        code {
          background: #f4f4f4;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
        }
      </style>
    </head>
    <body>
      <h1>IFrame Resizing Examples</h1>

      <div class="info">
        <strong>Server Status:</strong> Running with permissive frame options<br>
        <strong>Port:</strong> ${PORT}<br>
        <strong>Features:</strong>
        <ul>
          <li><code>X-Frame-Options</code>: Removed (allows all origins)</li>
          <li><code>Content-Security-Policy</code>: <code>frame-ancestors *</code></li>
          <li><code>Access-Control-Allow-Origin</code>: <code>*</code></li>
        </ul>
        All pages served by this server can be embedded in iframes from any origin.
      </div>

      <div class="examples">
        <div class="card">
          <h2>Vanilla JS Example</h2>
          <p>Basic implementation using vanilla JavaScript. Shows dynamic content addition/removal with automatic iframe resizing.</p>
          <a href="/examples/vanilla-js.html" target="_blank">View Example</a>
        </div>

        <div class="card">
          <h2>Parent-Child Demo</h2>
          <p>Complete demonstration showing a parent page embedding the child iframe and receiving resize messages.</p>
          <a href="/examples/parent-child-demo.html" target="_blank">View Demo</a>
        </div>

        <div class="card">
          <h2>Test in IFrame</h2>
          <p>Test the vanilla-js example embedded in an iframe to see the resizing in action.</p>
          <a href="/examples/test-iframe.html" target="_blank">View Test</a>
        </div>

        <div class="card">
          <h2>DataLayer Push Demo</h2>
          <p>Demonstrates pushing analytics events from an embedded iframe to the parent window's <code>dataLayer</code> using <code>pushToDataLayer</code>.</p>
          <a href="/examples/datalayer-parent.html" target="_blank">View Demo</a>
        </div>
      </div>

      <script>
        // Listen for resize messages
        window.addEventListener('message', (event) => {
          if (event.data.name === 'resize' && event.data.sender === 'child') {
            const iframe = document.getElementById('testFrame');
            const [height] = event.data.payload[0];
            iframe.style.height = height + 'px';
            console.log('Received resize message:', height);

            // Send acknowledgment
            iframe.contentWindow.postMessage({
              id: event.data.id,
              sender: 'parent',
              receiver: 'child',
              correspondingCommandId: event.data.id
            }, '*');
          }
        });
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║   IFrame Resizing Example Server                      ║
╚════════════════════════════════════════════════════════╝

Server running at: http://localhost:${PORT}

Examples available:
  • Vanilla JS:      http://localhost:${PORT}/examples/vanilla-js.html
  • Parent-Child:    http://localhost:${PORT}/examples/parent-child-demo.html
  • DataLayer Push:  http://localhost:${PORT}/examples/datalayer-parent.html
  • All Examples:    http://localhost:${PORT}

Server Features:
  ✓ Permissive X-Frame-Options (removed)
  ✓ CSP: frame-ancestors *
  ✓ CORS enabled for all origins
  ✓ Can be embedded in iframes from any domain

Press Ctrl+C to stop the server
  `);
});
