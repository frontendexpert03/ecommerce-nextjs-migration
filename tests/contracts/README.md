# Contract tests

Unit tests written **once** and run **twice** by Vitest: against the original Vue components (read-only from `../E-Commerce-Store`) and against their Next.js ports. A contract must pass on the original first. Full explanation: [docs/testing.md, Part 1](../../docs/testing.md#part-1-contract-tests-vitest).

```
tests/contracts/
├─ specs/          *.contract.test.ts: the tests (run in both Vitest projects)
├─ vue/
│  ├─ target.ts    adapter for the Vue originals (Pinia, vue-router, @testing-library/vue)
│  ├─ setup.ts     Vitest setup for the vue project
│  └─ vue-app.d.ts type declaration for @vue-app/* imports
├─ next/
│  └─ target.tsx   adapter for the React port (Zustand, @testing-library/react)
├─ harness/
│  ├─ types.ts     ContractTarget and ContractProps: what both adapters provide
│  ├─ serialize.ts turns rendered markup into comparable text
│  ├─ golden.ts    Vue records golden files; Next only compares
│  └─ assertions.ts expectMarkup() and expectData()
├─ fixtures.ts     sample products from the original catalog
└─ __golden__/     markup and data recorded from the Vue app (never edit by hand)
```

| Command               | Runs                                                |
| --------------------- | --------------------------------------------------- |
| `npm test`            | Both projects                                       |
| `npm run test:vue`    | Contracts on Vue only; records missing golden files |
| `npm run test:next`   | Contracts on Next + Next-only unit tests            |
| `npm run test:golden` | Re-records every golden file from Vue               |

Each test name starts with a behaviour ID from [docs/behaviour-spec.md](../../docs/behaviour-spec.md).
