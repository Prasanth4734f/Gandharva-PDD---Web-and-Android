import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sliders, Sparkles, Radio, Zap, Volume2 } from 'lucide-react-native';
import HapticService from '../../services/hapticService';

/**
 * MasterFxFilterBar
 * 1-Tap Studio Audio Post-Processing Presets:
 * - 💥 Bass Maximizer (+6dB Sub-Bass Punch)
 * - 🌌 3D Spatial Stereo (Wide Binaural Immersion)
 * - 📻 Vintage Vinyl / Lo-Fi (Warm Analog Saturation)
 * - 🎙️ Vocal Clarity (Mid-Range Presence Boost)
 */
export default function MasterFxFilterBar({ onFxChange }) {
  const [activeFx, setActiveFx] = useState('none');

  const FX_PRESETS = [
    { id: 'none', label: 'Flat Master', icon: Volume2, color: '#94A3B8', desc: 'Raw Studio Master' },
    { id: 'bass_boost', label: '💥 Bass Boost', icon: Zap, color: '#F59E0B', desc: '+6dB 808 Sub-Bass Punch' },
    { id: 'spatial_3d', label: '🌌 3D Spatial', icon: Sparkles, color: '#38BDF8', desc: 'Binaural Stereo Width' },
    { id: 'vintage_lofi', label: '📻 Lo-Fi Tape', icon: Radio, color: '#EC4899', desc: 'Warm Analog Saturation' },
  ];

  const handleSelectFx = (id) => {
    HapticService.medium();
    const newFx = activeFx === id ? 'none' : id;
    setActiveFx(newFx);
    if (onFxChange) onFxChange(newFx);
  };

  const selectedPreset = FX_PRESETS.find(f => f.id === activeFx);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Sliders size={14} color="#38BDF8" />
          <Text style={styles.headerTitle}>Studio Master FX</Text>
        </View>
        {selectedPreset && (
          <Text style={styles.activeDescText}>{selectedPreset.desc}</Text>
        )}
      </View>

      <View style={styles.pillRow}>
        {FX_PRESETS.map((preset) => {
          const isActive = activeFx === preset.id;
          const Icon = preset.icon;

          return (
            <TouchableOpacity
              key={preset.id}
              style={[
                styles.fxPill,
                isActive && { borderColor: preset.color, backgroundColor: `${preset.color}1A` }
              ]}
              onPress={() => handleSelectFx(preset.id)}
              activeOpacity={0.75}
            >
              <Icon size={12} color={isActive ? preset.color : '#94A3B8'} style={{ marginRight: 4 }} />
              <Text style={[styles.fxPillText, isActive && { color: preset.color, fontWeight: '700' }]}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 12,
    marginVertical: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  activeDescText: {
    fontSize: 11,
    color: '#38BDF8',
    fontStyle: 'italic',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  fxPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  fxPillText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
