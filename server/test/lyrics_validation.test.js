const { validateLyrics } = require('../src/utils/lyricsValidator');

function runTests() {
  console.log('--- 🧪 RUNNING GANDHARVA LYRICS VALIDATION TESTS ---');
  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
    }
  }

  // 1. Valid Telugu Lyrics
  const validTelugu = `[పల్లవి]
నీ చూపుల్లో ఏదో మాయ ఉందిలే
నా మనసే నీ వైపు లాగుతోందిలే
ప్రతి క్షణం నీతోనే జీవించాలనీ
నా గుండెల్లో ఆశలు పుడుతున్నాయిలే

[చరణం 1]
వెన్నెల్లో విరిసిన మల్లెలా నువ్వుంటే
నా తోటలో పూల సువాసనలాయే
కలలోనైనా నిజంలోనైనా నువ్వే
నా ఊపిరిలో నిండిన ప్రాణమాయే

[వంత / బ్రిడ్జ్]
ఎక్కడున్నా నీ ధ్యాసే
నా ప్రతి అడుగులో నీ పాదమే

[ముగింపు]
నీతోనే నా ప్రయాణం
జీవితాంతం నీతోనే నా జీవనం`;

  const res1 = validateLyrics(validTelugu, 'Telugu');
  assert(res1.isValid === true, 'Valid full-length Telugu lyrics pass validation');

  // 2. English text returned when Telugu requested (Language mismatch)
  const englishWhenTelugu = `[Verse 1]
Walking down the rainy road tonight
Looking at the city light
I miss you more than words can say
Wishing you were here today

[Chorus]
Take my hand and hold me close
You are the one I love the most`;

  const res2 = validateLyrics(englishWhenTelugu, 'Telugu');
  assert(res2.isValid === false, 'English lyrics rejected when Telugu was requested');
  assert(res2.errors.some(e => e.includes('native script characters')), 'Telugu script check error raised');

  // 3. Empty section headers with no actual lyrics
  const emptyHeaders = `[Verse 1]
[Chorus]
[Bridge]
[Outro]`;

  const res3 = validateLyrics(emptyHeaders, 'English');
  assert(res3.isValid === false, 'Empty section tags without content rejected');

  // 4. Ultra-short snippet (<80 chars / <6 lines)
  const shortSnippet = `[Verse 1]
One short line.
Two short line.`;

  const res4 = validateLyrics(shortSnippet, 'English');
  assert(res4.isValid === false, 'Short snippet rejected');

  // 5. Conversational preambles stripped cleanly
  const conversationalPreamble = `Sure, here are your requested song lyrics:
[Intro]
Let the music begin tonight
Dancing under the moonlight
[Verse 1]
Step by step we feel the beat
Moving on the crowded street
[Chorus]
This is our night, this is our time
Singing out this joyful rhyme`;

  const res5 = validateLyrics(conversationalPreamble, 'English');
  assert(res5.isValid === true, 'Conversational preamble stripped and content accepted');
  assert(!res5.cleanedText.includes('Sure, here are'), 'Preamble successfully removed from cleaned output');

  // 6. Valid Hindi lyrics
  const validHindi = `[मुखड़ा]
तेरे बिना जिया लागे ना
दिल मेरा अब कहीं भागे ना
हर धड़कन में बस तू ही तू
ये प्यार कभी भी जागे ना

[अंतरा 1]
चाँदनी रातों में तेरी यादें
ख्वाबों में भी तेरी बातें
साँसों में घुली है खुशबू तेरी
कैसे बताऊँ ये जज़्बातें

[आउट्रो]
तू ही मेरी मंज़िल, तू ही रास्ता`;

  const res6 = validateLyrics(validHindi, 'Hindi');
  assert(res6.isValid === true, 'Valid full-length Hindi lyrics pass validation');

  console.log(`\n========================================`);
  console.log(`Results: ${passed}/${total} tests passed.`);
  console.log(`========================================`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
