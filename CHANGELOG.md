# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2024-08-07

### Changed

- Major refactor with multiple fixes and improvements
  - Image export reflects config
  - Light/dark theme that matches Grafana
  - Updated theme colors
  - Better error display
  - Clearer message when there's no data in source
  - Updated margins (default to 0 for all)
- More memoziation to reduce rerendering
- Fixed workflow and updated Node version
- Updated with grafana/create-plugin
- Updated license
- Added a changelog

### Fixed

- Bug fix for height/width resize
- Fixed potential crashes with script validation

## [1.6.7] - 2024-04-08

### Fixed

- Small fix for 1.6.7

## [1.6.6] - 2024-03-27

### Changed

- Moved image render function out of panel
- Improved error handling
- Updated to create-plugin

## [1.6.5] - 2024-01-08

### Changed

- Updated README.md
- Fixed resizable issue

## [1.6.4] - 2023-11-16

### Fixed

- Fixed timezone matcher

## [1.6.3] - 2023-11-16

### Added

- Added ability to select column for time correction

## [1.6.2] - 2023-10-26

### Improved

- Enhanced matchTimezone logic

## [1.6.1] - 2023-10-06

### Added

- Added image export format selector

### Changed

- Now passing the entire variable object

## [1.6.0] - 2023-09-25

### Fixed

- Fixed "browser" timezone issue

### Changed

- Removed forced defaults
- Added matchTimezone function
