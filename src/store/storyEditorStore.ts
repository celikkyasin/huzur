import { create } from "zustand";
import { storyTemplates } from "@/data/mock";

type StoryEditorState = {
  selectedTemplateId: string;
  message: string;
  backgroundStyle: string;
  fontStyle: string;
  colorTheme: string;
  setTemplate: (templateId: string) => void;
  setMessage: (message: string) => void;
  setBackgroundStyle: (backgroundStyle: string) => void;
  setFontStyle: (fontStyle: string) => void;
  setColorTheme: (colorTheme: string) => void;
};

const firstTemplate = storyTemplates[0];

export const useStoryEditorStore = create<StoryEditorState>((set) => ({
  selectedTemplateId: firstTemplate.id,
  message: firstTemplate.message,
  backgroundStyle: "Zarif Desen",
  fontStyle: "Klasik",
  colorTheme: "Zümrüt",
  setTemplate: (templateId) => {
    const template = storyTemplates.find((item) => item.id === templateId) ?? firstTemplate;
    set({ selectedTemplateId: template.id, message: template.message });
  },
  setMessage: (message) => set({ message }),
  setBackgroundStyle: (backgroundStyle) => set({ backgroundStyle }),
  setFontStyle: (fontStyle) => set({ fontStyle }),
  setColorTheme: (colorTheme) => set({ colorTheme })
}));
