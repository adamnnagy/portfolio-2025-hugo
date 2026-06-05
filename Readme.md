To use shortcodes in markdown, add: 

{{% shortcode %}}
{{% /shortcode  %}}

Shortcodes can be defined in /layouts/shortcodes/ 
Just use HTML and GO templating

now shortcode {{% raw %}} {{% /raw %}} is defined, so that any type of html can be added to markdown


To Do: 
[x] Audio Folder - reset audio.currentTime when skipped
[] shorten iGEM project page
[x] Labocine final check
[x] WWF
[] Content: Panteezis page - workflow pictures
[x] Project: Labocine: Add images and videos
[x] Content: Labocine pictures
[x] Content: iGEM cover video - remove girl with blur
[x] remaster / remix panteezis
[] Project: Free shipping - change hero video and image
[x] Project: Dobodel Live: Add hero image and video
[x] Project: iGEM: Formatting
[x] Project: iGEM: Shorten
[x] add (hover) animations to titles / headers if possible 
[x] style: full width for youtube videos and other blocks / make classes so they can be dynamic
[] Content: 
[x] Design: project pages main text too white / too much contrast
[x] Design: project pages main text too small (weird?)
[] Design: links currently are the same in markdown as the text
[] Design: Project page hero - role is now left-aligned and looks weird
[] Design: responsiveness 
[x] Design: Titles - remove uppercase
[x] Design: iGEM TOC looks like shit
[x] Design: lists appear weirdly
[] Design: 
[x] Layout: add back to the top button to all pages
[] Layout: Segment projects?
[] Music Making / bands project page ? -> mixing
[x] FIX: video.html shortcode

## toggle-text

A generic click-to-toggle partial that switches between two bodies of content. JS is wired up globally in `main.js` — any `.toggle-text` on any page gets the behavior automatically.

**Partial:** `layouts/partials/toggle-text.html`

| Param | Required | Description |
|---|---|---|
| `normal` | yes | HTML string shown by default |
| `alternate` | yes | HTML string shown after click |
| `hint` | no | Label on the normal panel (default: "an alternate take →") |
| `hintBack` | no | Label on the alternate panel (default: "← back") |

```go-html-template
{{ $normal    := printf `<p class="my-class">%s</p>` .Params.someField }}
{{ $alternate := partial "path/to/alternate-content.html" . }}
{{ partial "toggle-text.html" (dict
    "normal"    $normal
    "alternate" $alternate
    "hint"      "an alternate take →"
    "hintBack"  "← back to reality"
) }}
```

If the alternate content is a screenplay, wrap it in `<div class="screenplay">` to get the correct monospace formatting:

**Classes:** `screenplay__scene-heading`, `screenplay__action`, `screenplay__character`, `screenplay__dialogue`

```html
<div class="screenplay">
    <p class="screenplay__scene-heading">INT. SOME ROOM. DAY.</p>
    <p class="screenplay__action">Someone does something.</p>
    <p class="screenplay__character">CHARACTER</p>
    <p class="screenplay__dialogue">They say something.</p>
</div>
```

**Example in use:** `layouts/partials/home/intro.html` + `layouts/partials/home/intro-screenplay.html`
