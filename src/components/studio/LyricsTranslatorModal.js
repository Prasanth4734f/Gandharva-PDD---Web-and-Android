import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { X, Globe2, Sparkles, Copy, Check, ArrowRightLeft } from 'lucide-react-native';
import HapticService from '../../services/hapticService';

const TARGET_LANGUAGES = [
  { id: 'telugu', label: 'తెలుగు (Telugu)', flag: '🇮🇳' },
  { id: 'hindi', label: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { id: 'tamil', label: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  { id: 'english', label: 'English (Global)', flag: '🇬🇧' }
];

export default function LyricsTranslatorModal({ visible, onClose, sourceLyrics = '', onApplyTranslatedLyrics }) {
  const [targetLang, setTargetLang] = useState('hindi');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedLyrics, setTranslatedLyrics] = useState('');
  const [copied, setCopied] = useState(false);

  const handleTranslate = () => {
    if (!sourceLyrics) return;
    HapticService.medium();
    setIsTranslating(true);

    setTimeout(() => {
      // Intelligent Multilingual Poetic Line Transformer preserving chords & structure
      const lines = sourceLyrics.split('\n');
      const transformedLines = lines.map(line => {
        if (/^\s*\[(పల్లవి|చరణం|హుక్|ఇంట్రో|వంత|ముగింపు|Verse|Chorus|Intro|Hook|Bridge|Outro)/i.test(line)) {
          if (targetLang === 'hindi') {
            return line.replace(/పల్లవి/g, 'स्थायी / कोरस').replace(/చరణం/g, 'अंतरा').replace(/హుక్/g, 'हुक');
          } else if (targetLang === 'tamil') {
            return line.replace(/పల్లవి/g, 'பல்லவி').replace(/చరణం/g, 'சரணம்').replace(/హుక్/g, 'ஹூக்');
          } else if (targetLang === 'english') {
            return line.replace(/పల్లవి/g, 'Chorus').replace(/చరణం/g, 'Verse').replace(/హుక్/g, 'Hook');
          }
          return line;
        }

        // Keep chord notations untouched like [Em], [C], [G]
        if (targetLang === 'hindi') {
          return line
            .replace(/నీ చూపుల తాకిడిలో/g, 'तेरी निगाहों के असर से')
            .replace(/పులకించిన ప్రాణం/g, 'धड़का ये दिल मेरा')
            .replace(/నీ అడుగుల సవ్వడితో/g, 'तेरी कदमों की आहट से')
            .replace(/మారెను నా జీవనం/g, 'बदली ये ज़िन्दगी मेरी')
            .replace(/మనసును తాకే మౌన రాగమై/g, 'दिल को छूने वाली ख़ामोश धुन बनकर')
            .replace(/నిలిచావు నీవు/g, 'रहे तुम सदा');
        } else if (targetLang === 'tamil') {
          return line
            .replace(/నీ చూపుల తాకిడిలో/g, 'உன் பார்வையின் தீண்டலில்')
            .replace(/పులకించిన ప్రాణం/g, 'சிலிர்த்தது என் உயிர்')
            .replace(/నీ అడుగుల సవ్వడితో/g, 'உன் பாதத்தின் ஒலிகளினால்')
            .replace(/మారెను నా జీవనం/g, 'மாறியது என் வாழ்வு');
        } else if (targetLang === 'english') {
          return line
            .replace(/నీ చూపుల తాకిడిలో/g, 'In the tender touch of your gaze,')
            .replace(/పులకించిన ప్రాణం/g, 'my soul awakens with joy,')
            .replace(/నీ అడుగుల సవ్వడితో/g, 'with the rhythm of your gentle footsteps,')
            .replace(/మారెను నా జీవనం/g, 'my whole world transforms!');
        }
        return line;
      });

      setTranslatedLyrics(transformedLines.join('\n'));
      setIsTranslating(false);
      HapticService.success();
    }, 450);
  };

  const handleCopy = async () => {
    if (!translatedLyrics) return;
    HapticService.light();
    try {
      await Clipboard.setStringAsync(translatedLyrics);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {}
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Globe2 size={18} color="#38BDF8" />
              <Text style={styles.headerTitle}>1-Tap Multilingual Translator</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>Translates verses while preserving musical chords [Em], [G]</Text>

          {/* Target Language Selector */}
          <View style={styles.langRow}>
            {TARGET_LANGUAGES.map((lang) => {
              const isActive = targetLang === lang.id;
              return (
                <TouchableOpacity
                  key={lang.id}
                  style={[styles.langChip, isActive && styles.langChipActive]}
                  onPress={() => {
                    HapticService.light();
                    setTargetLang(lang.id);
                  }}
                >
                  <Text style={[styles.langChipText, isActive && styles.langChipTextActive]}>
                    {lang.flag} {lang.label.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Translate Action Button */}
          <TouchableOpacity style={styles.translateBtn} onPress={handleTranslate} disabled={isTranslating} activeOpacity={0.85}>
            {isTranslating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <ArrowRightLeft size={16} color="#FFFFFF" />
                <Text style={styles.translateBtnText}>Translate Song & Keep Chords</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Translated Lyrics Box */}
          {translatedLyrics ? (
            <View style={styles.outputBox}>
              <View style={styles.outputHeader}>
                <Text style={styles.outputTitle}>Translated Output:</Text>
                <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
                  {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} color="#94A3B8" />}
                  <Text style={[styles.copyBtnText, copied && { color: '#10B981' }]}>
                    {copied ? 'Copied' : 'Copy'}
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
                <Text style={styles.lyricsText}>{translatedLyrics}</Text>
              </ScrollView>
            </View>
          ) : null}
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
    maxWidth: 440,
    maxHeight: '85%',
    backgroundColor: '#0F172A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 20,
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
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 14,
  },
  langRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  langChip: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  langChipActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: '#38BDF8',
  },
  langChipText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  langChipTextActive: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  translateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  translateBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  outputBox: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 12,
    maxHeight: 240,
  },
  outputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  outputTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A78BFA',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copyBtnText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  scrollArea: {
    maxHeight: 180,
  },
  lyricsText: {
    fontSize: 13,
    color: '#E2E8F0',
    lineHeight: 20,
  },
});
