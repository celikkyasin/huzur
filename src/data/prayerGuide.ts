import type { IconName } from "@/types";

export type PrayerRakats = {
  id: string;
  name: string;
  detail: string;
  note: string;
};

export type PrayerStep = {
  id: string;
  title: string;
  icon: IconName;
  posture: string;
  reading: string;
  description: string;
};

export type PrayerReading = {
  id: string;
  title: string;
  place: string;
  arabic: string;
  transliteration: string;
  meaning: string;
};

export const prayerPreparation = [
  "Abdest alınır, beden ve elbise temiz olur.",
  "Namaz kılınacak yer temiz seçilir.",
  "Kıbleye dönülür ve kalben niyet edilir.",
  "Vakit namazına göre sünnet, farz veya vitir niyeti yapılır.",
  "Namaza huzurla başlanır; acele etmeden tadil-i erkana dikkat edilir."
];

export const prayerRakats: PrayerRakats[] = [
  { id: "sabah", name: "Sabah", detail: "2 rekat sünnet + 2 rekat farz", note: "Farzdan önce iki rekat sünnet kılınır." },
  { id: "ogle", name: "Öğle", detail: "4 rekat ilk sünnet + 4 rekat farz + 2 rekat son sünnet", note: "Dört rekatlı sünnet ve farzlarda ara oturuş bulunur." },
  { id: "ikindi", name: "İkindi", detail: "4 rekat sünnet + 4 rekat farz", note: "Sünnetin ilk oturuşunda salavatlar okunur, üçüncü rekata Sübhaneke ile başlanır." },
  { id: "aksam", name: "Akşam", detail: "3 rekat farz + 2 rekat sünnet", note: "Üç rekatlı farzda ikinci rekattan sonra ara oturuş yapılır." },
  { id: "yatsi", name: "Yatsı", detail: "4 rekat ilk sünnet + 4 rekat farz + 2 rekat son sünnet + 3 rekat vitir", note: "Vitir namazının üçüncü rekatında Kunut duaları okunur." }
];

export const prayerSteps: PrayerStep[] = [
  {
    id: "niyet",
    title: "Niyet ve İftitah Tekbiri",
    icon: "hand-left",
    posture: "Ayakta, kıbleye dönük",
    reading: "Niyet edilir, “Allahu Ekber” denir.",
    description: "Kılınacak namaz kalben belirlenir. Eller kaldırılır ve tekbir alınarak namaza başlanır. Ardından eller bağlanır."
  },
  {
    id: "kiyam",
    title: "Kıyam",
    icon: "person",
    posture: "Ayakta duruş",
    reading: "Sübhaneke, Euzü Besmele, Fatiha ve zamm-ı sure okunur.",
    description: "İlk rekatta Sübhaneke okunur. Her rekatta Fatiha okunur; ilk iki rekatta Fatiha’dan sonra kısa bir sure veya birkaç ayet okunur."
  },
  {
    id: "ruku",
    title: "Rükû",
    icon: "arrow-down",
    posture: "Eğilme",
    reading: "En az üç defa “Sübhane rabbiye’l-azîm” denir.",
    description: "Sırt düzgün olacak şekilde rükûya varılır. Sonra “Semiallahu limen hamideh” denilerek doğrulunur, “Rabbena leke’l-hamd” denir."
  },
  {
    id: "secde",
    title: "Secde",
    icon: "ellipse",
    posture: "Yere kapanış",
    reading: "Her secdede en az üç defa “Sübhane rabbiye’l-a‘lâ” denir.",
    description: "Alın, burun, eller, dizler ve ayaklar yere gelecek şekilde secde edilir. İki secde arasında kısa oturuş yapılır."
  },
  {
    id: "oturus",
    title: "Oturuş",
    icon: "reader",
    posture: "Tahiyyat oturuşu",
    reading: "Ettehiyyatü, son oturuşta Salli, Barik ve Rabbena duaları okunur.",
    description: "İki rekatlı namazlarda ikinci rekat sonunda son oturuş yapılır. Üç ve dört rekatlı namazlarda ikinci rekat sonunda ara oturuş vardır."
  },
  {
    id: "selam",
    title: "Selam",
    icon: "return-down-forward",
    posture: "Sağa ve sola selam",
    reading: "“Esselamu aleyküm ve rahmetullah” denir.",
    description: "Son oturuştan sonra önce sağa, sonra sola selam verilerek namaz tamamlanır."
  }
];

export const prayerReadings: PrayerReading[] = [
  {
    id: "subhaneke",
    title: "Sübhaneke",
    place: "İlk rekatta tekbirden sonra okunur.",
    arabic: "",
    transliteration: "Sübhâneke allâhümme ve bi hamdik. Ve tebârekesmük. Ve teâlâ ceddük. Ve lâ ilâhe gayrük.",
    meaning: "Allah’ım! Seni eksik sıfatlardan tenzih ederim. Sana hamd ederim. Senin adın mübarektir, şanın yücedir. Senden başka ilah yoktur."
  },
  {
    id: "fatiha",
    title: "Fatiha Suresi",
    place: "Her rekatta okunur.",
    arabic: "",
    transliteration: "Bismillâhirrahmânirrahîm. Elhamdü lillâhi rabbi’l-âlemîn. Errahmânirrahîm. Mâliki yevmi’d-dîn. İyyâke na‘budü ve iyyâke neste‘în. İhdina’s-sırâta’l-müstakîm. Sırâta’llezîne en‘amte aleyhim. Ğayri’l-mağdûbi aleyhim ve le’d-dâllîn.",
    meaning: "Rahman ve Rahim olan Allah’ın adıyla. Hamd, alemlerin Rabbi Allah’a mahsustur. O Rahman ve Rahim’dir. Din gününün sahibidir. Yalnız sana kulluk eder, yalnız senden yardım dileriz. Bizi dosdoğru yola; kendilerine nimet verdiklerinin yoluna ilet. Gazaba uğrayanların ve sapmışların yoluna değil."
  },
  {
    id: "ruku",
    title: "Rükû Tesbihi",
    place: "Rükûda en az üç defa okunur.",
    arabic: "",
    transliteration: "Sübhâne rabbiye’l-azîm.",
    meaning: "Yüce Rabbim her türlü eksiklikten uzaktır."
  },
  {
    id: "secde",
    title: "Secde Tesbihi",
    place: "Secdede en az üç defa okunur.",
    arabic: "",
    transliteration: "Sübhâne rabbiye’l-a‘lâ.",
    meaning: "En yüce Rabbim her türlü eksiklikten uzaktır."
  },
  {
    id: "tahiyyat",
    title: "Ettehiyyatü",
    place: "Oturma halinde okunur.",
    arabic: "",
    transliteration: "Ettehiyyâtü lillâhi ve’s-salavâtü ve’t-tayyibât. Esselâmü aleyke eyyühe’n-nebiyyü ve rahmetullâhi ve berekâtüh. Esselâmü aleynâ ve alâ ibâdillâhi’s-sâlihîn. Eşhedü en lâ ilâhe illallâh ve eşhedü enne Muhammeden abdühû ve resûlüh.",
    meaning: "Bütün hürmetler, dualar ve güzel sözler Allah içindir. Ey Peygamber! Selam, Allah’ın rahmeti ve bereketi senin üzerine olsun. Selam bize ve Allah’ın salih kullarına olsun. Şahitlik ederim ki Allah’tan başka ilah yoktur; yine şahitlik ederim ki Muhammed O’nun kulu ve elçisidir."
  },
  {
    id: "salli",
    title: "Allahümme Salli",
    place: "Son oturuşta okunur.",
    arabic: "",
    transliteration: "Allahümme salli alâ Muhammedin ve alâ âli Muhammed. Kemâ salleyte alâ İbrâhîme ve alâ âli İbrâhîm. İnneke hamîdün mecîd.",
    meaning: "Allah’ım! Hz. Muhammed’e ve onun aline rahmet eyle; Hz. İbrahim’e ve onun aline rahmet ettiğin gibi. Şüphesiz sen övülmeye layık ve yücesin."
  },
  {
    id: "barik",
    title: "Allahümme Barik",
    place: "Son oturuşta okunur.",
    arabic: "",
    transliteration: "Allahümme bârik alâ Muhammedin ve alâ âli Muhammed. Kemâ bârekte alâ İbrâhîme ve alâ âli İbrâhîm. İnneke hamîdün mecîd.",
    meaning: "Allah’ım! Hz. Muhammed’e ve onun aline bereket ihsan eyle; Hz. İbrahim’e ve onun aline bereket ihsan ettiğin gibi. Şüphesiz sen övülmeye layık ve yücesin."
  },
  {
    id: "rabbena",
    title: "Rabbena Duaları",
    place: "Son oturuşta salavatlardan sonra okunur.",
    arabic: "",
    transliteration: "Rabbenâ âtinâ fi’d-dünyâ haseneten ve fi’l-âhireti haseneten ve kınâ azâbe’n-nâr. Rabbenâğfir lî ve li-vâlideyye ve li’l-mü’minîne yevme yekûmü’l-hisâb.",
    meaning: "Rabbimiz! Bize dünyada da ahirette de iyilik ver ve bizi ateş azabından koru. Rabbimiz! Hesap gününde beni, anne babamı ve müminleri bağışla."
  },
  {
    id: "short-surahs",
    title: "Kısa Sureler",
    place: "Fatiha’dan sonra zamm-ı sure olarak okunabilir.",
    arabic: "",
    transliteration: "Asr, Kevser, İhlas, Felak, Nas ve ezberinizdeki diğer kısa sureler okunabilir. Namazda Fatiha’dan sonra Kur’an’dan en az kısa bir sure veya birkaç ayet okumak yeterlidir.",
    meaning: "Ezber ilerledikçe farklı surelerle namaz zenginleşir. İlk aşamada kısa sureleri doğru okumaya, sonra anlamlarını öğrenmeye odaklanmak faydalıdır."
  }
];
