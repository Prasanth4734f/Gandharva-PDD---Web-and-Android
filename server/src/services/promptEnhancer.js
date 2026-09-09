/**
 * PromptEnhancer Engine (GANDHARVA Studio Engine)
 * Intelligent Semantic Prompt Understanding & Master Music Production Synthesizer.
 * 
 * Deeply parses the user's prompt (mood, narrative, storyline, instruments, style, pacing)
 * and generates a bespoke, high-fidelity studio music prompt tailored specifically to the user's vision.
 */

const COMPOSER_ARCHETYPES = {
  // --- TELUGU & TAMIL CINEMATIC UNIVERSES ---
  anirudh: {
    match: /(anirudh|rockstar|mass anthem|heavy bass|hype drop|club mass|jailer|leo|vikram|devara|master|petta|doctor|beast|kaththi|jersey|nani gang leader|naa ready|hukum)/i,
    name: "Modern High-Impact Mass & Trap Fusion",
    dna: "powered by deep 808 sub-bass resonance, punchy high-transient claps, sudden dynamic tension drops, and sharp acoustic plucks at 128 BPM in E Minor"
  },
  arr: {
    match: /(a\.?r\.?\s*rahman|ar rahman|rahman|sufi|soulful melody|world fusion|roja|bombay|dil se|ponniyin selvan|ps1|ps2|vinnaithaandi varuvaaya|vtv|guru|rockstar movie)/i,
    name: "Soulful World Fusion & Modal Symphony",
    dna: "blending authentic acoustic bansuri woodwinds, rich multi-layered modal chord progressions, subtle micro-tonal textures, and evolving chamber strings at 82 BPM in D Minor"
  },
  ilaiyaraaja: {
    match: /(ilaiyaraaja|ilayaraja|raaja sir|maestro|isaignani|80s melody|90s melody|geethanjali|thalapathi|nayagan|sagarasangamam|rudraveena)/i,
    name: "Maestro Acoustic Counterpoint & Classical Harmony",
    dna: "crafted with sophisticated walking basslines, multi-layered acoustic string counterpoint, authentic Carnatic-Western orchestral polyphony, and natural room resonance at 92 BPM"
  },
  keeravani: {
    match: /(keeravani|m\.?m\.?\s*keeravani|baahubali|bahubali|rrr|mythological|epic saga|period drama|magadheera|eega|chatrapathi|simhadri|naatu naatu)/i,
    name: "Grand Mythological Symphony & Classical Depth",
    dna: "combining authentic Indian Veena, sweeping symphonic strings, thunderous taiko percussion, and dramatic historical choral majesty at 112 BPM in C Minor"
  },
  thaman: {
    match: /(thaman|s\.?\s*thaman|ss thaman|ala vaikunthapurramuloo|guntur kaaram|akhanda|veera simha reddy|bheemla nayak|krack|race gurram|dookudu|butta bomma|saripodhaa sanivaaram)/i,
    name: "High-Voltage Celebration & Modern Brass Mass",
    dna: "driven by energetic South Indian dholak syncopations, tight acoustic strumming, punchy modern kick transients, and sharp brass fanfares at 132 BPM in A Minor"
  },
  dsp: {
    match: /(dsp|devi sri prasad|rockstar dsp|pushpa|pushpa 2|rangasthalam|teenmaar|festival mass|arya|waltair veerayya|srimanthudu|sarileru neekevvaru|oo antava|srivalli)/i,
    name: "High-Energy Folk & Dance Celebration",
    dna: "featuring live Telugu Teenmaar rhythms, explosive dholak grooves, whistle accents, high-tempo dance guitars, and festival horns at 136 BPM"
  },
  santhosh_narayanan: {
    match: /(santhosh narayanan|sana|kabali|kaala|dasara|sarpatta|kalki|kalki 2898|jigarthanda|soodhu kavvum|vada chennai|bairavaa)/i,
    name: "Raw Rustic Indie-Folk & Gritty Brass",
    dna: "engineered with earthy acoustic percussion, live street brass horns, quirky dynamic basslines, raw folk acoustics, and ambient vinyl grit at 104 BPM"
  },
  yuvan: {
    match: /(yuvan|yuvan shankar raja|u1|little maestro|lofi soul|melancholy king|7g rainbow colony|pudhupettai|paiyaa|mankatha|love today|manmadhan)/i,
    name: "Hypnotic Melancholic Soul & Atmospheric Lo-Fi",
    dna: "featuring warm acoustic piano melodies, deep atmospheric 808 sub-bass, melancholic violin progressions, and intimate lo-fi textures at 78 BPM in C Minor"
  },
  harris: {
    match: /(harris jayaraj|harris|ghajini|surya melody|varnam|minnale|kaakha kaakha|anniyan|dhruva natchathiram|orange telugu)/i,
    name: "Glossy Electronic Pop & Acoustic Romance",
    dna: "built on glossy synthesizer plucks, crisp acoustic guitar arpeggios, smooth vocoder backing layers, and radio-ready electro-pop polish at 120 BPM"
  },
  mani_sharma: {
    match: /(mani sharma|melody brahma|swara brahma|pokiri|indra|kushi|okkadu|athadu|stalin|billa telugu)/i,
    name: "Iconic Commercial Melody & Driving Rhythm",
    dna: "showcasing classic South Indian melodic string ensembles, driving commercial drum tracks, and memorable melodic chord transitions at 116 BPM"
  },
  mickey_j_meyer: {
    match: /(mickey j meyer|mickey|happy days|seethamma vakitlo|mahanati|a aa|leader|kotha bangaru lokam)/i,
    name: "Breezy Acoustic Youth Romance",
    dna: "featuring soothing nylon acoustic guitar picking, tender felt grand piano, peaceful woodwinds, and warm youthful harmonies at 76 BPM"
  },
  gv_prakash: {
    match: /(g\.?v\.?\s*prakash|gv prakash|aadukalam|soorarai pottru|asuran|thalaivaa|raayan|theri|captain miller)/i,
    name: "Raw Emotional Folk & Cinematic String Swells",
    dna: "powered by passionate acoustic guitar strumming, soaring rural strings, raw Indian percussion, and deeply emotional chord cadences at 90 BPM"
  },
  ravi_basrur: {
    match: /(ravi basrur|kgf|kgf 2|salaar|monster mass|heavy metal orchestral|kabzaa|sultan)/i,
    name: "Industrial Metal & Monolithic War Horns",
    dna: "featuring crushing low-end industrial bass, distorted electric guitar walls, thunderous war drums, and dark symphonic brass at 120 BPM in Drop D"
  },
  sushin_shyam: {
    match: /(sushin shyam|sushin|manjummel boys|avesham|aavesham|kumbalangi nights|bheeshma parvam|romancham|premalu)/i,
    name: "Atmospheric Malayalam Indie-Synth & Folk",
    dna: "crafted with dark analog synth basslines, moody organic Indian percussion, spatial ambient reverbs, and eccentric modern indie grooves at 108 BPM"
  },
  hans_zimmer: {
    match: /(hans zimmer|zimmer|interstellar|inception|dune|gladiator|dark knight|epic orchestral)/i,
    name: "Monumental Wall-of-Sound Orchestral Masterpiece",
    dna: "layered with giant French horn swells, ticking time ostinatos, massive sub-bass impacts, and soaring symphonic choir at 110 BPM in D Minor"
  }
};

const INSTRUMENT_DICTIONARY = [
  { match: /(flute|bansuri|woodwind)/i, name: "expressive Bansuri woodwinds", role: "melodic lead" },
  { match: /(piano|grand piano|keys)/i, name: "intimate acoustic grand piano", role: "harmonic core" },
  { match: /(violin|fiddle|strings)/i, name: "soaring orchestral violin ensemble", role: "emotional swells" },
  { match: /(cello|cellos)/i, name: "deep soulful acoustic cello", role: "low-mid warmth" },
  { match: /(guitar|acoustic guitar)/i, name: "rich nylon & steel-string acoustic guitar", role: "rhythmic picking" },
  { match: /(electric guitar|distorted guitar|rock guitar)/i, name: "gritty overdriven electric guitar riffs", role: "harmonic power" },
  { match: /(sitar)/i, name: "intricate classical sitar arpeggios", role: "classical texture" },
  { match: /(veena)/i, name: "majestic classical Veena plucks", role: "traditional resonance" },
  { match: /(saxophone|sax|brass)/i, name: "warm velvet saxophone and brass swells", role: "rich overtones" },
  { match: /(tabla|mridangam|dholak)/i, name: "authentic hand-played Indian percussion (Tabla & Dholak)", role: "rhythmic foundation" },
  { match: /(808|sub bass|sub-bass|heavy bass)/i, name: "deep vibrating 808 sub-bass", role: "low-end weight" },
  { match: /(synth|synthesizer|arpeggio)/i, name: "lush analog synthesizer pads and arpeggios", role: "modern soundscape" },
  { match: /(harp)/i, name: "gentle concert harp glissandos", role: "ethereal shimmer" },
  { match: /(choir|vocal pads|choral)/i, name: "ethereal multi-voice choral harmonies", role: "spiritual atmosphere" },
  { match: /(taiko|drums|cinematic percussion)/i, name: "thunderous cinematic taiko and orchestral drums", role: "percussive drive" }
];

const THEMATIC_MOODS = [
  {
    id: "tragic_separation",
    match: /(separat|breakup|misunderstand|broken|apart|leave|left|divorce|lost love|goodbye|10 years|years apart)/i,
    genre: "Soul-Stirring Cinematic Melodrama",
    bpm: "66-72 BPM",
    key: "D Minor / B Minor",
    intro: "opens with a fragile, solitary piano motif evoking tender nostalgic memories of the early days",
    build: "gradually weaves in weeping cello lines and delicate violin counterpoints as emotional tension and tragic longing mount",
    climax: "surges into a heart-wrenching orchestral crescendo where sweeping strings and acoustic plucks mourn what could have been",
    outro: "gently dissolves into a solitary, echoing piano chord left hanging in reflective quietude",
    textures: "natural room reverb, subtle vinyl warmth, intimate mic placement",
    defaultInstruments: ["solo grand piano", "weeping cello", "expressive violin section", "warm ambient pads"]
  },
  {
    id: "childhood_rain_nostalgia",
    match: /(rain|walking in heavy rain|childhood|nostalgia|remembering|old days|memories|puddle|lonely man)/i,
    genre: "Atmospheric Melancholic Acoustic Journey",
    bpm: "70-76 BPM",
    key: "F Major / D Minor",
    intro: "begins with gentle acoustic guitar picking against atmospheric binaural rain ambiance and soft felt piano",
    build: "develops with a deeply emotive bansuri flute melody and warm chamber strings capturing the innocence of childhood memories",
    climax: "blossoms into a deeply moving symphonic swell of strings and mellow horn warmth reflecting the passage of time",
    outro: "subsides back into quiet rain textures and fading acoustic guitar chords",
    textures: "rain sound design, tape saturation, warm analog warmth",
    defaultInstruments: ["felt grand piano", "bamboo bansuri", "acoustic fingerstyle guitar", "chamber strings"]
  },
  {
    id: "deep_sadness",
    match: /(sad|emotional|pain|cry|tear|grief|sorrow|loss|alone|lonely|heartbroken|depress)/i,
    genre: "Intimate Cinematic Soundtrack",
    bpm: "64-68 BPM",
    key: "C Minor / G Minor",
    intro: "starts with a sparse, haunting piano progression that leaves space between every note for emotional weight",
    build: "layers a mournful solo cello and soft string quartet that rise in passionate, grief-laden counterpoint",
    climax: "peaks in a breathtaking, tear-inducing climax of soaring violins and sub-bass resonance",
    outro: "tapers off into a gentle, solitary piano resolution with lingering emotional depth",
    textures: "extended reverb tails, intimate close-mic clarity, deep acoustic resonance",
    defaultInstruments: ["grand piano", "solo cello", "soft string quartet", "subtle ambient drone"]
  },
  {
    id: "hero_mass_anthem",
    match: /(hero|heroic|entry|mass|mass anthem|king|warrior|triumph|badass|attitude|swag|action|victory)/i,
    genre: "High-Octane Cinematic Mass Anthem",
    bpm: "128-134 BPM",
    key: "E Minor / A Minor",
    intro: "strikes hard with punchy rhythm claps, dramatic low-brass stabs, and an ominous bass rise building immense anticipation",
    build: "explodes into a driving groove with relentless heavy 808 kicks, sharp acoustic plucks, and syncopated brass fanfares",
    climax: "delivers a colossal, stadium-shaking drop packed with wall-of-sound energy and triumphant horns",
    outro: "concludes with a decisive, punchy sub-bass thud and echoing brass tail",
    textures: "ultra-tight transient response, wide stereo mastering, aggressive sub-bass drive",
    defaultInstruments: ["heavy 808 sub-bass", "punchy live percussion", "cinematic brass section", "distorted electric accents"]
  },
  {
    id: "romantic_passion",
    match: /(love|romantic|romance|passion|heart|sweet|kiss|wedding|soulmate|beloved|hug)/i,
    genre: "Lush Contemporary Romantic Symphony",
    bpm: "80-86 BPM",
    key: "E-flat Major / G Major",
    intro: "commences with sweet acoustic guitar arpeggios, gentle music box notes, and velvet electric piano chords",
    build: "unfolds into a passionate groove with warm acoustic bass, smooth drum shakers, and a soaring flute or violin duet",
    climax: "blooms into an ecstatic, soaring romantic chorus filled with lush orchestral strings and uplifting chord cadences",
    outro: "finishes on a soothing, warm acoustic resolution that leaves a sweet romantic aftertaste",
    textures: "lush stereo chorus, warm low-end, sparkling high-frequency polish",
    defaultInstruments: ["acoustic guitar", "grand piano", "soaring violin", "flute woodwinds", "warm bass"]
  },
  {
    id: "lofi_peaceful",
    match: /(lofi|lo-fi|chill|relax|peace|peaceful|sleep|study|night|ambient|calm|zen)/i,
    genre: "Warm Melodic Lo-Fi & Ambient Soul",
    bpm: "72-78 BPM",
    key: "A-flat Major / C Minor",
    intro: "opens with dusty vinyl crackle, mellow Rhodes electric piano chords, and a laid-back boom-bap drum groove",
    build: "interweaves soothing muted guitar riffs, lazy acoustic basslines, and gentle synth bells in a hypnotic loop",
    climax: "evolves with a smooth jazz saxophone or muted trumpet solo floating effortlessly above the groove",
    outro: "drifts peacefully away into fading vinyl static and warm electric piano echoes",
    textures: "vinyl crackle, cassette tape flutter, warm low-pass filtering",
    defaultInstruments: ["vintage Rhodes piano", "lazy boom-bap drums", "warm sub-bass", "muted guitar", "jazz saxophone"]
  },
  {
    id: "devotional_spiritual",
    match: /(devotional|god|spiritual|bhajan|temple|sacred|divine|prayer|chant|krishna|shiva|mantra)/i,
    genre: "Sacred Indian Classical & Devotional Symphony",
    bpm: "78-84 BPM",
    key: "C Major / D Major (Bhairavi / Kalyani Raga Colors)",
    intro: "begins with the resonant ring of temple bells, gentle tambura drone, and an evocative bamboo bansuri alap",
    build: "rises majestically with traditional Mridangam rhythms, soulful Harmonium chords, and devotional string sweeps",
    climax: "culminates in an uplifting, transcendent spiritual crescendo full of divine joy and choral harmony",
    outro: "settles softly back into a tranquil tambura drone and lingering temple bell vibration",
    textures: "spacious hall reverb, natural acoustic purity, sacred ambience",
    defaultInstruments: ["bamboo bansuri", "mridangam", "tambura", "harmonium", "devotional choir"]
  },
  {
    id: "cyberpunk_synthwave",
    match: /(cyber|cyberpunk|synthwave|retro|80s synth|future|neon|drive|speed|techno|edm|electronic)/i,
    genre: "Futuristic Cyberpunk Synthwave & Bass Drive",
    bpm: "124-130 BPM",
    key: "F Minor / D Minor",
    intro: "boots up with sweeping analog filter sweeps, pulsing arpeggiated synths, and punchy vintage drum machine kicks",
    build: "surges forward with a gritty running synth bassline, gated reverbed snares, and soaring neon synth leads",
    climax: "ignites an adrenaline-fueled peak with intense sidechain compression, driving drum fills, and electrifying synth stabs",
    outro: "ends with an abrupt low-pass filter sweep and echoing analog delay",
    textures: "analog synthesizer grit, gated reverb, punchy transient dynamics",
    defaultInstruments: ["analog synth leads", "running synth bass", "80s drum machines", "vocoder pads"]
  },
  {
    id: "horror_dark_suspense",
    match: /(horror|scary|dark|creepy|ghost|haunted|fear|suspense|monster|thriller|nightmare|eerie)/i,
    genre: "Dark Atmospheric Psychological Suspense Score",
    bpm: "58-64 BPM",
    key: "C Minor / D-sharp Diminished",
    intro: "drifts into unsettling low sub-bass drones, dissonant music box notes, and metallic scraping textures",
    build: "escalates psychological tension with rising string screeches, heartbeat pulse kicks, and erratic woodwind whispers",
    climax: "erupts into a terrifying, heart-stopping sonic jump-scare followed by a colossal wall of dissonant brass",
    outro: "dissolves back into cold, breathless ambient stillness",
    textures: "dissonant micro-tonal textures, deep sub-rumble, spatial horror panning",
    defaultInstruments: ["dissonant strings", "low sub drone", "unsettling music box", "metallic percussion"]
  },
  {
    id: "folk_village_celebration",
    match: /(village|folk|rural|traditional|teenmaar|dhol|marathi|bhangra|dance|celebration|festival|party)/i,
    genre: "High-Energy Folk Fusion & Festive Dance",
    bpm: "132-138 BPM",
    key: "G Major / A Major",
    intro: "kicks off with a live rhythmic whistle, infectious handclaps, and an explosive Dhol / Teenmaar drum groove",
    build: "develops with fast acoustic guitar strumming, vibrant street horns, and playful folk flute melodies",
    climax: "peaks in an all-out joyful dance frenzy with thunderous live percussion and soaring festival horns",
    outro: "ends with a celebratory syncopated drum flourish and cheering crowd ambiance",
    textures: "live festival ambience, crisp acoustic attacks, wide energetic stereo field",
    defaultInstruments: ["live Dholak & Dhol", "folk flute", "acoustic rhythm guitar", "festival brass horns"]
  }
];

class PromptEnhancer {
  /**
   * Intelligently parses user prompt and synthesizes a 100% tailored master production prompt.
   * @param {string} rawPrompt 
   * @returns {string} Highly descriptive master music generation prompt
   */
  static enhance(rawPrompt) {
    if (!rawPrompt || !rawPrompt.trim()) {
      return "A pristine, master high-fidelity cinematic composition with rich acoustic strings, grand piano, and dynamic orchestral percussion.";
    }

    const input = rawPrompt.trim();

    // 1. Detect Composer Style Mentions
    let composerContext = "";
    for (const key in COMPOSER_ARCHETYPES) {
      if (COMPOSER_ARCHETYPES[key].match.test(input)) {
        composerContext = `Arranged with the acoustic production DNA of ${COMPOSER_ARCHETYPES[key].name} (${COMPOSER_ARCHETYPES[key].dna}). `;
        break;
      }
    }

    // 2. Detect User-Specified Instruments
    const detectedInstruments = [];
    for (const item of INSTRUMENT_DICTIONARY) {
      if (item.match.test(input)) {
        detectedInstruments.push(item.name);
      }
    }

    // 3. Detect Explicit BPM / Key if mentioned in text
    const bpmMatch = input.match(/(\d{2,3})\s*bpm/i);
    const keyMatch = input.match(/\b(key of\s+[A-G][b#]?\s*(?:minor|major|m)?|[A-G][b#]?\s+(?:minor|major))\b/i);

    // 4. Find Best Thematic Mood Match
    let matchedMood = null;
    for (const mood of THEMATIC_MOODS) {
      if (mood.match.test(input)) {
        matchedMood = mood;
        break;
      }
    }

    if (!matchedMood) {
      matchedMood = {
        genre: "Original Modern Cinematic Studio Production",
        bpm: "96-104 BPM",
        key: "D Minor",
        intro: `opens with a captivating thematic introduction centered around the concept of "${input}"`,
        build: "gradually layers rich acoustic and electronic harmonies, building dynamic momentum and narrative depth",
        climax: "culminates in a vibrant, emotionally charged studio master peak",
        outro: "resolves smoothly with pristine natural decay and balanced stereo space",
        textures: "balanced dynamic range, wide stereo imaging, broadcast-grade clarity",
        defaultInstruments: ["grand piano", "acoustic string ensemble", "sub-bass", "studio percussion"]
      };
    }

    const chosenBpm = bpmMatch ? `${bpmMatch[1]} BPM` : matchedMood.bpm;
    const chosenKey = keyMatch ? keyMatch[0] : matchedMood.key;

    // Combine detected instruments with mood instruments
    const finalInstrumentsList = [...new Set([...detectedInstruments, ...matchedMood.defaultInstruments])];
    const instrumentsStr = finalInstrumentsList.slice(0, 5).join(", ");

    // Assemble Narrative Enhancement
    const enhancedParagraph = [
      `A master-tier ${matchedMood.genre} crafted specifically around: "${input}".`,
      composerContext ? composerContext.trim() : "",
      `Movement & Harmonic Structure: Composed at ${chosenBpm} in ${chosenKey}.`,
      `Progression: The piece ${matchedMood.intro}. It ${matchedMood.build}. At its summit, the arrangement ${matchedMood.climax}. Finally, it ${matchedMood.outro}.`,
      `Featured Instrumentation: ${instrumentsStr}.`,
      `Acoustic Engineering: ${matchedMood.textures}, pristine 24-bit studio mastering, zero noise distortion, immersive depth.`
    ].filter(Boolean).join(" ");

    return enhancedParagraph;
  }
}

module.exports = PromptEnhancer;
