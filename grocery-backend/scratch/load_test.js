const API_URL = "http://localhost:8000/api/products/get.php";
const CONCURRENT_USERS = 100;

async function runTest() {
    console.log(`🚀 Starting Concurrency Test...`);
    console.log(`📍 Endpoint: ${API_URL}`);
    console.log(`👥 Simulating ${CONCURRENT_USERS} concurrent users...\n`);

    const start = Date.now();
    
    const requests = Array(CONCURRENT_USERS).fill(0).map(async (_, i) => {
        const reqStart = Date.now();
        try {
            const res = await fetch(API_URL);
            const reqEnd = Date.now();
            return { 
                id: i, 
                success: res.ok, 
                status: res.status, 
                time: reqEnd - reqStart 
            };
        } catch (err) {
            return { 
                id: i, 
                success: false, 
                status: 'TIMEOUT/ERROR', 
                time: Date.now() - reqStart 
            };
        }
    });

    const results = await Promise.all(requests);
    const end = Date.now();
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const totalTime = results.reduce((sum, r) => sum + r.time, 0);
    const avgTime = (totalTime / CONCURRENT_USERS).toFixed(2);
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`✅ Successful Requests : ${successful}`);
    console.log(`❌ Failed Requests     : ${failed}`);
    console.log(`⏱️  Total Duration      : ${end - start}ms`);
    console.log(`📊 Avg Response Time   : ${avgTime}ms`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    if (failed > 0) {
        console.log("\n⚠️ WARNING: Your current server is dropping requests under load!");
    } else {
        console.log("\n✨ System handled the load, but check the 'Avg Response Time' for bottlenecking.");
    }
}

runTest();
