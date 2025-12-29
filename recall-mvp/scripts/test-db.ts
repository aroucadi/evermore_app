
console.log('Starting DB test...');
try {
    const { jobRepository } = require('../lib/infrastructure/di/container');
    console.log('Container loaded.');
    console.log('Finding pending jobs...');
    jobRepository.findPending('generate_chapter', 1).then((jobs: any[]) => {
        console.log('Jobs found:', jobs.length);
        console.log('DB Connection successful!');
        process.exit(0);
    }).catch((err: any) => {
        console.error('DB Query failed:', err);
        process.exit(1);
    });
} catch (error) {
    console.error('Initialization failed:', error);
    process.exit(1);
}
