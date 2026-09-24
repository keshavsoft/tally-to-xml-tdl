# CHANGELOG

All notable changes to `tally-xml-tdl` are documented in this file.

---

## [1.6.1] - 2026-09-17

### Added
- **v6 Engine**: New template-based XML generation architecture using `body.xml` and `body.json`.
- **`clean()` Method**: Strips XML metadata, attributes (`@_RESERVEDNAME`), flattens nested `#text` objects, and returns sanitized arrays/objects.
- **`get()` Method**: Provides full fidelity XML-to-JSON parsing when raw envelope structures are needed.
- **Pre-configured Queries**:
  - `uom` (Units of Measure)
  - `stockItems` (Stock Item names and aliases)
  - `stockItemsWithBaseUnits` (Stock Items with base units)
  - `ledgerNames` (Ledger names)
- **Subpath Export**: Direct access via `tally-xml-tdl/v6` in addition to root export.
- **TypeScript Support**: Full `.d.ts` type declarations for `get`, `clean`, and `V6Options`.

### Changed
- Streamlined package distribution to package only `v6` core files, reducing unpacked package size to ~11 kB.
- Simplified dependencies to rely on `fast-xml-parser`.

---

## [1.4.1] - 2026-05-05

### Added
- Voucher imports and XML body generation.
- Support for Day Book and GST collection exports.

---

## [1.0.0] - 2026-04-18

### Added
- Initial release of `tally-xml-tdl` with base XML collection requests and HTTP transport.