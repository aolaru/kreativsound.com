$ErrorActionPreference = "Stop"

$rootDir = Split-Path -Parent $PSScriptRoot
$baseUrl = "https://kreativsound.com"
$analyticsToken = "4d2ef2573cb8456282aa65a1d9defd9d"

$footerLinks = @(
  @{ Label = "Kreativ Font"; Href = "https://kreativfont.com" }
  @{ Label = "Kreativ Sound"; Href = "https://kreativsound.com" }
  @{ Label = "Kreativ WP"; Href = "https://kreativwp.com" }
  @{ Label = "Kreativ Tools"; Href = "https://kreativtools.com" }
)

$staticPages = @(
  @{
    Slug = "about"
    Title = "About | Kreativ Sound"
    Description = "About Kreativ Sound, an independent sound design project creating atmospheric presets and textures."
    Heading = "About Kreativ Sound"
    Lead = "Independent sound design tools and atmospheric resources for creators."
    Nav = "about"
    LastMod = "2026-03-16"
    ChangeFreq = "monthly"
    Priority = "0.7"
    BodyHtml = @'
      <div class="stack">
        <p>Kreativ Sound focuses on ambient, experimental, and cinematic sound materials that help creators build mood quickly. The catalog includes presets and sample packs designed for music production, film edits, and creative content work.</p>
        <p>Every release is built with usability in mind: clear sonic identity, ready-to-use textures, and practical formats for fast workflow integration.</p>
        <p>Kreativ Sound is part of the <a href="https://madebykreativ.com" target="_blank" rel="noopener noreferrer">KREATIV</a> ecosystem of independent creative tools and assets.</p>
      </div>
'@
  }
  @{
    Slug = "contact"
    Title = "Contact | Kreativ Sound"
    Description = "Contact Kreativ Sound for licensing, collaboration, and support."
    Heading = "Contact"
    Lead = "For licensing, partnerships, support, or custom requests."
    Nav = "contact"
    LastMod = "2026-03-16"
    ChangeFreq = "monthly"
    Priority = "0.7"
    BodyHtml = @'
      <ul class="contact-list">
        <li><i class="fa-solid fa-envelope" aria-hidden="true"></i> Email: <a href="mailto:info@kreativsound.com">info@kreativsound.com</a></li>
        <li><i class="fa-solid fa-bag-shopping" aria-hidden="true"></i> Store: <a href="https://kreativ.gumroad.com" target="_blank" rel="noopener noreferrer">kreativ.gumroad.com</a></li>
        <li><i class="fa-brands fa-patreon" aria-hidden="true"></i> Patreon: <a href="https://www.patreon.com/kreativsound" target="_blank" rel="noopener noreferrer">patreon.com/kreativsound</a></li>
      </ul>
'@
  }
)

$learnCoverage = @(
  "Product-specific workflow ideas that help clients move from browsing presets to using them inside real scenes."
  "Short, practical breakdowns focused on tension, atmosphere, transitions, and low-register movement."
  "Creative notes that stay concrete enough to be useful in film, ambient, and experimental production sessions."
)

$posts = @(
  @{
    Slug = "crafting-ambient-textures.html"
    Section = "learn"
    ListSection = "Latest Guides"
    ListLabel = "Read article"
    Title = "Crafting Ambient Textures"
    MetaTitle = "Crafting Ambient Textures | Kreativ Sound"
    Description = "A short practical workflow for building ambient textures from a tonal bed, soft motion, and controlled detail."
    Published = "2026-03-16"
    DisplayDate = "March 16, 2026"
    ListingSummary = "A short practical workflow for building ambient textures without overcrowding the mix."
    BodyHtml = @'
      <figure class="article-figure">
        <img
          class="article-image"
          src="../assets/thumbs/space-2.jpg"
          width="128"
          height="128"
          alt="SPACE 2 artwork"
          loading="eager"
          decoding="async"
        />
      </figure>
      <p>Ambient textures work better when each layer has one job. Keep the stack simple.</p>

      <h2>1. Start with one stable bed</h2>
      <p>Pick one tonal layer and let it hold the space. If the first sound already feels wide and deep, stop there before adding more.</p>

      <h2>2. Add movement slowly</h2>
      <p>Bring in a second layer for drift, not for size. Slow modulation, light filtering, and gentle stereo change usually do enough.</p>

      <h2>3. Use detail at the edges</h2>
      <p>Noise, texture, and small transients should sit around the main bed, not fight it. Keep these layers lower than you think.</p>

      <p>The goal is not complexity. The goal is a texture that holds mood and leaves room for the rest of the scene.</p>
      <p><a href="https://kreativ.gumroad.com" target="_blank" rel="noopener noreferrer">Explore sound packs on Gumroad</a></p>
'@
  }
  @{
    Slug = "three-ways-to-use-neolith-for-cinematic-tension-2026-03-14.html"
    Section = "learn"
    ListSection = "Latest Guides"
    ListLabel = "Read article"
    Title = "3 Ways to Use NEOLITH for Cinematic Tension"
    MetaTitle = "3 Ways to Use NEOLITH for Cinematic Tension | Kreativ Sound"
    Description = "Three practical ways to use NEOLITH for cinematic tension, restraint, and low-register movement."
    Published = "2026-03-14"
    DisplayDate = "March 14, 2026"
    ListingSummary = "Three concrete ways to use NEOLITH for cinematic tension without overcrowding the arrangement."
    BodyHtml = @'
      <figure class="article-figure">
        <img
          class="article-image"
          src="../assets/thumbs/neolith.jpg"
          width="128"
          height="128"
          alt="NEOLITH artwork"
          loading="eager"
          decoding="async"
        />
      </figure>
      <p>NEOLITH works best as a tension layer. Keep it simple and let one sound do the job.</p>

      <h2>1. Build a low-moving bed under sparse dialogue</h2>
      <p>Pick a restrained preset and keep it low in the mix. Add slow movement, but do not overdo it. This keeps the scene uneasy without getting in the way.</p>

      <h2>2. Tighten the harmonic space before the reveal</h2>
      <p>Use it before the hit, not only on the hit. Narrow the stereo image or darken the tone right before the reveal. That small move makes the next moment land harder.</p>

      <h2>3. Pair it with something unstable and organic</h2>
      <p>Layer it with noise, tape, or field recordings. Let NEOLITH hold the tone and let the rough layer add tension around it. This works well for dark ambient, suspense, and slow builds.</p>

      <p>The idea is simple: use NEOLITH to hold pressure, not to fill everything. A single focused layer usually works better than stacking too much.</p>
      <p><a href="https://kreativ.gumroad.com/l/neolith-softube-models-presets?layout=profile" target="_blank" rel="noopener noreferrer">Get NEOLITH on Gumroad</a></p>
'@
  }
  @{
    Slug = "how-to-layer-bioforms-for-organic-motion-2026-03-14.html"
    Section = "learn"
    ListSection = "Latest Guides"
    ListLabel = "Read article"
    Title = "How to Layer BIOFORMS for Organic Motion"
    MetaTitle = "How to Layer BIOFORMS for Organic Motion | Kreativ Sound"
    Description = "A short practical guide to layering BIOFORMS for organic motion and controlled movement."
    Published = "2026-03-14"
    DisplayDate = "March 14, 2026"
    ListingSummary = "How to layer BIOFORMS for organic motion without losing focus in the mix."
    BodyHtml = @'
      <figure class="article-figure">
        <img
          class="article-image"
          src="../assets/thumbs/bioforms.jpg"
          width="128"
          height="128"
          alt="BIOFORMS artwork"
          loading="eager"
          decoding="async"
        />
      </figure>
      <p>BIOFORMS works best when one layer moves and one layer stays still.</p>

      <h2>1. Start with one stable base</h2>
      <p>Pick a preset that holds the tone. Keep it simple. This is the part that keeps the sound grounded.</p>

      <h2>2. Add one moving layer</h2>
      <p>Bring in a second preset with more motion or texture. Keep it lower in the mix. You want movement, not clutter.</p>

      <h2>3. Leave space around it</h2>
      <p>BIOFORMS already has detail. Do not stack too much on top. A small amount of space makes the motion feel more alive.</p>

      <p>The main idea is simple: one layer for tone, one layer for motion.</p>
      <p><a href="https://kreativ.gumroad.com/l/bioforms-synplant-2-presets?layout=profile" target="_blank" rel="noopener noreferrer">Get BIOFORMS on Gumroad</a></p>
'@
  }
  @{
    Slug = "how-to-use-tectonic-2-for-low-end-pressure-2026-03-14.html"
    Section = "learn"
    ListSection = "Latest Guides"
    ListLabel = "Read article"
    Title = "How to Use TECTONIC 2 for Low-End Pressure"
    MetaTitle = "How to Use TECTONIC 2 for Low-End Pressure | Kreativ Sound"
    Description = "A short practical guide to using TECTONIC 2 for low-end pressure in cinematic and dark ambient work."
    Published = "2026-03-14"
    DisplayDate = "March 14, 2026"
    ListingSummary = "How to use TECTONIC 2 for low-end pressure in dark ambient and cinematic work."
    BodyHtml = @'
      <figure class="article-figure">
        <img
          class="article-image"
          src="../assets/thumbs/tectonic-2.jpg"
          width="128"
          height="128"
          alt="TECTONIC 2 artwork"
          loading="eager"
          decoding="async"
        />
      </figure>
      <p>TECTONIC 2 works best when the low end feels present, not loud.</p>

      <h2>1. Keep it controlled</h2>
      <p>Start lower than you think. Low-end pressure works when it stays steady and does not take over the mix.</p>

      <h2>2. Use it before the impact</h2>
      <p>Bring it in early and let it build slowly. That makes the next section feel heavier without needing more layers.</p>

      <h2>3. Pair it with sparse top detail</h2>
      <p>A little noise or texture on top is enough. The low end should carry the weight. Everything else should stay out of the way.</p>

      <p>The main idea is simple: pressure comes from control, not volume.</p>
      <p><a href="https://kreativ.gumroad.com/l/tectonic-underground-textures?layout=profile" target="_blank" rel="noopener noreferrer">Get TECTONIC 2 on Gumroad</a></p>
'@
  }
  @{
    Slug = "neolith-release-2026-03-03.html"
    Section = "news"
    ListSection = "Latest Sound Releases"
    ListLabel = "Read release note"
    Title = "NEOLITH Release Notes"
    MetaTitle = "NEOLITH Release Notes (March 3, 2026) | Kreativ Sound"
    Description = "Release notes for NEOLITH presets for Softube Models, published March 3, 2026."
    Published = "2026-03-03"
    DisplayDate = "March 3, 2026"
    ListingSummary = "NEOLITH for Softube Models released with a focused analog-forward preset set for cinematic scoring."
    BodyHtml = @'
      <p>NEOLITH is now available for Softube Models. This release focuses on analog-forward tones designed for cinematic scenes, modern ambient scoring, and low-register tension work.</p>
      <p>The sound set was built to move fast in session workflows: presets load with balanced gain structure, clear naming, and immediate macro utility for texture and movement.</p>
      <p>Use cases include intro pads, dark synth beds, and transitions where harmonic detail is needed without over-layering.</p>
      <p><a href="https://kreativ.gumroad.com/l/neolith-softube-models-presets?layout=profile" target="_blank" rel="noopener noreferrer">View NEOLITH on Gumroad</a></p>
'@
  }
  @{
    Slug = "bioforms-update-2026-02-26.html"
    Section = "news"
    ListSection = "Latest Sound Releases"
    ListLabel = "Read update"
    Title = "BIOFORMS Catalog Update"
    MetaTitle = "BIOFORMS Catalog Update (February 26, 2026) | Kreativ Sound"
    Description = "BIOFORMS homepage and catalog update details from February 26, 2026."
    Published = "2026-02-26"
    DisplayDate = "February 26, 2026"
    ListingSummary = "BIOFORMS for Synplant 2 was elevated as a core release with improved homepage placement."
    BodyHtml = @'
      <p>BIOFORMS was promoted in the homepage presentation and featured placement to improve discoverability for Synplant 2 users.</p>
      <p>This update aligns copy, visuals, and CTA placement around one clear entry point for new visitors.</p>
      <p><a href="https://kreativ.gumroad.com/l/bioforms-synplant-2-presets?layout=profile" target="_blank" rel="noopener noreferrer">View BIOFORMS on Gumroad</a></p>
'@
  }
  @{
    Slug = "catalog-media-refresh-2026-02-25.html"
    Section = "news"
    ListSection = "Latest Sound Releases"
    ListLabel = "Read update"
    Title = "Catalog Media Refresh"
    MetaTitle = "Catalog Media Refresh (February 25, 2026) | Kreativ Sound"
    Description = "Catalog media and thumbnail update from February 25, 2026."
    Published = "2026-02-25"
    DisplayDate = "February 25, 2026"
    ListingSummary = "Catalog thumbnail pipeline was refreshed for faster loads and cleaner media management."
    BodyHtml = @'
      <p>Thumbnail assets were consolidated to local optimized files to improve page speed, visual consistency, and deployment reliability.</p>
      <p>The update also established a repeatable media pipeline so new pack launches can ship with matching thumbnail quality.</p>
'@
  }
  @{
    Slug = "news-launch-2026-03-06.html"
    Section = "news"
    ListSection = "Important Site News"
    Title = "News Section Launch"
    MetaTitle = "News Section Launch (March 6, 2026) | Kreativ Sound"
    Description = "Kreativ Sound news section launch update from March 6, 2026."
    Published = "2026-03-06"
    DisplayDate = "March 6, 2026"
    ListingSummary = "Top-level routes were cleaned up to use stable trailing-slash URLs for News, Learn, About, and Contact."
    OverrideListHref = "../about/"
    OverrideListLabel = "View updated navigation"
    BodyHtml = @'
      <p>The site now includes a dedicated News section in primary navigation to centralize release notes and important platform updates.</p>
      <p>This change makes product and operational changes easier to track over time and improves communication cadence for visitors.</p>
'@
  }
  @{
    Slug = "footer-network-update-2026-03-06.html"
    Section = "news"
    ListSection = "Important Site News"
    Title = "Footer Network Update"
    MetaTitle = "Footer Network Update (March 6, 2026) | Kreativ Sound"
    Description = "Footer and ecosystem link update from March 6, 2026."
    Published = "2026-03-06"
    DisplayDate = "March 6, 2026"
    ListingSummary = "Navigation was refined with Font Awesome icons, a share button, and a new branded favicon system across the site."
    OverrideListHref = "../"
    OverrideListLabel = "See homepage refresh"
    BodyHtml = @'
      <p>The footer now includes direct links to Kreativ Font, Kreativ Sound, Kreativ WP, and Kreativ Tools to make network discovery easier.</p>
      <p>Attribution was consolidated into a single centered line with Made by KREATIV linked to madebykreativ.com.</p>
'@
  }
  @{
    Slug = "analytics-rollout-2026-03-05.html"
    Section = "news"
    ListSection = "Important Site News"
    Title = "Analytics and Release Workflow Rollout"
    MetaTitle = "Analytics and Release Workflow Rollout (March 5, 2026) | Kreativ Sound"
    Description = "Analytics and release workflow rollout update from March 5, 2026."
    Published = "2026-03-05"
    DisplayDate = "March 5, 2026"
    ListingSummary = "Learn section added with practical product articles for NEOLITH, BIOFORMS, and TECTONIC 2."
    OverrideListHref = "../learn/"
    OverrideListLabel = "Open Learn"
    BodyHtml = @'
      <p>Plausible event tracking was introduced for product clicks, outbound traffic, theme toggles, and 404 views.</p>
      <p>The release process was formalized with a release-gate script that runs thumbnail checks, Lighthouse audits, and score threshold validation.</p>
      <p>Monitoring guidance was added to keep uptime and analytics quality visible after each deployment.</p>
'@
  }
  @{
    Slug = "building-a-repeatable-sound-brand.html"
    Section = "draft"
    Title = "Building a Repeatable Sound Brand for Content"
    MetaTitle = "Building a Repeatable Sound Brand | Kreativ Sound"
    Description = "Draft post: build a repeatable sound brand for video and content production."
    Robots = "noindex,nofollow"
    BodyHtml = @'
      <div class="stack">
        <p>This draft frames a method to define a signature sonic palette across intros, transitions, and background layers.</p>
        <p>Goal: increase recognition while staying flexible across different content formats.</p>
      </div>
'@
  }
  @{
    Slug = "preset-pack-production-notes.html"
    Section = "draft"
    Title = "Preset Pack Production Notes: From Sketch to Release"
    MetaTitle = "Preset Pack Production Notes | Kreativ Sound"
    Description = "Draft post: notes from preset pack production workflow."
    Robots = "noindex,nofollow"
    BodyHtml = @'
      <div class="stack">
        <p>This draft covers naming conventions, macro mapping strategy, loudness consistency, and final QA before publishing.</p>
        <p>Focus: balancing creative variety with predictable usability for end users.</p>
      </div>
'@
  }
  @{
    Slug = "scoring-with-minimal-sound-design.html"
    Section = "draft"
    Title = "Scoring with Minimal Sound Design Layers"
    MetaTitle = "Scoring with Minimal Sound Design Layers | Kreativ Sound"
    Description = "Draft post: score more with fewer sound design layers."
    Robots = "noindex,nofollow"
    BodyHtml = @'
      <div class="stack">
        <p>This draft explores how three core layers can deliver emotion and narrative movement without overcrowding a mix.</p>
        <p>Sections include low-end bed, harmonic motion, and transient punctuation.</p>
      </div>
'@
  }
)

function Get-HeadHtml {
  param(
    [string]$Title,
    [string]$Description,
    [string]$Canonical,
    [string]$Robots = "index,follow",
    [string]$Root = ".."
  )

  @"
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>$Title</title>
  <meta name="description" content="$Description" />
  <meta name="theme-color" content="#f8e9e9" />
  <meta name="robots" content="$Robots" />
  <script>
    (function () {
      var stored = localStorage.getItem("theme");
      var theme = stored === "light" || stored === "dark" ? stored : "light";
      document.documentElement.setAttribute("data-theme", theme);
    })();
  </script>
  <link rel="canonical" href="$Canonical" />
  <link rel="icon" type="image/svg+xml" href="$Root/favicon.svg" />
  <link rel="icon" type="image/png" sizes="32x32" href="$Root/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="$Root/favicon-16x16.png" />
  <link rel="apple-touch-icon" href="$Root/apple-touch-icon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
  <link rel="stylesheet" href="$Root/style.css" />
  <!-- Cloudflare Web Analytics --><script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "$analyticsToken"}'></script><!-- End Cloudflare Web Analytics -->
</head>
"@
}

function Get-NavHtml {
  param([string]$Active)

  $items = @(
    @{ Key = "home"; Href = "/"; Label = "Home"; Icon = $true }
    @{ Key = "news"; Href = "/news/"; Label = "News"; Icon = $false }
    @{ Key = "learn"; Href = "/learn/"; Label = "Learn"; Icon = $false }
    @{ Key = "about"; Href = "/about/"; Label = "About"; Icon = $false }
    @{ Key = "contact"; Href = "/contact/"; Label = "Contact"; Icon = $false }
  )

  $lines = foreach ($item in $items) {
    $class = if ($item.Key -eq $Active) { "nav-link active" } else { "nav-link" }
    if ($item.Icon) {
      @"
      <a class="$class" href="$($item.Href)" aria-label="$($item.Label)">
        <i class="nav-icon fa-solid fa-house" aria-hidden="true"></i>
        <span class="sr-only">$($item.Label)</span>
      </a>
"@
    }
    else {
      "      <a class=`"$class`" href=`"$($item.Href)`">$($item.Label)</a>"
    }
  }

  @"
    <nav class="site-nav" aria-label="Primary">
$($lines -join "`n")
      <button class="nav-link share-button" id="share-button" type="button" aria-label="Share this page">
        <i class="fa-solid fa-share-nodes" aria-hidden="true"></i>
        <span class="sr-only">Share this page</span>
      </button>
      <button class="nav-link theme-toggle" id="theme-toggle" type="button" aria-pressed="false" aria-label="Switch theme" data-icon="moon">
        <i class="theme-icon theme-icon-sun fa-regular fa-sun" aria-hidden="true"></i>
        <i class="theme-icon theme-icon-moon fa-regular fa-moon" aria-hidden="true"></i>
        <span class="sr-only">Toggle theme</span>
      </button>
    </nav>
"@
}

function Get-FooterHtml {
  $lines = for ($i = 0; $i -lt $footerLinks.Count; $i++) {
    $link = $footerLinks[$i]
    "        <a href=`"$($link.Href)`" target=`"_blank`" rel=`"noopener noreferrer`">$($link.Label)</a>"
    if ($i -lt $footerLinks.Count - 1) {
      "        <span aria-hidden=`"true`">&middot;</span>"
    }
  }

  @"
    <footer class="footer">
      <p class="footer-links">
$($lines -join "`n")
      </p>
      <p class="footer-meta">
        &copy; <span id="year"></span>
        <a href="https://madebykreativ.com" target="_blank" rel="noopener noreferrer">Made by KREATIV</a>
        &middot; Independent creative tools and assets by Andrei Olaru
      </p>
    </footer>
"@
}

function Get-ShellHtml {
  param(
    [string]$Title,
    [string]$Description,
    [string]$Canonical,
    [string]$NavKey,
    [string]$ContentHtml,
    [string]$Robots = "index,follow",
    [string]$Root = "..",
    [switch]$IncludeShare
  )

  $shareScript = if ($IncludeShare) { "`n  <script src=`"$Root/share.js`"></script>" } else { "" }

  @"
<!DOCTYPE html>
<html lang="en" data-theme="light">
$(Get-HeadHtml -Title $Title -Description $Description -Canonical $Canonical -Robots $Robots -Root $Root)
<body>
  <main class="container">
$(Get-NavHtml -Active $NavKey)

    $ContentHtml

$(Get-FooterHtml)
  </main>

  <script src="$Root/site.js"></script>$shareScript
</body>
</html>
"@
}

function Write-Page {
  param(
    [string]$RelativePath,
    [string]$Contents
  )

  $fullPath = Join-Path $rootDir $RelativePath
  $dir = Split-Path -Parent $fullPath
  if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir | Out-Null
  }
  Set-Content -LiteralPath $fullPath -Value $Contents -NoNewline
}

foreach ($page in $staticPages) {
  $content = @"
<section class="card page-main">
      <h1 class="page-title">$($page.Heading)</h1>
      <p class="page-lead">$($page.Lead)</p>
$($page.BodyHtml)
    </section>
"@

  Write-Page -RelativePath "$($page.Slug)\index.html" -Contents (
    Get-ShellHtml -Title $page.Title -Description $page.Description -Canonical "$baseUrl/$($page.Slug)/" -NavKey $page.Nav -ContentHtml $content -IncludeShare
  )
}

$newsBlocks = foreach ($group in @("Latest Sound Releases", "Important Site News")) {
  $items = $posts |
    Where-Object { $_.Section -eq "news" -and $_.ListSection -eq $group } |
    Sort-Object @{ Expression = { $_["Published"] }; Descending = $true } |
    ForEach-Object {
      $href = if ($_.OverrideListHref) { $_.OverrideListHref } else { "../posts/$($_.Slug)" }
      $label = if ($_.OverrideListLabel) { $_.OverrideListLabel } else { $_.ListLabel }
@"
            <li>
              <time datetime="$($_.Published)">$($_.DisplayDate)</time>
              <span>$($_.ListingSummary)</span>
              <a href="$href">$label <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
            </li>
"@
    }

@"
        <article class="news-block">
          <h2>$group</h2>
          <ul class="news-list">
$($items -join "`n")
          </ul>
        </article>
"@
}

Write-Page -RelativePath "news\index.html" -Contents (
  Get-ShellHtml -Title "News | Kreativ Sound" -Description "Latest sound releases and important updates from Kreativ Sound." -Canonical "$baseUrl/news/" -NavKey "news" -ContentHtml @"
<section class="card page-main">
      <h1 class="page-title">News</h1>
      <p class="page-lead">Latest sound releases and important site updates.</p>
      <div class="stack news-stack">
$($newsBlocks -join "`n")
      </div>
    </section>
"@ -IncludeShare
)

$learnItems = $posts |
  Where-Object { $_.Section -eq "learn" } |
  Sort-Object @{ Expression = { $_["Published"] }; Descending = $true } |
  ForEach-Object {
    $href = "../posts/$($_.Slug)"
@"
            <li>
              <time datetime="$($_.Published)">$($_.DisplayDate)</time>
              <span>$($_.ListingSummary)</span>
              <a href="$href">$($_.ListLabel) <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
            </li>
"@
  }

$coverageItems = $learnCoverage | ForEach-Object {
@"
            <li>
              <span>$_</span>
            </li>
"@
}

Write-Page -RelativePath "learn\index.html" -Contents (
  Get-ShellHtml -Title "Learn | Kreativ Sound" -Description "Practical sound design articles, workflows, and product-guided ideas from Kreativ Sound." -Canonical "$baseUrl/learn/" -NavKey "learn" -ContentHtml @"
<section class="card page-main">
      <h1 class="page-title">Learn</h1>
      <p class="page-lead">Practical sound design ideas, workflows, and product-guided articles from Kreativ Sound.</p>
      <div class="stack news-stack">
        <article class="news-block">
          <h2>Latest Guides</h2>
          <ul class="news-list">
$($learnItems -join "`n")
          </ul>
        </article>
        <article class="news-block">
          <h2>What Learn Covers</h2>
          <ul class="news-list">
$($coverageItems -join "`n")
          </ul>
        </article>
      </div>
    </section>
"@ -IncludeShare
)

foreach ($slug in @("about", "contact", "news", "learn")) {
  $label = (Get-Culture).TextInfo.ToTitleCase($slug)
  Write-Page -RelativePath "$slug.html" -Contents @"
<!DOCTYPE html>
<html lang="en">
$(Get-HeadHtml -Title "Redirecting | Kreativ Sound" -Description "Redirecting to $label." -Canonical "$baseUrl/$slug/" -Robots "noindex,follow" -Root ".")
<body>
  <main class="container">
    <section class="card page-main">
      <h1 class="page-title">Redirecting</h1>
      <p class="page-lead"><a href="/$slug/">Continue to $label</a></p>
    </section>
  </main>
</body>
</html>
"@
}

Write-Page -RelativePath "404.html" -Contents @"
<!DOCTYPE html>
<html lang="en">
$(Get-HeadHtml -Title "Page Not Found | Kreativ Sound" -Description "The page you are looking for does not exist." -Canonical "$baseUrl/404.html" -Robots "noindex,follow" -Root ".")
<body>
  <main class="container">
    <section class="card" aria-labelledby="not-found-title">
      <h1 id="not-found-title">Page Not Found</h1>
      <p class="catalog-intro">The link may be outdated, moved, or mistyped.</p>
      <p>
        <a class="button primary" href="/"><i class="fa-solid fa-house" aria-hidden="true"></i> Return Home</a>
      </p>
    </section>
  </main>
</body>
</html>
"@

foreach ($post in $posts) {
  if ($post.Section -eq "draft") {
    $draftHtml = @"
<!DOCTYPE html>
<html lang="en" data-theme="light">
$(Get-HeadHtml -Title $post.MetaTitle -Description $post.Description -Canonical "$baseUrl/posts/$($post.Slug)" -Robots $post.Robots)
<body>
  <main class="container">
    <section class="card page-main">
      <h1 class="page-title">$($post.Title)</h1>
$($post.BodyHtml)
    </section>
  </main>
</body>
</html>
"@
    Write-Page -RelativePath "posts\$($post.Slug)" -Contents $draftHtml
    continue
  }

  $articleContent = @"
<article class="card page-main">
      <h1 class="page-title">$($post.Title)</h1>
      <p class="page-lead article-meta">Published $($post.DisplayDate)</p>
      <div class="stack article-stack">
$($post.BodyHtml)
      </div>
    </article>
"@

  Write-Page -RelativePath "posts\$($post.Slug)" -Contents (
    Get-ShellHtml -Title $post.MetaTitle -Description $post.Description -Canonical "$baseUrl/posts/$($post.Slug)" -NavKey $post.Section -ContentHtml $articleContent -IncludeShare
  )
}

$sitemapEntries = @(
  @{ Url = "$baseUrl/"; LastMod = "2026-03-15"; ChangeFreq = "weekly"; Priority = "1.0" }
) + ($staticPages | ForEach-Object {
  @{ Url = "$baseUrl/$($_.Slug)/"; LastMod = $_.LastMod; ChangeFreq = $_.ChangeFreq; Priority = $_.Priority }
}) + @(
  @{ Url = "$baseUrl/news/"; LastMod = "2026-03-16"; ChangeFreq = "weekly"; Priority = "0.8" }
  @{ Url = "$baseUrl/learn/"; LastMod = "2026-03-16"; ChangeFreq = "weekly"; Priority = "0.8" }
) + ($posts | Where-Object { $_.Section -ne "draft" } | ForEach-Object {
  $lastMod = if ($_.Published -eq "2026-03-16") { "2026-03-16" } else { "2026-03-14" }
  @{ Url = "$baseUrl/posts/$($_.Slug)"; LastMod = $lastMod; ChangeFreq = "monthly"; Priority = "0.7" }
})

$urlLines = $sitemapEntries | ForEach-Object {
@"
  <url>
    <loc>$($_.Url)</loc>
    <lastmod>$($_.LastMod)</lastmod>
    <changefreq>$($_.ChangeFreq)</changefreq>
    <priority>$($_.Priority)</priority>
  </url>
"@
}

Write-Page -RelativePath "sitemap.xml" -Contents @"
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
$($urlLines -join "`n")
</urlset>
"@

Write-Host "Generated pages, posts, redirects, and sitemap."
