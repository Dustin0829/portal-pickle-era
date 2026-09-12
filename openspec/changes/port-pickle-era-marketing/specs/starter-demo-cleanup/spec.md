## Purpose

Follow-up after the marketing port: remove leftover starter demo scaffolding so `app` only carries Pickle Era product UI and shared shell infrastructure. **Not implemented by the `port-pickle-era-marketing` apply** — a later change fulfills these requirements.

## ADDED Requirements

### Requirement: Remove unused examples API feature

After the marketing home replaces the starter demo, the product `app` MUST remove the unused `src/api/features/examples/` module and any tests, hooks, or pages that only existed to demonstrate that module (for example `ExamplesSection`, counter demo, `DemoErrorTrigger`), unless a product feature still imports them.

#### Scenario: Examples feature gone
- **WHEN** the cleanup follow-up lands
- **THEN** `src/api/features/examples/` is removed and no production route renders the starter ExamplesSection

#### Scenario: Related tests removed or retargeted
- **WHEN** examples demo modules are deleted
- **THEN** Vitest files that only covered those demos are removed or rewritten so `pnpm verify` stays green

### Requirement: Remove orphaned boneyard bones

Boneyard bone JSON and registry entries that only captured the starter examples list (or other removed demo surfaces) MUST be removed or replaced so the bones registry does not reference deleted fixtures.

#### Scenario: No dead examples-list bones
- **WHEN** the cleanup follow-up lands
- **THEN** `src/bones/` does not retain examples-list (or equivalent demo-only) bones that no longer mount on any route
