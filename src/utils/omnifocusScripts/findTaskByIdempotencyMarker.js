(() => {
  try {
    const args = typeof injectedArgs !== 'undefined' ? injectedArgs : {};
    const marker = args.marker;
    if (typeof marker !== 'string' || !/^omnifocus-mcp:[a-f0-9]{64}$/.test(marker)) {
      return JSON.stringify({ status: 'unknown', reason: 'invalid marker', completeScan: false });
    }

    const expectedLine = `[omnifocus-mcp-idempotency:${marker}]`;
    const matches = flattenedTasks.filter(task => {
      const lines = String(task.note || '').split(/\r?\n/);
      return lines.some(line => line.trim() === expectedLine);
    });

    if (matches.length === 0) {
      return JSON.stringify({ status: 'not_found', completeScan: true });
    }
    if (matches.length > 1) {
      return JSON.stringify({
        status: 'unknown',
        reason: 'multiple exact marker matches',
        matchCount: matches.length,
        completeScan: true,
      });
    }

    const task = matches[0];
    return JSON.stringify({
      status: 'found',
      task: { id: String(task.id.primaryKey), name: String(task.name || '') },
      completeScan: true,
    });
  } catch (error) {
    return JSON.stringify({
      status: 'unknown',
      reason: String(error),
      completeScan: false,
    });
  }
})();
