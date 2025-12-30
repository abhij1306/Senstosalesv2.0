#!/usr/bin/env node
/**
 * Next.js DevTools MCP Server
 * Provides live application state diagnostics
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const NEXT_APP_URL = process.env.NEXT_APP_URL || 'http://localhost:3000';
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

class NextDevToolsServer {
    constructor() {
        this.routes = [];
        this.components = [];
        this.buildErrors = [];
    }

    async scanRoutes() {
        const appDir = path.join(FRONTEND_DIR, 'app');
        const routes = [];

        const scanDir = (dir, basePath = '') => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });

            for (const entry of entries) {
                if (entry.isDirectory() && !entry.name.startsWith('_') && !entry.name.startsWith('.')) {
                    const routePath = basePath + '/' + entry.name;
                    scanDir(path.join(dir, entry.name), routePath);
                } else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
                    routes.push({
                        path: basePath || '/',
                        file: path.relative(FRONTEND_DIR, path.join(dir, entry.name)),
                        type: 'page'
                    });
                } else if (entry.name === 'layout.tsx' || entry.name === 'layout.ts') {
                    routes.push({
                        path: basePath || '/',
                        file: path.relative(FRONTEND_DIR, path.join(dir, entry.name)),
                        type: 'layout'
                    });
                }
            }
        };

        scanDir(appDir);
        this.routes = routes;
        return routes;
    }

    async scanComponents() {
        const componentsDir = path.join(FRONTEND_DIR, 'components', 'design-system');
        const components = [];

        const scanCategory = (category) => {
            const categoryDir = path.join(componentsDir, category);
            if (!fs.existsSync(categoryDir)) return;

            const files = fs.readdirSync(categoryDir);
            for (const file of files) {
                if (file.endsWith('.tsx') && !file.startsWith('_')) {
                    const filePath = path.join(categoryDir, file);
                    const content = fs.readFileSync(filePath, 'utf-8');

                    // Extract component name
                    const exportMatch = content.match(/export\s+(?:const|function)\s+(\w+)/);
                    const componentName = exportMatch ? exportMatch[1] : file.replace('.tsx', '');

                    components.push({
                        name: componentName,
                        category,
                        file: path.relative(FRONTEND_DIR, filePath)
                    });
                }
            }
        };

        ['atoms', 'molecules', 'organisms', 'templates'].forEach(scanCategory);
        this.components = components;
        return components;
    }

    async getApplicationState() {
        await this.scanRoutes();
        await this.scanComponents();

        return {
            timestamp: new Date().toISOString(),
            appUrl: NEXT_APP_URL,
            routes: this.routes,
            components: this.components,
            stats: {
                totalRoutes: this.routes.length,
                totalComponents: this.components.length,
                componentsByCategory: {
                    atoms: this.components.filter(c => c.category === 'atoms').length,
                    molecules: this.components.filter(c => c.category === 'molecules').length,
                    organisms: this.components.filter(c => c.category === 'organisms').length,
                    templates: this.components.filter(c => c.category === 'templates').length
                }
            }
        };
    }
}

// MCP Server Implementation
const server = new NextDevToolsServer();

process.stdin.on('data', async (data) => {
    try {
        const request = JSON.parse(data.toString());

        let response;
        switch (request.method) {
            case 'getState':
                response = await server.getApplicationState();
                break;
            case 'getRoutes':
                response = await server.scanRoutes();
                break;
            case 'getComponents':
                response = await server.scanComponents();
                break;
            default:
                response = { error: 'Unknown method' };
        }

        process.stdout.write(JSON.stringify(response) + '\n');
    } catch (error) {
        process.stdout.write(JSON.stringify({ error: error.message }) + '\n');
    }
});

console.error('Next.js DevTools MCP Server started');
