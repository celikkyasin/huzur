import { useState } from "react";
import { Image, LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View, type ImageSourcePropType } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { prayerPreparation, prayerRakats, prayerReadings, prayerSteps, type PrayerStep } from "@/data/prayerGuide";
import { colors, radii, typography } from "@/theme";

type PostureId = "takbir" | "kiyam" | "ruku" | "secde" | "oturus" | "selam";
type PrayerId = "sabah" | "ogle" | "ikindi" | "aksam" | "yatsi";

type PrayerGuide = {
  title: string;
  summary: string;
  sections: Array<{
    title: string;
    rakats: string;
    detail: string;
    steps: string[];
  }>;
};

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const postureByStep: Record<string, PostureId> = {
  niyet: "takbir",
  kiyam: "kiyam",
  ruku: "ruku",
  secde: "secde",
  oturus: "oturus",
  selam: "selam"
};

const postureImages: Record<PostureId, ImageSourcePropType> = {
  takbir: require("../assets/prayer/takbir.png"),
  kiyam: require("../assets/prayer/kiyam.png"),
  ruku: require("../assets/prayer/ruku.png"),
  secde: require("../assets/prayer/secde.png"),
  oturus: require("../assets/prayer/oturus.png"),
  selam: require("../assets/prayer/selam.png")
};

const prayerGuides: Record<PrayerId, PrayerGuide> = {
  sabah: {
    title: "Sabah Namazı",
    summary: "Önce 2 rekat sünnet, ardından 2 rekat farz kılınır. Her iki namaz da iki rekatlı olduğu için ikinci rekat sonunda son oturuşla tamamlanır.",
    sections: [
      {
        title: "Sabahın Sünneti",
        rakats: "2 rekat",
        detail: "Niyet edilir, iki rekat kılınır ve ikinci rekat sonunda Ettehiyyatü, Salli, Barik ve Rabbena duaları okunarak selam verilir.",
        steps: ["1. rekatta Sübhaneke, Fatiha ve zamm-ı sure okunur.", "Rükû ve iki secdeden sonra ikinci rekata kalkılır.", "2. rekatta Fatiha ve zamm-ı sure okunur.", "Son oturuşta dualar okunur ve selam verilir."]
      },
      {
        title: "Sabahın Farzı",
        rakats: "2 rekat",
        detail: "Sünnetten sonra farz için niyet edilir. Kılınışı iki rekatlı namaz düzenindedir.",
        steps: ["1. rekatta Fatiha ve zamm-ı sure okunur.", "Rükû ve secdelerden sonra ikinci rekata kalkılır.", "2. rekatta Fatiha ve zamm-ı sure okunur.", "Son oturuşta dualar okunur ve selam verilir."]
      }
    ]
  },
  ogle: {
    title: "Öğle Namazı",
    summary: "4 rekat ilk sünnet, 4 rekat farz ve 2 rekat son sünnet olarak kılınır.",
    sections: [
      {
        title: "İlk Sünnet",
        rakats: "4 rekat",
        detail: "Dört rekatlı sünnettir. İkinci rekat sonunda ara oturuş yapılır, dördüncü rekat sonunda son oturuşla tamamlanır.",
        steps: ["İlk iki rekatta Fatiha ve zamm-ı sure okunur.", "Ara oturuşta Ettehiyyatü okunur.", "Üçüncü ve dördüncü rekatta Fatiha ve zamm-ı sure okunur.", "Son oturuşta salavatlar ve Rabbena duaları okunur."]
      },
      {
        title: "Farz",
        rakats: "4 rekat",
        detail: "Öğlenin farzı dört rekattır. İlk iki rekatta Fatiha'dan sonra zamm-ı sure okunur; son iki rekatta Fatiha okunur.",
        steps: ["1. ve 2. rekatta Fatiha ve zamm-ı sure okunur.", "2. rekat sonunda ara oturuş yapılır.", "3. ve 4. rekatta Fatiha okunur.", "Son oturuşta dualar okunur ve selam verilir."]
      },
      {
        title: "Son Sünnet",
        rakats: "2 rekat",
        detail: "İki rekatlı sünnet olarak kılınır ve ikinci rekat sonunda selam verilir.",
        steps: ["Her iki rekatta Fatiha ve zamm-ı sure okunur.", "İkinci rekat sonunda Ettehiyyatü, Salli, Barik ve Rabbena duaları okunur.", "Sağa ve sola selam verilerek tamamlanır."]
      }
    ]
  },
  ikindi: {
    title: "İkindi Namazı",
    summary: "4 rekat sünnet ve 4 rekat farz olarak kılınır.",
    sections: [
      {
        title: "İkindinin Sünneti",
        rakats: "4 rekat",
        detail: "İlk oturuşta Ettehiyyatü ile birlikte Salli ve Barik okunur. Üçüncü rekata kalkınca Sübhaneke ile başlanır.",
        steps: ["1. ve 2. rekatta Fatiha ve zamm-ı sure okunur.", "Ara oturuşta Ettehiyyatü, Salli ve Barik okunur.", "3. rekata Sübhaneke ile başlanır.", "Dördüncü rekat sonunda son oturuş ve selam yapılır."]
      },
      {
        title: "İkindinin Farzı",
        rakats: "4 rekat",
        detail: "Dört rekat farzdır. İlk iki rekatta zamm-ı sure okunur, son iki rekatta Fatiha okunur.",
        steps: ["İlk iki rekatta Fatiha ve zamm-ı sure okunur.", "İkinci rekat sonunda ara oturuş yapılır.", "Son iki rekatta Fatiha okunur.", "Son oturuşta dualar okunup selam verilir."]
      }
    ]
  },
  aksam: {
    title: "Akşam Namazı",
    summary: "3 rekat farz ve 2 rekat sünnet olarak kılınır.",
    sections: [
      {
        title: "Akşamın Farzı",
        rakats: "3 rekat",
        detail: "Üç rekat farzdır. İkinci rekat sonunda ara oturuş yapılır, üçüncü rekat sonunda son oturuşla tamamlanır.",
        steps: ["İlk iki rekatta Fatiha ve zamm-ı sure okunur.", "İkinci rekat sonunda Ettehiyyatü okunur.", "Üçüncü rekatta Fatiha okunur.", "Son oturuşta dualar okunur ve selam verilir."]
      },
      {
        title: "Akşamın Sünneti",
        rakats: "2 rekat",
        detail: "İki rekatlı sünnet olarak kılınır.",
        steps: ["Her iki rekatta Fatiha ve zamm-ı sure okunur.", "İkinci rekat sonunda son oturuş yapılır.", "Dualar okunur ve selam verilir."]
      }
    ]
  },
  yatsi: {
    title: "Yatsı Namazı",
    summary: "4 rekat ilk sünnet, 4 rekat farz, 2 rekat son sünnet ve 3 rekat vitir olarak kılınır.",
    sections: [
      {
        title: "İlk Sünnet",
        rakats: "4 rekat",
        detail: "Dört rekatlı sünnet düzenindedir. Ara oturuş ve son oturuş bulunur.",
        steps: ["İlk iki rekatta Fatiha ve zamm-ı sure okunur.", "Ara oturuşta Ettehiyyatü okunur.", "Üçüncü ve dördüncü rekatta Fatiha ve zamm-ı sure okunur.", "Son oturuşla tamamlanır."]
      },
      {
        title: "Farz",
        rakats: "4 rekat",
        detail: "Dört rekat farzdır. İlk iki rekatta zamm-ı sure, son iki rekatta Fatiha okunur.",
        steps: ["İlk iki rekatta Fatiha ve zamm-ı sure okunur.", "İkinci rekat sonunda ara oturuş yapılır.", "Son iki rekatta Fatiha okunur.", "Son oturuşta dualar okunup selam verilir."]
      },
      {
        title: "Son Sünnet ve Vitir",
        rakats: "2 + 3 rekat",
        detail: "Son sünnet iki rekat olarak kılınır. Vitir namazının üçüncü rekatında tekbir alınarak Kunut duaları okunur.",
        steps: ["Son sünnet iki rekatlı namaz düzenindedir.", "Vitirde ilk iki rekatta Fatiha ve zamm-ı sure okunur.", "Üçüncü rekatta Fatiha ve zamm-ı sureden sonra tekbir alınır.", "Kunut duaları okunur, rükû ve secdelerden sonra son oturuşla tamamlanır."]
      }
    ]
  }
};

const baseRakatFlow = [
  { title: "1. Rekat", detail: "Niyet, iftitah tekbiri, Sübhaneke, Euzü Besmele, Fatiha, zamm-ı sure, rükû ve iki secde." },
  { title: "2. Rekat", detail: "Besmele, Fatiha, zamm-ı sure, rükû, iki secde ve oturuş. İki rekatlı namaz burada son oturuşla tamamlanır." },
  { title: "3. Rekat", detail: "Üç veya dört rekatlı namazlarda ayağa kalkılır. Farzlarda Fatiha okunur; sünnetlerde Fatiha ile zamm-ı sure okunur." },
  { title: "Son Rekat", detail: "Fatiha, gerekli yerde zamm-ı sure, rükû ve secdelerden sonra son oturuş yapılır; dualar okunup selam verilir." }
];

function PrayerPoseImage({ posture, compact = false }: { posture: PostureId; compact?: boolean }) {
  return (
    <View style={[styles.poseFrame, compact && styles.poseFrameCompact]}>
      <Image source={postureImages[posture]} style={styles.poseImage} resizeMode="cover" />
    </View>
  );
}

function StepVisual({ step, index }: { step: PrayerStep; index: number }) {
  return (
    <View style={styles.stepVisual}>
      <Text style={styles.stepNumber}>{index + 1}</Text>
      <PrayerPoseImage posture={postureByStep[step.id] ?? "kiyam"} />
      <Text style={styles.stepPosture}>{step.posture}</Text>
    </View>
  );
}

function PrayerDetailCard({ guide }: { guide: PrayerGuide }) {
  return (
    <Card style={styles.selectedPrayerCard}>
      <View style={styles.selectedPrayerHeader}>
        <View>
          <Text style={styles.selectedKicker}>Seçilen vakit</Text>
          <Text style={styles.selectedPrayerTitle}>{guide.title}</Text>
        </View>
        <View style={styles.selectedBadge}>
          <Ionicons name="book" size={20} color={colors.emerald} />
        </View>
      </View>
      <Text style={styles.selectedSummary}>{guide.summary}</Text>
      {guide.sections.map((section) => (
        <View key={section.title} style={styles.prayerPart}>
          <View style={styles.prayerPartVisual}>
            <PrayerPoseImage posture="kiyam" compact />
            <PrayerPoseImage posture="ruku" compact />
            <PrayerPoseImage posture="secde" compact />
            <PrayerPoseImage posture="oturus" compact />
            <PrayerPoseImage posture="selam" compact />
          </View>
          <View style={styles.prayerPartHeader}>
            <Text style={styles.prayerPartTitle}>{section.title}</Text>
            <Text style={styles.prayerPartRakat}>{section.rakats}</Text>
          </View>
          <Text style={styles.prayerPartDetail}>{section.detail}</Text>
          {section.steps.map((step) => (
            <View key={step} style={styles.prayerStepRow}>
              <View style={styles.smallDot} />
              <Text style={styles.prayerStepText}>{step}</Text>
            </View>
          ))}
        </View>
      ))}
    </Card>
  );
}

export default function NamazScreen() {
  const [selectedPrayerId, setSelectedPrayerId] = useState<PrayerId>("sabah");
  const [openPrayerIds, setOpenPrayerIds] = useState<PrayerId[]>(["sabah"]);
  const selectedPrayer = prayerGuides[selectedPrayerId];
  const selectedRakatFlow = selectedPrayer.sections.map((section) => ({
    title: `${section.title} (${section.rakats})`,
    detail: section.detail
  }));

  const togglePrayer = (id: PrayerId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedPrayerId(id);
    setOpenPrayerIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  return (
    <ScreenContainer>
      <AppHeader />
      <View style={styles.heading}>
        <Text style={styles.title}>Namaz Rehberi</Text>
        <Text style={styles.subtitle}>Vakitler, rekatlar, kılınış adımları ve namazda okunacak sureler.</Text>
      </View>

      <Card variant="emerald" style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroTitleWrap}>
            <Text style={styles.heroKicker}>Günlük ibadet rehberi</Text>
            <Text style={styles.heroTitle}>Namazı adım adım öğren</Text>
          </View>
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={20} color={colors.gold} />
          </View>
        </View>
        <Text style={styles.heroText}>Her vakit için rekat bilgisi, görsel hareket anlatımı ve namaz içinde okunacak dualar tek ekranda düzenli şekilde hazırlandı.</Text>
      </Card>

      <SectionTitle title="Namaza Hazırlık Yap" />
      <Card style={styles.preparationCard}>
        {prayerPreparation.map((item, index) => (
          <View key={item} style={[styles.checkRow, index !== prayerPreparation.length - 1 && styles.checkBorder]}>
            <View style={styles.checkIcon}>
              <Ionicons name="checkmark" size={16} color={colors.emerald} />
            </View>
            <Text style={styles.checkText}>{item}</Text>
          </View>
        ))}
      </Card>

      <SectionTitle title="Namaz Bölümleri" />
      <View style={styles.accordionList}>
        {prayerRakats.map((item) => {
          const prayerId = item.id as PrayerId;
          const isOpen = openPrayerIds.includes(prayerId);
          const guide = prayerGuides[prayerId];

          return (
            <View key={item.id} style={styles.accordionItem}>
              <Pressable accessibilityRole="button" accessibilityLabel={`${guide.title} bölümünü aç veya kapat`} onPress={() => togglePrayer(prayerId)} style={({ pressed }) => pressed && styles.pressedCard}>
                <Card style={[styles.rakatCard, isOpen && styles.rakatCardSelected]}>
                  <View style={styles.rakatHeader}>
                    <View style={styles.rakatTitleWrap}>
                      <Text style={[styles.rakatName, isOpen && styles.rakatNameSelected]}>{guide.title}</Text>
                      <Text style={[styles.rakatDetail, isOpen && styles.rakatDetailSelected]}>{item.detail}</Text>
                    </View>
                    <View style={[styles.rakatAction, isOpen && styles.rakatActionSelected]}>
                      <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={18} color={isOpen ? colors.white : colors.emerald} />
                    </View>
                  </View>
                  <Text style={[styles.rakatNote, isOpen && styles.rakatNoteSelected]}>{item.note}</Text>
                </Card>
              </Pressable>
              {isOpen ? <PrayerDetailCard guide={guide} /> : null}
            </View>
          );
        })}
      </View>

      <SectionTitle title={`${selectedPrayer.title} Nasıl Kılınır`} />
      <View style={styles.stepsWrap}>
        {prayerSteps.map((step, index) => (
          <Card key={step.id} style={styles.stepCard}>
            <StepVisual step={step} index={index} />
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepReading}>{step.reading}</Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>
          </Card>
        ))}
      </View>

      <SectionTitle title={`${selectedPrayer.title} Rekat Akışı`} />
      <Card style={styles.flowCard}>
        {selectedRakatFlow.map((item, index) => (
          <View key={item.title} style={[styles.flowRow, index !== selectedRakatFlow.length - 1 && styles.flowBorder]}>
            <View style={styles.flowDot}>
              <Text style={styles.flowNumber}>{index + 1}</Text>
            </View>
            <View style={styles.flowTextWrap}>
              <Text style={styles.flowTitle}>{item.title}</Text>
              <Text style={styles.flowDetail}>{item.detail}</Text>
            </View>
          </View>
        ))}
      </Card>

      <SectionTitle title="Temel Rekat Akışı" />
      <Card style={styles.flowCard}>
        {baseRakatFlow.map((item, index) => (
          <View key={item.title} style={[styles.flowRow, index !== baseRakatFlow.length - 1 && styles.flowBorder]}>
            <View style={styles.flowDot}>
              <Text style={styles.flowNumber}>{index + 1}</Text>
            </View>
            <View style={styles.flowTextWrap}>
              <Text style={styles.flowTitle}>{item.title}</Text>
              <Text style={styles.flowDetail}>{item.detail}</Text>
            </View>
          </View>
        ))}
      </Card>

      <SectionTitle title="Namazda Okunacak Sure ve Dualar" />
      {prayerReadings.map((item) => (
        <Card key={item.id} style={styles.readingCard}>
          <View style={styles.readingHeader}>
            <View style={styles.readingTitleWrap}>
              <Text style={styles.readingTitle}>{item.title}</Text>
              <Text style={styles.readingPlace}>{item.place}</Text>
            </View>
            <View style={styles.readingIcon}>
              <Ionicons name="book" size={18} color={colors.emerald} />
            </View>
          </View>
          <View style={styles.goldLine} />
          <Text style={styles.readingLabel}>Okunuşu</Text>
          <Text style={styles.transliteration}>{item.transliteration}</Text>
          <Text style={styles.readingLabel}>Anlamı</Text>
          <Text style={styles.meaning}>{item.meaning}</Text>
        </Card>
      ))}

      <Card variant="soft" style={styles.noteCard}>
        <Ionicons name="information-circle" size={22} color={colors.emerald} />
        <Text style={styles.noteText}>Bu rehber temel öğrenme içindir. Mezhep ve uygulama farklılıklarında güvenilir ilmihal kaynaklarından veya yetkili din görevlilerinden destek alabilirsiniz.</Text>
      </Card>

      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={18} color={colors.emerald} />
        <Text style={styles.backText}>Geri Dön</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heading: {
    marginTop: 18,
    marginBottom: 18
  },
  title: {
    fontFamily: typography.title,
    color: colors.emerald,
    fontSize: 34,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.muted,
    marginTop: 6,
    fontSize: 14,
    lineHeight: 21
  },
  hero: {
    overflow: "hidden",
    marginBottom: 22
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14
  },
  heroTitleWrap: {
    flex: 1
  },
  heroKicker: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "800"
  },
  heroTitle: {
    color: colors.white,
    fontFamily: typography.title,
    fontSize: 26,
    fontWeight: "900",
    marginTop: 5
  },
  heroBadge: {
    width: 44,
    height: 44,
    borderRadius: radii.round,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  heroText: {
    color: "rgba(255,255,255,0.84)",
    lineHeight: 21,
    marginTop: 14,
    fontSize: 14
  },
  preparationCard: {
    marginBottom: 22
  },
  checkRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    alignItems: "flex-start"
  },
  checkBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.line
  },
  checkIcon: {
    width: 26,
    height: 26,
    borderRadius: radii.round,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1
  },
  checkText: {
    flex: 1,
    color: colors.ink,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700"
  },
  accordionList: {
    gap: 12,
    marginBottom: 22
  },
  accordionItem: {
    gap: 0
  },
  rakatTitleWrap: {
    flex: 1,
    minWidth: 0
  },
  prayerTabs: {
    gap: 10,
    paddingRight: 20,
    paddingBottom: 12
  },
  prayerTab: {
    width: 168,
    minHeight: 102,
    borderRadius: radii.lg,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    justifyContent: "space-between"
  },
  prayerTabSelected: {
    backgroundColor: colors.emerald,
    borderColor: colors.emerald
  },
  prayerTabName: {
    color: colors.emerald,
    fontFamily: typography.title,
    fontSize: 22,
    fontWeight: "900"
  },
  prayerTabNameSelected: {
    color: colors.white
  },
  prayerTabDetail: {
    color: colors.muted,
    marginTop: 8,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800"
  },
  prayerTabDetailSelected: {
    color: "rgba(255,255,255,0.78)"
  },
  rakatCard: {
    padding: 16
  },
  rakatCardSelected: {
    backgroundColor: colors.emerald,
    borderColor: colors.emerald
  },
  rakatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  rakatName: {
    color: colors.emerald,
    fontFamily: typography.title,
    fontSize: 22,
    fontWeight: "900"
  },
  rakatNameSelected: {
    color: colors.white
  },
  rakatAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: radii.round,
    backgroundColor: colors.emeraldSoft,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  rakatActionSelected: {
    backgroundColor: "rgba(255,255,255,0.16)"
  },
  rakatActionText: {
    color: colors.emerald,
    fontSize: 11,
    fontWeight: "900"
  },
  rakatActionTextSelected: {
    color: colors.white
  },
  rakatDetail: {
    color: colors.ink,
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "900"
  },
  rakatDetailSelected: {
    color: colors.white
  },
  rakatNote: {
    color: colors.muted,
    marginTop: 7,
    fontSize: 12,
    lineHeight: 18
  },
  rakatNoteSelected: {
    color: "rgba(255,255,255,0.76)"
  },
  pressedCard: {
    opacity: 0.78
  },
  selectedPrayerCard: {
    marginBottom: 22,
    paddingTop: 22,
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md
  },
  selectedPrayerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  selectedKicker: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  selectedPrayerTitle: {
    color: colors.ink,
    fontFamily: typography.title,
    fontSize: 26,
    fontWeight: "900",
    marginTop: 4
  },
  selectedBadge: {
    width: 42,
    height: 42,
    borderRadius: radii.round,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  selectedSummary: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
    fontWeight: "700"
  },
  prayerPart: {
    borderRadius: radii.lg,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    marginTop: 14
  },
  prayerPartVisual: {
    minHeight: 78,
    borderRadius: radii.md,
    backgroundColor: colors.emeraldSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 12,
    paddingHorizontal: 6
  },
  prayerPartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  prayerPartTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900",
    flex: 1
  },
  prayerPartRakat: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: "900",
    backgroundColor: colors.goldSoft,
    borderRadius: radii.round,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  prayerPartDetail: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8
  },
  prayerStepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    marginTop: 9
  },
  smallDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.gold,
    marginTop: 6
  },
  prayerStepText: {
    flex: 1,
    color: colors.ink,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700"
  },
  stepsWrap: {
    gap: 12,
    marginBottom: 22
  },
  stepCard: {
    flexDirection: "row",
    gap: 14,
    padding: 15
  },
  stepVisual: {
    width: 112,
    minHeight: 146,
    borderRadius: radii.lg,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 8
  },
  stepNumber: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: "900"
  },
  poseFrame: {
    width: 90,
    height: 82,
    marginVertical: 6,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(7,94,71,0.14)",
    backgroundColor: colors.white,
    overflow: "hidden"
  },
  poseFrameCompact: {
    width: 50,
    height: 54,
    marginVertical: 0,
    borderRadius: radii.sm
  },
  poseImage: {
    width: "100%",
    height: "100%"
  },
  stepPosture: {
    color: colors.emerald,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
    paddingHorizontal: 4
  },
  stepBody: {
    flex: 1
  },
  stepTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900"
  },
  stepReading: {
    color: colors.emerald,
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "800"
  },
  stepDescription: {
    color: colors.muted,
    marginTop: 7,
    fontSize: 12,
    lineHeight: 18
  },
  flowCard: {
    marginBottom: 22
  },
  flowRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 13
  },
  flowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.line
  },
  flowDot: {
    width: 30,
    height: 30,
    borderRadius: radii.round,
    backgroundColor: colors.goldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  flowNumber: {
    color: colors.emerald,
    fontWeight: "900"
  },
  flowTextWrap: {
    flex: 1
  },
  flowTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900"
  },
  flowDetail: {
    color: colors.muted,
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18
  },
  readingCard: {
    marginBottom: 12
  },
  readingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14
  },
  readingTitleWrap: {
    flex: 1
  },
  readingTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  readingPlace: {
    color: colors.muted,
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17
  },
  readingIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.round,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  goldLine: {
    width: 64,
    height: 3,
    borderRadius: 3,
    backgroundColor: colors.gold,
    marginVertical: 14
  },
  readingLabel: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    marginTop: 8,
    marginBottom: 5
  },
  transliteration: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "800"
  },
  meaning: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20
  },
  noteCard: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8
  },
  noteText: {
    flex: 1,
    color: colors.emerald,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800"
  },
  backButton: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radii.round,
    backgroundColor: colors.emeraldSoft
  },
  backText: {
    color: colors.emerald,
    fontWeight: "900"
  }
});
