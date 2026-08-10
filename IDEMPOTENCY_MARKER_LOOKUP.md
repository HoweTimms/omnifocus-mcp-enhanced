# Idempotency marker lookup foundation

This branch adds an internal, read-only exact-marker lookup for future safe
task-creation reconciliation. It is not registered as an MCP tool and was not
executed against OmniFocus during development.

The proposed reserved task-note line is:

```text
[omnifocus-mcp-idempotency:omnifocus-mcp:<sha256>]
```

`findTaskByIdempotencyMarker.js` scans all `flattenedTasks` and compares a
complete trimmed note line. Its result contract is deliberately fail-closed:

- one exact match: `found` with task ID and name;
- zero matches after a complete scan: `not_found`;
- multiple matches, invalid input, automation failure, malformed response, or
  incomplete scan: `unknown`.

Only authoritative `not_found` may permit a coordinator to retry an interrupted
creation. `unknown` must pause for reconciliation.

The TypeScript primitive accepts an injectable executor so unit tests cover the
contract without accessing OmniFocus. Eight new tests verify exact-line script
shape, absence of mutation statements, classification, validation, error
handling, and fake execution. The full build passes 66 tests.

Before production use:

1. Review the note-marker choice and exact scan contract.
2. Decide ledger storage, permissions, retention, backup, and inspection.
3. With explicit approval, perform one controlled marked-task experiment and
   verify create, exact lookup, note preservation, and cleanup.
4. Do not register a write tool or set `ALLOW_WRITES=true` until that experiment
   and its rollback are accepted.

## Controlled experiment — 2026-08-10

The owner explicitly approved one real local experiment. With all hub/Hermes
writes still disabled:

1. Created one uniquely named temporary inbox task with the reserved marker in
   its note.
2. Exact-marker lookup returned `found` and the same task ID returned by
   creation.
3. ID-based readback confirmed the task name and complete marker line were
   preserved.
4. Deleted that exact task by ID.
5. A final complete marker scan returned authoritative `not_found`.

Result: create, lookup, identity matching, note preservation, cleanup, and
post-cleanup absence all passed. Two approved writes occurred (one creation and
its deletion); no fixture remains. No hub setting, Hermes configuration,
service, or public network was changed.

The experiment validates note-marker storage and exact lookup, but does not
enable production writes. `ALLOW_WRITES=false` remains required.
