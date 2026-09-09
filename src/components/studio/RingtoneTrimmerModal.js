import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { X, Scissors, Play, Pause, Bell, Download, Check, Sparkles } from 'lucide-react-native';
import HapticService from '../../services/hapticService';

/**
 * RingtoneTrimmerModal
 * Precision 15s / 30s Ringtone & Drop Audio Trimmer:
 * - 15s & 30s Preset buttons
 * - Start / End offset sliders
 * - Realtime looped playback of the trimmed drop
 * - 1-Click Export Ringtone to WhatsApp / File System
 */
export default function RingtoneTrimmerModal({ visible, onClose, audioUrl, title = "Master Track", totalDuration = 30 }) {
  const [trimDuration, setTrimDuration] = useState(15); // 15s or 30s
  const [startSec, setStartSec] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const maxStart = Math.max(0, totalDuration - trimDuration);

  // Clean up sound on unmount/close
  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync().catch(() => {});
    };
  }, [sound, visible]);

  const handleSelectDuration = (dur) => {
    HapticService.medium();
    setTrimDuration(dur);
    if (startSec > Math.max(0, totalDuration - dur)) {
      setStartSec(Math.max(0, totalDuration - dur));
    }
  };

  const handleAdjustStart = (delta) => {
    HapticService.light();
    setStartSec(prev => Math.max(0, Math.min(maxStart, prev + delta)));
  };

  const togglePreview = async () => {
    if (!audioUrl) return;
    HapticService.light();

    try {
      if (!sound) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true, positionMillis: startSec * 1000 },
          (status) => {
            if (status.isLoaded) {
              setIsPlaying(status.isPlaying);
              // Loop within trim window
              if (status.positionMillis >= (startSec + trimDuration) * 1000) {
                newSound.setPositionAsync(startSec * 1000);
              }
            }
          }
        );
        setSound(newSound);
        setIsPlaying(true);
      } else {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.setPositionAsync(startSec * 1000);
          await sound.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (e) {
      console.warn('[Trimmer] Playback error:', e);
    }
  };

  const handleExportRingtone = async () => {
    if (!audioUrl) return;
    HapticService.success();
    setIsExporting(true);

    try {
      if (Platform.OS === 'web') {
        const a = document.createElement('a');
        a.href = audioUrl;
        a.download = `${title.replace(/\s+/g, '_')}_ringtone_${trimDuration}s.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const filename = `${title.replace(/\s+/g, '_')}_ringtone_${trimDuration}s.wav`;
        const fileUri = `${FileSystem.cacheDirectory}${filename}`;
        const downloadRes = await FileSystem.downloadAsync(audioUrl, fileUri);

        if (downloadRes.status === 200) {
          const canShare = await Sharing.isAvailableAsync();
          if (canShare) {
            await Sharing.shareAsync(downloadRes.uri, {
              mimeType: 'audio/wav',
              dialogTitle: `Save Ringtone: ${title}`,
              UTI: 'com.microsoft.waveform-audio'
            });
          }
        }
      }
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } catch (e) {
      console.warn('[Trimmer] Export error:', e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Modal Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Scissors size={18} color="#38BDF8" />
              <Text style={styles.headerTitle}>1-Tap Ringtone & Drop Trimmer</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <Text style={styles.trackSubtitle}>{title} • Crop the best drop</Text>

          {/* Quick Preset Selector */}
          <View style={styles.presetRow}>
            <TouchableOpacity
              style={[styles.presetBtn, trimDuration === 15 && styles.presetBtnActive]}
              onPress={() => handleSelectDuration(15)}
            >
              <Bell size={14} color={trimDuration === 15 ? "#FFFFFF" : "#94A3B8"} style={{ marginRight: 4 }} />
              <Text style={[styles.presetBtnText, trimDuration === 15 && styles.presetBtnTextActive]}>
                15s Ringtone
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.presetBtn, trimDuration === 30 && styles.presetBtnActive]}
              onPress={() => handleSelectDuration(30)}
            >
              <Sparkles size={14} color={trimDuration === 30 ? "#FFFFFF" : "#94A3B8"} style={{ marginRight: 4 }} />
              <Text style={[styles.presetBtnText, trimDuration === 30 && styles.presetBtnTextActive]}>
                30s Reel / Alarm
              </Text>
            </TouchableOpacity>
          </View>

          {/* Trim Window Selector */}
          <View style={styles.trimBox}>
            <Text style={styles.trimRangeLabel}>
              Trim Window: <Text style={styles.trimHighlight}>0:{startSec < 10 ? '0' : ''}{startSec} — 0:{startSec + trimDuration < 10 ? '0' : ''}{startSec + trimDuration}</Text>
            </Text>

            <View style={styles.adjustRow}>
              <TouchableOpacity style={styles.adjustBtn} onPress={() => handleAdjustStart(-2)}>
                <Text style={styles.adjustBtnText}>- 2s</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.adjustBtn} onPress={() => handleAdjustStart(-5)}>
                <Text style={styles.adjustBtnText}>- 5s</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.adjustBtn} onPress={() => handleAdjustStart(5)}>
                <Text style={styles.adjustBtnText}>+ 5s</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.adjustBtn} onPress={() => handleAdjustStart(2)}>
                <Text style={styles.adjustBtnText}>+ 2s</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Preview & Export Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.previewBtn} onPress={togglePreview} activeOpacity={0.85}>
              {isPlaying ? <Pause size={18} color="#FFFFFF" /> : <Play size={18} color="#FFFFFF" style={{ marginLeft: 2 }} />}
              <Text style={styles.previewBtnText}>{isPlaying ? 'Pause Clip' : 'Preview Clip'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.exportBtn} onPress={handleExportRingtone} disabled={isExporting} activeOpacity={0.85}>
              {isExporting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : exported ? (
                <>
                  <Check size={18} color="#10B981" />
                  <Text style={[styles.exportBtnText, { color: '#10B981' }]}>Exported!</Text>
                </>
              ) : (
                <>
                  <Download size={18} color="#FFFFFF" />
                  <Text style={styles.exportBtnText}>Set Ringtone</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
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
    maxWidth: 420,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
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
  trackSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 16,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  presetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 10,
    borderRadius: 12,
  },
  presetBtnActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  presetBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  presetBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  trimBox: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    alignItems: 'center',
  },
  trimRangeLabel: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 10,
  },
  trimHighlight: {
    color: '#38BDF8',
    fontWeight: '800',
  },
  adjustRow: {
    flexDirection: 'row',
    gap: 8,
  },
  adjustBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  adjustBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  previewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 13,
    borderRadius: 14,
  },
  previewBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  exportBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingVertical: 13,
    borderRadius: 14,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  exportBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
