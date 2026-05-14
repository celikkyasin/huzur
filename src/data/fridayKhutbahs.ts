export type FridayKhutbah = {
  id: string;
  date: string;
  title: string;
  summary: string;
  content: string[];
};

export const fridayKhutbahs: FridayKhutbah[] = [
  {
    id: "2026-05-15",
    date: "15 Mayıs 2026",
    title: "Ailede Merhamet ve Güzel Söz",
    summary: "Aile hayatında merhamet, sabır ve güzel sözün bereketi.",
    content: [
      "Aziz kardeşlerim, aile; sevginin, emanete riayetin ve merhametin ilk öğrenildiği yuvadır. Bir evde güzel söz çoğaldıkça huzur da çoğalır.",
      "Rabbimiz bizlere eşlerimiz ve çocuklarımız için göz aydınlığı olacak bir aile düzeni istemeyi öğretir. Bu dua, evlerimizi sadece barınak değil, rahmet iklimi haline getirme çağrısıdır.",
      "Öyleyse kırıcı sözden uzak duralım, sabrı çoğaltalım, büyüklerimize hürmeti, küçüklerimize şefkati ihmal etmeyelim."
    ]
  },
  {
    id: "2026-05-08",
    date: "8 Mayıs 2026",
    title: "Namazla Dirilen Kalpler",
    summary: "Namazın vakit bilinci ve kulluk disiplini üzerindeki yeri.",
    content: [
      "Namaz, müminin gününü Allah'a bağlılıkla düzenleyen en güçlü ibadetlerden biridir.",
      "Vakitlere dikkat etmek, insanın hayatına ölçü, kalbine sükunet ve davranışlarına istikamet kazandırır.",
      "Namazı sadece bir görev olarak değil, Rabbiyle buluşma sevinci olarak yaşayabilen gönüller huzura yaklaşır."
    ]
  },
  {
    id: "2026-05-01",
    date: "1 Mayıs 2026",
    title: "Helal Kazanç ve Kul Hakkı",
    summary: "Kazançta dürüstlük, emekte adalet ve kul hakkı hassasiyeti.",
    content: [
      "Helal kazanç, sadece sofraya gelen lokmanın değil, kalbe giren huzurun da kaynağıdır.",
      "Mümin, işinde doğruluğu, sözünde güveni, alışverişinde adaleti gözetir.",
      "Kul hakkından sakınmak; ailemize, toplumumuza ve ahiretimize karşı sorumluluğumuzdur."
    ]
  }
];
