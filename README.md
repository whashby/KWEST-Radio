# KWEST Radio

Playing the King's music.

A standalone full-viewport radio player, built with native HTML, CSS, JavaScript and Web Audio. This repository contains the latest implementation developed in the original design chat, including the dark-mode logo fix.

## Run

Open index.html in a modern browser, or serve this directory with any static HTTP server. No build or package installation is required. Keep the logo, favicon and manifest files beside index.html. Internet access is required for the live stream and station metadata.

## Check

With Node.js installed, run:

    npm test

The checks simulate playback/reconnection, prebuffering, remembered themes and artwork synchronization. They do not test a real broadcast or browser appearance.

## Current behavior

- Native play/pause, mute, volume, fullscreen, and remembered autoplay controls.
- Autoplay targets three seconds of buffered audio, with bounded fallback and reconnection.
- Continuous retry after errors, stream endings or stalled playback; Pause cancels retries.
- Centered album cover flow, larger current cover, and four smaller recent-track covers.
- Soft grey radial background, faded audio-reactive artwork and remembered dark mode.
- Transparent original-logo derivative; dark mode lightens RADIO lettering and keeps artwork away from the header.
- Collapsible recent playlist, 200 stored plays, and 300 artwork references.
- Two-second metadata refresh and buffer-aware deferred artwork changes.
- Page never scrolls; only the playlist contents may scroll. Reduced motion is respected.
- Visualizer rendering stops while paused or hidden, reuses its gradient, and caps canvas pixel density at 2x. Closed playlists release their rows and images; artwork preloads are cleaned up when superseded. Pending artwork retains one transition while paused and at most 20 during long stalls, without changing the audio stream.

## Sources and limits

Stream: https://s3.radio.co/s3fee7145d/listen

Metadata: https://public.radio.co/stations/s3fee7145d/status

Radio.co must allow cross-origin access for audio analysis and metadata. Its public feed does not provide a verified future queue, so side covers show history. Artwork synchronization estimates stream transport latency because metadata has no in-stream timestamps. Browsers may require a user gesture before audible autoplay, and OS sleep can interrupt playback. History and preferences use localStorage when available.

Only app source/assets and focused checks are included. Earlier design variants, chat screenshots, temporary scripts, generated bundles and unrelated files were not copied. No API keys or backend are needed. Logo/station/media rights remain with their respective owners; no redistribution license is granted by this repository.
