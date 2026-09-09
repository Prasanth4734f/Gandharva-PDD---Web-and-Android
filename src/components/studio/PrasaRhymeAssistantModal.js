import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { X, Search, Sparkles, Copy, Check, BookOpen } from 'lucide-react-native';
import HapticService from '../../services/hapticService';

/**
 * Classical Prasa & Rhyme Dictionary in native scripts
 */
const PRASA_DATABASE = {
  // TELUGU PRASA & ANUPRASA
  'ప్రేమ': ['సీమ', 'క్షేమ', 'ధామ', 'నేమ', 'గరిమ', 'మహిమ', 'తరమ'],
  'కాలం': ['తీరం', 'దూరం', 'నేరం', 'హారం', 'ద్వారం', 'సారం', 'భారం'],
  'వెన్నెల': ['కన్నుల', 'కలల', 'రేయిల', 'చేయిల', 'తీగల', 'పువ్వుల'],
  'గాలి': ['దోలి', 'కేళి', 'ధూళి', 'జాబిలి', 'మౌళి', 'కౌగిలి'],
  'రాత్రి': ['నేత్రి', 'గాత్రి', 'ధాత్రి', 'స్నేహితి', 'జ్యోతి'],
  'మనసు': ['కలలు', 'తపస్సు', 'వయసు', 'సొగసు', 'తెలుసు', 'మెరుపు'],
  'బాధ': ['గాధ', 'రాధ', 'బాట', 'మాట', 'వేదన', 'రోదన'],
  'విజయం': ['హృదయం', 'ఉదయం', 'సమయం', 'పయనం', 'నయనం', 'గానం'],

  // HINDI TUKBANDI & RHYMES
  'दिल': ['मंज़िल', 'महफ़िल', 'साहिल', 'क़ाबिल', 'शामिल', 'हासिल'],
  'याद': ['फ़रियाद', 'आबाद', 'बर्बाद', 'साद', 'इमदाद', 'नाशाद'],
  'रात': ['बात', 'मुलाक़ात', 'बरसात', 'सौगात', 'जज़्बात', 'हालात'],
  'सफ़र': ['नज़र', 'असर', 'सहर', 'लहर', 'शहर', 'क़मर'],
  'ख्वाब': ['जवाब', 'गुलाब', 'हिसाब', 'शबाब', 'आफ़ताब'],

  // TAMIL EDHUGAI & MONAI
  'காதல்': ['பாடல்', 'ஆடல்', 'கூடல்', 'தேடல்', 'நாடல்'],
  'நிலவு': ['கனவு', 'வரவு', 'உறவு', 'நினைவு', 'மறைவு'],
  'வானம்': ['கானம்', 'ஞானம்', 'தானம்', 'மானம்', 'மோனம்']
};

export default function PrasaRhymeAssistantModal({ visible, onClose, onSelectRhyme }) {
  const [searchTerm, setSearchTerm] = useState('ప్రేమ');
  const [copiedWord, setCopiedWord] = useState(null);

  const getRhymes = (term) => {
    if (!term) return [];
    const clean = term.trim();
    if (PRASA_DATABASE[clean]) return PRASA_DATABASE[clean];

    // Fuzzy matching
    for (const key in PRASA_DATABASE) {
      if (clean.includes(key) || key.includes(clean)) {
        return PRASA_DATABASE[key];
      }
    }

    // Default rich sample
    return ['తీరం', 'దూరం', 'హారం', 'ద్వారం', 'సమయం', 'హృదయం'];
  };

  const handleCopyRhyme = async (word) => {
    HapticService.light();
    try {
      await Clipboard.setStringAsync(word);
      setCopiedWord(word);
      if (onSelectRhyme) onSelectRhyme(word);
      setTimeout(() => setCopiedWord(null), 2000);
    } catch (e) {}
  };

  const rhymes = getRhymes(searchTerm);

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <BookOpen size={18} color="#A78BFA" />
              <Text style={styles.title}>Prasa & Rhyme Assistant</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>Classical Telugu, Hindi & Tamil Poetic Rhyme Engine</Text>

          {/* Search Box */}
          <View style={styles.searchBox}>
            <Search size={16} color="#94A3B8" />
            <TextInput
              style={styles.input}
              placeholder="Search word (e.g. ప్రేమ, కాలం, दिल, रात, காதல்)"
              placeholderTextColor="#64748B"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>

          {/* Quick Preset Words */}
          <View style={styles.presetChips}>
            {['ప్రేమ', 'కాలం', 'వెన్నెల', 'విజయం', 'दिल', 'रात', 'காதல்'].map((w) => (
              <TouchableOpacity
                key={w}
                style={[styles.chip, searchTerm === w && styles.chipActive]}
                onPress={() => {
                  HapticService.light();
                  setSearchTerm(w);
                }}
              >
                <Text style={[styles.chipText, searchTerm === w && styles.chipTextActive]}>{w}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Results Grid */}
          <Text style={styles.resultsLabel}>Matching Poetic Prasa & Synonyms (ప్రాస పదాలు):</Text>
          <ScrollView style={styles.resultsScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.rhymesGrid}>
              {rhymes.map((word, idx) => {
                const isCopied = copiedWord === word;
                return (
                  <TouchableOpacity
                    key={`rhyme-${idx}`}
                    style={[styles.rhymeBadge, isCopied && styles.rhymeBadgeCopied]}
                    onPress={() => handleCopyRhyme(word)}
                    activeOpacity={0.75}
                  >
                    <Sparkles size={12} color={isCopied ? "#10B981" : "#A78BFA"} style={{ marginRight: 6 }} />
                    <Text style={[styles.rhymeWord, isCopied && { color: '#10B981' }]}>{word}</Text>
                    {isCopied ? (
                      <Check size={12} color="#10B981" style={{ marginLeft: 6 }} />
                    ) : (
                      <Copy size={12} color="#64748B" style={{ marginLeft: 6 }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
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
    maxHeight: '80%',
    backgroundColor: '#0F172A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 20,
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
    padding: 0,
  },
  presetChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 12,
  },
  chip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipActive: {
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    borderColor: '#A78BFA',
  },
  chipText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  chipTextActive: {
    color: '#C4B5FD',
    fontWeight: '700',
  },
  resultsLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 10,
    fontWeight: '600',
  },
  resultsScroll: {
    maxHeight: 220,
  },
  rhymesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rhymeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  rhymeBadgeCopied: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  rhymeWord: {
    fontSize: 14,
    color: '#F1F5F9',
    fontWeight: '600',
  },
});
