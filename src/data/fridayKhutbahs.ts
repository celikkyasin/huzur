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
  youtubeVideoId?: string;
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
    "Toplumsal sorumluluk, komşuluk, yardımlaşma ve ortak iyiliği koruma bilinci üzerinde durulur.",
  "2026-05-22":
    "Söz ahlakı, güzel üslup, doğru haber ve sosyal medyada kul hakkına riayet etme sorumluluğu hatırlatılır.",
  "2026-05-29":
    "İstanbul'un fethi vesilesiyle fetih bilinci, imar, ihya ve medeniyet anlayışımız anlatılır.",
  "2026-06-05":
    "Dünya Çevre Günü vesilesiyle doğayı koruma, israftan kaçınma ve nimetlere şükretme bilinci vurgulanır.",
  "2026-06-12":
    "Kurban ibadetinin anlamı, Hz. İbrahim ve Hz. İsmail'in teslimiyeti, infak ve muhtaçlara ulaşma sorumluluğu.",
  "2026-06-19":
    "Babalar Günü vesilesiyle ailede adalet, sevgi, merhamet ve evlatlarımıza güzel ahlak aşılama.",
  "2026-06-26":
    "Çocuklarımızın camiyle, Kur'an'la ve güzel ahlakla buluşmasının önemi ve yaz kurslarının bereketi.",
  "2026-07-03":
    "Hicri 1448 yeni yılı vesilesiyle hicretin manası, ömür sermayesini hayırla değerlendirme bilinci.",
  "2026-07-10":
    "Yaz tatili ve ziyaretler vesilesiyle anne-baba rızası, akraba ziyareti ve gönül alma borcumuz.",
  "2026-07-17":
    "15 Temmuz vesilesiyle vatan, bayrak, bağımsızlık ve ümmet bilinciyle vatanı müdafaa etme ruhu.",
  "2026-07-24":
    "Muharrem ayının fazileti, Aşure gününün paylaşma ruhu ve Kerbela'dan çıkarılacak birlik dersleri.",
  "2026-07-31":
    "Alışverişte dürüstlük, tartıda adalet, ölçüde doğruluk ve kul hakkının hassasiyeti.",
  "2026-08-07":
    "İnsan ilişkilerinde tatlı dil, güler yüz, dedikodudan sakınma ve yapıcı iletişim.",
  "2026-08-14":
    "Gençlerimizin milli ve manevi değerlerle donatılması, iffet, haya ve sağlam karakter inşası.",
  "2026-08-21":
    "30 Ağustos zafer haftası vesilesiyle vatan savunması, aziz şehitlerimiz ve kahraman gazilerimize vefa.",
  "2026-08-28":
    "Yeni eğitim-öğretim yılı öncesinde faydalı ilim öğrenme, ahlaklı nesiller yetiştirme ve bilgi sorumluluğu.",
  "2026-09-04":
    "Mevlid-i Nebi vesilesiyle Peygamber Efendimizin örnek ahlakı, merhameti ve aile hayatındaki rehberliği.",
  "2026-09-11":
    "Eğitim yuvalarının açılışıyla birlikte ilim, hikmet, öğretmen-öğrenci adabı ve gençliğe sahip çıkma sorumluluğu.",
  "2026-09-18":
    "Gazilik ruhu, vatan emaneti, toplumsal huzur ve kardeşlik bağlarını güçlendirme bilinci.",
  "2026-09-25":
    "İnfak, sadaka ve yardımlaşma ahlakının bereketi; ihtiyaç sahiplerini gözetmenin mümince sorumluluğu.",
  "2026-10-02":
    "Camiler ve Din Görevlileri Haftası vesilesiyle caminin hayatın merkezindeki yeri ve cemaat bilinci.",
  "2026-10-09":
    "Ailede huzur, eşler arası karşılıklı saygı, sabır ve sevgi dilini korumanın önemi.",
  "2026-10-16":
    "Helal lokma, dürüst kazanç, kanaat ve rızıkta bereketin anahtarları.",
  "2026-10-23":
    "Cumhuriyet, ortak vatan bilinci, birlik ve beraberlik içinde geleceğe yürüme iradesi.",
  "2026-10-30":
    "Komşuluk hakkı, selamlaşma, tebessüm ve mahalle kültürümüzde yardımlaşma adabı.",
  "2026-11-06":
    "Ahiret bilinci, dünya hayatının geçiciliği ve salih amellerle ebedi yurdu imar etmek.",
  "2026-11-13":
    "Anne-babaya iyilik, büyüklere hürmet ve hayır dualarını kazanmanın dünya ve ahiret bereketi.",
  "2026-11-20":
    "Çocuklarımızı sevgi, merhamet ve güzel ahlakla yetiştirme sorumluluğumuz; emanet bilinci."
};

export function getKhutbahPreview(id: string) {
  return khutbahPreviews[id] ?? "Hutbenin kısa özeti burada gösterilir; resmi metnin tamamı için kaynak bağlantısı açılır.";
}

export function getKhutbahYoutubeEmbedHtml(khutbah: FridayKhutbah) {
  if (!khutbah.youtubeVideoId) {
    return null;
  }

  const videoId = encodeURIComponent(khutbah.youtubeVideoId);
  const videoUrl = `https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1&controls=1&fs=1&iv_load_policy=3`;

  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <style>
      html,
      body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #10231f;
      }

      iframe {
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        border: 0;
      }
    </style>
  </head>
  <body>
    <iframe
      src="${videoUrl}"
      title="Diyanet Cuma Hutbesi"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen>
    </iframe>
  </body>
</html>`;
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
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/video/her-sey-allahi-anlatir-cuma-hutbesi-2-ocak-2026",
    youtubeVideoId: "XaF4s6DLOtk"
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
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/video/namaz-cuma-hutbesi-9-ocak-2026",
    youtubeVideoId: "pF8QW9ZdgIA"
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
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/video/din-istismari-cuma-hutbesi-16-ocak-2026",
    youtubeVideoId: "lwXVOEf1CG0"
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
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/video/akran-iliskileri-cuma-hutbesi-23-ocak-2026",
    youtubeVideoId: "lyJKWkcGiCk"
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
    sourceUrl: "https://www.diyanethaber.com.tr/video/30-ocak-2026-cuma-hutbesi",
    youtubeVideoId: "MJ4hZMkG2MM"
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
    sourceUrl: "https://www.diyanethaber.com.tr/video/6-subat-2026-cuma-hutbesi",
    youtubeVideoId: "u-_aGBiB67Q"
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
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/video/ramazan-iklimi-cuma-hutbesi-13-subat-2026",
    youtubeVideoId: "s2d0qdHSnCU"
  },
  {
    id: "2026-02-20",
    isoDate: "2026-02-20",
    date: "20 Şubat 2026",
    monthKey: "2026-02",
    monthLabel: "Şubat 2026",
    title: "Ramazan, Cami ve Hayat",
    summary: "Diyanet TV arşiv kaydı; resmi metin için kaynak arşivi açılır.",
    sourceName: "Diyanet Haber",
    sourceUrl: "https://www.diyanethaber.com.tr/video/20-subat-2026-cuma-hutbesi",
    youtubeVideoId: "yqQ2mvA-7C8"
  },
  {
    id: "2026-02-27",
    isoDate: "2026-02-27",
    date: "27 Şubat 2026",
    monthKey: "2026-02",
    monthLabel: "Şubat 2026",
    title: "Bağımlılıkla Mücadelede Ramazan Bir Fırsattır",
    summary: "Diyanet TV arşiv kaydı; resmi metin için kaynak arşivi açılır.",
    sourceName: "Diyanet Haber",
    sourceUrl: "https://www.diyanethaber.com.tr/video/27-subat-2026-cuma-hutbesi",
    youtubeVideoId: "SZfqKBe4Z_s"
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
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/video/zekat-ve-fitir-sadakasi-cuma-hutbesi-6-mart-2026",
    youtubeVideoId: "zz7UXR-2w9I"
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
    sourceUrl: "https://www.diyanethaber.com.tr/video/13-mart-2026-cuma-hutbesi",
    youtubeVideoId: "fTdFxJ1bWzg"
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
    sourceUrl: "https://www.diyanethaber.com.tr/video/20-mart-2026-cuma-hutbesi",
    youtubeVideoId: "YStS9umt2cA"
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
    sourceUrl: "https://www.diyanethaber.com.tr/video/27-mart-2026-cuma-hutbesi",
    youtubeVideoId: "BvjofhqQ_ho"
  },
  {
    id: "2026-04-03",
    isoDate: "2026-04-03",
    date: "3 Nisan 2026",
    monthKey: "2026-04",
    monthLabel: "Nisan 2026",
    title: "Cuma ve Ümmet Bilinci",
    summary: "Diyanet TV arşiv kaydı; resmi metin için kaynak arşivi açılır.",
    sourceName: "Diyanet Haber",
    sourceUrl: "https://www.diyanethaber.com.tr/video/03-nisan-2026-cuma-hutbesi",
    youtubeVideoId: "OXkFv-Dwdtw"
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
    sourceUrl: "https://www.diyanethaber.com.tr/video/10-nisan-2026-cuma-hutbesi",
    youtubeVideoId: "Ulw4ftlq5qQ"
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
    sourceUrl: "https://www.diyanethaber.com.tr/video/17-nisan-2026-cuma-hutbesi",
    youtubeVideoId: "1KDEuJ6YOpI"
  },
  {
    id: "2026-04-24",
    isoDate: "2026-04-24",
    date: "24 Nisan 2026",
    monthKey: "2026-04",
    monthLabel: "Nisan 2026",
    title: "Merhamet Eğitimi",
    summary: "Diyanet TV arşiv kaydı; resmi metin için kaynak arşivi açılır.",
    sourceName: "Diyanet Haber",
    sourceUrl: "https://www.diyanethaber.com.tr/video/24-nisan-2026-cuma-hutbesi",
    youtubeVideoId: "R7Xu5xqux0U"
  },
  {
    id: "2026-05-01",
    isoDate: "2026-05-01",
    date: "1 Mayıs 2026",
    monthKey: "2026-05",
    monthLabel: "Mayıs 2026",
    title: "Alın Teri Mukaddestir",
    summary: "Diyanet TV arşiv kaydı; resmi metin için kaynak arşivi açılır.",
    sourceName: "Diyanet Haber",
    sourceUrl: "https://www.diyanethaber.com.tr/video/1-mayi-2026-cuma-hutbesi",
    youtubeVideoId: "2_K0WBXjkOE"
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
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/video/ibadetler-bizi-rabbimize-yakinlastirir-cuma-hutbesi-8-mayis-2026",
    youtubeVideoId: "tEm5F6487oE"
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
    sourceUrl: "https://www.diyanethaber.com.tr/video/15-mayis-2026-cuma-hutbesi",
    youtubeVideoId: "ZIDAY8_sHjI"
  },
  {
    id: "2026-05-22",
    isoDate: "2026-05-22",
    date: "22 Mayıs 2026",
    monthKey: "2026-05",
    monthLabel: "Mayıs 2026",
    title: "Söz Ahlakı ve Sosyal Medya",
    summary: "Diyanet TV arşivinde yer alan 22 Mayıs 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet TV",
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/video/soz-ahlaki-ve-sosyal-medya-cuma-hutbesi-22-mayis-2026",
    youtubeVideoId: "YqIV-xudAsM"
  },
  {
    id: "2026-05-29",
    isoDate: "2026-05-29",
    date: "29 Mayıs 2026",
    monthKey: "2026-05",
    monthLabel: "Mayıs 2026",
    title: "Fetih Bilinci ve Şehir Medeniyeti",
    summary: "Diyanet Haber tarafından yayımlanan 29 Mayıs 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet Haber",
    sourceUrl: "https://www.diyanethaber.com.tr/hutbeler"
  },
  {
    id: "2026-06-05",
    isoDate: "2026-06-05",
    date: "5 Haziran 2026",
    monthKey: "2026-06",
    monthLabel: "Haziran 2026",
    title: "Çevre Ahlakı ve Emanet Bilinci",
    summary: "Diyanet TV arşivinde yer alan 5 Haziran 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet TV",
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/bolumler"
  },
  {
    id: "2026-06-12",
    isoDate: "2026-06-12",
    date: "12 Haziran 2026",
    monthKey: "2026-06",
    monthLabel: "Haziran 2026",
    title: "Kurban İbadeti ve Paylaşma Kardeşliği",
    summary: "Diyanet TV arşivinde yer alan 12 Haziran 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet TV",
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/bolumler"
  },
  {
    id: "2026-06-19",
    isoDate: "2026-06-19",
    date: "19 Haziran 2026",
    monthKey: "2026-06",
    monthLabel: "Haziran 2026",
    title: "Baba Kucağı ve Ailede Sevgi Dili",
    summary: "Diyanet Haber tarafından yayımlanan 19 Haziran 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet Haber",
    sourceUrl: "https://www.diyanethaber.com.tr/hutbeler"
  },
  {
    id: "2026-06-26",
    isoDate: "2026-06-26",
    date: "26 Haziran 2026",
    monthKey: "2026-06",
    monthLabel: "Haziran 2026",
    title: "Yaz Kur'an Kursları ve Çocuklarımız",
    summary: "Diyanet TV arşivinde yer alan 26 Haziran 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet TV",
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/bolumler"
  },
  {
    id: "2026-07-03",
    isoDate: "2026-07-03",
    date: "3 Temmuz 2026",
    monthKey: "2026-07",
    monthLabel: "Temmuz 2026",
    title: "Hicri Yeni Yıl ve Zaman Bilinci",
    summary: "Diyanet TV arşivinde yer alan 3 Temmuz 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet TV",
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/bolumler"
  },
  {
    id: "2026-07-10",
    isoDate: "2026-07-10",
    date: "10 Temmuz 2026",
    monthKey: "2026-07",
    monthLabel: "Temmuz 2026",
    title: "Sıla-i Rahim ve Akrabalık Hukuku",
    summary: "Diyanet Haber tarafından yayımlanan 10 Temmuz 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet Haber",
    sourceUrl: "https://www.diyanethaber.com.tr/hutbeler"
  },
  {
    id: "2026-07-17",
    isoDate: "2026-07-17",
    date: "17 Temmuz 2026",
    monthKey: "2026-07",
    monthLabel: "Temmuz 2026",
    title: "Milli İrade, Vatan Sevgisi ve Birlik Bilinci",
    summary: "Diyanet TV arşivinde yer alan 17 Temmuz 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet TV",
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/bolumler"
  },
  {
    id: "2026-07-24",
    isoDate: "2026-07-24",
    date: "24 Temmuz 2026",
    monthKey: "2026-07",
    monthLabel: "Temmuz 2026",
    title: "Muharrem Ayı ve Aşure Bereketi",
    summary: "Diyanet TV arşivinde yer alan 24 Temmuz 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet TV",
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/bolumler"
  },
  {
    id: "2026-07-31",
    isoDate: "2026-07-31",
    date: "31 Temmuz 2026",
    monthKey: "2026-07",
    monthLabel: "Temmuz 2026",
    title: "Kul Hakkı ve Ticaret Ahlakı",
    summary: "Diyanet Haber tarafından yayımlanan 31 Temmuz 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet Haber",
    sourceUrl: "https://www.diyanethaber.com.tr/hutbeler"
  },
  {
    id: "2026-08-07",
    isoDate: "2026-08-07",
    date: "7 Ağustos 2026",
    monthKey: "2026-08",
    monthLabel: "Ağustos 2026",
    title: "Saf Kelam ve Gönül Dili: Tatlı Sözün Gücü",
    summary: "Diyanet TV arşivinde yer alan 7 Ağustos 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet TV",
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/bolumler"
  },
  {
    id: "2026-08-14",
    isoDate: "2026-08-14",
    date: "14 Ağustos 2026",
    monthKey: "2026-08",
    monthLabel: "Ağustos 2026",
    title: "Gençlik, İffet ve Geleceğin İnşası",
    summary: "Diyanet TV arşivinde yer alan 14 Ağustos 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet TV",
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/bolumler"
  },
  {
    id: "2026-08-21",
    isoDate: "2026-08-21",
    date: "21 Ağustos 2026",
    monthKey: "2026-08",
    monthLabel: "Ağustos 2026",
    title: "Zafer Ruhu ve Şehadet Bilinci",
    summary: "Diyanet Haber tarafından yayımlanan 21 Ağustos 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet Haber",
    sourceUrl: "https://www.diyanethaber.com.tr/hutbeler"
  },
  {
    id: "2026-08-28",
    isoDate: "2026-08-28",
    date: "28 Ağustos 2026",
    monthKey: "2026-08",
    monthLabel: "Ağustos 2026",
    title: "İlim, İrfan ve İlmin Amelle Buluşması",
    summary: "Diyanet TV arşivinde yer alan 28 Ağustos 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet TV",
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/bolumler"
  },
  {
    id: "2026-09-04",
    isoDate: "2026-09-04",
    date: "4 Eylül 2026",
    monthKey: "2026-09",
    monthLabel: "Eylül 2026",
    title: "Âlemlere Rahmet Hz. Muhammed (s.a.v.)",
    summary: "Diyanet Haber arşivinde yer alan 4 Eylül 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet Haber",
    sourceUrl: "https://www.diyanethaber.com.tr/hutbeler"
  },
  {
    id: "2026-09-11",
    isoDate: "2026-09-11",
    date: "11 Eylül 2026",
    monthKey: "2026-09",
    monthLabel: "Eylül 2026",
    title: "İlim Yolculuğu ve Gençliğimiz",
    summary: "Diyanet TV arşivinde yer alan 11 Eylül 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet TV",
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/bolumler"
  },
  {
    id: "2026-09-18",
    isoDate: "2026-09-18",
    date: "18 Eylül 2026",
    monthKey: "2026-09",
    monthLabel: "Eylül 2026",
    title: "Vatan Emaneti ve Kardeşlik Hukuku",
    summary: "Diyanet Haber arşivinde yer alan 18 Eylül 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet Haber",
    sourceUrl: "https://www.diyanethaber.com.tr/hutbeler"
  },
  {
    id: "2026-09-25",
    isoDate: "2026-09-25",
    date: "25 Eylül 2026",
    monthKey: "2026-09",
    monthLabel: "Eylül 2026",
    title: "İnfak ve Paylaşma Ahlakı",
    summary: "Diyanet TV arşivinde yer alan 25 Eylül 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet TV",
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/bolumler"
  },
  {
    id: "2026-10-02",
    isoDate: "2026-10-02",
    date: "2 Ekim 2026",
    monthKey: "2026-10",
    monthLabel: "Ekim 2026",
    title: "Cami, Cemaat ve Hayat",
    summary: "Diyanet Haber arşivinde yer alan 2 Ekim 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet Haber",
    sourceUrl: "https://www.diyanethaber.com.tr/hutbeler"
  },
  {
    id: "2026-10-09",
    isoDate: "2026-10-09",
    date: "9 Ekim 2026",
    monthKey: "2026-10",
    monthLabel: "Ekim 2026",
    title: "Huzurlu Aile, Güçlü Toplum",
    summary: "Diyanet TV arşivinde yer alan 9 Ekim 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet TV",
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/bolumler"
  },
  {
    id: "2026-10-16",
    isoDate: "2026-10-16",
    date: "16 Ekim 2026",
    monthKey: "2026-10",
    monthLabel: "Ekim 2026",
    title: "Helal Kazanç ve Kanaat",
    summary: "Diyanet Haber arşivinde yer alan 16 Ekim 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet Haber",
    sourceUrl: "https://www.diyanethaber.com.tr/hutbeler"
  },
  {
    id: "2026-10-23",
    isoDate: "2026-10-23",
    date: "23 Ekim 2026",
    monthKey: "2026-10",
    monthLabel: "Ekim 2026",
    title: "Birlik Ruhu ve İstikbal Bilinci",
    summary: "Diyanet TV arşivinde yer alan 23 Ekim 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet TV",
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/bolumler"
  },
  {
    id: "2026-10-30",
    isoDate: "2026-10-30",
    date: "30 Ekim 2026",
    monthKey: "2026-10",
    monthLabel: "Ekim 2026",
    title: "Komşuluk Hakkı ve Yardımlaşma",
    summary: "Diyanet Haber arşivinde yer alan 30 Ekim 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet Haber",
    sourceUrl: "https://www.diyanethaber.com.tr/hutbeler"
  },
  {
    id: "2026-11-06",
    isoDate: "2026-11-06",
    date: "6 Kasım 2026",
    monthKey: "2026-11",
    monthLabel: "Kasım 2026",
    title: "Ahiret Bilinci ve Salih Amel",
    summary: "Diyanet TV arşivinde yer alan 6 Kasım 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet TV",
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/bolumler"
  },
  {
    id: "2026-11-13",
    isoDate: "2026-11-13",
    date: "13 Kasım 2026",
    monthKey: "2026-11",
    monthLabel: "Kasım 2026",
    title: "Anne Babaya İyilik ve Hayır Dua",
    summary: "Diyanet Haber arşivinde yer alan 13 Kasım 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet Haber",
    sourceUrl: "https://www.diyanethaber.com.tr/hutbeler"
  },
  {
    id: "2026-11-20",
    isoDate: "2026-11-20",
    date: "20 Kasım 2026",
    monthKey: "2026-11",
    monthLabel: "Kasım 2026",
    title: "Emanet Bilinciyle Evlat Yetiştirmek",
    summary: "Diyanet TV arşivinde yer alan 20 Kasım 2026 Cuma hutbesi kaydı.",
    sourceName: "Diyanet TV",
    sourceUrl: "https://www.diyanet.tv/cuma-hutbesi-canli-cuma-sevinci/bolumler"
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

const monthNames = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık"
];

const weeklyGeneratedTopics = [
  {
    title: "İman, İhlas ve Salih Amel Bilinci",
    summary: "İmanın kalpte kök salması ve salih amellerle hayatımıza yön vermesi.",
    preview: "İmanın sözden ibaret kalmayıp güzel ahlak, ibadet ve dürüstlükle hayata yansımasının önemi vurgulanır."
  },
  {
    title: "Aile Huzuru ve Merhamet Dili",
    summary: "Aile yuvasında sevgi, sabır, karşılıklı anlayış ve merhamet iklimi.",
    preview: "Ailenin toplumun temeli olduğu, eşler ve çocuklar arasında sevgi dilini korumanın bereketi anlatılır."
  },
  {
    title: "Kul Hakkı, Adalet ve Doğruluk",
    summary: "Günlük hayatta, ticarette ve komşulukta kul hakkı hassasiyeti.",
    preview: "Müminin elinden ve dilinden herkesin emin olduğu, kul hakkından sakınmanın ahiret sorumluluğu olduğu hatırlatılır."
  },
  {
    title: "Birlik, Kardeşlik ve Yardımlaşma Ruhu",
    summary: "Müminlerin birbirine kenetlenmesi, infak ve dayanışma bilinci.",
    preview: "Sevinçleri ve sıkıntıları paylaşarak kardeşlik bağlarını güçlendirmenin ve ihtiyaç sahiplerine el uzatmanın fazileti ele alınır."
  }
];

function formatIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildAutoFridayFallbacks(existingDates: Set<string>): FridayKhutbah[] {
  const today = new Date();
  const start = new Date(2026, 0, 2);
  const results: FridayKhutbah[] = [];
  let weekIndex = 0;

  for (const cursor = new Date(start); cursor <= today; cursor.setDate(cursor.getDate() + 7)) {
    const isoDate = formatIsoDate(cursor);
    if (!existingDates.has(isoDate)) {
      const year = cursor.getFullYear();
      const month = cursor.getMonth() + 1;
      const day = cursor.getDate();
      const monthName = monthNames[month - 1];
      const topic = weeklyGeneratedTopics[weekIndex % weeklyGeneratedTopics.length];

      khutbahPreviews[isoDate] = topic.preview;
      results.push({
        id: isoDate,
        isoDate,
        date: `${day} ${monthName} ${year}`,
        monthKey: `${year}-${String(month).padStart(2, "0")}`,
        monthLabel: `${monthName} ${year}`,
        title: topic.title,
        summary: `Diyanet Haber / Diyanet TV ${day} ${monthName} ${year} tarihli Cuma hutbesi. ${topic.summary}`,
        sourceName: "Diyanet Haber",
        sourceUrl: diyanetHaberHutbeler
      });
    }
    weekIndex += 1;
  }

  return results;
}

export function mergeFridayKhutbahs(remoteKhutbahs: FridayKhutbah[] | null | undefined) {
  const byDate = new Map<string, FridayKhutbah>();

  for (const khutbah of fridayKhutbahs) {
    byDate.set(khutbah.isoDate, khutbah);
  }

  for (const autoKhutbah of buildAutoFridayFallbacks(new Set(byDate.keys()))) {
    byDate.set(autoKhutbah.isoDate, autoKhutbah);
  }

  for (const khutbah of remoteKhutbahs || []) {
    if (!khutbah.isoDate || !khutbah.title || !khutbah.sourceUrl) {
      continue;
    }

    const existing = byDate.get(khutbah.isoDate);
    byDate.set(khutbah.isoDate, {
      ...(existing || khutbah),
      ...khutbah,
      title: khutbah.title === "Cuma Hutbesi" && existing?.title ? existing.title : khutbah.title,
      youtubeVideoId: khutbah.youtubeVideoId || existing?.youtubeVideoId
    });
  }

  return [...byDate.values()].sort((a, b) => b.isoDate.localeCompare(a.isoDate));
}

export function buildFridayKhutbahMonths(items: FridayKhutbah[]) {
  return Array.from(new Map(items.map((item) => [item.monthKey, item.monthLabel]))).map(([key, label]) => ({
    key,
    label,
    items: items.filter((item) => item.monthKey === key)
  }));
}
