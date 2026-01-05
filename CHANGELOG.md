# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-01-05

### Added
- Complete rewrite in Vanilla JavaScript (ES6+)
- No jQuery dependency required
- ES6 module support
- Rollup build system
- npm package support
- Modern browser support

### Changed
- **BREAKING**: Removed jQuery dependency
- **BREAKING**: Minimum browser requirements changed to ES6+ support
- **BREAKING**: No IE11 support
- API remains largely compatible with v1.x
- File size reduced by 54% (50KB → 23KB minified)
- Improved performance with native DOM APIs

### Removed
- jQuery dependency
- IE11 support
- Bower support (use npm instead)

### Migration Guide

#### Installation
**Before (v1.x):**
```bash
bower install izimodal
# or
npm install izimodal
```

**After (v2.x):**
```bash
npm install izimodal-vanilla
```

#### Usage
**Before (v1.x):**
```javascript
$('#modal').iziModal({
  title: 'Hello'
});
$('#modal').iziModal('open');
```

**After (v2.x):**
```javascript
import iziModal from 'izimodal-vanilla';

const modal = iziModal('#modal', {
  title: 'Hello'
});
modal.open();

// Or jQuery-like syntax still works:
iziModal('#modal', 'open');
```

## [1.6.1] - Previous jQuery version

See [original repository](https://github.com/marcelodolza/iziModal) for v1.x changelog.
