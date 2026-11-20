# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [0.2.0] - 2026-11-20

### Added

- `ActionMap` — bind many physical controls to named logical actions (`:pressed` / `:released` / `:held`), with aggregate hold state, blur clear, optional `preventDefault`, and `autoTick`
- `quantizeStick(x, y, { sectors, deadzone, forward })` — pure stick → sector helper
- `focusGate({ extra })` — `enabled` predicate that skips editable focus (+ optional chrome gate)

### Changed

- README quickstart centers on ActionMap + utils alongside raw Controller events

## [0.1.0] - 2026-11-20

### Added

- Public `@makefully/engagefully` package metadata, MIT license, and Keep-a-Changelog
- GitHub Actions `release.yml`: version-bump on `main` → npm OIDC publish + GitHub release
- README quickstart for Controller + Keyboard/Gamepad

### Changed

- Package name from `engagefully` to `@makefully/engagefully`
