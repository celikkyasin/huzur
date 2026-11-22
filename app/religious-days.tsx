import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { colors, radii, typography } from "@/theme";

type ReligiousDayItem = {
  date: string;
  title: string;
  meaning: string;
  reason: string;
  worshipTip: string;
};

type ReligiousDayGroup = {
  month: string;
  items: ReligiousDayItem[];
};

const religiousDays: ReligiousDayGroup[] = [
  {
    month: "Ocak",
    items: [
      {
        date: "15 Ocak 2026",
        title: "Regaib Kandili",
        meaning: "Üç ayların (Recep, Şaban ve Ramazan) başlangıcını müjdeleyen, rahmet, arzu ve bol ihsan gecesidir.",
        reason: "Recep ayının ilk Cuma gecesi idrak edilir. 'Regaib' kelimesi bol ihsan, rağbet edilen hayırlar ve manevi hediyeler anlamına gelir; kulların Allah'ın affına ve lütfuna yöneldiği mübarek bir başlangıçtır.",
        worshipTip: "Bu gecede tövbe-istiğfar etmek, kaza ve nafile namaz kılmak, Kur'an okumak ve üç aylara hayırlı bir niyetle girmek tavsiye edilir."
      },
      {
        date: "25 Ocak 2026",
        title: "Miraç Kandili",
        meaning: "Peygamber Efendimiz Hz. Muhammed'in (s.a.v.) Mescid-i Haram'dan Mescid-i Aksa'ya ve oradan ilahi huzura yükseldiği mübarek gecedir.",
        reason: "Recep ayının 27. gecesinde gerçekleşen İsra ve Miraç mucizesini anmak için idrak edilir. Beş vakit namaz bu gecede farz kılınmış, Bakara Suresi'nin son iki ayeti (Âmenerrasûlü) ve şirk koşmayanların bağışlanacağı müjdesi verilmiştir.",
        worshipTip: "Namazın müminin miracı olduğu bilinciyle namazlara özen göstermek, kaza namazı kılmak ve bolca salavat getirmek güzel görülür."
      }
    ]
  },
  {
    month: "Şubat",
    items: [
      {
        date: "2 Şubat 2026",
        title: "Berat Kandili",
        meaning: "Günahlardan arınma, ilahi af ve rahmete kavuşma, kulluk muhasebesi yapma gecesidir.",
        reason: "Şaban ayının 15. gecesidir. 'Berat' borçtan, suçtan ve cezadan kurtulmak demektir. Ramazan ayına hazırlık yapılırken ilahi rahmetin coştuğu ve duaların kabul edildiği bir arınma gecesi olarak kutlanır.",
        worshipTip: "Kırgınlıkları gidermek, kul hakkından helallik almak, samimi tövbe etmek ve gelecek günler için hayır dua etmek tavsiye edilir."
      },
      {
        date: "18 Şubat 2026",
        title: "Ramazan Başlangıcı",
        meaning: "On bir ayın sultanı, oruç, Kur'an, sabır ve yardımlaşma ayı olan mübarek Ramazan-ı Şerif'in ilk günüdür.",
        reason: "Kur'an-ı Kerim'in indirilmeye başlandığı ve İslam'ın beş şartından biri olan oruç ibadetinin farz kılındığı aydır. Müminlerin nefis terbiyesi, şükür ve paylaşma bilinciyle manevi yenilenme yaşadığı rahmet mevsimidir.",
        worshipTip: "Oruç ibadetini huşu ile tutmak, mukabele ve Kur'an okumalarını artırmak, teravih namazlarına ve sadakaya önem vermek tavsiye edilir."
      }
    ]
  },
  {
    month: "Mart",
    items: [
      {
        date: "15 Mart 2026",
        title: "Kadir Gecesi",
        meaning: "Kur'an-ı Kerim'in indirilmeye başlandığı ve 'bin aydan daha hayırlı' olduğu müjdelenen en faziletli gecedir.",
        reason: "Ramazan ayının 27. gecesi olarak idrak edilir. Kadir Suresi'nde bildirildiği üzere meleklerin ve Cebrail'in (a.s.) yeryüzüne indiği, tan yeri ağarıncaya kadar selamet ve esenlik dolu olan vahiy gecesidir.",
        worshipTip: "Peygamber Efendimizin öğrettiği 'Allahümme inneke afüvvün tuhibbül afve fa'fu annî' (Allah'ım, Sen affedicisin, affı seversin, beni de affet) duasını sıkça okumak tavsiye edilir."
      },
      {
        date: "19 Mart 2026",
        title: "Ramazan Bayramı Arefesi",
        meaning: "Ramazan ayının son günü ve bayram sevincine kavuşmadan önceki hazırlık ve dua günüdür.",
        reason: "Bir aylık oruç ve sabır yolculuğunun tamamlandığı, bayram sabahına hem ruhen hem de hanelerimizle hazırlandığımız mübarek gündür.",
        worshipTip: "Kabir ziyaretleri yapmak, geçmişlerimizin ruhuna Kur'an ve Fatiha okumak, fıtır sadakasını (fitre) bayram namazından önce ihtiyaç sahiplerine ulaştırmak önemlidir."
      },
      {
        date: "20-22 Mart 2026",
        title: "Ramazan Bayramı",
        meaning: "Ramazan ayı boyunca tutulan oruçların ve yapılan ibadetlerin şükrü olarak kutlanan birlik, kardeşlik ve sevinç günleridir.",
        reason: "Şevval ayının ilk üç günüdür. İslam'daki iki büyük dini bayramdan ilki olup, müminlerin ilahi affa ve bayram sevincine kavuşmasını, kırgınlıkların son bulmasını simgeler.",
        worshipTip: "Bayram namazına gitmek, anne-baba ve akrabaları ziyaret etmek (sıla-i rahim), çocukları sevindirmek ve yetimleri gözetmek sünnettir."
      }
    ]
  },
  {
    month: "Mayıs",
    items: [
      {
        date: "26 Mayıs 2026",
        title: "Kurban Bayramı Arefesi",
        meaning: "Hac ibadetinin en önemli rüknü olan Arafat vakfesinin yapıldığı, duaların geri çevrilmediği çok kıymetli bir gündür.",
        reason: "Zilhicce ayının 9. günüdür. Hacıların Arafat'ta Allah'a yöneldiği, dünyadaki tüm Müslümanların da teşrik tekbirlerine başladığı ve kurban ibadetine hazırlandığı mübarek gündür.",
        worshipTip: "Sabah namazından itibaren teşrik tekbirlerine başlamak, hacda olmayanlar için Arefe günü orucu tutmak ve bolca istiğfar etmek çok faziletlidir."
      },
      {
        date: "27-30 Mayıs 2026",
        title: "Kurban Bayramı",
        meaning: "Allah'a yakınlaşma, teslimiyet, fedakârlık ve ihtiyaç sahipleriyle paylaşma bayramıdır.",
        reason: "Zilhicce ayının 10-13. günleridir. Hz. İbrahim (a.s.) ve oğlu Hz. İsmail'in (a.s.) Allah'ın emrine olan tam sadakat ve teslimiyetini hatırlar; kurban ibadetiyle şükrümüzü ve kardeşliğimizi pekiştiririz.",
        worshipTip: "Farz namazların ardından teşrik tekbirlerini unutmamak, kurban etini komşu ve ihtiyaç sahipleriyle paylaşmak ve büyüklerin hayır duasını almak tavsiye edilir."
      }
    ]
  },
  {
    month: "Haziran",
    items: [
      {
        date: "16 Haziran 2026",
        title: "Hicri Yılbaşı",
        meaning: "İslam takviminin (Hicri takvim) başlangıcı ve Muharrem ayının birinci günüdür.",
        reason: "Peygamber Efendimiz (s.a.v.) ve Mekkeli Müslümanların inançlarını özgürce yaşamak için Mekke'den Medine'ye yaptığı kutlu hicret, İslam tarihinde dönüm noktası olmuş ve Hz. Ömer döneminde takvim başlangıcı kabul edilmiştir.",
        worshipTip: "Geçen bir yılın muhasebesini yapmak, yeni Hicri yılın İslam âlemine huzur ve hayır getirmesi için dua etmek tavsiye edilir."
      },
      {
        date: "25 Haziran 2026",
        title: "Aşure Günü",
        meaning: "Muharrem ayının 10. günü olup tarihte pek çok ilahi kurtuluşun gerçekleştiği ve paylaşma kültürünün yaşatıldığı gündür.",
        reason: "Hz. Nuh'un gemisinin tufandan kurtulması ve Hz. Musa'nın Firavun zulmünden selamete çıkması gibi peygamberler tarihindeki önemli hadiselerin yanı sıra, Kerbela şehitleri Hz. Hüseyin ve ehlibeytin hüzün ve rahmetle anıldığı gündür.",
        worshipTip: "Peygamber Efendimizin sünnetine uyarak Muharrem'in 9-10 veya 10-11. günlerinde oruç tutmak, komşulara ikramda bulunmak ve ehlibeyti rahmetle anmak güzeldir."
      }
    ]
  },
  {
    month: "Ağustos",
    items: [
      {
        date: "25 Ağustos 2026",
        title: "Mevlid Kandili",
        meaning: "Âlemlere rahmet olarak gönderilen son peygamber Hz. Muhammed Mustafa'nın (s.a.v.) dünyaya teşrif ettiği gecedir.",
        reason: "Rebiülevvel ayının 12. gecesidir. 'Mevlid' doğum zamanı demektir. İnsanlığı karanlıktan aydınlığa çıkaran, güzel ahlakı tamamlamak üzere gönderilen Peygamber Efendimizin doğumunu ve sünnetini anlamak için idrak edilir.",
        worshipTip: "Bolca salât ü selâm getirmek, Peygamber Efendimizin hayatını (siyer) ve ahlakını okumak, aile içinde O'nun örnekliğini konuşmak tavsiye edilir."
      }
    ]
  }
];

export default function ReligiousDaysScreen() {
  const [expandedKey, setExpandedKey] = useState<string | null>("15 Ocak 2026-Regaib Kandili");

  return (
    <ScreenContainer>
      <AppHeader title="Dini Günler" />
      <Card variant="emerald" style={styles.hero}>
        <Text style={styles.heroLabel}>2026 TAKVİMİ</Text>
        <Text style={styles.heroTitle}>Dini günler ve kandiller</Text>
        <Text style={styles.heroText}>Dini günlerin anlamını, neden kutlandığını ve bu mübarek vakitlerde yapılabilecek ibadetleri görmek için günlerin üzerine dokunun.</Text>
      </Card>

      {religiousDays.map((group) => (
        <View key={group.month} style={styles.monthGroup}>
          <Text style={styles.monthTitle}>{group.month}</Text>
          {group.items.map((item) => {
            const itemKey = `${item.date}-${item.title}`;
            const isExpanded = expandedKey === itemKey;

            return (
              <Pressable
                key={itemKey}
                accessibilityRole="button"
                accessibilityLabel={`${item.title} detaylarını ${isExpanded ? "kapat" : "aç"}`}
                onPress={() => setExpandedKey(isExpanded ? null : itemKey)}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Card style={[styles.dayCard, isExpanded && styles.dayCardActive]}>
                  <View style={styles.dayTopRow}>
                    <View style={[styles.dateBadge, isExpanded && styles.dateBadgeActive]}>
                      <Ionicons name="calendar-number" size={20} color={isExpanded ? colors.white : colors.emerald} />
                    </View>
                    <View style={styles.dayTextWrap}>
                      <Text style={styles.dayTitle}>{item.title}</Text>
                      <Text style={styles.dayDate}>{item.date}</Text>
                    </View>
                    <View style={styles.chevronBadge}>
                      <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={colors.emerald} />
                    </View>
                  </View>

                  {isExpanded ? (
                    <View style={styles.detailBox}>
                      <View style={styles.detailSection}>
                        <View style={styles.detailHeader}>
                          <Ionicons name="information-circle" size={16} color={colors.emerald} />
                          <Text style={styles.detailLabel}>Ne İle İlgilidir?</Text>
                        </View>
                        <Text style={styles.detailText}>{item.meaning}</Text>
                      </View>

                      <View style={styles.detailSection}>
                        <View style={styles.detailHeader}>
                          <Ionicons name="sparkles" size={16} color={colors.gold} />
                          <Text style={styles.detailLabel}>Neden İdrak Edilir?</Text>
                        </View>
                        <Text style={styles.detailText}>{item.reason}</Text>
                      </View>

                      <View style={styles.tipBox}>
                        <View style={styles.detailHeader}>
                          <Ionicons name="heart" size={16} color={colors.emerald} />
                          <Text style={styles.detailLabel}>Bu Günde Ne Yapılmalı?</Text>
                        </View>
                        <Text style={styles.tipText}>{item.worshipTip}</Text>
                      </View>
                    </View>
                  ) : null}
                </Card>
              </Pressable>
            );
          })}
        </View>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: { marginTop: 16, marginBottom: 18 },
  heroLabel: { color: colors.gold, fontSize: 12, fontWeight: "900" },
  heroTitle: { color: colors.white, fontFamily: typography.title, fontSize: 28, lineHeight: 34, fontWeight: "900", marginTop: 8 },
  heroText: { color: "rgba(255,255,255,0.82)", marginTop: 10, lineHeight: 21, fontWeight: "700" },
  monthGroup: { marginBottom: 18 },
  monthTitle: { color: colors.emerald, fontFamily: typography.title, fontSize: 28, fontWeight: "900", marginBottom: 10 },
  dayCard: { marginBottom: 10, padding: 14 },
  dayCardActive: { borderColor: colors.emerald, borderWidth: 1.5 },
  dayTopRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  dateBadge: { width: 48, height: 48, borderRadius: radii.round, backgroundColor: colors.emeraldSoft, alignItems: "center", justifyContent: "center" },
  dateBadgeActive: { backgroundColor: colors.emerald },
  dayTextWrap: { flex: 1, minWidth: 0 },
  dayTitle: { color: colors.ink, fontSize: 17, fontWeight: "900" },
  dayDate: { color: colors.muted, marginTop: 4, fontWeight: "800" },
  chevronBadge: { width: 36, height: 36, borderRadius: radii.round, backgroundColor: colors.emeraldSoft, alignItems: "center", justifyContent: "center" },
  detailBox: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.line, gap: 12 },
  detailSection: { gap: 4 },
  detailHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  detailLabel: { color: colors.emerald, fontSize: 13, fontWeight: "900" },
  detailText: { color: colors.ink, fontSize: 14, lineHeight: 21, fontWeight: "700" },
  tipBox: { borderRadius: radii.md, backgroundColor: colors.emeraldSoft, padding: 12, gap: 4 },
  tipText: { color: colors.ink, fontSize: 13, lineHeight: 20, fontWeight: "700" },
  pressed: { opacity: 0.85 }
});
