# Contract tests

Unit tests that check each component, store and helper of the port against the original Vue app. Every contract passed on the original first; the markup and data the original rendered were recorded once into `__golden__/`, and the port is compared with them. Full explanation: [docs/testing.md, Part 1](../../docs/testing.md#part-1-contract-tests-vitest).

```
tests/contracts/
├─ specs/          *.contract.test.ts: the tests
├─ next/
│  └─ target.tsx   adapter for the React port (Zustand, @testing-library/react)
├─ harness/
│  ├─ types.ts     ContractTarget and ContractProps: what an adapter provides
│  ├─ serialize.ts turns rendered markup into comparable text
│  ├─ golden.ts    compares with the golden files; never writes them
│  └─ assertions.ts expectMarkup() and expectData()
├─ fixtures.ts     sample products from the original catalog
└─ __golden__/     markup and data recorded from the Vue app (never edit by hand)
```

| Command              | Runs                             |
| -------------------- | -------------------------------- |
| `npm test`           | Contracts + Next-only unit tests |
| `npm run test:watch` | The same, rerun on every change  |

The golden files were recorded by the parity recorder in the Vue app's folder, which runs these same specs through a Vue adapter ([ADR 0017](../../docs/adr/0017-frozen-vue-reference.md), [how](../../docs/testing.md#how-the-reference-data-was-recorded)).

Each test name starts with a behaviour ID from [docs/behaviour-spec.md](../../docs/behaviour-spec.md).
