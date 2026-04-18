# Nixor Character Vault Design

## Overview

Nixor is a local-first character asset vault for SillyTavern users who collect large numbers of character cards and related files but do not want to keep everything inside SillyTavern itself.

The product goal is to separate "collection management" from "chat runtime." Nixor should help the user import, organize, preview, tag, filter, and export character-related assets while preserving original files exactly as imported.

The first release targets a single user on a local machine. It should be stable, private, and optimized for long-term collecting rather than collaboration or cloud sync.

## Product Goals

- Provide a clean local library for storing character-related assets outside SillyTavern
- Support a two-level structure: source posts at the top, extracted assets underneath
- Allow importing community links and local files into the same library
- Automatically parse imported character cards when possible
- Support user-defined author attribution and tag-based organization
- Preserve original PNG character cards without recompression or metadata damage
- Make it easy to later export cards and supporting assets back into SillyTavern workflows

## Non-Goals For V1

- Multi-user collaboration
- Cloud sync
- Direct SillyTavern integration or plugin mode
- Full Discord automation across every possible message format
- Bulk remote crawling of entire communities
- Editing character card internals inside the app

## User Problem

The user collects a large number of character cards from community posts. Keeping all cards inside SillyTavern makes the workspace noisy and hard to manage. The user needs a dedicated archive that can:

- keep source context
- keep attached assets together
- make later search and filtering easy
- preserve original import quality
- support future expansion to more SillyTavern asset types

## Core Design Decision

Nixor uses a two-level content model:

1. Source Post
2. Asset

This model is required because a single community post may contain multiple collectible things: one or more character cards, preview images, JSON files, world books, quick replies, and notes. Treating the post as the top-level container preserves source context, while treating assets as separate children preserves fine-grained organization and export.

## Information Architecture

### 1. Source Post

A source post is the parent entry in the library. It represents the community page, thread, or message source from which assets were collected.

Fields:

- `id`
- `sourceUrl`
- `sourceType`
- `title`
- `body`
- `coverImageAssetId`
- `authorName`
- `tags`
- `notes`
- `importStatus`
- `createdAt`
- `updatedAt`
- `importedAt`

Behavior:

- A source post can exist even if parsing is incomplete
- A source post can be created from a link import or manually
- A source post can contain zero or more child assets
- Tags can exist at the post level for broad organization

### 2. Asset

An asset is a child item attached to a source post. Assets are the real collectible units that the user later filters, previews, and exports.

Supported V1 asset types:

- `character_card_png`
- `character_card_json`
- `worldbook`
- `quick_reply`
- `image`
- `other_file`

Fields:

- `id`
- `sourcePostId`
- `assetType`
- `displayName`
- `authorNameOverride`
- `tags`
- `originalFileName`
- `originalExtension`
- `storagePath`
- `previewPath`
- `mimeType`
- `fileSize`
- `checksum`
- `createdAt`
- `updatedAt`

Character-specific extracted fields:

- `characterName`
- `greeting`
- `descriptionSummary`
- `rawParsedMetadata`
- `parseStatus`
- `parseWarnings`

Behavior:

- Assets can inherit source context from the parent post
- Assets can also have their own tags
- Author can be shared from the post or overridden per asset
- Character cards should display extracted fields prominently in previews

## Classification Model

The library should support multiple ways to browse the same data:

- All posts
- All assets
- By tag
- By author
- By asset type
- Recently imported

The author view is important because the user explicitly wants creator-based organization. Author names should be editable text values in V1 rather than a separate normalized author entity. This keeps the first version simpler while still supporting the desired experience.

## Import Model

V1 import should prioritize stability over aggressive automation. The system should always preserve usable partial results instead of failing hard.

### Import Entry Types

V1 supports:

- community link import
- local file import
- manual entry creation

### Import Outcome Tiers

Every link import should land in one of these states:

1. Full import
2. Partial import
3. Link-only fallback

#### Full import

The app successfully extracts:

- title
- body
- one or more images
- enough structure to create a complete source post

#### Partial import

The app extracts only some of the above. The user can fill in the missing fields manually.

#### Link-only fallback

The app stores the source URL and creates a draft post with manual fields for title, author, tags, and notes. This ensures the user never loses the collection reference even when automation is unreliable.

### Link Import Flow

1. User pastes a community link
2. App attempts to fetch and parse the first post or top content block
3. App creates a source post draft
4. App attaches any discovered images as asset entries
5. User reviews and edits title, author, tags, and notes
6. User optionally adds local files to the same source post

### Local File Import Flow

1. User selects or drags in local files
2. App creates assets under a chosen source post, or offers to create a new source post
3. App stores original files into the managed asset library
4. App parses character card metadata when applicable
5. App shows extracted fields for review and manual correction

## Character Card Parsing

For character card imports, the app should attempt to parse and surface useful user-facing information without editing the original file.

V1 parsing goals:

- detect character card file type
- extract character name
- extract opening message or greeting
- extract any readable structured metadata
- generate a short preview summary

Rules:

- Parsed data is derived metadata, not a rewrite of the source file
- User corrections should be stored separately from the original file
- Original file bytes must remain unchanged

## File Preservation And Export

This is a hard requirement.

### Preservation Rules

- Original imported files must be stored exactly as received
- PNG character cards must never be recompressed, resized, or re-encoded in place
- Preview rendering must use either direct read-only display or separately generated preview/cache files
- Any app-generated thumbnail must never overwrite the original file
- Export must copy the original bytes back out

### Why This Matters

Character card PNG files may contain embedded metadata required by downstream tools such as SillyTavern. A visually identical image is not good enough if re-encoding strips metadata or changes file contents.

### Export Rules

- Exporting a PNG card should output the original imported file
- Exporting other asset types should also default to their original stored versions
- Bulk export should preserve filenames when possible and avoid destructive renaming

## Local Storage Architecture

The app should use a local-first architecture with three distinct storage layers:

1. Metadata database
2. Managed original asset storage
3. Derived preview/cache storage

### Metadata Database

Stores:

- posts
- assets
- tags
- author values
- parse results
- import states
- user edits

Recommended V1 approach:

- SQLite database stored inside the app data directory or project-local data directory during development

### Original Asset Storage

Stores the original imported files exactly as received.

Requirements:

- stable per-asset file path
- no in-place mutation
- safe duplication and export
- checksum support for future deduplication

### Preview/Cache Storage

Stores generated derivatives only:

- thumbnails
- lightweight previews
- temporary parsing outputs

This directory can be regenerated and should be disposable.

## UI Direction

The visual style should be simple, restrained, and low-saturation. It should feel more like a calm personal archive than a gamer dashboard.

Visual references requested by the user:

- iOS-style restraint
- Instagram/Twitter-like cleanliness
- low-key muted palette
- not Discord-themed
- not high saturation

### UI Principles

- calm neutral colors
- generous spacing
- light card surfaces
- quiet hierarchy
- content-first layout
- minimal chrome

## V1 Screens

### 1. Library Home

Purpose:

- main browsing surface
- search and filter entry point
- toggle between posts and assets

Main areas:

- left navigation
- center list/grid
- top search and action bar
- optional right detail panel

### 2. Source Post Detail

Purpose:

- show imported source context
- display title, body, images, author, tags
- show child assets beneath the source post

Main content:

- source metadata header
- source text preview
- image gallery
- child asset list
- add asset action

### 3. Asset Detail

Purpose:

- inspect a single asset
- preview parsed character information
- export the original file
- edit tags and author attribution

Main content:

- large preview area
- extracted metadata
- original file metadata
- export button
- related source post link

### 4. Import Flow

Purpose:

- guide link import and file import
- show partial parsing and manual completion states

Main states:

- paste link
- parsing in progress
- extracted preview
- missing fields form
- attach local files
- save to library

## Toolbar / Expandable Utility Area

The user wants a later expandable toolbar for managing related SillyTavern assets. V1 should reserve a place for this concept, even if not every tool ships immediately.

The utility area should eventually support:

- importing character cards
- viewing attached JSON
- viewing world books
- viewing quick replies
- attaching and exporting files

V1 design decision:

- include the structural slot in the layout and data model
- keep the first release focused on asset listing and preview instead of full editing tools

## Error Handling

The app should degrade gracefully.

Key behaviors:

- if a link cannot be fully parsed, create a draft post anyway
- if a file cannot be parsed, still store it as an asset
- if metadata extraction fails, mark parse status and allow manual fields
- if preview generation fails, preserve the original asset and fall back to file info display

The system must never drop a user-selected file just because one parsing step failed.

## Testing Strategy

V1 should be designed for testability even before implementation begins.

High-priority test areas:

- PNG import preserves exact bytes
- PNG export returns exact original bytes
- post and asset creation relationships
- partial link import fallback behavior
- character card parsing from supported sample files
- tag and author filtering
- preview generation never mutates original assets

## Recommended Technical Direction

For V1, the implementation should be a desktop-style local app built with a web UI and native file access.

Recommended stack direction:

- Electron or Tauri for desktop shell
- React for UI
- SQLite for metadata
- filesystem-managed asset repository for originals and previews

This stack fits the product because it combines:

- local file handling
- controlled export
- familiar UI development
- future room for importer and parser growth

The final shell choice should favor stability of local file workflows over theoretical startup speed.

## V1 Feature Scope

The first implementation should include:

- local app shell
- source post CRUD
- asset CRUD
- link import with graceful fallback
- local file import
- character card parsing for common cases
- author input and author filter
- tags
- asset preview
- original file export

The first implementation should not include:

- sync
- accounts
- sharing
- in-app advanced character editing
- automated crawling of entire servers or forums

## Future Expansion

This design should leave room for:

- deduplication
- richer parser support
- batch import
- batch export
- saved smart filters
- richer author profiles
- direct SillyTavern handoff workflows
- optional online backup

## Open Decisions Resolved For V1

- Platform: local single-user app
- Data model: source post + child assets
- Import philosophy: stability first, manual fallback allowed
- Visual style: restrained, soft, low-saturation, not Discord mimicry
- PNG safety: original bytes preserved and exported unchanged

## Implementation Guidance Summary

When implementation starts, the architecture should strictly separate:

- canonical metadata
- original immutable files
- derived previews

That separation is the most important technical safeguard in the whole product. It directly protects the user's SillyTavern-compatible character cards from accidental corruption while still allowing a polished browsing experience.
