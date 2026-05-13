import { Platform } from "react-native";

export const colors = {
  cream: "#F8F4EA",
  paper: "#FFFDF8",
  white: "#FFFFFF",
  emerald: "#075E47",
  emeraldDark: "#034332",
  emeraldSoft: "#EAF4EE",
  sage: "#DDE9DE",
  gold: "#D7B35A",
  goldSoft: "#FFF1BF",
  ink: "#1B2B29",
  muted: "#71807B",
  line: "#E7E1D4",
  danger: "#C55353",
  shadow: "#24433A"
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
  xxl: 40
};

export const radii = {
  sm: 12,
  md: 18,
  lg: 26,
  xl: 34,
  round: 999
};

export const typography = {
  title: Platform.select({ ios: "Georgia", default: "serif" }),
  body: Platform.select({ ios: "System", default: "sans-serif" })
};

export const shadows = {
  soft: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5
  },
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3
  }
};
