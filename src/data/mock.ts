import type { Dua, DuaCategory, FridayMessage, Mosque, PrayerTime, SettingsItem, StoryTemplate, Surah, SurahDetail, SurahVerse } from "@/types";

export const prayerTimes: PrayerTime[] = [
  { id: "imsak", name: "İmsak", time: "05:23" },
  { id: "gunes", name: "Güneş", time: "06:50" },
  { id: "ogle", name: "Öğle", time: "13:21" },
  { id: "ikindi", name: "İkindi", time: "16:58", isNext: true },
  { id: "aksam", name: "Akşam", time: "20:04" },
  { id: "yatsi", name: "Yatsı", time: "21:35" }
];

export const dailyAyahs = [
  {
    arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translation: "Şüphesiz her zorlukla beraber bir kolaylık vardır.",
    source: "İnşirah Suresi, 6"
  },
  {
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ",
    translation: "Siz beni anın ki ben de sizi anayım.",
    source: "Bakara Suresi, 152"
  },
  {
    arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    translation: "Kalpler ancak Allah'ı anmakla huzur bulur.",
    source: "Ra'd Suresi, 28"
  },
  {
    arabic: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ",
    translation: "Nerede olursanız olun O sizinle beraberdir.",
    source: "Hadid Suresi, 4"
  },
  {
    arabic: "رَبِّ زِدْنِي عِلْمًا",
    translation: "Rabbim, ilmimi artır.",
    source: "Taha Suresi, 114"
  },
  {
    arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    translation: "Şüphesiz Allah sabredenlerle beraberdir.",
    source: "Bakara Suresi, 153"
  },
  {
    arabic: "وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ",
    translation: "Rahmetim her şeyi kuşatmıştır.",
    source: "A'raf Suresi, 156"
  }
];

export function getDailyAyah(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return dailyAyahs[dayOfYear % dailyAyahs.length];
}

export const duaCategories: DuaCategory[] = [
  { id: "sabah", title: "Sabah Duaları", subtitle: "Güne başlarken", icon: "sunny" },
  { id: "aksam", title: "Akşam Duaları", subtitle: "Huzurlu bir uyku için", icon: "moon" },
  { id: "sifa", title: "Şifa Duaları", subtitle: "Sağlık ve afiyet", icon: "medkit" },
  { id: "yolculuk", title: "Yolculuk Duaları", subtitle: "Yola çıkarken", icon: "car" },
  { id: "yemek", title: "Yemek Duaları", subtitle: "Bereket artsın", icon: "restaurant" }
];

const duaSeeds: Record<string, Array<Omit<Dua, "id" | "categoryId">>> = {
  sabah: [
    { title: "Günün Duası", arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً", meaning: "Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver.", explanation: "Güne dünya ve ahiret iyiliğini birlikte isteyerek başlamayı hatırlatır.", source: "Bakara Suresi, 201" },
    { title: "Sabah Korunma Duası", arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ", meaning: "Adı anıldığında yerde ve gökte hiçbir şeyin zarar veremeyeceği Allah'ın adıyla.", explanation: "Sabah vakti Allah'ın korumasına sığınmak için okunur.", source: "Ebu Davud" },
    { title: "Bereketli Gün Duası", arabic: "اللَّهُمَّ بَارِكْ لِي فِي يَوْمِي", meaning: "Allah'ım, günümü benim için bereketli kıl.", explanation: "Günün işlerine huzur, açıklık ve bereket niyaz eder.", source: "Dua derlemesi" },
    { title: "Kalp Açıklığı Duası", arabic: "رَبِّ اشْرَحْ لِي صَدْرِي", meaning: "Rabbim, gönlüme ferahlık ver.", explanation: "Güne sakinlik ve geniş bir kalple başlamak için okunur.", source: "Taha Suresi, 25" },
    { title: "Şükür Duası", arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا", meaning: "Bizi yeniden hayata kavuşturan Allah'a hamd olsun.", explanation: "Uyanmayı bir nimet bilip güne şükürle başlamayı sağlar.", source: "Buhari" }
  ],
  aksam: [
    { title: "Huzur Duası", arabic: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ", meaning: "Allah'ım, sen selamsın; huzur ve esenlik sendendir.", explanation: "Günün sonunda kalbi sakinleştiren kısa bir duadır.", source: "Tirmizi" },
    { title: "Akşam Teslimiyet Duası", arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا", meaning: "Allah'ım! Senin yardımınla akşama erdik, senin yardımınla sabaha çıkarız.", explanation: "Günü Allah'a emanet ederek bitirmeyi öğretir.", source: "Tirmizi" },
    { title: "Gece Sükuneti Duası", arabic: "اللَّهُمَّ اجْعَلْ لَيْلَتِي سَكِينَةً", meaning: "Allah'ım, gecemi sükunetle doldur.", explanation: "Uyku öncesi zihni ve kalbi yumuşatır.", source: "Dua derlemesi" },
    { title: "Af Dileme Duası", arabic: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ", meaning: "Yüce Allah'tan bağışlanma dilerim.", explanation: "Gün içinde yapılan hatalar için tövbe bilinci verir.", source: "Hadislerde geçen zikir" },
    { title: "Aileye Rahmet Duası", arabic: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ", meaning: "Rabbimiz! Eşlerimizi ve çocuklarımızı bize göz aydınlığı kıl.", explanation: "Aile için huzur ve rahmet niyaz eder.", source: "Furkan Suresi, 74" }
  ],
  sifa: [
    { title: "Şifa Niyazı", arabic: "اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ اشْفِ أَنْتَ الشَّافِي", meaning: "Ey insanların Rabbi olan Allah'ım, sıkıntıyı gider; şifa veren sensin.", explanation: "Hastalık ve sıkıntı anlarında Allah'tan şifa dilemek için okunur.", source: "Buhari" },
    { title: "Afiyet Duası", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ", meaning: "Allah'ım, senden afiyet isterim.", explanation: "Beden, ruh ve gönül sağlığı için sade bir niyazdır.", source: "Tirmizi" },
    { title: "Kalbe Şifa Duası", arabic: "يَا شَافِي اشْفِ قَلْبِي", meaning: "Ey Şafi olan Rabbim, kalbime şifa ver.", explanation: "İç sıkıntısı ve yorgunluk anlarında okunur.", source: "Dua derlemesi" },
    { title: "Sabır Duası", arabic: "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا", meaning: "Rabbimiz, üzerimize sabır yağdır.", explanation: "Zor zamanlarda direnç ve sebat istemeyi öğretir.", source: "Bakara Suresi, 250" },
    { title: "Rahmet Duası", arabic: "رَبِّ ارْحَمْنِي وَاشْفِنِي", meaning: "Rabbim, bana merhamet et ve bana şifa ver.", explanation: "Rahmet ve iyileşmeyi birlikte dileyen içten bir duadır.", source: "Dua derlemesi" }
  ],
  yolculuk: [
    { title: "Yolculuk Duası", arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا", meaning: "Bunu bizim hizmetimize veren Allah'ı tesbih ederiz.", explanation: "Yola çıkarken güven, teslimiyet ve şükür bilincini canlı tutar.", source: "Zuhruf Suresi, 13" },
    { title: "Güvenli Yol Duası", arabic: "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى", meaning: "Allah'ım, bu yolculuğumuzda iyilik ve takva isteriz.", explanation: "Yolculuğun hayırla tamamlanması için okunur.", source: "Müslim" },
    { title: "Emanet Duası", arabic: "أَسْتَوْدِعُكُمُ اللَّهَ", meaning: "Sizi Allah'a emanet ederim.", explanation: "Ayrılırken sevdikleri Allah'ın korumasına bırakmayı ifade eder.", source: "Tirmizi" },
    { title: "Kolaylık Duası", arabic: "اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا", meaning: "Allah'ım, yolculuğumuzu bize kolaylaştır.", explanation: "Uzak yolları kolaylık ve huzurla tamamlamaya niyet eder.", source: "Müslim" },
    { title: "Dönüş Duası", arabic: "آيِبُونَ تَائِبُونَ عَابِدُونَ", meaning: "Dönüyoruz, tövbe ediyoruz, Rabbimize kulluk ediyoruz.", explanation: "Yolculuk dönüşünde şükür ve kulluk bilincini yeniler.", source: "Müslim" }
  ],
  yemek: [
    { title: "Yemek Duası", arabic: "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا", meaning: "Allah'ım! Bize verdiğin rızıkta bereket ihsan et.", explanation: "Nimetin sahibini hatırlatan sofra duasıdır.", source: "Tirmizi" },
    { title: "Sofra Şükrü", arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا", meaning: "Bizi yediren ve içiren Allah'a hamd olsun.", explanation: "Yemekten sonra nimete şükretmek için okunur.", source: "Ebu Davud" },
    { title: "Bereket Duası", arabic: "رَبِّ بَارِكْ لَنَا فِي رِزْقِنَا", meaning: "Rabbim, rızkımızı bereketlendir.", explanation: "Sofraya helal, bereket ve kanaat niyaz eder.", source: "Dua derlemesi" },
    { title: "Kanaat Duası", arabic: "اللَّهُمَّ قَنِّعْنِي بِمَا رَزَقْتَنِي", meaning: "Allah'ım, verdiğin rızka beni razı ve kanaatkar kıl.", explanation: "Azı çok bilme ve nimeti fark etme bilinci verir.", source: "Dua derlemesi" },
    { title: "Helal Rızık Duası", arabic: "اللَّهُمَّ ارْزُقْنَا حَلَالًا طَيِّبًا", meaning: "Allah'ım, bize helal ve temiz rızık ver.", explanation: "Kazanç ve sofrada helal hassasiyetini canlı tutar.", source: "Dua derlemesi" }
  ]
};

function createDuas(categoryId: string, prefix: string): Dua[] {
  const seeds = duaSeeds[categoryId];
  return Array.from({ length: 50 }, (_, index) => {
    const seed = seeds[index % seeds.length];
    const round = Math.floor(index / seeds.length) + 1;
    return {
      ...seed,
      id: `${categoryId}-${index + 1}`,
      categoryId,
      title: index < seeds.length ? seed.title : `${prefix} ${index + 1}`,
      explanation: round === 1 ? seed.explanation : `${seed.explanation} Bu okuma, ${round}. günlük tekrar için sadeleştirilmiş bir niyet metni olarak hazırlanmıştır.`
    };
  });
}

export const duas: Dua[] = [
  ...createDuas("sabah", "Sabah Niyazı"),
  ...createDuas("aksam", "Akşam Niyazı"),
  ...createDuas("sifa", "Şifa Niyazı"),
  ...createDuas("yolculuk", "Yolculuk Niyazı"),
  ...createDuas("yemek", "Sofra Niyazı")
];

const audioBase = "https://server8.mp3quran.net/afs";

const surahCatalog = [
  ["fatiha", "Fatiha Suresi", "الفاتحة", "Açılış", 7, "Mekke"],
  ["bakara", "Bakara Suresi", "البقرة", "Sığır", 286, "Medine"],
  ["ali-imran", "Al-i İmran Suresi", "آل عمران", "İmran Ailesi", 200, "Medine"],
  ["nisa", "Nisa Suresi", "النساء", "Kadınlar", 176, "Medine"],
  ["maide", "Maide Suresi", "المائدة", "Sofra", 120, "Medine"],
  ["enam", "En'am Suresi", "الأنعام", "Hayvanlar", 165, "Mekke"],
  ["araf", "A'raf Suresi", "الأعراف", "Yüksek Yerler", 206, "Mekke"],
  ["enfal", "Enfal Suresi", "الأنفال", "Ganimetler", 75, "Medine"],
  ["tevbe", "Tevbe Suresi", "التوبة", "Tövbe", 129, "Medine"],
  ["yunus", "Yunus Suresi", "يونس", "Yunus", 109, "Mekke"],
  ["hud", "Hud Suresi", "هود", "Hud", 123, "Mekke"],
  ["yusuf", "Yusuf Suresi", "يوسف", "Yusuf", 111, "Mekke"],
  ["rad", "Ra'd Suresi", "الرعد", "Gök Gürültüsü", 43, "Medine"],
  ["ibrahim", "İbrahim Suresi", "إبراهيم", "İbrahim", 52, "Mekke"],
  ["hicr", "Hicr Suresi", "الحجر", "Hicr", 99, "Mekke"],
  ["nahl", "Nahl Suresi", "النحل", "Bal Arısı", 128, "Mekke"],
  ["isra", "İsra Suresi", "الإسراء", "Gece Yolculuğu", 111, "Mekke"],
  ["kehf", "Kehf Suresi", "الكهف", "Mağara", 110, "Mekke"],
  ["meryem", "Meryem Suresi", "مريم", "Meryem", 98, "Mekke"],
  ["taha", "Taha Suresi", "طه", "Taha", 135, "Mekke"],
  ["enbiya", "Enbiya Suresi", "الأنبياء", "Peygamberler", 112, "Mekke"],
  ["hac", "Hac Suresi", "الحج", "Hac", 78, "Medine"],
  ["muminun", "Mü'minun Suresi", "المؤمنون", "Müminler", 118, "Mekke"],
  ["nur", "Nur Suresi", "النور", "Nur", 64, "Medine"],
  ["furkan", "Furkan Suresi", "الفرقان", "Ölçü", 77, "Mekke"],
  ["suara", "Şuara Suresi", "الشعراء", "Şairler", 227, "Mekke"],
  ["neml", "Neml Suresi", "النمل", "Karınca", 93, "Mekke"],
  ["kasas", "Kasas Suresi", "القصص", "Kıssalar", 88, "Mekke"],
  ["ankebut", "Ankebut Suresi", "العنكبوت", "Örümcek", 69, "Mekke"],
  ["rum", "Rum Suresi", "الروم", "Rumlar", 60, "Mekke"],
  ["lokman", "Lokman Suresi", "لقمان", "Lokman", 34, "Mekke"],
  ["secde", "Secde Suresi", "السجدة", "Secde", 30, "Mekke"],
  ["ahzab", "Ahzab Suresi", "الأحزاب", "Gruplar", 73, "Medine"],
  ["sebe", "Sebe Suresi", "سبأ", "Sebe", 54, "Mekke"],
  ["fatir", "Fatır Suresi", "فاطر", "Yaratan", 45, "Mekke"],
  ["yasin", "Yasin Suresi", "يس", "Yasin", 83, "Mekke"],
  ["saffat", "Saffat Suresi", "الصافات", "Saf Tutanlar", 182, "Mekke"],
  ["sad", "Sad Suresi", "ص", "Sad", 88, "Mekke"],
  ["zumer", "Zümer Suresi", "الزمر", "Topluluklar", 75, "Mekke"],
  ["mumin", "Mü'min Suresi", "غافر", "Mümin", 85, "Mekke"],
  ["fussilet", "Fussilet Suresi", "فصلت", "Açıklanmış", 54, "Mekke"],
  ["sura", "Şura Suresi", "الشورى", "Danışma", 53, "Mekke"],
  ["zuhruf", "Zuhruf Suresi", "الزخرف", "Süs", 89, "Mekke"],
  ["duhan", "Duhan Suresi", "الدخان", "Duman", 59, "Mekke"],
  ["casiye", "Casiye Suresi", "الجاثية", "Diz Çöken", 37, "Mekke"],
  ["ahkaf", "Ahkaf Suresi", "الأحقاف", "Kum Tepeleri", 35, "Mekke"],
  ["muhammed", "Muhammed Suresi", "محمد", "Muhammed", 38, "Medine"],
  ["fetih", "Fetih Suresi", "الفتح", "Fetih", 29, "Medine"],
  ["hucurat", "Hucurat Suresi", "الحجرات", "Odalar", 18, "Medine"],
  ["kaf", "Kaf Suresi", "ق", "Kaf", 45, "Mekke"],
  ["zariyat", "Zariyat Suresi", "الذاريات", "Savuranlar", 60, "Mekke"],
  ["tur", "Tur Suresi", "الطور", "Tur", 49, "Mekke"],
  ["necm", "Necm Suresi", "النجم", "Yıldız", 62, "Mekke"],
  ["kamer", "Kamer Suresi", "القمر", "Ay", 55, "Mekke"],
  ["rahman", "Rahman Suresi", "الرحمن", "Rahman", 78, "Medine"],
  ["vakia", "Vakıa Suresi", "الواقعة", "Olay", 96, "Mekke"],
  ["hadid", "Hadid Suresi", "الحديد", "Demir", 29, "Medine"],
  ["mucadele", "Mücadele Suresi", "المجادلة", "Mücadele", 22, "Medine"],
  ["hasr", "Haşr Suresi", "الحشر", "Toplanma", 24, "Medine"],
  ["mumtehine", "Mümtehine Suresi", "الممتحنة", "İmtihan Edilen", 13, "Medine"],
  ["saf", "Saf Suresi", "الصف", "Saf", 14, "Medine"],
  ["cuma", "Cuma Suresi", "الجمعة", "Cuma", 11, "Medine"],
  ["munafikun", "Münafikun Suresi", "المنافقون", "Münafıklar", 11, "Medine"],
  ["tegabun", "Teğabun Suresi", "التغابن", "Aldanış", 18, "Medine"],
  ["talak", "Talak Suresi", "الطلاق", "Boşanma", 12, "Medine"],
  ["tahrim", "Tahrim Suresi", "التحريم", "Haram Kılma", 12, "Medine"],
  ["mulk", "Mülk Suresi", "الملك", "Hükümranlık", 30, "Mekke"],
  ["kalem", "Kalem Suresi", "القلم", "Kalem", 52, "Mekke"],
  ["hakka", "Hakka Suresi", "الحاقة", "Gerçek", 52, "Mekke"],
  ["mearic", "Mearic Suresi", "المعارج", "Yükseliş Yolları", 44, "Mekke"],
  ["nuh", "Nuh Suresi", "نوح", "Nuh", 28, "Mekke"],
  ["cin", "Cin Suresi", "الجن", "Cin", 28, "Mekke"],
  ["muzzemmil", "Müzzemmil Suresi", "المزمل", "Örtünen", 20, "Mekke"],
  ["muddessir", "Müddessir Suresi", "المدثر", "Bürünen", 56, "Mekke"],
  ["kiyame", "Kıyamet Suresi", "القيامة", "Kıyamet", 40, "Mekke"],
  ["insan", "İnsan Suresi", "الإنسان", "İnsan", 31, "Medine"],
  ["murselat", "Mürselat Suresi", "المرسلات", "Gönderilenler", 50, "Mekke"],
  ["nebe", "Nebe Suresi", "النبأ", "Haber", 40, "Mekke"],
  ["naziat", "Naziat Suresi", "النازعات", "Söküp Çıkaranlar", 46, "Mekke"],
  ["abese", "Abese Suresi", "عبس", "Yüzünü Ekşitti", 42, "Mekke"],
  ["tekvir", "Tekvir Suresi", "التكوير", "Dürülme", 29, "Mekke"],
  ["infitar", "İnfitar Suresi", "الإنفطار", "Yarılma", 19, "Mekke"],
  ["mutaffifin", "Mutaffifin Suresi", "المطففين", "Ölçüde Hile", 36, "Mekke"],
  ["insikak", "İnşikak Suresi", "الإنشقاق", "Yarılma", 25, "Mekke"],
  ["buruc", "Büruc Suresi", "البروج", "Burçlar", 22, "Mekke"],
  ["tarik", "Tarık Suresi", "الطارق", "Gece Gelen", 17, "Mekke"],
  ["ala", "A'la Suresi", "الأعلى", "En Yüce", 19, "Mekke"],
  ["gasiye", "Gaşiye Suresi", "الغاشية", "Kaplayan", 26, "Mekke"],
  ["fecr", "Fecr Suresi", "الفجر", "Şafak", 30, "Mekke"],
  ["beled", "Beled Suresi", "البلد", "Şehir", 20, "Mekke"],
  ["sems", "Şems Suresi", "الشمس", "Güneş", 15, "Mekke"],
  ["leyl", "Leyl Suresi", "الليل", "Gece", 21, "Mekke"],
  ["duha", "Duha Suresi", "الضحى", "Kuşluk", 11, "Mekke"],
  ["insirah", "İnşirah Suresi", "الشرح", "Ferahlık", 8, "Mekke"],
  ["tin", "Tin Suresi", "التين", "İncir", 8, "Mekke"],
  ["alak", "Alak Suresi", "العلق", "Alak", 19, "Mekke"],
  ["kadir", "Kadir Suresi", "القدر", "Kadir", 5, "Mekke"],
  ["beyyine", "Beyyine Suresi", "البينة", "Açık Delil", 8, "Medine"],
  ["zilzal", "Zilzal Suresi", "الزلزلة", "Sarsıntı", 8, "Medine"],
  ["adiyat", "Adiyat Suresi", "العاديات", "Koşan Atlar", 11, "Mekke"],
  ["karia", "Karia Suresi", "القارعة", "Çarpan Olay", 11, "Mekke"],
  ["tekasur", "Tekasür Suresi", "التكاثر", "Çoğaltma Yarışı", 8, "Mekke"],
  ["asr", "Asr Suresi", "العصر", "Asır", 3, "Mekke"],
  ["humeze", "Hümeze Suresi", "الهمزة", "Arkadan Çekiştiren", 9, "Mekke"],
  ["fil", "Fil Suresi", "الفيل", "Fil", 5, "Mekke"],
  ["kureys", "Kureyş Suresi", "قريش", "Kureyş", 4, "Mekke"],
  ["maun", "Maun Suresi", "الماعون", "Yardım", 7, "Mekke"],
  ["kevser", "Kevser Suresi", "الكوثر", "Kevser", 3, "Mekke"],
  ["kafirun", "Kafirun Suresi", "الكافرون", "İnkarcılar", 6, "Mekke"],
  ["nasr", "Nasr Suresi", "النصر", "Yardım", 3, "Medine"],
  ["tebbet", "Tebbet Suresi", "المسد", "Kuruyan Eller", 5, "Mekke"],
  ["ihlas", "İhlas Suresi", "الإخلاص", "Samimiyet", 4, "Mekke"],
  ["felak", "Felak Suresi", "الفلق", "Sabah Aydınlığı", 5, "Mekke"],
  ["nas", "Nas Suresi", "الناس", "İnsanlar", 6, "Mekke"]
] as const;

const highlightedVerses: Record<string, SurahVerse[]> = {
  fatiha: [
    { number: 1, arabic: "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ", translation: "Rahman ve Rahim olan Allah'ın adıyla.", explanation: "Her hayırlı işe Allah'ın adıyla başlamayı öğretir." },
    { number: 2, arabic: "اَلْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِينَ", translation: "Hamd, alemlerin Rabbi Allah'a mahsustur.", explanation: "Bütün övgünün ve şükrün Allah'a ait olduğunu hatırlatır." },
    { number: 3, arabic: "اَلرَّحْمٰنِ الرَّحِيمِ", translation: "O, Rahman'dır, Rahim'dir.", explanation: "Allah'ın rahmetinin kullarını kuşattığını bildirir." },
    { number: 4, arabic: "مَالِكِ يَوْمِ الدِّينِ", translation: "Din gününün sahibidir.", explanation: "Hesap gününün gerçek hükümranının Allah olduğunu bildirir." },
    { number: 5, arabic: "اِيَّاكَ نَعْبُدُ وَاِيَّاكَ نَسْتَعِينُ", translation: "Yalnız sana kulluk eder, yalnız senden yardım dileriz.", explanation: "Kulluğun ve yardım talebinin merkezine Allah'ı koyar." },
    { number: 6, arabic: "اِهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", translation: "Bizi dosdoğru yola ilet.", explanation: "Kulun her gün Allah'tan hidayet istemesidir." },
    { number: 7, arabic: "صِرَاطَ الَّذِينَ اَنْعَمْتَ عَلَيْهِمْ", translation: "Kendilerine nimet verdiklerinin yoluna ilet.", explanation: "Doğru yolun salih kulların yolu olduğunu açıklar." }
  ],
  bakara: [
    { number: 1, arabic: "الم", translation: "Elif Lam Mim.", explanation: "Huruf-ı mukattaa, manası Allah katında olan özel harflerdendir." },
    { number: 2, arabic: "ذٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِلْمُتَّقِينَ", translation: "Bu, kendisinde şüphe olmayan kitaptır; takva sahipleri için yol göstericidir.", explanation: "Kur'an'ın rehber oluşunu ve kalbe güven veren kesinliğini bildirir." },
    { number: 3, arabic: "اَلَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلٰوةَ", translation: "Onlar gayba inanır ve namazı dosdoğru kılarlar.", explanation: "Müminin iman ve ibadet sorumluluğunu özetler." }
  ],
  yasin: [
    { number: 1, arabic: "يس", translation: "Yasin.", explanation: "Surenin başındaki mukattaa harflerindendir." },
    { number: 2, arabic: "وَالْقُرْآنِ الْحَكِيمِ", translation: "Hikmet dolu Kur'an'a yemin olsun.", explanation: "Kur'an'ın hikmet ve hakikat kaynağı olduğunu vurgular." },
    { number: 3, arabic: "إِنَّكَ لَمِنَ الْمُرْسَلِينَ", translation: "Şüphesiz sen gönderilmiş peygamberlerdensin.", explanation: "Peygamber Efendimizin risaletini teyit eder." }
  ],
  rahman: [
    { number: 1, arabic: "الرَّحْمٰنُ", translation: "Rahman.", explanation: "Sonsuz merhamet sahibi Allah'ın ismiyle başlar." },
    { number: 2, arabic: "عَلَّمَ الْقُرْآنَ", translation: "Kur'an'ı öğretti.", explanation: "En büyük nimetin vahiy ve hidayet olduğunu bildirir." },
    { number: 3, arabic: "خَلَقَ الْإِنْسَانَ", translation: "İnsanı yarattı.", explanation: "İnsanın yaratılışının Allah'ın rahmetinin bir eseri olduğunu hatırlatır." }
  ],
  mulk: [
    { number: 1, arabic: "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ", translation: "Hükümranlık elinde olan Allah ne yücedir.", explanation: "Bütün mülk ve kudretin Allah'a ait olduğunu bildirir." },
    { number: 2, arabic: "الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ", translation: "Ölümü ve hayatı yaratan O'dur.", explanation: "Hayatın güzel amelle değerlendirilecek bir imtihan olduğunu hatırlatır." },
    { number: 3, arabic: "الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا", translation: "Yedi göğü tabaka tabaka yaratan O'dur.", explanation: "Kainattaki düzenin Allah'ın kudretine işaret ettiğini anlatır." }
  ]
};

const revelationStories: Record<string, string> = {
  fatiha:
    "Fatiha Suresi, Mekke döneminin ilk yıllarında müminlere namazın ruhunu, duanın adabını ve kulluğun özünü öğreten temel surelerden biri olarak inmiştir. Sure belli tek bir olaydan çok, vahyin başlangıç döneminde Müslümanların Allah'a nasıl yönelmesi gerektiğini gösteren bir rehber niteliğindedir. Hamd, rahmet, hesap günü, kulluk ve hidayet isteği bu kısa surede bir araya gelir.",
  bakara:
    "Bakara Suresi, hicretten sonra Medine'de yeni kurulan İslam toplumunun inanç, ibadet, aile, hukuk ve toplumsal hayatını düzenleyen uzun bir rehber olarak inmiştir. Müslümanların Medine'de müstakil bir ümmet haline gelmesi, kıblenin değişmesi, oruç ve hac gibi ibadetlerin ayrıntılanması, İsrailoğulları kıssaları ve toplumsal sorumluluklar bu surenin iniş bağlamını oluşturur.",
  "ali-imran":
    "Al-i İmran Suresi, Medine döneminde özellikle Ehl-i Kitap ile yapılan inanç tartışmaları, Uhud Savaşı sonrası yaşanan muhasebe ve Müslüman toplumun sabırla ayakta kalma ihtiyacı içinde inmiştir. Sure tevhid inancını güçlendirir, Hz. Meryem ve Hz. İsa kıssalarını anlatır, Uhud sonrası müminlere moral ve istikamet verir.",
  nisa:
    "Nisa Suresi, Medine döneminde aile, miras, yetimler, evlilik, toplumsal adalet ve savaş sonrası sorumluluklar gibi konuların düzenlendiği bir süreçte inmiştir. Uhud Savaşı sonrasında yetim kalan çocuklar, dul kalan kadınlar ve toplumun korunması gereken kesimleriyle ilgili hükümler surenin önemli bağlamlarından biridir.",
  maide:
    "Maide Suresi, Medine döneminin sonlarına doğru İslam toplumunun ahit, helal-haram hassasiyeti, ibadetler ve sosyal ilişkilerde olgunlaşmasını hedefleyen ayetlerle inmiştir. Surede verilen hükümler, Müslümanların artık kurumsallaşmış bir toplum olarak sorumluluklarını taşımasına yöneliktir.",
  yasin:
    "Yasin Suresi, Mekke döneminde inkarın yoğunlaştığı, peygamberlik ve ahiret inancının reddedildiği bir ortamda inmiştir. Sure elçilerin davetini, dirilişi, kainattaki delilleri ve Allah'ın kudretini güçlü bir üslupla hatırlatarak kalpleri tevhid ve ahiret bilincine çağırır.",
  rahman:
    "Rahman Suresi, Allah'ın rahmetini ve nimetlerini tekrar eden etkileyici bir üslupla hatırlatır. İnsanın yaratılışı, Kur'an'ın öğretilmesi, kainattaki denge ve ahiret sahneleri üzerinden kulun şükür sorumluluğunu canlı tutar. Surenin ana bağlamı, nimeti fark etmek ve rahmet sahibine yönelmektir.",
  mulk:
    "Mülk Suresi, Mekke döneminde insanı kainat, ölüm, hayat ve hesap üzerine düşünmeye çağıran ayetlerle inmiştir. İnkarın baskın olduğu bir ortamda Allah'ın mutlak hükümranlığını, yaratılıştaki düzeni ve insanın imtihan sorumluluğunu hatırlatır.",
  duha:
    "Duha Suresi, vahyin bir süre kesilmesi sebebiyle Peygamber Efendimizin gönlünde oluşan mahzunluğu teselli eden ayetlerle inmiştir. Sure, Rabbin terk etmediğini, geçmişte verilen nimetleri ve gelecekteki lütufları hatırlatarak ümit ve güven duygusu verir.",
  insirah:
    "İnşirah Suresi, Peygamber Efendimizin tebliğ yükü karşısında kalbinin ferahlatıldığını ve her zorlukla beraber kolaylık bulunduğunu bildiren teselli ayetleriyle inmiştir. Mekke döneminin ağır şartları içinde sabır, umut ve yeniden gayret mesajı taşır.",
  kevser:
    "Kevser Suresi, Peygamber Efendimize yönelik küçümseyici sözlere karşı bir teselli ve müjde olarak inmiştir. Allah'ın ona bitmeyen hayır verdiğini bildirir; namaz ve kurbanla şükretmeyi emreder, asıl kesik olanın düşmanlıkta ısrar edenler olduğunu hatırlatır.",
  ihlas:
    "İhlas Suresi, Allah'ın birliğini en özlü biçimde anlatan Mekki bir suredir. Müşriklerin Allah hakkında sordukları sorulara cevap niteliğinde, O'nun doğmadığını, doğurmadığını ve hiçbir denginin bulunmadığını ilan eder."
};

function createSurahDetail(item: (typeof surahCatalog)[number], index: number): SurahDetail {
  const [id, name, arabicName, meaning, verses, revelationPlace] = item;
  const number = index + 1;
  return {
    id,
    number,
    name,
    arabicName,
    meaning,
    verses,
    duration: "Sesli",
    revelationPlace,
    audioUri: `${audioBase}/${number.toString().padStart(3, "0")}.mp3`,
    description: `${name}; ${revelationPlace} döneminde inmiş, ${verses} ayetten oluşan bir suredir. Bu ekranda Arapça okuma, Türkçe açıklama ve sesli dinleme birlikte sunulur.`,
    revelationStory:
      revelationStories[id] ??
      `${name}, ${revelationPlace} döneminde inen sureler arasındadır. İniş bağlamı, surenin ana mesajıyla birlikte düşünülür: tevhid, kulluk bilinci, ahiret sorumluluğu, sabır, şükür ve insanın Allah karşısındaki konumu. Bu bölüm ileride klasik tefsir kaynaklarından ayrıntılı rivayetlerle genişletilecek şekilde hazırlanmıştır.`,
    versesText:
      highlightedVerses[id] ??
      [
        {
          number: 1,
          arabic: arabicName,
          translation: `${name}, ${meaning} anlamıyla Kur'an-ı Kerim'de yer alan ${verses} ayetlik bir suredir.`,
          explanation: `Bu sure ${revelationPlace} döneminin manevi iklimini taşır. Temel okuma, surenin Allah'a kulluk, ahiret bilinci, sabır, şükür ve doğru yola yönelme mesajları etrafında anlaşılmasıdır.`
        }
      ]
  };
}

export const surahDetails: SurahDetail[] = surahCatalog.map(createSurahDetail);
export const surahs: Surah[] = surahDetails.map(({ description, revelationStory, versesText, ...surah }) => surah);

export const mosques: Mosque[] = [
  { id: "ulu", name: "Ulu Camii", distance: "350 m", address: "Fevzi Paşa Caddesi, Merkez", walkingTime: "5 dk" },
  { id: "efendi", name: "Merkez Efendi Camii", distance: "850 m", address: "Aksaray Mahallesi", walkingTime: "12 dk" },
  { id: "fatih", name: "Fatih Camii", distance: "1.2 km", address: "Ali Kuşçu Mahallesi", walkingTime: "18 dk" }
];

export const fridayCategories = ["Tümü", "Klasik", "Minimal", "Modern", "Ayetli", "Hadisli"];

export const fridayMessages: FridayMessage[] = [
  { id: "rahmet", category: "Klasik", message: "Allah'ın rahmeti ve bereketi üzerinize olsun. Hayırlı Cumalar.", background: "#2E1D12", accent: "#D7B35A" },
  { id: "namaz", category: "Modern", message: "Gönlünüz duayla, gününüz huzurla dolsun. Cumanız mübarek olsun.", background: "#0A5C78", accent: "#F5D67B" },
  { id: "ayet", category: "Ayetli", message: "Şüphesiz zorlukla beraber bir kolaylık vardır. Hayırlı Cumalar.", background: "#3B2A16", accent: "#E7C36C" },
  { id: "dua", category: "Minimal", message: "Dualarınız kabul, kalbiniz huzur bulsun. Cuma bereketi üzerinize olsun.", background: "#075E47", accent: "#D7B35A" }
];

export const storyTemplates: StoryTemplate[] = [
  { id: "instagram", title: "Instagram Story", format: "Dikey", size: "1080x1920", background: "#075E47", accent: "#D7B35A", message: "Cumanız mübarek, dualarınız kabul olsun." },
  { id: "whatsapp", title: "WhatsApp Durumu", format: "Dikey", size: "1080x1920", background: "#F8F4EA", accent: "#075E47", message: "Rahmet kapıları açık, gönüller huzurlu olsun." },
  { id: "square", title: "Kare Gönderi", format: "Kare", size: "1080x1080", background: "#1B2B29", accent: "#F5D67B", message: "Hayırlı Cumalar. Bereket ve huzur sizinle olsun." }
];

export const settingsItems: SettingsItem[] = [
  { id: "prayer", title: "Namaz Vakti Bildirimleri", subtitle: "Ezan sesi seçimi, önceden uyarı", icon: "notifications", value: "Açık" },
  { id: "language", title: "Dil Seçimi", icon: "globe", value: "Türkçe" },
  { id: "theme", title: "Tema", icon: "color-palette", value: "Aydınlık" },
  { id: "about", title: "Uygulama Hakkında", subtitle: "Sürüm 1.0.0", icon: "information-circle" },
  { id: "contact", title: "İletişim", icon: "mail" }
];
