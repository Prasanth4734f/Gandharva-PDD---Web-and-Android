import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Sparkles, Play, Square, Music, Compass } from 'lucide-react-native';
import HapticService from '../../services/hapticService';
import { playPianoNote } from '../../services/synthAudioEngine';

export const SCALES_RAGAS_DATABASE = [
  { id: 'all', name: 'All Notes', notes: [] },
  { id: 'mohanam', name: '🌿 Mohanam (Bhoopali)', notes: ['C', 'D', 'E', 'G', 'A'], raga: 'Carnatic Pentatonic' },
  { id: 'kalyani', name: '✨ Kalyani (Yaman)', notes: ['C', 'D', 'E', 'F#', 'G', 'A', 'B'], raga: 'Major 65th Melakarta' },
  { id: 'mayamalavagowla', name: '🏛️ Mayamalavagowla', notes: ['C', 'C#', 'E', 'F', 'G', 'G#', 'B'], raga: 'Morning 15th Melakarta' },
  { id: 'charukesi', name: '💖 Charukesi', notes: ['C', 'D', 'E', 'F', 'G', 'G#', 'A#'], raga: 'Soulful 26th Melakarta' },
  { id: 'e_minor_penta', name: '⚡ E-Minor Pentatonic', notes: ['E', 'G', 'A', 'B', 'D'], raga: 'Rock / Mass Solo' },
  { id: 'blues', name: '🎷 Blues Scale', notes: ['C', 'D#', 'F', 'F#', 'G', 'A#'], raga: 'Jazz & Soul' }
];

export default function ScaleRagaHighlighterBar({ onScaleChange, onNoteTrigger }) {
  const [activeScale, setActiveScale] = useState(SCALES_RAGAS_DATABASE[0]);
  const [isArpPlaying, setIsArpPlaying] = useState(false);
  const arpIntervalRef = React.useRef(null);

  const handleSelectScale = (scale) => {
    HapticService.medium();
    setActiveScale(scale);
    if (onScaleChange) onScaleChange(scale);
  };

  const toggleArpeggiator = () => {
    HapticService.medium();
    if (isArpPlaying) {
      if (arpIntervalRef.current) clearInterval(arpIntervalRef.current);
      setIsArpPlaying(false);
    } else {
      if (activeScale.notes.length === 0) return;
      setIsArpPlaying(true);

      const notesToPlay = activeScale.notes.map(n => `${n}4`);
      let idx = 0;

      arpIntervalRef.current = setInterval(() => {
        const note = notesToPlay[idx % notesToPlay.length];
        playPianoNote(note, 0.7, false, 0.8);
        if (onNoteTrigger) onNoteTrigger(note);
        idx++;
      }, 250);
    }
  };

  React.useEffect(() => {
    return () => {
      if (arpIntervalRef.current) clearInterval(arpIntervalRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Compass size={14} color="#10B981" />
          <Text style={styles.headerTitle}>Raga & Scale Glow</Text>
        </View>

        {activeScale.notes.length > 0 && (
          <TouchableOpacity
            style={[styles.arpBtn, isArpPlaying && styles.arpBtnActive]}
            onPress={toggleArpeggiator}
            activeOpacity={0.8}
          >
            {isArpPlaying ? <Square size={10} color="#FFFFFF" /> : <Play size={10} color="#10B981" />}
            <Text style={[styles.arpBtnText, isArpPlaying && { color: '#FFFFFF' }]}>
              {isArpPlaying ? 'Stop Arp' : 'Auto Arp'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Scale Chips Horizontal Scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollChips}>
        {SCALES_RAGAS_DATABASE.map((scale) => {
          const isActive = activeScale.id === scale.id;
          return (
            <TouchableOpacity
              key={scale.id}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => handleSelectScale(scale)}
              activeOpacity={0.75}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {scale.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 10,
    marginVertical: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  arpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  arpBtnActive: {
    backgroundColor: '#10B981',
  },
  arpBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  scrollChips: {
    gap: 6,
  },
  chip: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  chipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
  },
  chipText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#34D399',
    fontWeight: '700',
  },
});
