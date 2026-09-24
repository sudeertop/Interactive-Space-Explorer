/**
 * Scene geometry for the Solar System view.
 *
 * These are the values the 3D scene needs synchronously, before any network
 * call — so the visualisation and editorial panels always render without a
 * backend or build step.
 *
 * ── ORBITAL DISTANCE MAPPING ──────────────────────────────────────────────
 * Orbit radii are DERIVED from real semi-major axes (AU), not hand-placed.
 * A literal linear mapping is unusable: Neptune sits 77x further out than
 * Mercury, so the four inner planets would collapse into the Sun's disc.
 *
 * Strategy: a single power-law compression, applied uniformly.
 *
 *     r(scene) = R0 * (a_AU ^ 0.58)
 *
 * A power law (not a logarithm, not piecewise segments) is used deliberately:
 *   - It is monotonic, so planet ORDER is always correct.
 *   - One exponent for every planet means no arbitrary per-planet fudging;
 *     the whole system is one honest, reproducible transform.
 *   - It preserves the qualitative truth that outer gaps are far larger.
 *     Measured on this mapping, the Uranus→Neptune gap is 9.6x the
 *     Venus→Earth gap (true linear: 39.3x). A log10 mapping would have
 *     crushed that to 1.4x — i.e. almost equal gaps, exactly what we must
 *     avoid. So: dramatically compressed, but still dramatically uneven.
 *
 * This is a COMPRESSED visualisation and the UI says so. It is not to scale.
 * Body radii are compressed separately (and far more aggressively) — a
 * true-to-scale Sun beside a true-to-scale Mercury would be invisible.
 * ──────────────────────────────────────────────────────────────────────────
 */

/** Real semi-major axes, AU (IAU / NASA planetary fact sheet values). */
export const SEMI_MAJOR_AXIS_AU = {
  mercury: 0.387,
  venus: 0.723,
  earth: 1.0,
  mars: 1.524,
  jupiter: 5.203,
  saturn: 9.537,
  uranus: 19.191,
  neptune: 30.07,
};

const DISTANCE_EXPONENT = 0.58;
const DISTANCE_SCALE = 15.0;

/** AU -> scene units. Exported so the UI can explain the mapping honestly. */
export function orbitRadiusFor(au) {
  return DISTANCE_SCALE * Math.pow(au, DISTANCE_EXPONENT);
}

const R = (id) => Number(orbitRadiusFor(SEMI_MAJOR_AXIS_AU[id]).toFixed(2));

export const BODY_GEOMETRY = [
  {
    id: "sun",
    name: "Güneş",
    kicker: "Yıldız",
    mode: "page",
    href: "./pages/sun.html",
    lead: "Sistemin toplam kütlesinin yaklaşık %99,86'sını taşıyan yıldız.",
    color: "#f0a24a",
    radius: 3.6,
    orbitRadius: 0,
    periodDays: null,
    rotationHours: 609.1,
    surface: "star",
    tilt: 0.13,
  },
  {
    id: "mercury",
    name: "Merkür",
    kicker: "I. Gezegen",
    mode: "panel",
    href: null,
    lead: "Güneş'e en yakın ve en küçük gezegen.",
    color: "#8f8a84",
    radius: 0.62,
    orbitRadius: R("mercury"),
    periodDays: 88,
    rotationHours: 1407.6,
    surface: "rock",
    tilt: 0.0006,
  },
  {
    id: "venus",
    name: "Venüs",
    kicker: "II. Gezegen",
    mode: "panel",
    href: null,
    lead: "Yoğun karbondioksit atmosferiyle sistemin en sıcak gezegeni.",
    color: "#d8b68a",
    radius: 1.3,
    orbitRadius: R("venus"),
    periodDays: 224.7,
    rotationHours: -5832.5,
    surface: "cloud",
    tilt: 3.09,
  },
  {
    id: "earth",
    name: "Dünya",
    kicker: "III. Gezegen",
    mode: "panel",
    href: null,
    lead: "Yüzeyinde kararlı sıvı su bulunan gezegen.",
    color: "#4a7fa8",
    radius: 1.35,
    orbitRadius: R("earth"),
    periodDays: 365.25,
    rotationHours: 23.93,
    surface: "terra",
    tilt: 0.41,
  },
  {
    id: "moon",
    name: "Ay",
    kicker: "Dünya'nın uydusu",
    mode: "page",
    href: "./pages/moon.html",
    lead: "Dünya'nın tek doğal uydusu.",
    color: "#9a978f",
    radius: 0.38,
    orbitRadius: 2.9,
    periodDays: 27.3,
    rotationHours: 655.7,
    surface: "rock",
    tilt: 0.11,
    parent: "earth",
    // Earth and its satellite project a few pixels apart; push the Moon's label
    // clear of Earth's so neither becomes unclickable.
    labelOffset: [12, 16],
  },
  {
    id: "mars",
    name: "Mars",
    kicker: "IV. Gezegen",
    mode: "page",
    href: "./pages/mars.html",
    lead: "Demir oksitçe zengin yüzeyiyle kızıl görünen gezegen.",
    color: "#b45a3c",
    radius: 0.75,
    orbitRadius: R("mars"),
    periodDays: 687,
    rotationHours: 24.62,
    surface: "rock",
    tilt: 0.44,
  },
  {
    id: "jupiter",
    name: "Jüpiter",
    kicker: "V. Gezegen",
    mode: "panel",
    href: null,
    lead: "Sistemin en büyük gezegeni.",
    color: "#c9a37a",
    radius: 3.4,
    orbitRadius: R("jupiter"),
    periodDays: 4333,
    rotationHours: 9.93,
    surface: "bands",
    tilt: 0.05,
  },
  {
    id: "saturn",
    name: "Satürn",
    kicker: "VI. Gezegen",
    mode: "page",
    href: "./pages/saturn.html",
    lead: "Geniş halka sistemiyle tanınan gaz devi.",
    color: "#d8c8a0",
    radius: 3.0,
    orbitRadius: R("saturn"),
    periodDays: 10759,
    rotationHours: 10.7,
    surface: "bands",
    tilt: 0.47,
    rings: [1.28, 2.05],
  },
  {
    id: "uranus",
    name: "Uranüs",
    kicker: "VII. Gezegen",
    mode: "panel",
    href: null,
    lead: "Neredeyse yan yatmış eksende dönen buz devi.",
    color: "#8fb8bd",
    radius: 1.9,
    orbitRadius: R("uranus"),
    periodDays: 30687,
    rotationHours: -17.24,
    surface: "cloud",
    tilt: 1.71,
    rings: [1.5, 1.72],
  },
  {
    id: "neptune",
    name: "Neptün",
    kicker: "VIII. Gezegen",
    mode: "panel",
    href: null,
    lead: "Güneş'e en uzak gezegen; en hızlı rüzgârlara sahiptir.",
    color: "#4a6fa8",
    radius: 1.85,
    orbitRadius: R("neptune"),
    periodDays: 60190,
    rotationHours: 16.11,
    surface: "cloud",
    tilt: 0.49,
  },
];

export const OVERVIEW_FALLBACK = {
  kicker: "GENEL BAKIŞ",
  title: "Güneş Sistemi",
  lead: "Yaklaşık 4,6 milyar yıl önce oluşan; Güneş, sekiz gezegen ve onlara eşlik eden küçük cisimlerden oluşan kozmik sistemimiz.",
  stats: [
    { label: "Yaş", value: "≈ 4,6 milyar yıl" },
    { label: "Merkez yıldız", value: "Güneş" },
    { label: "Gezegen sayısı", value: "8" },
    { label: "İç sistem", value: "4 kayaç gezegen" },
    { label: "Dış sistem", value: "4 dev gezegen" },
    { label: "Küçük cisimler", value: "Asteroitler ve kuyrukluyıldızlar" },
  ],
  sections: [
    {
      heading: "Genel yapı",
      body: "İç sistemde Merkür, Venüs, Dünya ve Mars gibi kayaç gezegenler; dış sistemde Jüpiter ve Satürn gibi gaz devleri ile Uranüs ve Neptün gibi buz devleri bulunur.",
    },
    {
      heading: "Küçük cisimler",
      body: "Cüce gezegenler, doğal uydular, asteroitler ve kuyrukluyıldızlar da Güneş'in kütleçekimi altında sistemin parçasıdır.",
    },
  ],
  hint: "Bir gök cismini seçerek temel verilerini inceleyin.",
};

/** Complete bundled editorial copy; no API or backend is required. */
export const BODY_CONTENT_FALLBACKS = {
  mercury: {
    kicker: "I. GEZEGEN · KAYAÇ",
    lead: "Güneş'e en yakın ve en küçük gezegen; kayda değer bir atmosferi yoktur.",
    stats: [
      { label: "Çap", value: "4.879 km" },
      { label: "Güneş'e uzaklık", value: "0,39 AB (~58 milyon km)" },
      { label: "Yörünge süresi", value: "88 gün" },
      { label: "Dönme süresi", value: "58,6 gün" },
      { label: "Sıcaklık", value: "−173 °C … 427 °C" },
      { label: "Kutup birikimi", value: "Su buzu" },
      { label: "Uydu", value: "Yok" },
      { label: "Tür", value: "Kayaç gezegen" },
    ],
    sections: [
      { heading: "Uç sıcaklık farkı", body: "Atmosfer ısıyı tutamadığı için gündüz ve gece yüzeyi arasında 600 °C'yi aşan bir fark oluşur. Sistemdeki en büyük yüzey sıcaklık aralığı Merkür'e aittir." },
      { heading: "Yörünge ve dönme kilidi", body: "Merkür Güneş çevresinde her iki turda kendi ekseninde üç kez döner (3:2 spin–yörünge rezonansı). Bir güneş günü, iki Merkür yılına yakındır." },
      { heading: "Yüzey", body: "Ay'a benzeyen, yoğun kraterli bir yüzeye sahiptir. Caloris Havzası yaklaşık 1.550 km çapıyla sistemin en büyük çarpma havzalarından biridir." },
      { heading: "Kutuplardaki su buzu", body: "MESSENGER verileri, kutuplara yakın ve Güneş ışığını hiç almayan derin kraterlerde su buzu bulunduğunu doğruladı. Merkür'ün eksen eğikliği çok küçük olduğu için bu kalıcı gölgeler aşırı soğuk kalabilir." },
    ],
  },
  venus: {
    kicker: "II. GEZEGEN · KAYAÇ",
    lead: "Yoğun karbondioksit atmosferi ve güçlü sera etkisiyle Güneş Sistemi'nin en sıcak gezegenidir.",
    stats: [
      { label: "Çap", value: "12.104 km" },
      { label: "Güneş'e uzaklık", value: "0,72 AB (~108 milyon km)" },
      { label: "Yörünge süresi", value: "225 gün" },
      { label: "Dönme süresi", value: "243 gün (ters yönde)" },
      { label: "Sıcaklık", value: "~464 °C" },
      { label: "Jeolojik etkinlik", value: "Etkin volkanizma" },
      { label: "Uydu", value: "Yok" },
      { label: "Tür", value: "Kayaç gezegen" },
    ],
    sections: [
      { heading: "Kaçak sera etkisi", body: "Atmosferin %96'sı karbondioksittir ve yüzey basıncı Dünya'nın yaklaşık 92 katıdır. Isı kaçamadığı için yüzey, Merkür'den daha yakın olmadığı hâlde daha sıcaktır." },
      { heading: "Ters dönme", body: "Venüs kendi ekseninde diğer gezegenlerin tersine döner; Güneş batıdan doğar. Bir dönüşü, bir yörünge turundan uzundur." },
      { heading: "Bulut örtüsü", body: "Sülfürik asit bulutları yüzeyi görünür ışıkta tamamen gizler. Yüzey haritaları radarla çıkarılmıştır." },
      { heading: "Etkin volkanizma", body: "Magellan radar görüntülerinin farklı tarihlerde alınan kareleri, 1990'ların başında yeni lav akıntıları oluştuğunu gösterdi. Bu değişimler Venüs'ün jeolojik olarak hâlâ etkin olduğuna doğrudan kanıt sağlıyor." },
    ],
  },
  earth: {
    kicker: "III. GEZEGEN · KAYAÇ",
    lead: "Yüzeyinde kararlı sıvı su bulunan ve yaşam barındırdığı bilinen tek gezegendir.",
    stats: [
      { label: "Çap", value: "12.742 km" },
      { label: "Güneş'e uzaklık", value: "1 AB (~150 milyon km)" },
      { label: "Yörünge süresi", value: "365,25 gün" },
      { label: "Dönme süresi", value: "23 sa 56 dk" },
      { label: "Ortalama sıcaklık", value: "~15 °C" },
      { label: "Uydu", value: "1 (Ay)" },
      { label: "Tür", value: "Kayaç gezegen" },
    ],
    sections: [
      { heading: "Sıvı su", body: "Güneş'e uzaklığı ve atmosfer basıncı, suyun yüzeyde sıvı hâlde kalmasına izin verir. Yüzeyin yaklaşık %71'i suyla kaplıdır." },
      { heading: "Atmosfer ve manyetik alan", body: "Azot–oksijen atmosferi zararlı morötesini süzer; sıvı demir çekirdeğin ürettiği manyetik alan güneş rüzgârını saptırır." },
      { heading: "Eksen eğikliği", body: "23,4°'lik eksen eğikliği mevsimleri oluşturur. Ay'ın kütleçekimi bu eğikliği uzun dönemde kararlı tutar." },
      { heading: "Hareketli kabuk", body: "Dünya'nın litosferi sürekli hareket eden levhalara ayrılmıştır. Levhaların çarpışması, ayrılması ve birbirinin altına dalması depremleri, volkanları, dağları ve okyanus havzalarını oluşturur." },
    ],
  },
  jupiter: {
    kicker: "V. GEZEGEN · GAZ DEVİ",
    lead: "Diğer tüm gezegenlerin toplamından daha kütleli, Güneş Sistemi'nin en büyük gezegenidir.",
    stats: [
      { label: "Çap", value: "139.820 km" },
      { label: "Güneş'e uzaklık", value: "5,2 AB (~778 milyon km)" },
      { label: "Yörünge süresi", value: "11,9 yıl" },
      { label: "Dönme süresi", value: "9 sa 56 dk" },
      { label: "Bulut tepesi sıcaklığı", value: "~−145 °C" },
      { label: "Uydu", value: "115 doğrulanmış" },
      { label: "Tür", value: "Gaz devi" },
    ],
    sections: [
      { heading: "Büyük Kırmızı Leke", body: "Dünya'dan geniş, yüzyıllardır süren dev bir fırtına sistemi. Son gözlemlerde alanı yavaşça küçülmektedir." },
      { heading: "Hızlı dönme", body: "Sistemin en hızlı dönen gezegenidir; bir günü 10 saatten kısadır. Bu hız gezegeni kutuplardan gözle görülür biçimde basıklaştırır." },
      { heading: "Uydu sistemi", body: "Galileo uyduları — Io, Europa, Ganymede, Callisto — küçük birer dünya sayılır. Europa'nın buzul kabuğu altında sıvı su okyanusu bulunduğu düşünülür." },
      { heading: "Katı yüzeyi yok", body: "Jüpiter'in bulutlarının altında iniş yapılabilecek katı bir yüzey bulunmaz. Artan basınç hidrojeni önce sıvıya, daha derinde elektriği ileten metalik hidrojene dönüştürür; bu katman güçlü manyetik alanın oluşmasına katkı verir." },
    ],
  },
  uranus: {
    kicker: "VII. GEZEGEN · BUZ DEVİ",
    lead: "Yaklaşık 98° eksen eğikliği nedeniyle yörüngesinde neredeyse yan yatmış biçimde ilerler.",
    stats: [
      { label: "Çap", value: "50.724 km" },
      { label: "Güneş'e uzaklık", value: "19,8 AB (~2,9 milyar km)" },
      { label: "Yörünge süresi", value: "84 yıl" },
      { label: "Dönme süresi", value: "17 sa 14 dk (ters yönde)" },
      { label: "Sıcaklık", value: "~−195 °C" },
      { label: "Halka sistemi", value: "13 halka" },
      { label: "Uydu", value: "29 doğrulanmış" },
      { label: "Tür", value: "Buz devi" },
    ],
    sections: [
      { heading: "Yan yatmış eksen", body: "Eksen eğikliği yaklaşık 98°'dir; gezegen yörüngesi boyunca âdeta yuvarlanır. Kutuplarda 21 yıl süren gündüz ve gece yaşanır." },
      { heading: "Metan rengi", body: "Atmosferdeki metan kırmızı ışığı soğurur; geriye kalan saçılmış ışık gezegene soluk mavi-yeşil tonunu verir." },
      { heading: "Buz devi yapısı", body: "Gaz devlerinden farklı olarak kütlesinin büyük kısmı su, amonyak ve metan buzlarından oluşan sıcak ve yoğun bir akışkan katmandır." },
      { heading: "Halkalar ve manyetik alan", body: "Uranüs'ün 13 soluk halkası vardır. Manyetik ekseni dönme eksenine göre yaklaşık 60° eğik ve gezegen merkezinden belirgin biçimde kayıktır; bu nedenle manyetosferi son derece asimetriktir." },
    ],
  },
  neptune: {
    kicker: "VIII. GEZEGEN · BUZ DEVİ",
    lead: "Güneş'e en uzak gezegen; mavi atmosferinde sistemin en hızlı rüzgârları ölçülür.",
    stats: [
      { label: "Çap", value: "49.244 km" },
      { label: "Güneş'e uzaklık", value: "30,1 AB (~4,5 milyar km)" },
      { label: "Yörünge süresi", value: "164,8 yıl" },
      { label: "Dönme süresi", value: "16 sa 6 dk" },
      { label: "Sıcaklık", value: "~−200 °C" },
      { label: "En büyük uydu", value: "Triton" },
      { label: "Uydu", value: "16 doğrulanmış" },
      { label: "Tür", value: "Buz devi" },
    ],
    sections: [
      { heading: "Aşırı rüzgârlar", body: "Atmosferinde saatte 2.000 km'yi aşan rüzgârlar ölçülmüştür. Güneş'ten çok az enerji almasına karşın iç ısısı da bulunan gezegenin aşırı hava düzenekleri hâlâ araştırılmaktadır." },
      { heading: "Mavi görünüm", body: "Atmosferdeki metan kırmızı ışığı soğurur. Güncel yeniden işlenmiş görüntüler, Neptün ile Uranüs'ün doğal renkte eski Voyager görsellerinin düşündürdüğünden daha benzer olduğunu gösterir." },
      { heading: "Hesapla bulundu", body: "Neptün, Uranüs'ün yörüngesindeki sapmalardan yola çıkılarak matematiksel olarak öngörülmüş ve 1846'da tahmin edilen konumda gözlenmiştir." },
      { heading: "Triton: yakalanmış bir dünya", body: "Neptün'ün en büyük uydusu Triton, gezegenin dönüşünün ters yönünde dolanır; bu yüzden Kuiper Kuşağı'ndan yakalanmış bir cisim olduğu düşünülür. Voyager 2, aşırı soğuk yüzeyinden yaklaşık 8 km yükselen azot jetleri gözledi." },
    ],
  },
};
