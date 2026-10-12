/**
 * PromptEnhancer Engine (GANDHARVA Studio Engine)
 * Intelligent Semantic Prompt Understanding & Master Music Production Synthesizer.
 * 
 * Deeply parses the user's prompt (emotion, mood, narrative, storyline, instruments, style, pacing)
 * and generates a bespoke, high-fidelity studio music prompt that strictly preserves and amplifies
 * the exact emotion and spirit of the user's vision.
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
  { match: /(flute|bansuri|woodwind|bamboo)/i, name: "expressive Bansuri woodwinds", role: "melodic lead" },
  { match: /(piano|grand piano|keys|felt piano)/i, name: "intimate acoustic grand piano", role: "harmonic core" },
  { match: /(violin|fiddle|strings|string quartet)/i, name: "soaring orchestral violin ensemble", role: "emotional swells" },
  { match: /(cello|cellos)/i, name: "deep soulful acoustic cello", role: "low-mid warmth" },
  { match: /(guitar|acoustic guitar|nylon guitar)/i, name: "rich nylon & steel-string acoustic guitar", role: "rhythmic picking" },
  { match: /(electric guitar|distorted guitar|rock guitar)/i, name: "gritty overdriven electric guitar riffs", role: "harmonic power" },
  { match: /(sitar)/i, name: "intricate classical sitar arpeggios", role: "classical texture" },
  { match: /(veena)/i, name: "majestic classical Veena plucks", role: "traditional resonance" },
  { match: /(saxophone|sax|brass|horns)/i, name: "warm velvet saxophone and brass swells", role: "rich overtones" },
  { match: /(tabla|mridangam|dholak|ghatam)/i, name: "authentic hand-played Indian percussion (Tabla & Dholak)", role: "rhythmic foundation" },
  { match: /(808|sub bass|sub-bass|heavy bass)/i, name: "deep vibrating 808 sub-bass", role: "low-end weight" },
  { match: /(synth|synthesizer|arpeggio|pad)/i, name: "lush analog synthesizer pads and arpeggios", role: "modern soundscape" },
  { match: /(harp)/i, name: "gentle concert harp glissandos", role: "ethereal shimmer" },
  { match: /(choir|vocal pads|choral)/i, name: "ethereal multi-voice choral harmonies", role: "spiritual atmosphere" },
  { match: /(taiko|drums|cinematic percussion|dhol)/i, name: "thunderous cinematic taiko and orchestral drums", role: "percussive drive" }
];

const THEMATIC_MOODS = [
  {
    id: "deep_sadness_and_heartbreak",
    match: /(sad|pain|cry|crying|tears?|grief|sorrow|loss|mourning|heartbreak|heartbroken|depress|agony|lonely|alone|broken|separation|goodbye|farewell|traged|mourn|regret|guilt|hurts?|ache|suffering|hopeless|despair|weep|weeping|broken[- ]heart|teardrop|melanchol|miss you|lost love)/i,
    emotionLabel: "Profound Heartbreak, Sorrow & Emotional Longing",
    genre: "Soul-Stirring Melancholic Cinematic Soundtrack",
    bpm: "62-68 BPM",
    key: "D Minor / C Minor",
    intro: "opens with fragile, solitary felt piano notes and deep space between chords, evoking profound emotional vulnerability",
    build: "develops with weeping cello countermelodies and a rising sorrowful violin quartet steeped in poignant grief and unhealed ache",
    climax: "crests in an intensely moving, tear-inducing crescendo of soaring strings and melancholic acoustic plucks",
    outro: "dissolves slowly into a solitary, lingering piano resonance surrounded by poignant quietude",
    textures: "tear-soaked natural room reverb, intimate close-mic acoustic warmth, raw expressive dynamics",
    defaultInstruments: ["intimate felt grand piano", "weeping acoustic cello", "expressive solo violin", "gentle acoustic guitar picking", "subtle ambient pad"]
  },
  {
    id: "sensual_intimate_romance",
    match: /(sensual|seductive|hot romance|intimate|chemistry|desire|candlelight|lovers|penthouse|slow dance|bedroom|sultry|erotic|alluring)/i,
    emotionLabel: "Sensual Chemistry, Intimacy & Passionate Desire",
    genre: "Sensual & Seductive R&B Romantic Soundtrack",
    bpm: "74-78 BPM",
    key: "F-sharp Minor / D Minor",
    intro: "sets an intimate atmosphere with velvet Rhodes electric piano chords, subtle vinyl saturation, and deep breathing room",
    build: "unfolds a slow-burning groove with silky muted electric guitar riffs, warm 808 sub-bass, and sultry saxophone melodies",
    climax: "peaks in an intense, passionate surge of harmonic chemistry with soaring lead lines and warm stereo reverb",
    outro: "melts smoothly away into a whispering Rhodes chord and delicate bass decay",
    textures: "warm analog saturation, intimate microphone proximity, lush stereo imaging",
    defaultInstruments: ["Rhodes electric piano", "sultry tenor saxophone", "warm 808 sub-bass", "muted electric guitar", "soft trap percussion"]
  },
  {
    id: "romantic_passion_and_love",
    match: /(love|romantic|romance|passion|heart|sweet|kiss|wedding|soulmate|beloved|hug|date|crush|affection|tender|first love|falling in love|together)/i,
    emotionLabel: "Pure Romance, Soulful Love & Tender Devotion",
    genre: "Lush Contemporary Romantic Symphony",
    bpm: "80-86 BPM",
    key: "E-flat Major / G Major",
    intro: "commences with sweet acoustic guitar arpeggios, gentle music box notes, and velvet electric piano chords",
    build: "unfolds into a passionate groove with warm acoustic bass, smooth drum shakers, and a soaring flute or violin duet",
    climax: "blooms into an ecstatic, soaring romantic chorus filled with lush orchestral strings and uplifting chord cadences",
    outro: "finishes on a soothing, warm acoustic resolution that leaves a sweet romantic aftertaste",
    textures: "lush stereo chorus, warm low-end, sparkling high-frequency polish",
    defaultInstruments: ["nylon acoustic guitar", "grand piano", "soaring violin", "flute woodwinds", "warm acoustic bass"]
  },
  {
    id: "dark_villain_elevation_menace",
    match: /\b(villain|antagonist|evil|dark lord|sinister|menacing|intimidating|heavy villain|villain elevation|nemesis|dark power|demon king|anti[- ]hero|ruthless|malevolent|monolithic)\b/i,
    emotionLabel: "Dark Menacing Dominance, Intimidation & Villain Elevation",
    genre: "Monolithic Dark Orchestral & Heavy Industrial Score",
    bpm: "110-120 BPM",
    key: "D Minor / C Phrygian",
    intro: "opens with an ominous low brass drone, sinister clockwork ostinato, and deep sub-bass tremors establishing an intimidating, menacing presence",
    build: "escalates with aggressive industrial percussion, distorted synth bass pulses, and dark dissonant orchestral swells",
    climax: "explodes into a terrifying, colossal wall-of-sound climax with thunderous war drums, roaring low brass, and crushing sub-bass dominance",
    outro: "ends with a lingering, menacing dark drone and heavy metallic reverb tail",
    textures: "heavy analog distortion, monolithic low-frequency impact, menacing spatial depth",
    defaultInstruments: ["low brass section", "distorted 808 sub-bass", "industrial war drums", "dissonant strings", "dark analog synth"]
  },
  {
    id: "fiery_rage_and_vengeance",
    match: /\b(angry|rage|furious|wrath|vengeance|revenge|hate|hatred|fury|aggressive|violence|destroy|destruction|brutal|dark power|monolithic|fiery|warrior wrath|retribution)\b/i,
    emotionLabel: "Fiery Fury, Vengeance & Unstoppable Wrath",
    genre: "Industrial Orchestral Metal & Dark War Anthem",
    bpm: "132-142 BPM",
    key: "D Minor (Drop D) / C Phrygian",
    intro: "ignites with ominous distorted sub-drones, grinding metallic impacts, and menacing electric guitar whispers",
    build: "accelerates furiously with thunderous taiko war drums, crushing heavy distorted guitar riffs, and screaming orchestral brass",
    climax: "erupts into a ferocious, apocalyptic climax of raw sonic power, relentless double-kick impacts, and roaring symphonic chaos",
    outro: "finishes with a heavy distorted chord decay, smoking feedback, and echoing war drum resonance",
    textures: "heavy analog distortion, high-transient clipping, monolithic low-frequency impact",
    defaultInstruments: ["distorted electric guitar walls", "crushing industrial bass", "thunderous taiko drums", "aggressive symphonic brass"]
  },
  {
    id: "hero_mass_anthem",
    match: /\b(hero|heroic|entry|mass|mass anthem|king|warrior|triumph|badass|attitude|swag|victory|elevation|hype|unstoppable|legend|conquer|champion|domination|stadium|punch)\b/i,
    emotionLabel: "Electrifying Heroic Dominance, Swagger & Mass Elevation",
    genre: "High-Octane Cinematic Mass Anthem",
    bpm: "128-134 BPM",
    key: "E Minor / A Minor",
    intro: "strikes hard with punchy rhythm claps, dramatic low-brass stabs, and an ominous bass rise building immense anticipation",
    build: "explodes into a driving groove with relentless heavy 808 kicks, sharp acoustic plucks, and syncopated brass fanfares",
    climax: "delivers a colossal, stadium-shaking drop packed with wall-of-sound energy, triumphant horns, and roaring low end",
    outro: "concludes with a decisive, punchy sub-bass thud and echoing brass tail",
    textures: "ultra-tight transient response, wide stereo mastering, aggressive sub-bass drive",
    defaultInstruments: ["heavy 808 sub-bass", "punchy live percussion", "cinematic brass section", "distorted electric accents", "energetic dholak"]
  },
  {
    id: "uplifting_joy_and_celebration",
    match: /(happy|joy|joyful|cheerful|celebrat|party|festiv|dance|ecstatic|excited|smile|smiling|sunshine|laughter|upbeat|bouncy|playful|carnival|bhangra|fun)/i,
    emotionLabel: "Exuberant Joy, Euphoria & Festive Celebration",
    genre: "Euphoric Festive Pop & Modern Celebration Symphony",
    bpm: "124-132 BPM",
    key: "G Major / C Major",
    intro: "opens with bright acoustic guitar strums, cheerful clapping syncopations, and a buoyant melodic hook",
    build: "rises with infectious live dance grooves, sparkling synthesizer plucks, and rich harmonic vocal pad layers",
    climax: "soars into a burst of pure euphoria, featuring explosive brass fanfares, energetic percussion rolls, and irresistible dance momentum",
    outro: "ends on a joyful, vibrant acoustic cadence with cheering room ambience and smiling high-end sparkle",
    textures: "vibrant high-end clarity, wide joyful stereo spread, punchy and organic rhythm transients",
    defaultInstruments: ["acoustic rhythm guitar", "lively live dholak/drums", "bright brass horns", "sparkling electric piano", "uplifting strings"]
  },
  {
    id: "childhood_rain_nostalgia",
    match: /(nostalg|childhood|memories|old days|past|monsoon|rain|walking in (?:the )?rain|puddle|reminisc|vintage|bittersweet|years ago|looking back|homesick)/i,
    emotionLabel: "Bittersweet Rain Nostalgia & Cherished Childhood Memories",
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
    id: "lofi_peaceful_serenity",
    match: /(lofi|lo-fi|chill|relax|peace|peaceful|sleep|study|night|ambient|calm|zen|serene|tranquil|meditat|soothing|healing|gentle|quiet|cozy)/i,
    emotionLabel: "Deep Tranquility, Inner Peace & Soothing Relaxation",
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
    id: "devotional_spiritual_bhakti",
    match: /(devotional|god|spiritual|bhajan|temple|sacred|divine|prayer|chant|krishna|shiva|mantra|holy|blessing|worship|sanctuary|puja|aarti|bhakti)/i,
    emotionLabel: "Sacred Spiritual Reverence, Divine Peace & Bhakti",
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
    id: "horror_dark_suspense",
    match: /(horror|scary|dark|creepy|ghost|haunted|fear|suspense|monster|thriller|nightmare|eerie|spooky|chilling|paranormal|ominous|shadows|jump[- ]scare|dissonant)/i,
    emotionLabel: "Chilling Psychological Suspense, Dread & Terror",
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
    id: "cyberpunk_synthwave",
    match: /(cyber|cyberpunk|synthwave|retro|80s synth|future|futuristic|neon|techno|edm|electronic|android|dystopia|hologram|space|spaceship|galaxy|sci[- ]fi)/i,
    emotionLabel: "High-Tech Cybernetic Adrenaline & Neon Mystery",
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
    id: "phonk_drift_workout",
    match: /(phonk|drift|workout|gym|adrenaline|speed|fast car|racing|drift car|motivation|hardcore|intense workout|chase)/i,
    emotionLabel: "Aggressive Motivation, Adrenaline & Raw Drive",
    genre: "High-Octane Phonk & Drift Bass Master",
    bpm: "138-146 BPM",
    key: "F-sharp Minor / D Minor",
    intro: "initiates with dark menacing cowbell melodies, filtered low-frequency rumble, and rising engine rev textures",
    build: "drops into a relentless high-speed groove with sliding 808 sub-bass, fast Memphis trap rhythms, and crisp rimshots",
    climax: "unleashes maximum velocity with distorted sub-bass saturation, lightning-fast hi-hat rolls, and dark brass stabs",
    outro: "cuts out with a sharp bass slide and trailing echo",
    textures: "aggressive clipping transients, car audio bass saturation, dark lo-fi cowbells",
    defaultInstruments: ["distorted cowbells", "sliding 808 sub-bass", "fast trap percussion", "dark brass"]
  },
  {
    id: "folk_village_celebration",
    match: /(village|folk|rural|traditional|teenmaar|dhol|marathi|bhangra|dance|celebration|festival|party|carnival)/i,
    emotionLabel: "Earthy Village Energy, Festivity & Raw Celebration",
    genre: "High-Energy Folk Fusion & Festive Dance",
    bpm: "132-138 BPM",
    key: "G Major / A Major",
    intro: "kicks off with a live rhythmic whistle, infectious handclaps, and an explosive Dhol / Teenmaar drum groove",
    build: "develops with fast acoustic guitar strumming, vibrant street horns, and playful folk flute melodies",
    climax: "peaks in an all-out joyful dance frenzy with thunderous live percussion and soaring festival horns",
    outro: "ends with a celebratory syncopated drum flourish and cheering crowd ambiance",
    textures: "live festival ambience, crisp acoustic attacks, wide energetic stereo field",
    defaultInstruments: ["live Dholak & Dhol", "folk flute", "acoustic rhythm guitar", "festival brass horns"]
  },
  {
    id: "familial_sacrifice_melodrama",
    match: /(mother|father|sacrifice|family|struggle|hardship|devotion of a mother|tearful goodbye|unconditional love|parent)/i,
    emotionLabel: "Deep Familial Devotion, Sacrificial Love & Poignancy",
    genre: "Deeply Moving Cinematic Melodrama",
    bpm: "66-72 BPM",
    key: "D Minor to F Major",
    intro: "opens with tender acoustic guitar notes and a soft, warm piano motif portraying selfless devotion and love",
    build: "gradually elevates with sweeping symphonic strings and an emotive solo bansuri or cello highlighting hardships endured",
    climax: "swells into a breathtaking, heart-stirring crescendo of orchestral majesty that celebrates unwavering love",
    outro: "fades into a peaceful, deeply comforting acoustic lullaby resonance",
    textures: "warm emotional harmonics, pristine symphonic depth, gentle acoustic warmth",
    defaultInstruments: ["tender grand piano", "solo bansuri/cello", "symphonic string section", "warm acoustic guitar"]
  }
];

class PromptEnhancer {
  /**
   * Intelligently parses user prompt for emotion, mood, tempo, and instruments.
   * @param {string} rawPrompt 
   * @returns {object} Analysis result
   */
  static analyzePrompt(rawPrompt) {
    if (!rawPrompt || typeof rawPrompt !== 'string') {
      return {
        genre: "Cinematic",
        moodName: "Cinematic",
        emotionLabel: "Cinematic Emotion",
        suggestedBpm: "96 BPM",
        suggestedKey: "D Minor"
      };
    }

    const input = rawPrompt.trim();

    // 1. Detect Dominant Thematic Mood via Scored Matching
    let matchedMood = null;
    let highestScore = 0;

    for (const mood of THEMATIC_MOODS) {
      const regex = new RegExp(mood.match.source, 'gi');
      const matches = input.match(regex);
      if (matches && matches.length > 0) {
        let score = matches.length * 10;
        matches.forEach(m => { score += m.length; });
        if (score > highestScore) {
          highestScore = score;
          matchedMood = mood;
        }
      }
    }

    if (!matchedMood) {
      matchedMood = {
        genre: "Original Modern Cinematic Studio Production",
        moodName: "Emotional Cinematic",
        emotionLabel: "Deep Narrative Emotion & Dynamic Atmosphere",
        bpm: "92-98 BPM",
        key: "D Minor",
        intro: `opens with an evocative thematic introduction reflecting "${input}"`,
        build: "gradually layers rich acoustic and electronic harmonies, building profound emotional momentum and narrative depth",
        climax: "culminates in a vibrant, emotionally charged studio master peak",
        outro: "resolves smoothly with pristine natural decay and balanced stereo space",
        textures: "balanced dynamic range, wide stereo imaging, broadcast-grade clarity",
        defaultInstruments: ["grand piano", "acoustic string ensemble", "sub-bass", "studio percussion"]
      };
    }

    const bpmMatch = input.match(/(\d{2,3})\s*bpm/i);
    const keyMatch = input.match(/\b(key of\s+[A-G][b#]?\s*(?:minor|major|m)?|[A-G][b#]?\s+(?:minor|major))\b/i);

    return {
      genre: matchedMood.genre,
      moodName: matchedMood.emotionLabel || matchedMood.id,
      emotionLabel: matchedMood.emotionLabel || "Rich Expressive Emotion",
      suggestedBpm: bpmMatch ? `${bpmMatch[1]} BPM` : matchedMood.bpm,
      suggestedKey: keyMatch ? keyMatch[0] : matchedMood.key,
      thematicMood: matchedMood
    };
  }

  /**
   * Intelligently parses user prompt and synthesizes a 100% emotion-preserving master production prompt.
   * @param {string} rawPrompt 
   * @returns {string} Highly descriptive master music generation prompt faithfully carrying the user's emotion
   */
  static enhance(rawPrompt) {
    if (!rawPrompt || !rawPrompt.trim()) {
      return "A pristine, master high-fidelity cinematic composition with rich acoustic strings, grand piano, and dynamic orchestral percussion.";
    }

    const input = rawPrompt.trim();

    // Prevent double-wrapping if already an enhanced master-tier prompt
    if (/^A master-tier/i.test(input) || (input.length > 200 && /BPM/i.test(input) && /Instrumentation/i.test(input))) {
      return input;
    }

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

    // 3. Analyze Emotion and Mood
    const analysis = this.analyzePrompt(input);
    const matchedMood = analysis.thematicMood;
    const chosenBpm = analysis.suggestedBpm;
    const chosenKey = analysis.suggestedKey;

    // Combine detected instruments with mood instruments
    const finalInstrumentsList = [...new Set([...detectedInstruments, ...matchedMood.defaultInstruments])];
    const instrumentsStr = finalInstrumentsList.slice(0, 5).join(", ");

    // Assemble Narrative Enhancement with Uncompromising Emotional Fidelity
    const enhancedParagraph = [
      `A master-tier ${matchedMood.genre} carrying the exact emotion of "${input}" with ${matchedMood.emotionLabel}.`,
      composerContext ? composerContext.trim() : "",
      `Movement & Harmonic Structure: Composed at ${chosenBpm} in ${chosenKey}.`,
      `Emotional Arc & Progression: The piece ${matchedMood.intro}. It ${matchedMood.build}. At its summit, the arrangement ${matchedMood.climax}. Finally, it ${matchedMood.outro}.`,
      `Featured Instrumentation: ${instrumentsStr}.`,
      `Acoustic Engineering: ${matchedMood.textures}, pristine 24-bit studio mastering, zero noise distortion, immersive emotional depth.`
    ].filter(Boolean).join(" ");

    return enhancedParagraph;
  }
}

module.exports = PromptEnhancer;
