import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import { X, Play, Pause, RotateCcw, Type, Sparkles, Volume2 } from 'lucide-react-native';
import HapticService from '../../services/hapticService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * KaraokeTeleprompterModal
 * Full-Screen Stage Lyrics Prompter:
 * - Auto-scrolls lyrics smoothly based on tempo (BPM / Speed slider)
 * - Large, high-visibility stage typography with glowing active section markers
 * - Font Size adjuster (A- / A+)
 * - Play / Pause / Reset controls with tactile haptics
 */
export default function KaraokeTeleprompterModal({ visible, onClose, lyricsText, title = "Live Stage Prompter", bpm = 110 }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [fontSize, setFontSize] = useState(22);
  const [scrollSpeed, setScrollSpeed] = useState(35); // pixels per second
  const scrollRef = useRef(null);
  const scrollPosRef = useRef(0);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (!visible) {
      setIsPlaying(false);
      scrollPosRef.current = 0;
      return;
    }
    setIsPlaying(true);
  }, [visible]);

  useEffect(() => {
    if (!isPlaying || !visible) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let lastTime = performance.now ? performance.now() : Date.now();

    const step = (now) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      scrollPosRef.current += scrollSpeed * delta;
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: scrollPosRef.current, animated: false });
      }

      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, scrollSpeed, visible]);

  const togglePlay = () => {
    HapticService.light();
    setIsPlaying(prev => !prev);
  };

  const handleReset = () => {
    HapticService.medium();
    scrollPosRef.current = 0;
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const adjustFontSize = (delta) => {
    HapticService.light();
    setFontSize(prev => Math.max(16, Math.min(36, prev + delta)));
  };

  const adjustSpeed = (delta) => {
    HapticService.light();
    setScrollSpeed(prev => Math.max(15, Math.min(100, prev + delta)));
  };

  const lines = (lyricsText || '').split('\n');

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Prompter HUD */}
        <View style={styles.topHud}>
          <View>
            <Text style={styles.trackTitle}>{title}</Text>
            <Text style={styles.tempoSubtitle}>Auto-Scroll: {scrollSpeed} px/s • {bpm} BPM</Text>
          </View>

          {/* Quick HUD Controls */}
          <View style={styles.hudActions}>
            <View style={styles.hudGroup}>
              <TouchableOpacity style={styles.hudBtn} onPress={() => adjustFontSize(-2)}>
                <Text style={styles.hudBtnText}>A-</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.hudBtn} onPress={() => adjustFontSize(2)}>
                <Text style={styles.hudBtnText}>A+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color="#F8FAFC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Teleprompter Scroll View */}
        <ScrollView
          ref={scrollRef}
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => setIsPlaying(false)}
        >
          {lines.map((line, idx) => {
            const isHeader = /^\s*\[(పల్లవి|చరణం|హుక్|ఇంట్రో|వంత|ముగింపు|Verse|Chorus|Intro|Hook|Bridge|Outro)/i.test(line);

            if (isHeader) {
              return (
                <View key={`sec-${idx}`} style={styles.sectionHeaderWrap}>
                  <Sparkles size={14} color="#A78BFA" style={{ marginRight: 6 }} />
                  <Text style={styles.sectionHeaderText}>{line.trim()}</Text>
                </View>
              );
            }

            if (!line.trim()) {
              return <View key={`spacer-${idx}`} style={{ height: 24 }} />;
            }

            return (
              <Text key={`line-${idx}`} style={[styles.lyricLine, { fontSize, lineHeight: fontSize * 1.6 }]}>
                {line}
              </Text>
            );
          })}
          <View style={{ height: SCREEN_HEIGHT * 0.6 }} />
        </ScrollView>

        {/* Bottom Stage Control Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.speedControl}>
            <Text style={styles.controlLabel}>Speed:</Text>
            <TouchableOpacity style={styles.speedBtn} onPress={() => adjustSpeed(-10)}>
              <Text style={styles.speedBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.speedVal}>{scrollSpeed}</Text>
            <TouchableOpacity style={styles.speedBtn} onPress={() => adjustSpeed(10)}>
              <Text style={styles.speedBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.playPauseBtn} onPress={togglePlay} activeOpacity={0.85}>
            {isPlaying ? <Pause size={24} color="#FFFFFF" /> : <Play size={24} color="#FFFFFF" style={{ marginLeft: 2 }} />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <RotateCcw size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // Pitch Black Stage Background
  },
  topHud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  tempoSubtitle: {
    fontSize: 12,
    color: '#38BDF8',
    marginTop: 2,
  },
  hudActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hudGroup: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    overflow: 'hidden',
  },
  hudBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRightWidth: 1,
    borderRightColor: '#334155',
  },
  hudBtnText: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 13,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 40,
  },
  sectionHeaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.35)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 30,
    marginBottom: 16,
  },
  sectionHeaderText: {
    color: '#C4B5FD',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  lyricLine: {
    color: '#F1F5F9',
    textAlign: 'center',
    fontWeight: '600',
    marginVertical: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingVertical: 18,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  speedControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlLabel: {
    color: '#64748B',
    fontSize: 12,
  },
  speedBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedBtnText: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 14,
  },
  speedVal: {
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: 13,
    minWidth: 24,
    textAlign: 'center',
  },
  playPauseBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  resetBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
