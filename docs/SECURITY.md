# Vanta Fiber - Security

## Principles

1. Least privilege, secrets on server, signed webhooks, hosted checkout, no card handling.
2. Retention limits, audit logs, verified appeals, human review before severe enforcement.
3. Never ask owners to paste secrets into Discord, public GitHub or chat.

## Threat model

Compromised staff account, malicious attachment, forged webhook, hostile imported configuration,
stolen session, cross-tenant query, dependency compromise, resource exhaustion, malicious markdown,
third-party outage.

## Controls

1. Signed Discord interactions, signature verification, timestamp/replay controls, prompt
   acknowledge/defer, durable intent record.
2. Isolated upload processing with size, extension, content validation, recursion and archive limits.
3. Parameterized queries, structured process arguments, secure headers, sanitized logs.
