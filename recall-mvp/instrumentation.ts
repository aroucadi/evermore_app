/**
 * Decode base64 Google Cloud credentials and write to temp file.
 * This enables Vertex AI auth in Docker/Vercel where we can't mount files.
 */
async function setupGoogleCredentials() {
    const base64Creds = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;

    // Only run if we have base64 creds and no standard creds path set
    if (base64Creds && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        try {
            // Dynamically import fs/path/os to avoid Edge Runtime crashes
            const fs = await import('fs');
            const path = await import('path');
            const os = await import('os');

            const credentialsJson = Buffer.from(base64Creds, 'base64').toString('utf-8');

            // Validate it's valid JSON
            JSON.parse(credentialsJson);

            // Write to temp file (cross-platform)
            const tempPath = path.join(os.tmpdir(), 'gcp-credentials.json');
            fs.writeFileSync(tempPath, credentialsJson, { mode: 0o600 });

            // Set the standard env var that Google SDKs look for
            process.env.GOOGLE_APPLICATION_CREDENTIALS = tempPath;

            console.log('[Instrumentation] Google Cloud credentials loaded to:', tempPath);
        } catch (e) {
            console.error('[Instrumentation] Failed to decode GOOGLE_APPLICATION_CREDENTIALS_BASE64:', e);
        }
    }
}

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        // Setup Google Cloud credentials before anything else
        await setupGoogleCredentials();

        // Only import and start worker in Node.js runtime (not Edge)
        const { backgroundWorker } = await import('./lib/worker');

        // Prevent starting multiple workers in dev mode (hot reload)
        if (!(global as unknown as { __workerStarted: boolean }).__workerStarted) {
            backgroundWorker.start();
            (global as unknown as { __workerStarted: boolean }).__workerStarted = true;
        }
    }
}
