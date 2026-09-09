/**
 * Story Narrative Intelligence Engine (NIE)
 * Deeply decomposes any user story into a multi-act, context-aware Album Blueprint.
 */

function cleanTitle(str) {
  return str.replace(/[^\w\s-]/g, '').trim();
}

function extractStoryBlueprint(storyText, language = 'English', targetCount = 4, preferredGenre = '') {
  let cleanStory = (storyText || '').trim();

  // If input was a wrapped prompt, extract the inner story
  const innerStoryMatch = cleanStory.match(/Story:\s*["']?([\s\S]+?)["']?(?:\n|Target Language|$)/i);
  if (innerStoryMatch && innerStoryMatch[1]) {
    cleanStory = innerStoryMatch[1].trim();
  }

  const lower = cleanStory.toLowerCase();

  // 1. Deep Thematic Classification
  const isMystery = lower.includes('call') || lower.includes('disappear') || lower.includes('missing') || lower.includes('secret') || lower.includes('shadow') || lower.includes('investigat') || lower.includes('strange') || lower.includes('murder') || lower.includes('dark') || lower.includes('phone');
  const isMass = lower.includes('mass') || lower.includes('elevation') || lower.includes('hero') || lower.includes('entry') || lower.includes('don') || lower.includes('gang') || lower.includes('fight') || lower.includes('revenge') || lower.includes('swag');
  const isWar = lower.includes('war') || lower.includes('battle') || lower.includes('kingdom') || lower.includes('empire') || lower.includes('warrior') || lower.includes('sword') || lower.includes('fortress');
  const isRain = lower.includes('rain') || lower.includes('nostalgia') || lower.includes('childhood') || lower.includes('memories') || lower.includes('alone') || lower.includes('lonely');
  const isLove = lower.includes('love') || lower.includes('romance') || lower.includes('romantic') || lower.includes('propose') || lower.includes('couple') || lower.includes('college') || lower.includes('priya') || lower.includes('arjun');
  const isCyber = lower.includes('cyber') || lower.includes('hacker') || lower.includes('neon') || lower.includes('future') || lower.includes('2088') || lower.includes('robot');
  const isTemple = lower.includes('temple') || lower.includes('spiritual') || lower.includes('god') || lower.includes('flute') || lower.includes('sacred') || lower.includes('divine');

  let genre = preferredGenre || 'Cinematic Drama Score';
  let subgenre = 'Original Story Soundtrack';
  let coverStyle = 'Cinematic Film Still';
  let colorPalette = ['#0F172A', '#D97706', '#2563EB', '#F8FAFC'];
  let dominantInstruments = ['Grand Piano', 'Acoustic Cello', 'Violin Strings', 'Sub-bass'];

  let title = 'Echoes of Destiny';
  let actPresets = [];

  if (isMystery) {
    genre = preferredGenre || 'Cinematic Mystery & Suspense Thriller';
    subgenre = 'Dark Atmospheric Noir & Pulse Synth';
    coverStyle = 'Moody Dark Film Noir Cinematography';
    colorPalette = ['#090A0F', '#1E293B', '#3B82F6', '#94A3B8'];
    dominantInstruments = ['Suspense Grand Piano', 'Pulsing Analog Bass', 'Haunting Solo Cello', 'Atmospheric Violin Pad'];
    title = 'Echoes of the Forgotten Call';
    actPresets = [
      {
        title: 'Act 1: The Midnight Ring',
        scene_description: 'A sudden late-night telephone ring shatters years of silence with an impossible voice from the past.',
        emotion: 'Ominous Shock & Intrigue',
        bpm: 72,
        key: 'D Minor'
      },
      {
        title: 'Act 2: Whispers in the Static',
        scene_description: 'Investigating dusty photographs, faded letters, and cryptic audio recordings to trace the lost signal.',
        emotion: 'Deepening Suspense',
        bpm: 84,
        key: 'G Minor'
      },
      {
        title: 'Act 3: Chasing the Phantom',
        scene_description: 'A nocturnal pursuit through rainy alleyways and abandoned corridors as danger closes in.',
        emotion: 'Surging Tension & Thrill',
        bpm: 110,
        key: 'A Minor'
      },
      {
        title: 'Act 4: Face to Face with the Past',
        scene_description: 'A climactic midnight confrontation where the shocking truth behind the disappearance is unveiled.',
        emotion: 'Dramatic Revelation',
        bpm: 92,
        key: 'C Minor'
      },
      {
        title: 'Act 5: Haunting Epilogue & Dawn',
        scene_description: 'The puzzle is finally solved, leaving peace and quiet resolution in the morning mist.',
        emotion: 'Cathartic Closure',
        bpm: 76,
        key: 'D Major'
      }
    ];
  } else if (isMass) {
    genre = preferredGenre || 'High-Impact Mass & Heroic Elevation';
    subgenre = 'Commercial Cinematic Action & 808 Trap';
    coverStyle = 'Dramatic Cinematic Action Lighting';
    colorPalette = ['#1E1B4B', '#DC2626', '#EA580C', '#FBBF24'];
    dominantInstruments = ['Heavy 808 Sub-bass', 'Stadium Brass Section', 'Punchy Live Percussion', 'Distorted Electric Guitar'];
    title = 'The Roar of Thunder: Mass Elevation';
    actPresets = [
      {
        title: 'Act 1: The Silent Thunder',
        scene_description: 'An unstoppable force awakens from the shadows, sending tremors through the underworld.',
        emotion: 'Menacing Anticipation',
        bpm: 96,
        key: 'D Minor'
      },
      {
        title: 'Act 2: The Rising Empire',
        scene_description: 'Marching into enemy territory with heavy 808 beats and ferocious energy.',
        emotion: 'Aggressive Momentum',
        bpm: 128,
        key: 'E Minor'
      },
      {
        title: 'Act 3: The War Drop',
        scene_description: 'An explosive adrenaline surge where destiny and raw power collide in full force.',
        emotion: 'Peak Mass Elevation',
        bpm: 136,
        key: 'A Minor'
      },
      {
        title: 'Act 4: Titan\'s Reign',
        scene_description: 'Claiming the throne as the dust settles over the defeated opposition.',
        emotion: 'Triumphant Dominance',
        bpm: 124,
        key: 'D Major'
      },
      {
        title: 'Act 5: Eternal Legend',
        scene_description: 'A grand celebration anthem echoing the immortal legacy across generations.',
        emotion: 'Euphoria & Grandeur',
        bpm: 130,
        key: 'G Major'
      }
    ];
  } else if (isWar) {
    genre = preferredGenre || 'Epic Historical & Mythological Symphony';
    subgenre = 'Taiko War Drums & Choral Majesty';
    coverStyle = 'Mythological Ancient Battlefield Painting';
    colorPalette = ['#450A0A', '#B91C1C', '#D97706', '#FEF08A'];
    dominantInstruments = ['Taiko War Drums', 'Symphonic French Horns', 'Sacred Veena', 'Epic Battle Choir'];
    title = 'Chronicles of the Fallen Kingdom';
    actPresets = [
      {
        title: 'Act 1: The Sacred Omen',
        scene_description: 'Prophecies whispered by elders as the sacred war horn resounds across the valley.',
        emotion: 'Solemn Awakening',
        bpm: 74,
        key: 'C Minor'
      },
      {
        title: 'Act 2: March of the Legions',
        scene_description: 'Armies assemble beneath roaring war banners and thunderous percussion.',
        emotion: 'Heroic March',
        bpm: 104,
        key: 'F Minor'
      },
      {
        title: 'Act 3: Clash of Titans',
        scene_description: 'A colossal symphonic battle where heroes fight for honour and destiny.',
        emotion: 'Colossal Climax',
        bpm: 132,
        key: 'D Minor'
      },
      {
        title: 'Act 4: Lament for the Brave',
        scene_description: 'A solemn cello and sitar tribute honoring the fallen warriors.',
        emotion: 'Sacred Reverence',
        bpm: 68,
        key: 'G Minor'
      },
      {
        title: 'Act 5: Coronation of Peace',
        scene_description: 'The golden kingdom celebrates eternal peace under triumphant choral fanfare.',
        emotion: 'Majestic Glory',
        bpm: 118,
        key: 'C Major'
      }
    ];
  } else if (isLove) {
    genre = preferredGenre || 'Lush Romantic Contemporary Symphony';
    subgenre = 'Youth College Romance & Acoustic Strings';
    coverStyle = 'Festive Golden Hour Romance Photography';
    colorPalette = ['#831843', '#BE185D', '#FB7185', '#FCE7F3'];
    dominantInstruments = ['Bansuri Flute', 'Acoustic Guitar', 'Velvet Grand Piano', 'Warm Strings'];
    title = 'A Symphony of Two Hearts';
    actPresets = [
      {
        title: 'Act 1: The First Glance',
        scene_description: 'Two kindred spirits cross paths under the afternoon light, igniting a silent spark.',
        emotion: 'Sweet Awakening',
        bpm: 80,
        key: 'C Major'
      },
      {
        title: 'Act 2: Whispers in the Rain',
        scene_description: 'Friendship blossoms into profound love during late-night walks and festival lights.',
        emotion: 'Deepening Connection',
        bpm: 90,
        key: 'G Major'
      },
      {
        title: 'Act 3: The Great Misunderstanding',
        scene_description: 'A sudden silence and unspoken words test the resilience of their bond.',
        emotion: 'Emotional Tension',
        bpm: 76,
        key: 'A Minor'
      },
      {
        title: 'Act 4: Longing & Realization',
        scene_description: 'Realizing that distance only proves the depth and sincerity of their love.',
        emotion: 'Yearning & Hope',
        bpm: 82,
        key: 'E Minor'
      },
      {
        title: 'Act 5: Grand Reunion & Forever',
        scene_description: 'A joyful embrace at graduation as two souls unite forever in harmonious music.',
        emotion: 'Pure Joy & Triumph',
        bpm: 116,
        key: 'F Major'
      }
    ];
  } else if (isCyber) {
    genre = preferredGenre || 'Futuristic Cyberpunk Synthwave';
    subgenre = 'Neon Bass & Electronic Odyssey';
    coverStyle = 'Cyberpunk Neon Metropolis Digital Art';
    colorPalette = ['#020617', '#06B6D4', '#7C3AED', '#EC4899'];
    dominantInstruments = ['Analog Synth Leads', 'Running Synth Bass', '80s Drum Machine Kicks', 'Vocoder Pads'];
    title = 'Neon Metropolis 2088';
    actPresets = [
      {
        title: 'Act 1: System Boot (Neon Awakening)',
        scene_description: 'Glitches in the neon grid reveal a rogue AI transmission at midnight.',
        emotion: 'Futuristic Mystery',
        bpm: 100,
        key: 'F Minor'
      },
      {
        title: 'Act 2: Infiltration Run',
        scene_description: 'Navigating cyberpunk alleyways and bypassing corporate firewalls.',
        emotion: 'Cybernetic Drive',
        bpm: 124,
        key: 'G Minor'
      },
      {
        title: 'Act 3: Neural Overclock',
        scene_description: 'A high-speed confrontation inside the virtual mainframe core.',
        emotion: 'Peak Electro Rush',
        bpm: 138,
        key: 'D Minor'
      },
      {
        title: 'Act 4: Beyond the Firewall',
        scene_description: 'Transcending physical limits into the boundless expanse of cyberspace.',
        emotion: 'Transcendent Wonder',
        bpm: 108,
        key: 'A Minor'
      },
      {
        title: 'Act 5: Synthetic Dawn',
        scene_description: 'A harmonious new digital dawn rising over the glowing skyscraper horizon.',
        emotion: 'Harmonic Ascension',
        bpm: 120,
        key: 'C Major'
      }
    ];
  } else {
    const words = cleanStory.split(/\s+/).slice(0, 4).join(' ').replace(/[^\w\s]/g, '');
    title = words ? `${words.charAt(0).toUpperCase() + words.slice(1)}: The Soundtrack` : 'The Cinematic Journey';
    actPresets = [
      {
        title: 'Act 1: The Awakening Horizon',
        scene_description: 'The story begins with an evocative premise that sets the emotional stakes in motion.',
        emotion: 'Nostalgia & Anticipation',
        bpm: 78,
        key: 'C Major'
      },
      {
        title: 'Act 2: The Journey Unfolds',
        scene_description: 'Characters navigate unexpected turns, deepening their purpose and relationships.',
        emotion: 'Growing Momentum',
        bpm: 92,
        key: 'G Major'
      },
      {
        title: 'Act 3: The Pivotal Climax',
        scene_description: 'The decisive turning point where obstacles are confronted with unwavering determination.',
        emotion: 'Surging Climax',
        bpm: 115,
        key: 'A Minor'
      },
      {
        title: 'Act 4: Twilight Reflection',
        scene_description: 'Processing the consequences of the trial with newfound wisdom and inner peace.',
        emotion: 'Peaceful Transcendence',
        bpm: 80,
        key: 'E Minor'
      },
      {
        title: 'Act 5: Celebration of Destiny',
        scene_description: 'A grand finale celebrating harmony, triumph, and lasting transformation.',
        emotion: 'Euphoria & Grandeur',
        bpm: 128,
        key: 'D Major'
      }
    ];
  }

  const trackCount = Math.max(3, Math.min(5, parseInt(targetCount) || 4));
  const plannedTracks = [];

  for (let i = 0; i < trackCount; i++) {
    const act = actPresets[i] || actPresets[i % actPresets.length];
    plannedTracks.push({
      track_number: i + 1,
      title: cleanTitle(act.title),
      scene_description: act.scene_description,
      emotion: act.emotion,
      suggested_bpm: act.bpm,
      key_signature: act.key
    });
  }

  return {
    title: cleanTitle(title),
    album_title: cleanTitle(title),
    genre,
    subgenre,
    language,
    story: cleanStory,
    num_lyrics: trackCount,
    num_bgms: trackCount,
    timeline: `${trackCount}-Scene Dynamic Story Arc`,
    cover_style: coverStyle,
    cover_prompt: `${title}, ${genre}, ${coverStyle}, dramatic atmospheric lighting, 8k square masterpiece album cover, no text`,
    color_palette: colorPalette,
    dominant_instruments: dominantInstruments,
    planned_tracks: plannedTracks,
    estimated_duration_mins: Math.ceil(trackCount * 2.5)
  };
}

module.exports = {
  extractStoryBlueprint
};
