import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AppHeader } from "@/components/AppHeader";
import { StoryPreview } from "@/components/StoryPreview";
import { StoryTemplateCard } from "@/components/StoryTemplateCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { storyTemplates } from "@/data/mock";
import { useStoryEditorStore } from "@/store/storyEditorStore";
import { colors, radii, typography } from "@/theme";

const backgroundOptions = ["Zarif Desen", "Sade Işık", "Cami Silüeti"];
const fontOptions = ["Klasik", "Modern", "Minimal"];
const themeOptions = ["Zümrüt", "Altın", "Gece"];

export default function StoryEditorScreen() {
  const {
    selectedTemplateId,
    message,
    backgroundStyle,
    fontStyle,
    colorTheme,
    setTemplate,
    setMessage,
    setBackgroundStyle,
    setFontStyle,
    setColorTheme
  } = useStoryEditorStore();
  const selectedTemplate = storyTemplates.find((template) => template.id === selectedTemplateId) ?? storyTemplates[0];

  return (
    <ScreenContainer>
      <AppHeader title="Story Oluştur" />
      <Text style={styles.title}>Otomatik Story Formatları</Text>
      <Text style={styles.subtitle}>Sosyal medya için hazır ölçülerde zarif Cuma hikayeleri oluşturun.</Text>

      <SectionTitle title="Önizleme" />
      <StoryPreview template={selectedTemplate} message={message} />

      <SectionTitle title="Şablon Seç" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templates}>
        {storyTemplates.map((template) => (
          <StoryTemplateCard key={template.id} template={template} selected={template.id === selectedTemplateId} onPress={() => setTemplate(template.id)} />
        ))}
      </ScrollView>

      <SectionTitle title="Mesaj Metni" />
      <TextInput
        value={message}
        onChangeText={setMessage}
        multiline
        placeholder="Cuma mesajınızı yazın"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />

      <SectionTitle title="Arka Plan" />
      <View style={styles.optionRow}>
        {backgroundOptions.map((item) => (
          <Text key={item} onPress={() => setBackgroundStyle(item)} style={[styles.option, backgroundStyle === item && styles.optionSelected]}>
            {item}
          </Text>
        ))}
      </View>

      <SectionTitle title="Yazı Stili" />
      <View style={styles.optionRow}>
        {fontOptions.map((item) => (
          <Text key={item} onPress={() => setFontStyle(item)} style={[styles.option, fontStyle === item && styles.optionSelected]}>
            {item}
          </Text>
        ))}
      </View>

      <SectionTitle title="Renk Teması" />
      <View style={styles.optionRow}>
        {themeOptions.map((item) => (
          <Text key={item} onPress={() => setColorTheme(item)} style={[styles.option, colorTheme === item && styles.optionSelected]}>
            {item}
          </Text>
        ))}
      </View>

      <View style={styles.buttons}>
        <PrimaryButton label="Paylaş" icon="share-social" />
        <PrimaryButton label="Galeriye Kaydet" icon="download" tone="light" />
        <PrimaryButton label="Metni Kopyala" icon="copy" tone="light" />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.emerald,
    fontFamily: typography.title,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "900",
    marginTop: 20
  },
  subtitle: {
    color: colors.muted,
    lineHeight: 22,
    marginTop: 8
  },
  templates: {
    paddingVertical: 4
  },
  input: {
    minHeight: 112,
    borderRadius: radii.lg,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.ink,
    padding: 16,
    textAlignVertical: "top",
    fontSize: 15,
    lineHeight: 22
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.round,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.muted,
    fontWeight: "800"
  },
  optionSelected: {
    color: colors.emerald,
    backgroundColor: colors.goldSoft,
    borderColor: colors.gold
  },
  buttons: {
    gap: 10,
    marginTop: 24
  }
});
