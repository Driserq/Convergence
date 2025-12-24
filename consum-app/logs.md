[GeminiRetryWorker] Failed to fetch retry jobs: Error: TypeError: fetch failed
    at fetchDueRetryJobs (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/lib/database.ts:224:11)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Timeout._onTimeout (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/plugins/geminiRetryWorker.ts:20:20)
[GeminiRetryWorker] Failed to fetch retry jobs: Error: TypeError: fetch failed
    at fetchDueRetryJobs (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/lib/database.ts:224:11)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Timeout._onTimeout (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/plugins/geminiRetryWorker.ts:20:20)
[GeminiRetryWorker] Failed to fetch retry jobs: Error: TypeError: fetch failed
    at fetchDueRetryJobs (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/lib/database.ts:224:11)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Timeout._onTimeout (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/plugins/geminiRetryWorker.ts:20:20)
[GeminiRetryWorker] Failed to fetch retry jobs: Error: TypeError: fetch failed
    at fetchDueRetryJobs (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/lib/database.ts:224:11)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Timeout._onTimeout (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/plugins/geminiRetryWorker.ts:20:20)
[GeminiRetryWorker] Failed to fetch retry jobs: Error: TypeError: fetch failed
    at fetchDueRetryJobs (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/lib/database.ts:224:11)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Timeout._onTimeout (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/plugins/geminiRetryWorker.ts:20:20)
TypeError: fetch failed
    at node:internal/deps/undici/undici:15482:13
    at async _handleRequest (/Users/jakubszewczyk/Documents/Convergence/consum-app/node_modules/@supabase/auth-js/src/lib/fetch.ts:184:14)
    at async _request (/Users/jakubszewczyk/Documents/Convergence/consum-app/node_modules/@supabase/auth-js/src/lib/fetch.ts:157:16)
    at async SupabaseAuthClient._getUser (/Users/jakubszewczyk/Documents/Convergence/consum-app/node_modules/@supabase/auth-js/src/GoTrueClient.ts:1644:16)
    at async SupabaseAuthClient.getUser (/Users/jakubszewczyk/Documents/Convergence/consum-app/node_modules/@supabase/auth-js/src/GoTrueClient.ts:1629:14)
    at async requireUser (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/routes/subscription.ts:29:27)
    at async Object.<anonymous> (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/routes/subscription.ts:41:18) {
  [cause]: SocketError: other side closed
      at TLSSocket.onHttpSocketEnd (node:internal/deps/undici/undici:6965:26)
      at TLSSocket.emit (node:events:519:35)
      at endReadableNT (node:internal/streams/readable:1701:12)
      at process.processTicksAndRejections (node:internal/process/task_queues:90:21) {
    code: 'UND_ERR_SOCKET',
    socket: {
      localAddress: '192.168.1.120',
      localPort: 59417,
      remoteAddress: '104.18.38.10',
      remotePort: 443,
      remoteFamily: 'IPv4',
      timeout: undefined,
      bytesWritten: 1089,
      bytesRead: 0
    }
  }
}
TypeError: fetch failed
    at node:internal/deps/undici/undici:15482:13
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async _handleRequest (/Users/jakubszewczyk/Documents/Convergence/consum-app/node_modules/@supabase/auth-js/src/lib/fetch.ts:184:14)
    at async _request (/Users/jakubszewczyk/Documents/Convergence/consum-app/node_modules/@supabase/auth-js/src/lib/fetch.ts:157:16)
    at async SupabaseAuthClient._getUser (/Users/jakubszewczyk/Documents/Convergence/consum-app/node_modules/@supabase/auth-js/src/GoTrueClient.ts:1644:16)
    at async SupabaseAuthClient.getUser (/Users/jakubszewczyk/Documents/Convergence/consum-app/node_modules/@supabase/auth-js/src/GoTrueClient.ts:1629:14)
    at async requireUser (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/routes/subscription.ts:29:27)
    at async Object.<anonymous> (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/routes/subscription.ts:41:18) {
  [cause]: ConnectTimeoutError: Connect Timeout Error (attempted addresses: 172.64.149.246:443, 104.18.38.10:443, timeout: 10000ms)
      at onConnectTimeout (node:internal/deps/undici/undici:1549:23)
      at Immediate._onImmediate (node:internal/deps/undici/undici:1530:11)
      at process.processImmediate (node:internal/timers:505:21) {
    code: 'UND_ERR_CONNECT_TIMEOUT'
  }
}
TypeError: fetch failed
    at node:internal/deps/undici/undici:15482:13
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async _handleRequest (/Users/jakubszewczyk/Documents/Convergence/consum-app/node_modules/@supabase/auth-js/src/lib/fetch.ts:184:14)
    at async _request (/Users/jakubszewczyk/Documents/Convergence/consum-app/node_modules/@supabase/auth-js/src/lib/fetch.ts:157:16)
    at async SupabaseAuthClient._getUser (/Users/jakubszewczyk/Documents/Convergence/consum-app/node_modules/@supabase/auth-js/src/GoTrueClient.ts:1644:16)
    at async SupabaseAuthClient.getUser (/Users/jakubszewczyk/Documents/Convergence/consum-app/node_modules/@supabase/auth-js/src/GoTrueClient.ts:1629:14)
    at async requireUser (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/routes/tracking.ts:48:27)
    at async Object.<anonymous> (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/routes/tracking.ts:60:18) {
  [cause]: ConnectTimeoutError: Connect Timeout Error (attempted addresses: 172.64.149.246:443, 104.18.38.10:443, timeout: 10000ms)
      at onConnectTimeout (node:internal/deps/undici/undici:1549:23)
      at Immediate._onImmediate (node:internal/deps/undici/undici:1530:11)
      at process.processImmediate (node:internal/timers:505:21) {
    code: 'UND_ERR_CONNECT_TIMEOUT'
  }
}
[GeminiRetryWorker] Failed to fetch retry jobs: Error: TypeError: fetch failed
    at fetchDueRetryJobs (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/lib/database.ts:224:11)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Timeout._onTimeout (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/plugins/geminiRetryWorker.ts:20:20)
[GeminiRetryWorker] Failed to fetch retry jobs: Error: TypeError: fetch failed
    at fetchDueRetryJobs (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/lib/database.ts:224:11)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Timeout._onTimeout (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/plugins/geminiRetryWorker.ts:20:20)
[GeminiRetryWorker] Failed to fetch retry jobs: Error: TypeError: fetch failed
    at fetchDueRetryJobs (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/lib/database.ts:224:11)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Timeout._onTimeout (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/plugins/geminiRetryWorker.ts:20:20)
[GeminiRetryWorker] Failed to fetch retry jobs: Error: TypeError: fetch failed
    at fetchDueRetryJobs (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/lib/database.ts:224:11)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Timeout._onTimeout (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/plugins/geminiRetryWorker.ts:20:20)
[Tracking] Failed to fetch tracking data: Error: TypeError: fetch failed
    at getTrackedBlueprintsForUser (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/lib/database.ts:260:11)
    at async Promise.all (index 0)
    at async Object.<anonymous> (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/routes/tracking.ts:64:48)
[GeminiRetryWorker] Failed to fetch retry jobs: Error: TypeError: fetch failed
    at fetchDueRetryJobs (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/lib/database.ts:224:11)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Timeout._onTimeout (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/plugins/geminiRetryWorker.ts:20:20)
[GeminiRetryWorker] Failed to fetch retry jobs: Error: TypeError: fetch failed
    at fetchDueRetryJobs (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/lib/database.ts:224:11)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Timeout._onTimeout (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/plugins/geminiRetryWorker.ts:20:20)
[GeminiRetryWorker] Failed to fetch retry jobs: Error: TypeError: fetch failed
    at fetchDueRetryJobs (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/lib/database.ts:224:11)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Timeout._onTimeout (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/plugins/geminiRetryWorker.ts:20:20)
[GeminiRetryWorker] Failed to fetch retry jobs: Error: TypeError: fetch failed
    at fetchDueRetryJobs (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/lib/database.ts:224:11)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async Timeout._onTimeout (/Users/jakubszewczyk/Documents/Convergence/consum-app/src/plugins/geminiRetryWorker.ts:20:20)