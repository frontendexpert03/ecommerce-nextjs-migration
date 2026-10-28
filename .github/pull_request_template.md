## What and why

<!-- What changes, and why. Link the issue or ADR if there is one. -->

## Checklist

- [ ] Looks and behaves like the original Vue app: contracts, behaviour tests and visual tests pass in CI
- [ ] No golden file (`tests/contracts/__golden__/`) or expected image (`e2e/__screenshots__/`) edited by hand; any re-recorded from the Vue app with the parity recorder
- [ ] New behaviour has a contract or a Next-only test; new structural decisions have an ADR
- [ ] Docs updated if commands or structure changed
