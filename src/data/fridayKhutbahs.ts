export type FridayKhutbah = {
  id: string;
  isoDate: string;
  date: string;
  monthKey: string;
  monthLabel: string;
  title: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
};

export type FridayKhutbahMonth = {
  key: string;
  label: string;
  items: FridayKhutbah[];
};

const diyanetHaberHutbeler = "https://www.diyanethaber.com.tr/hutbeler";
const diyanetTvArchive = "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/bolumler";

const khutbahPreviews: Record<string, string> = {
  "2026-01-02":
    "Kâinattaki düzen, insanın yaratılışı ve hayatın anlamı üzerinden her varlığın Rabbimizi hatırlattığı vurgulanır.",
  "2026-01-09":
    "Namazın müminin hayatındaki merkezi yeri, kulluk bilinci ve günlük hayatı güzelleştiren yönü kısa bir çerçevede anlatılır.",
  "2026-01-16":
    "Dini değerlerin kötüye kullanılmasına karşı bilinçli olmak, sahih bilgiye yönelmek ve güvenilir kaynakları esas almak öne çıkarılır.",
  "2026-01-23":
    "Gençlerin arkadaş çevresi, güzel ahlak ve birbirini iyiye çağırma sorumluluğu üzerinden akran ilişkilerine dikkat çekilir.",
  "2026-01-30":
    "Tövbenin insanı arındıran ve yeniden ayağa kaldıran yönü; pişmanlık, samimiyet ve iyiye yönelme bilinciyle ele alınır.",
  "2026-02-06":
    "Toplumsal dayanışma, kardeşlik hukuku ve zor zamanlarda birbirine destek olmanın dini ve insani değeri hatırlatılır.",
  "2026-02-13":
    "Ramazan ayının manevi iklimi, ibadet, sabır, paylaşma ve kalbi yenileme fırsatı olarak öne çıkarılır.",
  "2026-02-20":
    "Ramazan günlerinde camilerin, cemaatin ve ortak ibadet bilincinin insan hayatına kattığı huzur anlatılır.",
  "2026-02-27":
    "Ramazan ayının bağımlılıklardan uzaklaşmak, iradeyi güçlendirmek ve iyi alışkanlıklar kazanmak için fırsat olduğu vurgulanır.",
  "2026-03-06":
    "Zekât ve fıtır sadakasının yardımlaşma, arınma ve ihtiyaç sahiplerine ulaşma yönü hatırlatılır.",
  "2026-03-13":
    "Peygamberlerin hak, adalet ve tevhid mücadelesi; müminlere rehberlik eden örnek hayatlar olarak anlatılır.",
  "2026-03-20":
    "Ramazan bilincinin sadece bir aya değil, bütün hayata taşınması gerektiği üzerinde durulur.",
  "2026-03-27":
    "Tevekkülün çalışmayı bırakmak değil, gayret ettikten sonra Allah'a güvenmek olduğu sade bir şekilde açıklanır.",
  "2026-04-03":
    "Cuma namazının ümmet bilincini diri tutan yönü ve müminleri aynı safta buluşturan manevi atmosferi öne çıkarılır.",
  "2026-04-10":
    "İslam'ın iman, ibadet, ahlak ve sosyal hayatı kuşatan bütüncül bir hayat rehberi olduğu hatırlatılır.",
  "2026-04-17":
    "Birlik, sorumluluk ve kardeşlik bilinciyle toplum olarak birbirimize sahip çıkma çağrısı yapılır.",
  "2026-04-24":
    "Merhametin aileden topluma uzanan eğitici gücü; dil, davranış ve ilişkilerde şefkatle görünür hale gelir.",
  "2026-05-01":
    "Helal kazanç, emek, alın teri ve kul hakkına riayet etmenin hayatımızdaki değeri vurgulanır.",
  "2026-05-08":
    "İbadetlerin insanı Rabbine yaklaştıran, kalbi arındıran ve davranışları güzelleştiren yönü anlatılır.",
  "2026-05-15":
    "Toplumsal sorumluluk, komşuluk, yardımlaşma ve ortak iyiliği koruma bilinci üzerinde durulur."
};

export function getKhutbahPreview(id: string) {
  return khutbahPreviews[id] ?? "Hutbenin kısa özeti burada gösterilir; resmi metnin tamamı için kaynak bağlantısı açılır.";
}

export const fridayKhutbahs: FridayKhutbah[] = [
  {
    id: "2026-01-02",
    isoDate: "2026-01-02",
    date: "2 Ocak 2026",
    monthKey: "2026-01",
    monthLabel: "Ocak 2026",
    title: "Her Şey Allah'ı Anlatır",
    summary: "Diyanet TV arşivinde yer alan 2 Ocak 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet TV",
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/video/her-sey-allahi-anlatir-cuma-hutbesi-2-ocak-2026"
  },
  {
    id: "2026-01-09",
    isoDate: "2026-01-09",
    date: "9 Ocak 2026",
    monthKey: "2026-01",
    monthLabel: "Ocak 2026",
    title: "Namaz",
    summary: "Diyanet TV arşivinde yer alan 9 Ocak 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet TV",
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/video/namaz-cuma-hutbesi-9-ocak-2026"
  },
  {
    id: "2026-01-16",
    isoDate: "2026-01-16",
    date: "16 Ocak 2026",
    monthKey: "2026-01",
    monthLabel: "Ocak 2026",
    title: "Din İstismarı",
    summary: "Diyanet TV arşivinde yer alan 16 Ocak 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet TV",
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/video/din-istismari-cuma-hutbesi-16-ocak-2026"
  },
  {
    id: "2026-01-23",
    isoDate: "2026-01-23",
    date: "23 Ocak 2026",
    monthKey: "2026-01",
    monthLabel: "Ocak 2026",
    title: "Akran İlişkileri",
    summary: "Diyanet TV arşivinde yer alan 23 Ocak 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet TV",
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/video/akran-iliskileri-cuma-hutbesi-23-ocak-2026"
  },
  {
    id: "2026-01-30",
    isoDate: "2026-01-30",
    date: "30 Ocak 2026",
    monthKey: "2026-01",
    monthLabel: "Ocak 2026",
    title: "Tövbeye Yönelmek",
    summary: "Resmi arşiv kontrolü için Diyanet hutbeler sayfasına yönlendirir.",
    sourceName: "Diyanet Haber",
    sourceUrl: diyanetHaberHutbeler
  },
  {
    id: "2026-02-06",
    isoDate: "2026-02-06",
    date: "6 Şubat 2026",
    monthKey: "2026-02",
    monthLabel: "Şubat 2026",
    title: "Birlik ve Beraberlik",
    summary: "Diyanet Haber arşivinde yer alan 6 Şubat 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet Haber",
    sourceUrl: "https://www.diyanethaber.com.tr/video/6-subat-2026-cuma-hutbesi"
  },
  {
    id: "2026-02-13",
    isoDate: "2026-02-13",
    date: "13 Şubat 2026",
    monthKey: "2026-02",
    monthLabel: "Şubat 2026",
    title: "Ramazan İklimi",
    summary: "Diyanet TV arşivinde yer alan 13 Şubat 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet TV",
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/video/ramazan-iklimi-cuma-hutbesi-13-subat-2026"
  },
  {
    id: "2026-02-20",
    isoDate: "2026-02-20",
    date: "20 Şubat 2026",
    monthKey: "2026-02",
    monthLabel: "Şubat 2026",
    title: "Ramazan, Cami ve Hayat",
    summary: "Diyanet TV arşiv kaydı; resmi metin için kaynak arşivi açılır.",
    sourceName: "Diyanet TV",
    sourceUrl: diyanetTvArchive
  },
  {
    id: "2026-02-27",
    isoDate: "2026-02-27",
    date: "27 Şubat 2026",
    monthKey: "2026-02",
    monthLabel: "Şubat 2026",
    title: "Bağımlılıkla Mücadelede Ramazan Bir Fırsattır",
    summary: "Diyanet TV arşiv kaydı; resmi metin için kaynak arşivi açılır.",
    sourceName: "Diyanet TV",
    sourceUrl: diyanetTvArchive
  },
  {
    id: "2026-03-06",
    isoDate: "2026-03-06",
    date: "6 Mart 2026",
    monthKey: "2026-03",
    monthLabel: "Mart 2026",
    title: "Zekât ve Fıtır Sadakası",
    summary: "Diyanet TV arşivinde yer alan 6 Mart 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet TV",
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/video/zekat-ve-fitir-sadakasi-cuma-hutbesi-6-mart-2026"
  },
  {
    id: "2026-03-13",
    isoDate: "2026-03-13",
    date: "13 Mart 2026",
    monthKey: "2026-03",
    monthLabel: "Mart 2026",
    title: "Hak ve Hakikatin Temsilcileri: Peygamberler",
    summary: "Diyanet Haber arşivinde yer alan 13 Mart 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet Haber",
    sourceUrl: "https://www.diyanethaber.com.tr/video/13-mart-2026-cuma-hutbesi"
  },
  {
    id: "2026-03-20",
    isoDate: "2026-03-20",
    date: "20 Mart 2026",
    monthKey: "2026-03",
    monthLabel: "Mart 2026",
    title: "Hayatı Ramazan Kılmak",
    summary: "Diyanet Haber arşivinde yer alan 20 Mart 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet Haber",
    sourceUrl: "https://www.diyanethaber.com.tr/video/20-mart-2026-cuma-hutbesi"
  },
  {
    id: "2026-03-27",
    isoDate: "2026-03-27",
    date: "27 Mart 2026",
    monthKey: "2026-03",
    monthLabel: "Mart 2026",
    title: "Tevekkül",
    summary: "Diyanet Haber arşivinde yer alan 27 Mart 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet Haber",
    sourceUrl: "https://www.diyanethaber.com.tr/video/27-mart-2026-cuma-hutbesi"
  },
  {
    id: "2026-04-03",
    isoDate: "2026-04-03",
    date: "3 Nisan 2026",
    monthKey: "2026-04",
    monthLabel: "Nisan 2026",
    title: "Cuma ve Ümmet Bilinci",
    summary: "Diyanet TV arşiv kaydı; resmi metin için kaynak arşivi açılır.",
    sourceName: "Diyanet TV",
    sourceUrl: diyanetTvArchive
  },
  {
    id: "2026-04-10",
    isoDate: "2026-04-10",
    date: "10 Nisan 2026",
    monthKey: "2026-04",
    monthLabel: "Nisan 2026",
    title: "İslam",
    summary: "Diyanet Haber arşivinde yer alan 10 Nisan 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet Haber",
    sourceUrl: "https://www.diyanethaber.com.tr/video/10-nisan-2026-cuma-hutbesi"
  },
  {
    id: "2026-04-17",
    isoDate: "2026-04-17",
    date: "17 Nisan 2026",
    monthKey: "2026-04",
    monthLabel: "Nisan 2026",
    title: "Birbirimize Kenetlenelim, Sorumluluklarımızı İdrak Edelim",
    summary: "Diyanet Haber arşivinde yer alan 17 Nisan 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet Haber",
    sourceUrl: "https://www.diyanethaber.com.tr/video/17-nisan-2026-cuma-hutbesi"
  },
  {
    id: "2026-04-24",
    isoDate: "2026-04-24",
    date: "24 Nisan 2026",
    monthKey: "2026-04",
    monthLabel: "Nisan 2026",
    title: "Merhamet Eğitimi",
    summary: "Diyanet TV arşiv kaydı; resmi metin için kaynak arşivi açılır.",
    sourceName: "Diyanet TV",
    sourceUrl: diyanetTvArchive
  },
  {
    id: "2026-05-01",
    isoDate: "2026-05-01",
    date: "1 Mayıs 2026",
    monthKey: "2026-05",
    monthLabel: "Mayıs 2026",
    title: "Alın Teri Mukaddestir",
    summary: "Diyanet TV arşiv kaydı; resmi metin için kaynak arşivi açılır.",
    sourceName: "Diyanet TV",
    sourceUrl: diyanetTvArchive
  },
  {
    id: "2026-05-08",
    isoDate: "2026-05-08",
    date: "8 Mayıs 2026",
    monthKey: "2026-05",
    monthLabel: "Mayıs 2026",
    title: "İbadetler, Bizi Rabbimize Yakınlaştırır",
    summary: "Diyanet TV arşivinde yer alan 8 Mayıs 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet TV",
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/video/ibadetler-bizi-rabbimize-yakinlastirir-cuma-hutbesi-8-mayis-2026"
  },
  {
    id: "2026-05-15",
    isoDate: "2026-05-15",
    date: "15 Mayıs 2026",
    monthKey: "2026-05",
    monthLabel: "Mayıs 2026",
    title: "Toplumsal Sorumluluklarımız",
    summary: "Diyanet Haber tarafından yayınlanan 15 Mayıs 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet Haber",
    sourceUrl: "https://www.diyanethaber.com.tr/video/15-mayis-2026-cuma-hutbesi"
  }
];

export const fridayKhutbahMonths: FridayKhutbahMonth[] = Array.from(
  new Map(fridayKhutbahs.map((item) => [item.monthKey, item.monthLabel]))
).map(([key, label]) => ({
  key,
  label,
  items: fridayKhutbahs.filter((item) => item.monthKey === key)
}));

export const latestFridayKhutbah = [...fridayKhutbahs].sort((a, b) => b.isoDate.localeCompare(a.isoDate))[0];
