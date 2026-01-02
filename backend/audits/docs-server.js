#!/usr/bin/env node
/**
 * Documentation MCP Server
 * Serves project documentation and API specs
 */

const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '..', 'docs');

class DocsServer {
    getDocsList() {
        const docs = [];
        const scanDir = (dir, basePath = '') => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });

            for (const entry of entries) {
                if (entry.isDirectory() && !entry.name.startsWith('.')) {
                    scanDir(path.join(dir, entry.name), basePath + '/' + entry.name);
                } else if (entry.name.endsWith('.md')) {
                    const filePath = path.join(dir, entry.name);
                    const content = fs.readFileSync(filePath, 'utf-8');

                    // Extract title from first heading
                    const titleMatch = content.match(/^#\s+(.+)$/m);
                    const title = titleMatch ? titleMatch[1] : entry.name.replace('.md', '');

                    docs.push({
                        title,
                        file: (basePath + '/' + entry.name).replace(/^\//, ''),
                        path: filePath,
                        size: fs.statSync(filePath).size
                    });
                }
            }
        };

        scanDir(DOCS_DIR);
        return docs;
    }

    getDoc(filename) {
        const filePath = path.join(DOCS_DIR, filename);
        if (!fs.existsSync(filePath)) {
            return { error: 'Document not found' };
        }

        return {
            filename,
            content: fs.readFileSync(filePath, 'utf-8'),
            lastModified: fs.statSync(filePath).mtime
        };
    }

    getApiSpec() {
        const apiSpecPath = path.join(DOCS_DIR, 'api', 'openapi.json');
        if (!fs.existsSync(apiSpecPath)) {
            return { error: 'API spec not found' };
        }

        return JSON.parse(fs.readFileSync(apiSpecPath, 'utf-8'));
    }
}

// MCP Server Implementation
const server = new DocsServer();

process.stdin.on('data', (data) => {
    try {
        const request = JSON.parse(data.toString());

        let response;
        switch (request.method) {
            case 'listDocs':
                response = server.getDocsList();
                break;
            case 'getDoc':
                response = server.getDoc(request.params.filename);
                break;
            case 'getApiSpec':
                response = server.getApiSpec();
                break;
            default:
                response = { error: 'Unknown method' };
        }

        process.stdout.write(JSON.stringify(response) + '\n');
    } catch (error) {
        process.stdout.write(JSON.stringify({ error: error.message }) + '\n');
    }
});

console.error('Documentation MCP Server started');
