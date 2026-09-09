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

  // 1. Determine Deep Thematic Classification
  let genre = preferredGenre || 'Cinematic Drama Score';
  let subgenre = 'Original Story Soundtrack';
  let coverStyle = 'Cinematic Film Still';
  let colorPalette = ['#0F172A', '#D97706', '#2563EB', '#F8FAFC'];
  let dominantInstruments = ['Grand Piano', 'Acoustic Cello', 'Violin Strings', 'Sub-bass'];
  let isMass = false;

  if (lower.includes('mass') || lower.includes('elevation') || lower.includes('hero') || lower.includes('entry') || lower.includes('don') || lower.includes('gang') || lower.includes('swag') || lower.includes('deva') || lower.includes('vikram') || lower.includes('hukum') || lower.includes('salaar') || lower.includes('kgf')) {
    isMass = true;
    genre = 'High-Impact Mass & Heroic Elevation';
    subgenre = 'Commercial Cinematic Action & 808 Trap';
    coverStyle = 'Dramatic Cinematic Action Lighting';
    colorPalette = ['#1E1B4B', '#DC2626', '#EA580C', '#FBBF24'];
    dominantInstruments = ['Heavy 808 Sub-bass', 'Stadium Brass Section', 'Punchy Live Percussion', 'Distorted Electric Guitar'];
  } else if (lower.includes('war') || lower.includes('battle') || lower.includes('kingdom') || lower.includes('empire') || lower.includes('prince') || lower.includes('warrior') || lower.includes('spear') || lower.includes('fortress') || lower.includes('mahishmati') || lower.includes('rudra')) {
    genre = 'Epic Historical & Mythological Symphony';
    subgenre = 'Taiko War Drums & Choral Majesty';
    coverStyle = 'Mythological Ancient Battlefield Painting';
    colorPalette = ['#450A0A', '#B91C1C', '#D97706', '#FEF08A'];
    dominantInstruments = ['Taiko War Drums', 'Symphonic French Horns', 'Sacred Veena', 'Epic Battle Choir'];
  } else if (lower.includes('rain') || lower.includes('childhood') || lower.includes('nostalgia') || lower.includes('memories') || lower.includes('alone') || lower.includes('lonely') || lower.includes('walking in heavy rain')) {
    genre = 'Atmospheric Melancholic Acoustic Journey';
    subgenre = 'Nostalgic Felt Piano & Bansuri Flute';
    coverStyle = 'Moody Rainy Street Photography';
    colorPalette = ['#0F172A', '#1E293B', '#38BDF8', '#94A3B8'];
    dominantInstruments = ['Felt Grand Piano', 'Bamboo Bansuri Flute', 'Acoustic Fingerstyle Guitar', 'Chamber Cello'];
  } else if (lower.includes('love') || lower.includes('romance') || lower.includes('romantic') || lower.includes('coffee') || lower.includes('umbrella') || lower.includes('confess') || lower.includes('maya') || lower.includes('arjun') || lower.includes('priya')) {
    genre = 'Lush Romantic Contemporary Symphony';
    subgenre = 'Acoustic Love Ballad & Chamber Strings';
    coverStyle = 'Warm Golden Hour Romantic Scene';
    colorPalette = ['#831843', '#BE185D', '#FB7185', '#FCE7F3'];
    dominantInstruments = ['Acoustic Nylon Guitar', 'Velvet Grand Piano', 'Soaring Violin Duet', 'Warm Electric Bass'];
  } else if (lower.includes('cyber') || lower.includes('hacker') || lower.includes('neon') || lower.includes('future') || lower.includes('2088') || lower.includes('robot') || lower.includes('kael')) {
    genre = 'Futuristic Cyberpunk Synthwave';
    subgenre = 'Neon Bass & Electronic Action';
    coverStyle = 'Cyberpunk Neon Metropolis Digital Art';
    colorPalette = ['#020617', '#06B6D4', '#7C3AED', '#EC4899'];
    dominantInstruments = ['Analog Synth Leads', 'Running Synth Bass', '80s Drum Machine Kicks', 'Vocoder Pads'];
  } else if (lower.includes('college') || lower.includes('friends') || lower.includes('festival') || lower.includes('jathara') || lower.includes('teenmaar') || lower.includes('dance')) {
    genre = 'High-Energy Youth & Folk Celebration';
    subgenre = 'South Indian Teenmaar & Brass Mass';
    coverStyle = 'Vibrant Festive Street Carnival';
    colorPalette = ['#7C2D12', '#C2410C', '#EA580C', '#FDE047'];
    dominantInstruments = ['Live Teenmaar Dholak', 'Festival Brass Horns', 'Acoustic Rhythm Guitar', 'Shenhai Leads'];
  }

  // 2. Extract Character Names & Distinct Story Clauses
  const nameMatches = cleanStory.match(/\b([A-Z][a-z]{2,15})\b/g) || [];
  const excludedWords = new Set(['The', 'Act', 'Scene', 'Track', 'When', 'Then', 'With', 'From', 'After', 'Before', 'Two', 'Four', 'His', 'Her', 'Their', 'They', 'This', 'That', 'Into', 'Upon']);
  const characterNames = [...new Set(nameMatches.filter(n => !excludedWords.has(n)))];
  const protagonist = characterNames[0] || 'The Protagonist';

  // Split story by explicit Acts/Scenes, or by sentences
  const explicitActs = cleanStory.split(/(?:Act\s*\d+|Scene\s*\d+|Track\s*\d+)\s*[:—\-]/i).map(s => s.trim()).filter(Boolean);
  let rawSegments = [];
  if (explicitActs.length >= 3) {
    rawSegments = explicitActs;
  } else {
    // Split by sentences
    const sentences = cleanStory.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 8);
    rawSegments = sentences;
  }

  // 3. Generate Album Title from Story Context
  let albumTitle = '';
  if (isMass) {
    albumTitle = `${protagonist}: The Mass Elevation`;
  } else if (characterNames.length >= 2) {
    albumTitle = `${characterNames[0]} & ${characterNames[1]}: Destiny`;
  } else {
    const firstWords = cleanStory.split(/\s+/).slice(0, 4).join(' ').replace(/[^\w\s]/g, '');
    albumTitle = firstWords ? (firstWords.charAt(0).toUpperCase() + firstWords.slice(1)) : `${genre} Album`;
  }

  // 4. Construct Multi-Act Planned Tracks
  const trackCount = Math.max(3, Math.min(6, parseInt(targetCount) || 4));
  const plannedTracks = [];

  const actTemplates = [
    {
      role: 'Intro & Awakening',
      titlePrefix: isMass ? `${protagonist}'s Prelude` : 'The First Spark',
      emotion: isMass ? 'Ominous Anticipation' : 'Nostalgia & Hope',
      bpm: isMass ? 96 : 76,
      key: 'D Minor'
    },
    {
      role: 'Rising Tension & Movement',
      titlePrefix: isMass ? 'The Midnight Convoy' : 'Unspoken Waves',
      emotion: isMass ? 'Aggressive Momentum' : 'Deepening Connection',
      bpm: isMass ? 128 : 88,
      key: 'E Minor'
    },
    {
      role: 'Peak Climax & Elevation',
      titlePrefix: isMass ? `${protagonist}'s Mass Elevation Drop` : 'The Heartfelt Climax',
      emotion: isMass ? 'God-Level Elevation' : 'Surging Climax',
      bpm: isMass ? 134 : 96,
      key: 'A Minor'
    },
    {
      role: 'Resolution & Legacy',
      titlePrefix: isMass ? 'Reign of the Champion' : 'Timeless Resonance',
      emotion: isMass ? 'Triumphant Glory' : 'Peaceful Transcendence',
      bpm: isMass ? 126 : 80,
      key: 'D Major'
    },
    {
      role: 'Grand Celebration',
      titlePrefix: 'Festival of Victory',
      emotion: 'Euphoria & Grandeur',
      bpm: 130,
      key: 'G Major'
    },
    {
      role: 'Eternal Anthem',
      titlePrefix: 'The Forever Opus',
      emotion: 'Immortal Unity',
      bpm: 110,
      key: 'C Major'
    }
  ];

  for (let i = 0; i < trackCount; i++) {
    const act = actTemplates[i] || actTemplates[0];
    const segmentText = rawSegments[i] || rawSegments[rawSegments.length - 1] || cleanStory;
    
    // Create meaningful scene summary
    const sceneSummary = segmentText.length > 120 ? `${segmentText.slice(0, 117)}...` : segmentText;

    // Generate smart track title incorporating story details
    let trackTitle = act.titlePrefix;
    if (segmentText) {
      const segWords = segmentText.split(/\s+/).filter(w => w.length > 3 && !excludedWords.has(w)).slice(0, 3);
      if (segWords.length > 0) {
        const contextualSlug = segWords.join(' ').replace(/[^\w\s]/g, '');
        trackTitle = `Act ${i + 1}: ${act.titlePrefix} (${contextualSlug})`;
      }
    }

    plannedTracks.push({
      track_number: i + 1,
      title: cleanTitle(trackTitle),
      scene_description: sceneSummary,
      emotion: act.emotion,
      suggested_bpm: act.bpm,
      key_signature: act.key
    });
  }

  return {
    title: cleanTitle(albumTitle),
    genre,
    subgenre,
    language,
    story: cleanStory,
    num_lyrics: trackCount,
    num_bgms: trackCount,
    timeline: `${trackCount}-Scene Dynamic Story Arc`,
    cover_style: coverStyle,
    cover_prompt: `${albumTitle}, ${genre}, ${coverStyle}, dramatic atmospheric lighting, 8k square masterpiece album cover, no text`,
    color_palette: colorPalette,
    dominant_instruments: dominantInstruments,
    planned_tracks: plannedTracks,
    estimated_duration_mins: Math.ceil(trackCount * 2.5)
  };
}

module.exports = {
  extractStoryBlueprint
};
