import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Volume2, Copy, Check, Music, BookOpen, Mic, Globe2 } from 'lucide-react-native';
import { playNamedChord } from '../../services/synthAudioEngine';
import HapticService from '../../services/hapticService';
import KaraokeTeleprompterModal from './KaraokeTeleprompterModal';
import PrasaRhymeAssistantModal from './PrasaRhymeAssistantModal';
import LyricsTranslatorModal from './LyricsTranslatorModal';

/**
 * TappableLyricsView
 * Interactive Lyrics & Harmony Viewer:
 * - Parses chord markers [Em], [C], [G Major] and renders them as glowing, tappable buttons.
 * - When tapped, triggers realtime offline acoustic chord playback with tactile haptics.
 * - Stage Prompter: Full-screen auto-scrolling karaoke prompter.
 * - Prasa Assistant: Classical Telugu/Hindi/Tamil rhyme & synonym tool.
 * - Multilingual Translator: 1-tap translation keeping musical chords intact.
 * - 1-Click Copy Song to Clipboard with chord sheets.
 */
export default function TappableLyricsView({ lyricsText, title = "Original Song Lyrics", onCopySuccess }) {
  const [activeChord, setActiveChord] = useState(null);
  const [copied, setCopied] = useState(false);
  const [instrument, setInstrument] = useState('piano'); // 'piano' | 'guitar'
  const [showPrompter, setShowPrompter] = useState(false);
  const [showPrasa, setShowPrasa] = useState(false);
  const [showTranslate, setShowTranslate] = useState(false);

  const handleChordTap = (chord) => {
    HapticService.light();
    setActiveChord(chord);
    playNamedChord(chord, instrument, 2.2);
    setTimeout(() => setActiveChord(null), 600);
  };

  const handleCopy = async () => {
    if (!lyricsText) return;
    HapticService.light();
    try {
      await Clipboard.setStringAsync(lyricsText);
      setCopied(true);
      if (onCopySuccess) onCopySuccess();
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  // Parse lines into text tokens & chord tokens
  const renderFormattedLine = (line, lineIdx) => {
    if (!line.trim()) {
      return <View key={`empty-${lineIdx}`} style={{ height: 12 }} />;
    }

    // Section Header like [పల్లవి], [చరణం 1], [Chorus], [Verse]
    if (/^\s*\[(పల్లవి|చరణం|హుక్|ఇంట్రో|వంత|ముగింపు|Verse|Chorus|Intro|Hook|Bridge|Outro)/i.test(line)) {
      return (
        <View key={`sec-${lineIdx}`} style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeaderText}>{line.trim()}</Text>
        </View>
      );
    }

    // Line containing chord markers like [Em], [C Major], [G]
    const parts = line.split(/(\[[A-Ga-g][^\]]*\])/g);

    return (
      <View key={`line-${lineIdx}`} style={styles.lineContainer}>
        {parts.map((part, pIdx) => {
          if (/^\[[A-Ga-g][^\]]*\]$/.test(part)) {
            const chordName = part.replace(/\[|\]/g, '');
            const isPlaying = activeChord === chordName;
            return (
              <TouchableOpacity
                key={`chord-${lineIdx}-${pIdx}`}
                style={[styles.chordBadge, isPlaying && styles.chordBadgeActive]}
                onPress={() => handleChordTap(chordName)}
                activeOpacity={0.7}
              >
                <Music size={10} color={isPlaying ? "#FFFFFF" : "#60A5FA"} style={{ marginRight: 3 }} />
                <Text style={[styles.chordText, isPlaying && styles.chordTextActive]}>{chordName}</Text>
              </TouchableOpacity>
            );
          }
          return (
            <Text key={`txt-${lineIdx}-${pIdx}`} style={styles.lyricText}>
              {part}
            </Text>
          );
        })}
      </View>
    );
  };

  const lines = (lyricsText || '').split('\n');

  return (
    <View style={styles.card}>
      {/* Top Action Bar */}
      <View style={styles.topBar}>
        <View style={styles.titleRow}>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.instrumentToggle}>
            <TouchableOpacity
              style={[styles.instBtn, instrument === 'piano' && styles.instBtnActive]}
              onPress={() => setInstrument('piano')}
            >
              <Text style={[styles.instBtnText, instrument === 'piano' && styles.instBtnTextActive]}>🎹 Piano</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.instBtn, instrument === 'guitar' && styles.instBtnActive]}
              onPress={() => setInstrument('guitar')}
            >
              <Text style={[styles.instBtnText, instrument === 'guitar' && styles.instBtnTextActive]}>🎸 Guitar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 6 }}>
          <TouchableOpacity style={styles.actionPill} onPress={() => setShowTranslate(true)} activeOpacity={0.8}>
            <Globe2 size={13} color="#38BDF8" />
            <Text style={[styles.actionPillText, { color: '#38BDF8' }]}>Lang</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionPill} onPress={() => setShowPrasa(true)} activeOpacity={0.8}>
            <BookOpen size={13} color="#A78BFA" />
            <Text style={[styles.actionPillText, { color: '#C4B5FD' }]}>ప్రాస</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionPill} onPress={() => setShowPrompter(true)} activeOpacity={0.8}>
            <Mic size={13} color="#38BDF8" />
            <Text style={[styles.actionPillText, { color: '#38BDF8' }]}>Stage</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} activeOpacity={0.8}>
            {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} color="#94A3B8" />}
            <Text style={[styles.copyBtnText, copied && { color: '#10B981' }]}>
              {copied ? 'Copied!' : 'Copy'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.subHelper}>💡 Tap any chord badge to hear the authentic acoustic note</Text>

      {/* Lyrics & Chords Scrollable View */}
      <ScrollView style={styles.lyricsScroll} nestedScrollEnabled showsVerticalScrollIndicator={false}>
        <View style={styles.contentPadding}>
          {lines.map((line, idx) => renderFormattedLine(line, idx))}
        </View>
      </ScrollView>

      {/* Full-Screen Stage Prompter Modal */}
      <KaraokeTeleprompterModal
        visible={showPrompter}
        onClose={() => setShowPrompter(false)}
        lyricsText={lyricsText}
        title={title}
      />

      {/* Classical Prasa & Rhyme Assistant Modal */}
      <PrasaRhymeAssistantModal
        visible={showPrasa}
        onClose={() => setShowPrasa(false)}
      />

      {/* 1-Tap Multilingual Lyrics Translator Modal */}
      <LyricsTranslatorModal
        visible={showTranslate}
        onClose={() => setShowTranslate(false)}
        sourceLyrics={lyricsText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 14,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  instrumentToggle: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 2,
  },
  instBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 16,
  },
  instBtnActive: {
    backgroundColor: '#3B82F6',
  },
  instBtnText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  instBtnTextActive: {
    color: '#FFFFFF',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  actionPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  copyBtnText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  subHelper: {
    fontSize: 11,
    color: '#64748B',
    marginVertical: 6,
    fontStyle: 'italic',
  },
  lyricsScroll: {
    maxHeight: 320,
  },
  contentPadding: {
    paddingVertical: 6,
  },
  sectionHeaderContainer: {
    backgroundColor: '#1E293B',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 12,
    marginBottom: 6,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A78BFA',
    letterSpacing: 0.5,
  },
  lineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginVertical: 3,
  },
  lyricText: {
    fontSize: 15,
    color: '#E2E8F0',
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  chordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.4)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginHorizontal: 3,
    marginVertical: 1,
  },
  chordBadgeActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#60A5FA',
    transform: [{ scale: 1.08 }],
  },
  chordText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#60A5FA',
  },
  chordTextActive: {
    color: '#FFFFFF',
  },
});
