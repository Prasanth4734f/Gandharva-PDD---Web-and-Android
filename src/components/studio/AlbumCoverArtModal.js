import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, Animated, Easing, Share, Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { X, Disc, Download, Share2, Sparkles, Check, Music } from 'lucide-react-native';
import HapticService from '../../services/hapticService';

/**
 * Aesthetic Album Cover Visualizer Palettes
 */
const ARTWORK_THEMES = [
  { id: 'cyber_neon', name: 'Cyber Neon', bg: ['#0F172A', '#38BDF8', '#6366F1'], textColor: '#38BDF8', glow: '#38BDF8' },
  { id: 'vintage_gold', name: 'Vintage Gold', bg: ['#1C1917', '#78350F', '#F59E0B'], textColor: '#FBBF24', glow: '#F59E0B' },
  { id: 'royal_indian', name: 'Royal Indian', bg: ['#311042', '#7E22CE', '#EC4899'], textColor: '#F472B6', glow: '#EC4899' },
  { id: 'midnight_rain', name: 'Midnight Rain', bg: ['#020617', '#1E293B', '#0EA5E9'], textColor: '#7DD3FC', glow: '#0EA5E9' },
  { id: 'emerald_folk', name: 'Emerald Folk', bg: ['#064E3B', '#059669', '#10B981'], textColor: '#34D399', glow: '#10B981' }
];

export default function AlbumCoverArtModal({ visible, onClose, title = "Master Track", genre = "Cinematic", composer = "Gandharva AI" }) {
  const [activeTheme, setActiveTheme] = useState(ARTWORK_THEMES[0]);
  const [isSpinning, setIsSpinning] = useState(true);
  const [saved, setSaved] = useState(false);

  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && isSpinning) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 6000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnim.setValue(0);
    }
  }, [visible, isSpinning]);

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleShare = async () => {
    HapticService.success();
    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: `Album Cover: ${title}`,
            text: `Check out "${title}" Album Artwork on Gandharva AI Studio!`,
            url: window.location.href,
          });
        } else {
          await Share.share({ message: `"${title}" [${genre}] - Official Cover Art by Gandharva AI` });
        }
      } else {
        await Share.share({ message: `"${title}" [${genre}] - Official Cover Art by Gandharva AI Studio` });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {}
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Sparkles size={18} color="#38BDF8" />
              <Text style={styles.headerTitle}>1-Click AI Album Artwork</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>Spotify / Apple Music 1:1 High-Res Artwork</Text>

          {/* 1:1 Square Album Cover Canvas */}
          <View style={[styles.coverCanvas, { backgroundColor: activeTheme.bg[0], borderColor: activeTheme.glow }]}>
            {/* Spinning Vinyl Record Hybrid Effect */}
            <View style={styles.canvasCenter}>
              <Animated.View style={[styles.vinylDisc, { transform: [{ rotate: spinInterpolate }] }]}>
                <View style={styles.vinylGroove1}>
                  <View style={styles.vinylGroove2}>
                    <View style={[styles.vinylCenterLabel, { backgroundColor: activeTheme.glow }]}>
                      <Disc size={20} color="#0F172A" />
                    </View>
                  </View>
                </View>
              </Animated.View>
            </View>

            {/* Typography Overlay */}
            <View style={styles.typographyOverlay}>
              <View style={styles.badgeWrap}>
                <Text style={[styles.badgeText, { color: activeTheme.textColor }]}>{genre.toUpperCase()}</Text>
              </View>

              <Text style={styles.albumTitle} numberOfLines={2}>{title}</Text>
              <Text style={[styles.composerText, { color: activeTheme.textColor }]}>
                {composer} • Official Master
              </Text>
            </View>
          </View>

          {/* Theme Palette Switcher */}
          <Text style={styles.paletteLabel}>Visual Theme Preset:</Text>
          <View style={styles.themeRow}>
            {ARTWORK_THEMES.map((theme) => {
              const isActive = activeTheme.id === theme.id;
              return (
                <TouchableOpacity
                  key={theme.id}
                  style={[
                    styles.themeBtn,
                    { backgroundColor: theme.bg[1] },
                    isActive && { borderColor: '#FFFFFF', borderWidth: 2, transform: [{ scale: 1.08 }] }
                  ]}
                  onPress={() => {
                    HapticService.light();
                    setActiveTheme(theme);
                  }}
                >
                  <Text style={styles.themeBtnText}>{theme.name.split(' ')[0]}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Share Action */}
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.85}>
            {saved ? (
              <>
                <Check size={18} color="#10B981" />
                <Text style={[styles.shareBtnText, { color: '#10B981' }]}>Shared!</Text>
              </>
            ) : (
              <>
                <Share2 size={18} color="#FFFFFF" />
                <Text style={styles.shareBtnText}>Share Artwork to Socials</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 18,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 14,
    alignSelf: 'flex-start',
  },
  coverCanvas: {
    width: 280,
    height: 280,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  canvasCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vinylDisc: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#090D16',
    borderWidth: 2,
    borderColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vinylGroove1: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vinylGroove2: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vinylCenterLabel: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typographyOverlay: {
    zIndex: 10,
  },
  badgeWrap: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  albumTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  composerText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  paletteLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 14,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  themeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  themeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shareBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 12,
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
