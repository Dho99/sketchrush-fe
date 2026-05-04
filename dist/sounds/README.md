SketchRush local audio assets.

The frontend audio manager loads these files from `/sounds/*` after the first user interaction.
`background.mp3` is controlled through a single hidden `<audio id="sketchrush-background-music">` element so the music can loop without duplicate instances.

- `click.mp3`
- `correct.mp3`
- `wrong.mp3`
- `round-start.mp3`
- `game-end.mp3`
- `player-join.mp3`
- `background.mp3`

Keep the files small and game-friendly. Background music should already be normalized to a lower volume.
