const STORAGE_KEY = "solar-system-language";
const SUPPORTED_LANGUAGES = new Set(["tr", "en"]);

const readLanguage = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED_LANGUAGES.has(stored) ? stored : "tr";
};

const language = readLanguage();
document.documentElement.lang = language;

const normalize = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

// Turkish is the editorial source language. English lives in one shared,
// offline dictionary so every page and every dynamically-created panel uses
// the same terminology without duplicating pages or calling a translation API.
const EN = new Map(Object.entries({
    "Güneş Sistemi'ni Keşfet": "Explore the Solar System",
    "Güneş Sistemini Keşfet": "Explore the Solar System",
    "Güneş Sistemi — Etkileşimli 3B Sahne": "Solar System — Interactive 3D Scene",
    "Uzayı Anla — Temel Astronomi": "Understand Space — Astronomy Basics",
    "Güneş | Güneş Sistemini Keşfet": "Sun | Explore the Solar System",
    "Ay | Güneş Sistemini Keşfet": "Moon | Explore the Solar System",
    "Mars Keşif Modu | Güneş Sistemini Keşfet": "Mars Exploration | Explore the Solar System",
    "Satürn | Güneş Sistemini Keşfet": "Saturn | Explore the Solar System",

    "Etkileşimli Astronomi Modülü": "Interactive Astronomy Module",
    "01 — Giriş": "01 — Introduction",
    "Güneş Sistemi": "Solar System",
    "Uzayı Anla →": "Understand Space →",
    "Sekiz gezegen, Ay ve Güneş — hepsi tek bir sahnede. Yörüngeleri döndürün, bir gök cismi seçin, verilerini okuyun.": "Eight planets, the Moon, and the Sun — all in one scene. Rotate the orbits, select a celestial body, and explore its data.",
    "Mesafeler ve boyutlar görsel olarak sıkıştırılmıştır": "Distances and sizes are visually compressed",
    "Mesafeler ve boyutlar": "Distances and sizes", "görsel olarak sıkıştırılmıştır": "are visually compressed",
    "Güneş Sistemi önizlemesi": "Solar System preview",
    "Keşif modülleri": "Exploration modules",
    "Gök Cisimleri": "Celestial Bodies",
    "Gök cisimleri": "Celestial bodies",
    "Modül 02": "Module 02",
    "Genel": "Overview",
    "Sürükle": "Drag",
    "Döndür": "Rotate",
    "Tekerlek": "Wheel",
    "Scroll": "Scroll",
    "Yaklaş": "Zoom",
    "Yaklaş / Uzaklaş": "Zoom In / Out",
    "SÜRÜKLE": "DRAG",
    "DÖNDÜR": "ROTATE",
    "YAKLAŞ / UZAKLAŞ": "ZOOM IN / OUT",
    "Yörünge yarıçapları gerçek yarı-büyük eksen değerlerinden (AB) türetilmiştir; a0,58 ile sıkıştırılmıştır. Sıra ve iç/dış mesafe farkı korunur — görselleştirme ölçekli değildir.": "Orbit radii are derived from real semi-major-axis values (AU) and compressed using a⁰·⁵⁸. Their order and the inner/outer distance contrast are preserved; the visualization is not to scale.",
    "Yörünge yarıçapları gerçek yarı-büyük eksen değerlerinden (AB) türetilmiştir; a": "Orbit radii are derived from real semi-major-axis values (AU) and compressed using a",
    "ile sıkıştırılmıştır. Sıra ve iç/dış mesafe farkı korunur — görselleştirme ölçekli değildir.": "while preserving their order and the inner/outer distance contrast; the visualization is not to scale.",

    "Uzayı Anla": "Understand Space",

    "GENEL BAKIŞ": "OVERVIEW",
    "Yaklaşık 4,6 milyar yıl önce oluşan; Güneş, sekiz gezegen ve onlara eşlik eden küçük cisimlerden oluşan kozmik sistemimiz.": "Our cosmic neighborhood formed about 4.6 billion years ago and consists of the Sun, eight planets, and the smaller bodies that accompany them.",
    "Yaş": "Age",
    "Merkez yıldız": "Central star",
    "Gezegen sayısı": "Planets",
    "İç sistem": "Inner system",
    "Dış sistem": "Outer system",
    "Küçük cisimler": "Small bodies",
    "4 kayaç gezegen": "4 rocky planets",
    "4 dev gezegen": "4 giant planets",
    "Asteroitler ve kuyrukluyıldızlar": "Asteroids and comets",
    "Genel yapı": "Overall structure",
    "İç sistemde Merkür, Venüs, Dünya ve Mars gibi kayaç gezegenler; dış sistemde Jüpiter ve Satürn gibi gaz devleri ile Uranüs ve Neptün gibi buz devleri bulunur.": "The inner system contains the rocky planets Mercury, Venus, Earth, and Mars. Beyond them are the gas giants Jupiter and Saturn and the ice giants Uranus and Neptune.",
    "Cüce gezegenler, doğal uydular, asteroitler ve kuyrukluyıldızlar da Güneş'in kütleçekimi altında sistemin parçasıdır.": "Dwarf planets, natural satellites, asteroids, and comets are also part of the system under the Sun's gravity.",
    "Bir gök cismini seçerek temel verilerini inceleyin.": "Select a celestial body to explore its key data.",
    "Bir gök cismi seçin.": "Select a celestial body.",
    "Panelde açılır": "Opens in panel",
    "Ayrıntılı keşif modülü": "Detailed exploration module",

    "Güneş": "Sun", "Merkür": "Mercury", "Venüs": "Venus", "Dünya": "Earth",
    "Ay": "Moon", "Jüpiter": "Jupiter", "Satürn": "Saturn", "Uranüs": "Uranus", "Neptün": "Neptune",
    "Yıldız": "Star", "Kayaç gezegen": "Rocky planet", "Gaz devi": "Gas giant", "Buz devi": "Ice giant", "Doğal uydu": "Natural satellite",
    "I. Gezegen": "Planet I", "II. Gezegen": "Planet II", "III. Gezegen": "Planet III", "IV. Gezegen": "Planet IV",
    "V. Gezegen": "Planet V", "VI. Gezegen": "Planet VI", "VII. Gezegen": "Planet VII", "VIII. Gezegen": "Planet VIII",
    "Dünya'nın uydusu": "Earth's moon",
    "Sistemin toplam kütlesinin yaklaşık %99,86'sını taşıyan yıldız.": "The star that contains about 99.86% of the system's total mass.",
    "Güneş'e en yakın ve en küçük gezegen.": "The closest planet to the Sun and the smallest planet.",
    "Yoğun karbondioksit atmosferiyle sistemin en sıcak gezegeni.": "The hottest planet in the system, with a dense carbon-dioxide atmosphere.",
    "Yüzeyinde kararlı sıvı su bulunan gezegen.": "A planet with stable liquid water on its surface.",
    "Dünya'nın tek doğal uydusu.": "Earth's only natural satellite.",
    "Demir oksitçe zengin yüzeyiyle kızıl görünen gezegen.": "A planet that appears red because its surface is rich in iron oxides.",
    "Sistemin en büyük gezegeni.": "The largest planet in the system.",
    "Geniş halka sistemiyle tanınan gaz devi.": "A gas giant known for its extensive ring system.",
    "Neredeyse yan yatmış eksende dönen buz devi.": "An ice giant that rotates on an axis tipped almost sideways.",
    "Güneş'e en uzak gezegen; en hızlı rüzgârlara sahiptir.": "The farthest planet from the Sun, with the fastest winds in the system.",

    "I. GEZEGEN · KAYAÇ": "PLANET I · ROCKY", "II. GEZEGEN · KAYAÇ": "PLANET II · ROCKY",
    "III. GEZEGEN · KAYAÇ": "PLANET III · ROCKY", "IV. GEZEGEN · KAYAÇ": "PLANET IV · ROCKY",
    "V. GEZEGEN · GAZ DEVİ": "PLANET V · GAS GIANT", "VI. GEZEGEN · GAZ DEVİ": "PLANET VI · GAS GIANT",
    "VII. GEZEGEN · BUZ DEVİ": "PLANET VII · ICE GIANT", "VIII. GEZEGEN · BUZ DEVİ": "PLANET VIII · ICE GIANT",
    "GÜNEŞ SİSTEMİ · MERKEZ YILDIZ": "SOLAR SYSTEM · CENTRAL STAR",
    "GÜNEŞ SİSTEMİ · 4. GEZEGEN": "SOLAR SYSTEM · PLANET 4",
    "GÜNEŞ SİSTEMİ · 6. GEZEGEN": "SOLAR SYSTEM · PLANET 6",
    "DÜNYA'NIN DOĞAL UYDUSU": "EARTH'S NATURAL SATELLITE",
    "SATÜRN'ÜN DOĞAL UYDUSU": "SATURN'S NATURAL SATELLITE",
    "MARS'IN DOĞAL UYDUSU": "MARS'S NATURAL SATELLITE",
    "← GÜNEŞ SİSTEMİNİ KEŞFET": "← EXPLORE THE SOLAR SYSTEM",
    "← GÜNEŞ": "← SUN", "← AY": "← MOON", "← MARS": "← MARS", "← SATÜRN": "← SATURN",
    "Güneş Sistemi görünümüne dön": "Return to the Solar System view",
    "Güneş görünümüne dön": "Return to the Sun view", "Ay görünümüne dön": "Return to the Moon view",
    "Mars görünümüne dön": "Return to the Mars view", "Satürn görünümüne dön": "Return to the Saturn view",

    "Çap": "Diameter", "Ekvator çapı": "Equatorial diameter", "Kütle": "Mass", "Yerçekimi": "Gravity",
    "Güneş'e uzaklık": "Distance from the Sun", "Dünya'ya uzaklık": "Distance from Earth", "Ortalama uzaklık": "Mean distance",
    "Yıl": "Year", "Bir gün": "Length of day", "Bir Mars günü": "Length of a Martian day", "Bir Mars yılı": "Length of a Martian year",
    "Bir Satürn günü": "Length of a Saturnian day", "Bir Satürn yılı": "Length of a Saturnian year",
    "Yörünge süresi": "Orbital period", "Yörünge süresi (gün)": "Orbital period (days)", "Yörünge süresi (saat)": "Orbital period (hours)", "Dönme süresi": "Rotation period", "Dönüş süresi": "Rotation period",
    "Dönüş": "Rotation", "Ters yönde": "Retrograde", "Uydu": "Moons",
    "Tür": "Type", "Sıcaklık": "Temperature", "Ortalama sıcaklık": "Mean temperature", "Eksen eğikliği": "Axial tilt", "Eksantriklik": "Eccentricity",
    "Fotosfer sıcaklığı": "Photosphere temperature", "Çekirdek sıcaklığı": "Core temperature", "Enerji kaynağı": "Energy source",
    "Nükleer füzyon": "Nuclear fusion", "Yok": "None", "Aktif": "Active", "Operasyonel": "Operational",
    "Özellik": "Property", "Ölçek": "Scale", "Gerçek çap oranı": "True diameter ratio", "GERÇEK BOYUT ORANI": "TRUE SIZE RATIO",
    "DÜNYA İLE KARŞILAŞTIR": "COMPARE WITH EARTH", "Güneş ve Dünya": "Sun and Earth", "Ay ve Dünya": "Moon and Earth",
    "Mars ve Dünya": "Mars and Earth", "Satürn ve Dünya": "Saturn and Earth", "1 Dünya": "1 Earth",

    "Güneş, Güneş Sistemi'nin merkezinde bulunan yıldızdır. Sistemdeki toplam kütlenin yaklaşık %99,86'sını barındırır ve enerjisini çekirdeğinde gerçekleşen nükleer füzyondan üretir.": "The Sun is the star at the center of the Solar System. It contains about 99.86% of the system's total mass and produces energy through nuclear fusion in its core.",
    "Güneş nasıl enerji üretir?": "How does the Sun produce energy?",
    "Güneş'in çekirdeğinde hidrojen çekirdekleri birleşerek helyuma dönüşür. Bu süreç sırasında kütlenin küçük bir bölümü enerjiye dönüşür. Üretilen enerji dış katmanlara taşınır ve sonunda uzaya ışık ve ısı olarak yayılır.": "In the Sun's core, hydrogen nuclei fuse into helium. A small fraction of mass becomes energy, which travels through the outer layers and is ultimately emitted into space as radiation.",
    "Güneş'in katmanları": "Layers of the Sun", "Güneş'in Katmanları": "Layers of the Sun",
    "Enerji çekirdekte üretilir; ışınım ve konveksiyon bölgelerinden geçerek görünür yüzeye ve Güneş atmosferine ulaşır.": "Energy is produced in the core and passes through the radiative and convection zones before reaching the visible surface and solar atmosphere.",
    "KATMANLARI İNCELE →": "EXPLORE THE LAYERS →",
    "Çekirdek": "Core", "Işınım Bölgesi": "Radiative Zone", "Işınım bölgesi": "Radiative zone",
    "Konveksiyon Bölgesi": "Convection Zone", "Konveksiyon bölgesi": "Convection zone",
    "Fotosfer": "Photosphere", "Kromosfer": "Chromosphere", "Korona": "Corona",
    "Güneş'in merkezindeki, nükleer füzyonun gerçekleştiği bölgedir.": "The central region where nuclear fusion takes place.",
    "Çekirdekte üretilen enerji bu bölgede büyük ölçüde fotonların etkileşimleriyle dışarı taşınır.": "Energy from the core moves outward through repeated interactions involving photons.",
    "Sıcak plazma yükselirken daha soğuk plazma aşağı iner ve enerji konveksiyonla taşınır.": "Hot plasma rises while cooler plasma sinks, carrying energy by convection.",
    "Güneş'e baktığımızda görünür yüzey olarak algıladığımız katmandır.": "The layer perceived as the Sun's visible surface.",
    "Fotosferin üzerinde bulunan ince atmosfer katmanlarından biridir.": "A thin atmospheric layer above the photosphere.",
    "Güneş atmosferinin çok sıcak, seyrek ve uzaya doğru genişleyen dış bölümüdür.": "The extremely hot, tenuous outer atmosphere that extends into space.",
    "Güneş aktivitesi": "Solar activity", "GÜNEŞ AKTİVİTESİ · FOTOSFER": "SOLAR ACTIVITY · PHOTOSPHERE",
    "GÜNEŞ AKTİVİTESİ · ATMOSFER": "SOLAR ACTIVITY · ATMOSPHERE",
    "Manyetik alanın sürekli değişimi; güneş lekeleri, ani ışınım patlamaları ve korona içine uzanan prominensler gibi olaylar üretir.": "The Sun's changing magnetic field produces sunspots, sudden bursts of radiation, and prominences extending into the corona.",
    "GÜNEŞ LEKELERİ": "SUNSPOTS", "Güneş Lekeleri": "Sunspots", "PROMİNENS": "PROMINENCE", "Prominens": "Prominence",
    "Güneş gözlem görevleri": "Solar observation missions",
    "Parker Solar Probe koronayı yerinde ölçer; Solar Orbiter uzaktan görüntüleme ile çevresel ölçümleri birleştirir; SOHO ise Güneş'in içinden dış koronaya uzanan kesintisiz gözlemler sağlar.": "Parker Solar Probe samples the corona in situ; Solar Orbiter combines remote imaging with local measurements; SOHO provides long-running observations from the solar interior to the outer corona.",
    "Güneş lekeleri, Güneş'in görünür yüzeyinde çevrelerine göre daha karanlık görünen ve güçlü manyetik alanlarla ilişkili bölgelerdir.": "Sunspots are regions on the Sun's visible surface that appear darker than their surroundings and are associated with strong magnetic fields.",
    "Bölge": "Region", "Görünüm": "Appearance", "Temel neden": "Primary cause", "Ömür": "Lifetime",
    "Koyu bölgeler": "Dark regions", "Güçlü manyetik alan": "Strong magnetic field", "Günler – aylar": "Days to months",
    "Neden daha karanlık görünürler?": "Why do they look darker?", "Neden önemlidir?": "Why are they important?",
    "Güçlü manyetik alanlar, sıcak plazmanın aşağıdan yukarıya enerji taşımasını kısmen engeller. Bu nedenle güneş lekeleri çevredeki fotosferden daha soğuk kalır ve koyu görünür.": "Strong magnetic fields partly inhibit the upward transport of energy by hot plasma. Sunspots therefore remain cooler than the surrounding photosphere and appear dark.",
    "Güneş lekeleri aktif bölgelerin görünür işaretleridir. Karmaşık manyetik alanlara sahip bu bölgelerde solar flare gibi güçlü olaylar meydana gelebilir.": "Sunspots are visible markers of active regions, where complex magnetic fields can produce powerful events such as solar flares.",
    "Solar flare, Güneş atmosferinde biriken manyetik enerjinin çok kısa sürede açığa çıkmasıyla meydana gelen güçlü bir elektromanyetik patlamadır.": "A solar flare is a powerful burst of electromagnetic radiation caused by the rapid release of magnetic energy in the Sun's atmosphere.",
    "Kaynak": "Source", "Enerji": "Energy", "Sınıflar": "Classes", "Gözlem": "Observed in", "Aktif bölgeler": "Active regions", "Manyetik": "Magnetic",
    "Nasıl oluşur?": "How does it form?", "Dünya'yı etkileyebilir mi?": "Can it affect Earth?",
    "Karmaşık manyetik alan çizgileri yeniden yapılandığında depolanmış enerji çok hızlı biçimde plazmaya ve elektromanyetik ışınıma aktarılabilir. Bu olay gözlemlerde ani ve güçlü bir parlama olarak görülür.": "When complex magnetic fields reconnect, stored energy can be rapidly transferred to plasma and electromagnetic radiation, appearing as a sudden, intense brightening.",
    "Güçlü flare olaylarından yayılan X-ışını ve aşırı morötesi ışınım Dünya'nın üst atmosferindeki iyonlaşmayı artırabilir ve bazı radyo haberleşmelerini etkileyebilir.": "X-rays and extreme-ultraviolet radiation from strong flares can increase ionization in Earth's upper atmosphere and disrupt some radio communications.",
    "Prominens, Güneş yüzeyinin üzerinde manyetik alanlar tarafından tutulan yoğun ve görece daha soğuk plazmadan oluşan büyük yapılardır.": "A prominence is a large structure of dense, relatively cool plasma suspended above the Sun's surface by magnetic fields.",
    "Madde": "Material", "Şekil": "Form", "Kontrol": "Controlled by", "Plazma": "Plasma", "Kromosfer / korona": "Chromosphere / corona", "Yay · halka · ipliksi": "Arch · loop · filament", "Manyetik alan": "Magnetic field",
    "Nasıl yüzeyin üzerinde kalır?": "How does it remain above the surface?", "Ne kadar büyük olabilir?": "How large can it become?",
    "Prominens içerisindeki plazma Güneş'in manyetik alan çizgileri boyunca tutulabilir. Bu nedenle yüzeyin çok üzerinde dev yaylar ve ipliksi yapılar biçiminde görülebilir.": "Plasma in a prominence can be supported along the Sun's magnetic-field lines, forming enormous arches and filaments high above the surface.",
    "Bazı prominensler Dünya'nın çapının birçok katına ulaşabilir. Manyetik yapı kararsız hale geldiğinde prominens parçalanabilir veya Güneş'ten dışarı doğru fırlayabilir.": "Some prominences grow to many times Earth's diameter. If their magnetic structure becomes unstable, they can break apart or erupt away from the Sun.",

    "Ay, Dünya'nın tek doğal uydusudur. Dünya çevresindeki hareketi ve kendi eksenindeki dönüşü aynı sürede tamamlandığı için bize sürekli aynı yüzünü gösterir.": "The Moon is Earth's only natural satellite. Because it rotates once in the same time it takes to orbit Earth, it keeps nearly the same face toward us.",
    "Dünya'nın tek doğal uydusu olan Ay, gezegenimizin oluşumundan kısa süre sonra şekillendi ve Güneş Sistemi'nin milyarlarca yıllık çarpışma geçmişini yüzeyinde korudu.": "Earth's only natural satellite formed soon after our planet and preserves billions of years of Solar System impact history on its surface.",
    "Ay yüzeyi": "Lunar surface", "AY YÜZEYİ · ÇARPMA KRATERİ": "LUNAR SURFACE · IMPACT CRATER",
    "Krater çapı": "Crater diameter", "Konum": "Location", "Enlem": "Latitude", "Boylam": "Longitude",
    "LRO'YU İNCELE": "EXPLORE LRO", "LRO görevi": "LRO mission", "Ay yörüngesi": "Lunar orbit",
    "Ay modeli yükleniyor...": "Moon model loading...", "LRO modeli yükleniyor...": "LRO model loading...",

    "Mars, yüzeyindeki demir minerallerinin oksitlenmesi nedeniyle kızıl görünür. Dev volkanları, kilometrelerce uzanan kanyonları ve geçmişte sıvı suyun bulunduğuna dair güçlü kanıtlarıyla Güneş Sistemi'nin en çok araştırılan gezegenlerinden biridir.": "Mars appears red because iron-bearing minerals on its surface have oxidized. Its giant volcanoes, immense canyons, and strong evidence of past liquid water make it one of the most studied planets in the Solar System.",
    "Neden kızıl?": "Why is it red?", "Mars'ta su var mı?": "Is there water on Mars?",
    "Mars toprağında bulunan demir içeren mineraller zamanla oksitlenmiştir. Dünya'daki pas oluşumuna benzeyen bu süreç, yüzeye karakteristik kırmızı-turuncu rengini verir.": "Iron-bearing minerals in Martian dust and rock have oxidized over time. Much like rust on Earth, this process gives the surface its characteristic reddish-orange color.",
    "Bugün Mars yüzeyinde uzun süre sıvı halde kalabilen büyük su kütleleri bulunmaz. Ancak kutuplarda ve yer altında önemli miktarda su buzu vardır. Eski nehir yatakları ve göl tortulları ise geçmişte Mars'ın çok daha ıslak olduğunu gösterir.": "Large bodies of liquid water cannot persist on the Martian surface today. Significant water ice exists at the poles and underground, while ancient channels and lake deposits show that Mars was much wetter in the past.",
    "Mars modeli yükleniyor...": "Mars model loading...", "Mars modeli yüklenemedi.": "Mars model could not be loaded.",
    "Kalkan volkanı": "Shield volcano", "Kanyon sistemi": "Canyon system", "Kanyon ve graben ağı": "Canyon and graben network",
    "Dev çarpma havzası": "Giant impact basin", "Çarpma havzası": "Impact basin", "Geniş ova / çarpma havzası": "Broad plain / impact basin",
    "Karanlık volkanik bölge": "Dark volcanic region", "Çarpma krateri": "Impact crater", "Kuzey kutup buz örtüsü": "Northern polar ice cap", "Güney kutup buz örtüsü": "Southern polar ice cap",
    "Boyut": "Size", "Keşif": "Discovery", "Keşfeden": "Discoverer", "Mars merkezinden uzaklık": "Distance from Mars's center",

    "Satürn, Güneş Sistemi'nin ikinci en büyük gezegenidir. Büyük ölçüde hidrojen ve helyumdan oluşan bir gaz devidir ve belirgin halka sistemiyle diğer gezegenlerden kolayca ayırt edilir.": "Saturn is the second-largest planet in the Solar System. It is a gas giant composed mostly of hydrogen and helium, readily distinguished by its prominent ring system.",
    "Satürn, Güneş Sistemi'nin ikinci en büyük gezegeni ve geniş halka sistemiyle en kolay ayırt edilen gaz devidir. Büyük ölçüde hidrojen ve helyumdan oluşur; katı bir yüzeyi yoktur.": "Saturn is the second-largest planet in the Solar System and the gas giant most easily recognized by its vast ring system. It is composed mostly of hydrogen and helium and has no solid surface.",
    "Halkaları neyden oluşuyor?": "What are the rings made of?", "Tek bir halka mı?": "Is it a single ring?", "Halkaları keşfet": "Explore the rings",
    "Satürn'ün halkaları tek parça katı diskler değildir. Halka sistemi, gezegenin çevresinde birbirinden bağımsız yörüngelerde hareket eden çok sayıda buz, kaya ve toz parçacığından oluşur.": "Saturn's rings are not solid disks. They consist of countless particles of ice, rock, and dust moving in independent orbits around the planet.",
    "Hayır. Satürn'ün halka sistemi çok sayıda ince halkacık ve boşluktan oluşur. En belirgin ana bölgeler arasında C, B ve A halkaları bulunur. A ve B halkalarının arasında ise Cassini Bölümü yer alır.": "No. Saturn's ring system contains many narrow ringlets and gaps. The prominent main regions include the C, B, and A rings, with the Cassini Division between the A and B rings.",
    "3B modelde bir halka bölgesine tıklayabilir veya halka seçim panelini kullanabilirsin. Seçilen bölgenin sınırları model üzerinde vurgulanacak ve bilgileri bu panelde gösterilecek.": "Select a ring region in the 3D model or use the ring selector. The selected region's boundaries will be highlighted on the model and its information shown here.",
    "HALKALAR": "RINGS", "Satürn halka bölgeleri": "Saturn ring regions", "İç sınır": "Inner boundary", "Dış sınır": "Outer boundary", "Yaklaşık genişlik": "Approximate width",
    "Satürn modeli yükleniyor...": "Saturn model loading...", "Satürn modeli yüklenemedi.": "Saturn model could not be loaded.",
    "Satürn merkezinden uzaklık": "Distance from Saturn's center", "Ortalama yörünge hızı": "Mean orbital speed", "Yörünge eğimi": "Orbital inclination",

    "GÜNEŞ GÖREVİ · NASA": "SOLAR MISSION · NASA", "GÜNEŞ GÖREVİ · ESA / NASA": "SOLAR MISSION · ESA / NASA",
    "Fırlatma": "Launch", "Durum": "Status", "Operatör": "Operator", "Yörünge": "Orbit", "Bilimsel araçlar": "Science instruments",
    "RESMİ GÖREV SAYFASI →": "OFFICIAL MISSION PAGE →", "Görevden örnek gözlem": "Example mission observation", "Görevden örnek Güneş gözlemi": "Example solar observation from the mission",
    "12 Ağustos 2018": "August 12, 2018", "10 Şubat 2020": "February 10, 2020", "2 Aralık 1995": "December 2, 1995",
    "Güneş çevresinde yüksek eksantriklikli yörünge": "Highly eccentric orbit around the Sun", "Eğik ve eliptik Güneş yörüngesi": "Inclined, elliptical solar orbit", "Güneş-Dünya L1 çevresinde halo yörüngesi": "Halo orbit around Sun–Earth L1",
    "CANLI KONUM": "LIVE POSITION", "CANLI": "LIVE", "SİMÜLASYON": "SIMULATION", "ŞİMDİ": "NOW", "Hızı azalt": "Decrease speed", "Hızı artır": "Increase speed",
    "Tarih": "Date", "Güneş'e mesafe": "Distance from the Sun", "Görev süresi": "Mission elapsed time",

    "yaklaşık": "approximately", "doğrulanmış": "confirmed", "milyar yıl": "billion years", "milyar km": "billion km", "milyon km": "million km",
    "Dünya günü": "Earth days", "Dünya yılı": "Earth years", "gün": "days", "saat": "hours", "sa": "h", "dk": "min",
    "çap": "diameter", "yükseklik": "height", "uzunluk": "long", "genişlik": "wide", "ölçeğinde": "across", "km'den geniş": "km wide"
}));

const ADDITIONAL_EN = {
    "Keşfet": "Explore", "Uzayı Anla": "Understand Space",
    "MESAFELER VE BOYUTLAR": "DISTANCES AND SIZES", "GÖRSEL OLARAK SIKIŞTIRILMIŞTIR": "ARE VISUALLY COMPRESSED",
    "Bilgi paneli": "Information panel", "Sürükle döndür · Tekerlek yakınlaş": "Drag to rotate · Wheel to zoom",
    "SÜRÜKLE DÖNDÜR · SCROLL YAKLAŞ / UZAKLAŞ": "DRAG TO ROTATE · SCROLL TO ZOOM",

    "Güneş'e en yakın ve en küçük gezegen; ince dış katmanı ısıyı tutamadığı için büyük sıcaklık farkları yaşar.": "Mercury is the smallest planet and the closest to the Sun. With virtually no atmosphere to retain heat, it experiences extreme temperature swings.",
    "Güneş'e en yakın ve en küçük gezegen; kayda değer bir atmosferi yoktur.": "Mercury is the smallest planet and the closest to the Sun; it has no substantial atmosphere.",
    "Uç sıcaklık farkı": "Extreme temperature range", "Yörünge ve dönme kilidi": "Spin–orbit resonance", "Yüzey": "Surface",
    "Atmosfer ısıyı tutamadığı için gündüz ve gece yüzeyi arasında 600 °C'yi aşan bir fark oluşur. Sistemdeki en büyük yüzey sıcaklık aralığı Merkür'e aittir.": "Because its exosphere cannot retain heat, Mercury's day- and night-side surface temperatures differ by more than 600 °C, the widest surface-temperature range of any planet.",
    "Merkür Güneş çevresinde her iki turda kendi ekseninde üç kez döner (3:2 spin–yörünge rezonansı). Bir güneş günü, iki Merkür yılına yakındır.": "Mercury rotates three times for every two orbits around the Sun, a 3:2 spin–orbit resonance. One solar day lasts about two Mercury years.",
    "Ay'a benzeyen, yoğun kraterli bir yüzeye sahiptir. Caloris Havzası yaklaşık 1.550 km çapıyla sistemin en büyük çarpma havzalarından biridir.": "Its heavily cratered surface resembles the Moon. At roughly 1,550 km across, the Caloris Basin is one of the Solar System's largest impact basins.",
    "Yoğun kraterli yüzeyi Ay'ı andırır; belirgin bir atmosferi bulunmaz.": "Its heavily cratered surface resembles the Moon, and it has no substantial atmosphere.",

    "Yoğun karbondioksit atmosferi nedeniyle sistemin en sıcak gezegeni.": "The Solar System's hottest planet because of its dense carbon-dioxide atmosphere.",
    "Yoğun karbondioksit atmosferi ve güçlü sera etkisiyle Güneş Sistemi'nin en sıcak gezegenidir.": "Its dense carbon-dioxide atmosphere drives a runaway greenhouse effect, making Venus the Solar System's hottest planet.",
    "Kaçak sera etkisi": "Runaway greenhouse effect", "Ters dönme": "Retrograde rotation", "Bulut örtüsü": "Cloud cover", "Atmosfer": "Atmosphere",
    "Atmosferin %96'sı karbondioksittir ve yüzey basıncı Dünya'nın yaklaşık 92 katıdır. Isı kaçamadığı için yüzey, Merkür'den daha yakın olmadığı hâlde daha sıcaktır.": "About 96% of Venus's atmosphere is carbon dioxide, and surface pressure is roughly 92 times Earth's. Trapped heat makes Venus hotter than Mercury despite being farther from the Sun.",
    "Venüs kendi ekseninde diğer gezegenlerin tersine döner; Güneş batıdan doğar. Bir dönüşü, bir yörünge turundan uzundur.": "Venus rotates opposite to most planets, so the Sun rises in the west. One rotation takes longer than one orbit around the Sun.",
    "Sülfürik asit bulutları yüzeyi görünür ışıkta tamamen gizler. Yüzey haritaları radarla çıkarılmıştır.": "Clouds of sulfuric acid completely hide the surface in visible light, so radar has been used to map it.",
    "Kalın bulut örtüsü yüzeyi gizler; yüzey basıncı Dünya'nın yaklaşık 92 katıdır.": "A thick cloud deck hides the surface, where pressure is about 92 times Earth's.",

    "Yüzeyinde kararlı sıvı su bulunan, bilinen tek yaşam barındıran gezegen.": "The only planet known to support life and to have stable liquid water on its surface.",
    "Yüzeyinde kararlı sıvı su bulunan ve yaşam barındırdığı bilinen tek gezegendir.": "Earth is the only planet known to support life and to have stable liquid water on its surface.",
    "Sıvı su": "Liquid water", "Atmosfer ve manyetik alan": "Atmosphere and magnetic field", "Yaşanabilir dünya": "A habitable world",
    "Güneş'e uzaklığı ve atmosfer basıncı, suyun yüzeyde sıvı hâlde kalmasına izin verir. Yüzeyin yaklaşık %71'i suyla kaplıdır.": "Earth's distance from the Sun and atmospheric pressure allow water to remain liquid at the surface, about 71% of which is covered by water.",
    "Azot–oksijen atmosferi zararlı morötesini süzer; sıvı demir çekirdeğin ürettiği manyetik alan güneş rüzgârını saptırır.": "The nitrogen–oxygen atmosphere filters harmful ultraviolet radiation, while the magnetic field generated in the liquid-iron core deflects the solar wind.",
    "23,4°'lik eksen eğikliği mevsimleri oluşturur. Ay'ın kütleçekimi bu eğikliği uzun dönemde kararlı tutar.": "Earth's 23.4° axial tilt produces the seasons, and the Moon's gravity helps stabilize that tilt over long periods.",
    "Sıvı su, koruyucu atmosfer ve manyetik alan birlikte yüzey koşullarını dengeler.": "Liquid water, a protective atmosphere, and a magnetic field together help maintain stable surface conditions.",

    "Diğer tüm gezegenlerin toplamından daha kütleli, sistemin en büyük gezegeni.": "The largest planet in the Solar System, with more mass than all the other planets combined.",
    "Diğer tüm gezegenlerin toplamından daha kütleli, Güneş Sistemi'nin en büyük gezegenidir.": "Jupiter is the Solar System's largest planet and has more mass than all the other planets combined.",
    "Büyük Kırmızı Leke": "Great Red Spot", "Hızlı dönme": "Rapid rotation", "Uydu sistemi": "Moon system", "Fırtınalı atmosfer": "Stormy atmosphere", "Bulut tepesi sıcaklığı": "Cloud-top temperature",
    "Dünya'dan geniş, yüzyıllardır süren dev bir fırtına sistemi. Son gözlemlerde alanı yavaşça küçülmektedir.": "The Great Red Spot is a vast storm observed for centuries. Its area has been gradually shrinking in recent observations.",
    "Sistemin en hızlı dönen gezegenidir; bir günü 10 saatten kısadır. Bu hız gezegeni kutuplardan gözle görülür biçimde basıklaştırır.": "Jupiter is the fastest-rotating planet, with a day shorter than 10 hours. That speed makes it visibly flattened at the poles.",
    "Galileo uyduları — Io, Europa, Ganymede, Callisto — küçük birer dünya sayılır. Europa'nın buzul kabuğu altında sıvı su okyanusu bulunduğu düşünülür.": "The Galilean moons — Io, Europa, Ganymede, and Callisto — are worlds in their own right. Evidence indicates that a liquid-water ocean lies beneath Europa's icy crust.",
    "Bantlı atmosferindeki Büyük Kırmızı Leke, yüzyıllardır izlenen dev bir fırtınadır.": "The Great Red Spot in its banded atmosphere is a giant storm observed for centuries.",

    "Neredeyse yan yatmış eksende dönen, soluk mavi-yeşil buz devi.": "A pale blue-green ice giant rotating on an axis tipped almost sideways.",
    "Yaklaşık 98° eksen eğikliği nedeniyle yörüngesinde neredeyse yan yatmış biçimde ilerler.": "With an axial tilt of about 98°, Uranus travels around its orbit almost on its side.",
    "Yan yatmış eksen": "Sideways axis", "Metan rengi": "Color from methane", "Buz devi yapısı": "Ice-giant structure", "Mavi-yeşil görünüm": "Blue-green appearance",
    "Eksen eğikliği yaklaşık 98°'dir; gezegen yörüngesi boyunca âdeta yuvarlanır. Kutuplarda 21 yıl süren gündüz ve gece yaşanır.": "Uranus's axial tilt is about 98°, making it appear to roll along its orbit. Its poles experience daylight and darkness lasting about 21 Earth years.",
    "Atmosferdeki metan kırmızı ışığı soğurur; geriye kalan saçılmış ışık gezegene soluk mavi-yeşil tonunu verir.": "Methane in the atmosphere absorbs red light; the remaining scattered light gives Uranus its pale blue-green hue.",
    "Gaz devlerinden farklı olarak kütlesinin büyük kısmı su, amonyak ve metan buzlarından oluşan sıcak ve yoğun bir akışkan katmandır.": "Unlike the gas giants, much of Uranus's mass is a hot, dense fluid rich in water, ammonia, and methane materials.",
    "Atmosferindeki metan kırmızı ışığı soğurarak gezegene soluk mavi-yeşil rengini verir.": "Methane in the atmosphere absorbs red light, giving Uranus its pale blue-green color.",

    "Güneş'e en uzak gezegen; sistemin en hızlı rüzgârlarına sahiptir.": "The farthest planet from the Sun, with the fastest winds in the Solar System.",
    "Güneş'e en uzak gezegen; koyu mavi atmosferinde sistemin en hızlı rüzgârları ölçülür.": "The farthest planet from the Sun; the Solar System's fastest winds have been measured in its atmosphere.",
    "Aşırı rüzgârlar": "Extreme winds", "Derin mavi": "Deep blue", "Hesapla bulundu": "Predicted mathematically", "Aşırı hava": "Extreme weather",
    "Atmosferinde saatte 2.000 km'yi aşan rüzgârlar ölçülmüştür. Güneş'ten aldığı enerji çok azdır; bu enerjinin kaynağı hâlâ tartışılmaktadır.": "Winds exceeding 2,000 km/h have been measured in Neptune's atmosphere. The planet receives little sunlight and also radiates internal heat; the processes driving its extreme weather remain under study.",
    "Metan soğurması rengin bir kısmını açıklar, ancak Neptün Uranüs'ten belirgin biçimde daha koyu mavidir; nedeni tam olarak bilinmemektedir.": "Methane absorption explains part of Neptune's color, but additional atmospheric processes contribute to its appearance and are still being studied.",
    "Neptün, Uranüs'ün yörüngesindeki sapmalardan yola çıkılarak matematiksel olarak öngörülmüş ve 1846'da tahmin edilen konumda gözlenmiştir.": "Neptune was predicted mathematically from irregularities in Uranus's orbit and observed near the predicted position in 1846.",
    "Atmosferindeki rüzgâr hızları saatte 2.000 kilometreyi aşabilir.": "Wind speeds in Neptune's atmosphere can exceed 2,000 kilometers per hour.",

    "≈ 4,6 milyar yıl": "≈ 4.6 billion years", "~4,6 milyar yıl": "~4.6 billion years",
    "0,39 AB (~58 milyon km)": "0.39 AU (~58 million km)", "0,72 AB (~108 milyon km)": "0.72 AU (~108 million km)", "1 AB (~150 milyon km)": "1 AU (~150 million km)",
    "1,52 AB": "1.52 AU", "5,2 AB (~778 milyon km)": "5.2 AU (~778 million km)", "9,5 AB": "9.5 AU", "19,8 AB (~2,9 milyar km)": "19.8 AU (~2.9 billion km)", "30,1 AB (~4,5 milyar km)": "30.1 AU (~4.5 billion km)",
    "88 gün": "88 days", "58,6 gün": "58.6 days", "225 gün": "225 days", "243 gün (ters yönde)": "243 days (retrograde)", "365,25 gün": "365.25 days",
    "23 sa 56 dk": "23 h 56 min", "687 gün": "687 days", "11,9 yıl": "11.9 years", "9 sa 56 dk": "9 h 56 min", "84 yıl": "84 years",
    "17 sa 14 dk (ters yönde)": "17 h 14 min (retrograde)", "164,8 yıl": "164.8 years", "16 sa 6 dk": "16 h 6 min",
    "88 Dünya günü": "88 Earth days", "225 Dünya günü": "225 Earth days", "84 Dünya yılı": "84 Earth years", "≈ 11,9 Dünya yılı": "≈ 11.9 Earth years", "≈ 164,8 Dünya yılı": "≈ 164.8 Earth years",
    "1 (Ay)": "1 (Moon)", "1 · Ay": "1 · Moon", "293 doğrulanmış": "293 confirmed", "29 doğrulanmış": "29 confirmed", "16 doğrulanmış": "16 confirmed",

    "döndür": "rotate", "döndür ·": "rotate ·", "yakınlaş": "zoom",
    "Etkileşimli üç boyutlu Güneş modeli": "Interactive 3D model of the Sun", "Güneş bilgi paneli": "Sun information panel", "Güneş görevleri": "Solar missions", "Gerçek ephemeris": "Real ephemeris",
    "Güneş'in çekirdekten koronaya katmanlarını gösteren bilimsel kesit": "Scientific cutaway showing the Sun's layers from core to corona",
    "Güneş'in çekirdekten koronaya katmanlarını gösteren kesit": "Cutaway showing the Sun's layers from core to corona",
    "Güneş lekelerinin hareketi": "Motion of sunspots", "Güneş lekelerinin zaman içindeki hareketi": "Sunspot motion over time",
    "Güneş yüzeyindeki güneş lekeleri": "Sunspots on the solar surface", "Fotosferde görülen güneş lekeleri": "Sunspots visible in the photosphere",
    "Güneş'te solar flare": "Solar flare on the Sun", "Solar flare'in gelişimi": "Evolution of a solar flare",
    "Güneş prominensi": "Solar prominence", "Prominensin zaman içindeki hareketi": "Motion of a prominence over time",
    "≈ 1,39 milyon km": "≈ 1.39 million km", "≈ 15 milyon °C": "≈ 15 million °C", "≈ 5.500 °C": "≈ 5,500 °C",
    "1,989 × 10³⁰ kg": "1.989 × 10³⁰ kg", "5,97 × 10²⁴ kg": "5.97 × 10²⁴ kg", "≈ 12.756 km": "≈ 12,756 km",
    "Yapı": "Composition", "Sıcak plazma": "Hot plasma", "Kayasal gezegen": "Rocky planet", "Hacim": "Volume", "fotosfer": "photosphere", "küresel ortalama": "global mean",
    "Modeller aynı çap ölçeğinde gösteriliyor. Güneş'in çapı Dünya'nın yaklaşık 109 katıdır; beyaz işaret, gerçek oranda çok küçük kalan Dünya'yı sahnede bulmayı kolaylaştırır.": "The models use the same diameter scale. The Sun is about 109 times wider than Earth; the white marker makes Earth, which is tiny at this scale, easier to locate in the scene.",
    "Çap oranı korunur; cisimler arasındaki sahne boşluğu gerçek uzaklığı temsil etmez. Yaklaşıp uzaklaşarak boyut farkını inceleyebilirsin.": "The diameter ratio is preserved; the gap between the objects does not represent their real separation. Zoom in and out to examine the size difference.",
    "≈ 1,3 milyon Dünya": "≈ 1.3 million Earths"
};

Object.assign(ADDITIONAL_EN, {
    "Nokta": "Point", "Krateri keşfet": "Explore a crater", "Satürn uydularının yörünge hızı": "Orbital speed of Saturn's moons",
    "Ay Keşif Modu | Güneş Sistemini Keşfet": "Moon Exploration | Explore the Solar System",
    "Etkileşimli üç boyutlu Ay modeli": "Interactive 3D model of the Moon",
    "Ay nasıl oluştu?": "How did the Moon form?", "Kraterler nasıl oluştu?": "How did the craters form?", "Ay yörüngesinde": "In lunar orbit",
    "En güçlü oluşum modeli, genç Dünya'ya Mars büyüklüğünde bir gök cisminin çarpmasıyla uzaya savrulan maddelerin zamanla birleşerek Ay'ı oluşturduğunu öne sürer. Yeni oluşan Ay'ın yüzeyi başlangıçta büyük ölçüde erimiş haldeydi.": "The leading formation model proposes that a Mars-sized body struck the young Earth and that ejected material later combined to form the Moon. The newly formed Moon's surface was initially largely molten.",
    "Asteroitler, meteoroidler ve kuyrukluyıldızlar çok yüksek hızlarla Ay yüzeyine çarptığında kayaçları parçalar ve yüzeyden dışarı savurur. Ay'da yoğun bir atmosfer, yağmur, rüzgâr ve Dünya'daki kadar etkin yüzey yenileme süreçleri bulunmadığı için bu izler milyarlarca yıl boyunca korunabilir.": "When asteroids, meteoroids, and comets strike the lunar surface at high speed, they shatter and eject rock. With no dense atmosphere, rain, wind, or surface-renewal processes as active as Earth's, many of these scars can persist for billions of years.",
    "NASA'nın": "NASA's", "görevi, Ay yüzeyini yüksek çözünürlükte haritalamayı sürdürüyor.": "mission continues to map the lunar surface at high resolution.",
    "DÜNYA MODELİ YÜKLENİYOR": "EARTH MODEL LOADING", "NOKTA": "POINT", "KRATER KEŞFET": "EXPLORE A CRATER",
    "≈ 4,5 milyar yıl": "≈ 4.5 billion years", "3.474,8 km": "3,474.8 km", "7,35 × 10²² kg": "7.35 × 10²² kg", "1,62 m/s²": "1.62 m/s²", "≈ 384.400 km": "≈ 384,400 km",
    "Bu krateri keşfet": "Explore this crater",
    "Modeller aynı ölçek sistemi içinde gösteriliyor. Dünya'nın çapı Ay'ın çapının yaklaşık 3,67 katıdır. Yaklaşıp uzaklaşarak boyut farkını doğrudan inceleyebilirsin.": "The models use the same scale. Earth's diameter is about 3.67 times the Moon's. Zoom in and out to examine the size difference directly.",
    "12.756 km": "12,756 km", "9,8 m/s²": "9.8 m/s²", "≈ 27,3 gün": "≈ 27.3 days", "≈ 23,9 saat": "≈ 23.9 hours", "Çok ince ekzosfer": "Extremely thin exosphere", "Yoğun atmosfer": "Dense atmosphere",
    "AY YÖRÜNGESİ · NASA": "LUNAR ORBIT · NASA", "18 Haziran 2009": "June 18, 2009", "Yörünge tipi": "Orbit type", "Kutupsal": "Polar", "En yakın": "Perilune", "En uzak": "Apolune", "Simülasyon periyodu": "Simulation period",
    "Lunar Reconnaissance Orbiter, Ay yüzeyini yüksek çözünürlükte haritalamak ve Ay'ın jeolojisi, yüzey yapısı ve gelecekteki keşif görevleri için bilimsel veri toplamak amacıyla görev yapan bir NASA yörünge aracıdır.": "Lunar Reconnaissance Orbiter is a NASA spacecraft that maps the Moon at high resolution and gathers scientific data about its geology, surface, and future exploration sites.",
    "Neyi inceliyor?": "What does it study?", "Ay'da su buzu neden önemli?": "Why is water ice on the Moon important?",
    "LRO üzerindeki bilimsel araçlar Ay'ın yüzeyini görüntüler, sıcaklık değişimlerini ölçer, topoğrafyayı haritalar ve özellikle kutup bölgelerindeki su buzu açısından önemli alanların incelenmesine katkı sağlar.": "LRO's instruments image the lunar surface, measure temperature changes, map topography, and help study areas near the poles that may contain water ice.",
    "Ay'ın kutuplarındaki bazı kraterlerin tabanları Güneş ışığını neredeyse hiç almaz ve milyarlarca yıl boyunca son derece soğuk kalabilir. Bu kalıcı gölgeli bölgelerde su buzu bulunması, gelecekteki insanlı Ay görevleri için büyük önem taşır. Su; içme suyu sağlamanın yanında oksijen ve roket yakıtı üretiminde de kullanılabilir. LRO'nun sıcaklık ve yüzey haritaları, bu bölgelerin nerede bulunduğunu anlamamıza yardımcı olur.": "Some crater floors near the lunar poles receive almost no sunlight and can remain extremely cold for billions of years. Water ice in these permanently shadowed regions is important for future crewed missions: it could supply drinking water and be processed into oxygen and rocket propellant. LRO's temperature and surface maps help identify these regions."
});

Object.assign(ADDITIONAL_EN, {
    "Etkileşimli üç boyutlu Mars modeli": "Interactive 3D model of Mars", "UYDULAR": "MOONS",
    "6.779 km": "6,779 km", "≈ 228 milyon km": "≈ 228 million km", "3,71 m/s²": "3.71 m/s²", "≈ 24 sa 39 dk": "≈ 24 h 39 min", "687 Dünya günü": "687 Earth days",
    "Mars ve Dünya burada gerçek çap oranları korunarak yan yana gösteriliyor. Dünya'nın yarıçapı Mars'ın yaklaşık 1,88 katıdır.": "Mars and Earth are shown side by side with their true diameter ratio preserved. Earth's radius is about 1.88 times Mars's.",
    "12.742 km": "12,742 km", "6,42 × 10²³ kg": "6.42 × 10²³ kg", "9,81 m/s²": "9.81 m/s²", "≈ 24 sa 37 dk": "≈ 24 h 37 min", "≈ 23 sa 56 dk": "≈ 23 h 56 min",
    "≈ %95 karbondioksit": "≈ 95% carbon dioxide", "Azot + Oksijen": "Nitrogen + oxygen", "≈ 0,151 Dünya": "≈ 0.151 Earths",
    "Boyut farkı": "Size difference", "Neden uydular görünmüyor?": "Why aren't the moons visible?",
    "Dünya'nın çapı Mars'ın yaklaşık 1,88 katıdır. Aynı ölçek kullanıldığında Mars'ın Dünya'ya göre ne kadar küçük olduğu doğrudan görülebilir.": "Earth's diameter is about 1.88 times Mars's. On the same scale, the size difference between the two planets is immediately visible.",
    "Bu mod yalnızca iki gezegenin fiziksel özelliklerini ve boyutlarını karşılaştırmak için tasarlandı. Phobos, Deimos, yörünge çizgileri ve yüzey etiketleri karşılaştırma sırasında bilerek gizlenir.": "This mode compares the two planets' physical properties and sizes. Phobos, Deimos, orbit lines, and surface labels are intentionally hidden during the comparison."
});

Object.assign(ADDITIONAL_EN, {
    "Etkileşimli üç boyutlu Satürn modeli": "Interactive 3D model of Saturn", "Satürn bilgi paneli": "Saturn information panel",
    "≈ 120.536 km": "≈ 120,536 km", "≈ 9,5 AU": "≈ 9.5 AU", "≈ 10,7 saat": "≈ 10.7 hours", "≈ 29,4 Dünya yılı": "≈ 29.4 Earth years", "26,73°": "26.73°",
    "Bir yıl": "Length of year", "Gezegen türü": "Planet type", "Halkalar neyden oluşuyor?": "What are the rings made of?", "Neden bu kadar belirgin?": "Why are the rings so prominent?",
    "Satürn'ün halkaları katı ve tek parça diskler değildir. Halka sistemi; Satürn çevresinde bağımsız yörüngelerde hareket eden çok büyük sayıda buz, kaya ve toz parçacığından oluşur.": "Saturn's rings are not solid disks. They consist of countless particles of ice, rock, and dust moving in independent orbits around the planet.",
    "Halkalardaki su buzu parçacıkları Güneş ışığını güçlü yansıtır. Halka sistemi çok geniş olmasına rağmen dikey yönde olağanüstü incedir.": "Water-ice particles in the rings strongly reflect sunlight. Although the ring system is extremely broad, its main rings are remarkably thin vertically.",
    "Halka sisteminin yapısını incelemek için model üzerindeki bölgelerden birini veya sağ alttaki seçim menüsünü kullanabilirsiniz. Seçilen halkanın konumu ve sınırları model üzerinde gösterilir; ilgili bilimsel bilgiler bu panelde açılır.": "To examine the structure of the ring system, select a region on the model or use the selection menu at lower right. The selected ring's position and boundaries are shown on the model, while its scientific details open in this panel.",
    "C Halkasını incele": "Explore the C Ring", "B Halkasını incele": "Explore the B Ring", "A Halkasını incele": "Explore the A Ring", "F Halkasını incele": "Explore the F Ring", "Cassini Bölümünü incele": "Explore the Cassini Division",
    "C Halkası": "C Ring", "B Halkası": "B Ring", "A Halkası": "A Ring", "F Halkası": "F Ring", "Cassini Bölümü": "Cassini Division",
    "SATÜRN HALKA SİSTEMİ · İÇ BÖLGE": "SATURN RING SYSTEM · INNER REGION", "SATÜRN HALKA SİSTEMİ · EN YOĞUN BÖLGE": "SATURN RING SYSTEM · DENSEST REGION",
    "SATÜRN HALKA SİSTEMİ · A–B ARASI": "SATURN RING SYSTEM · BETWEEN A AND B", "SATÜRN HALKA SİSTEMİ · DIŞ ANA HALKA": "SATURN RING SYSTEM · OUTER MAIN RING", "SATÜRN HALKA SİSTEMİ · İNCE DIŞ HALKA": "SATURN RING SYSTEM · NARROW OUTER RING",
    "C Halkası, B Halkası'nın iç tarafında bulunan daha soluk ve daha saydam bir halka bölgesidir. Parçacık yoğunluğu B Halkası'na göre daha düşüktür.": "The C Ring is a fainter, more translucent region inside the B Ring, with a lower particle density.",
    "Neden daha soluk görünüyor?": "Why does it look fainter?", "C Halkası'ndaki madde daha seyrek dağıldığı için ışığı B Halkası kadar güçlü yansıtmaz. Bu nedenle teleskop görüntülerinde daha karanlık ve yarı saydam görünür.": "Because material is more sparsely distributed in the C Ring, it reflects less light than the B Ring and appears darker and partly transparent in telescope images.",
    "B Halkası, Satürn'ün ana halka sistemindeki en geniş, en parlak ve en yoğun bölgelerden biridir.": "The B Ring is one of the broadest, brightest, and densest regions in Saturn's main ring system.",
    "Neden bu kadar parlak?": "Why is it so bright?", "B Halkası çok yüksek miktarda su buzu içeren parçacık barındırır. Buz parçacıkları Güneş ışığını güçlü biçimde yansıttığı için bu bölge oldukça parlak görünür.": "The B Ring contains abundant water-ice-rich particles. Their strong reflection of sunlight makes this region appear especially bright.",
    "Cassini Bölümü, B ve A halkaları arasında bulunan belirgin koyu bölgedir.": "The Cassini Division is the prominent dark region between the B and A rings.",
    "Gerçekten tamamen boş mu?": "Is it completely empty?", "Hayır. Cassini Bölümü uzaktan bakıldığında bir boşluk gibi görünür ancak tamamen boş değildir. Burada da halka parçacıkları bulunur; yalnızca yoğunluk çevredeki ana halkalara göre daha düşüktür.": "No. The Cassini Division resembles an empty gap from a distance, but it still contains ring particles at a lower density than the neighboring main rings.",
    "A Halkası, Cassini Bölümü'nün dış tarafında bulunan ana halka bölgelerinden biridir.": "The A Ring is one of the main ring regions outside the Cassini Division.",
    "A Halkasında boşluklar var mı?": "Are there gaps in the A Ring?", "A Halkası tekdüze bir disk değildir. İçinde çok sayıda ince halkacık ve boşluk bulunur. En dikkat çekici yapılardan biri Encke Boşluğu'dur. Bu yapıların biçimlenmesinde küçük uyduların kütleçekim etkisi önemli rol oynar.": "The A Ring is not uniform. It contains many narrow ringlets and gaps, including the Encke Gap; the gravity of small moons helps shape these structures.",
    "F Halkası, ana A Halkası'nın dışında bulunan son derece ince ve dinamik bir halka yapısıdır.": "The F Ring is an extremely narrow, dynamic structure outside the main A Ring.",
    "Neden bu kadar karmaşık?": "Why is it so complex?", "F Halkası'nın şekli zaman içinde değişebilir. Yakınındaki çoban uydular özellikle Prometheus ve Pandora, halka parçacıklarının yörüngelerini kütleçekimleriyle etkileyerek kıvrımlar ve yoğunluk değişimleri oluşturabilir.": "The F Ring changes shape over time. Nearby shepherd moons, especially Prometheus and Pandora, gravitationally perturb ring-particle orbits, producing kinks and density variations.",
    "Modeldeki ölçek": "Scale in the model", "Bu bölgenin iç ve dış sınırları 3B modelde Satürn'ün ekvator yarıçapına göre orantılı biçimde gösteriliyor.": "This region's inner and outer boundaries are shown in proportion to Saturn's equatorial radius in the 3D model.",
    "Modeller aynı ölçek sistemi içinde gösteriliyor. Satürn'ün ekvator çapı Dünya'nın çapının yaklaşık 9,45 katıdır. Hacim olarak ise Satürn'ün içine yaklaşık 764 Dünya sığabilir. Yaklaşıp uzaklaşarak boyut farkını doğrudan inceleyebilirsin.": "The models use the same scale. Saturn's equatorial diameter is about 9.45 times Earth's, and its volume is about 764 times Earth's. Zoom in and out to examine the size difference directly.",
    "120.536 km": "120,536 km", "5,68 × 10²⁶ kg": "5.68 × 10²⁶ kg", "10,44 m/s²": "10.44 m/s²", "≈ 365,25 gün": "≈ 365.25 days", "Hidrojen + Helyum": "Hydrogen + helium", "≈ 764 Dünya": "≈ 764 Earths"
});

Object.assign(ADDITIONAL_EN, {
    "GÜNEŞ GÖREVLERİ": "SOLAR MISSIONS", "Yükleniyor…": "Loading…", "Operasyon": "Operations", "Görev": "Mission", "Bilim araçları": "Science instruments",
    "ESA / NASA · Operasyon NASA GSFC": "ESA / NASA · Operated by NASA GSFC",
    "Canlı konum": "Live position", "Görüntüler ve gözlemler": "Images and observations", "Resmî görev sayfası": "Official mission page",
    "Konum, JPL Horizons'tan önceden alınmış gerçek heliosentrik durum vektörleri arasında hız bilgisi de kullanılarak interpolasyonla hesaplanır. Simülasyon zamanı varsayılan olarak gerçek UTC zamanıdır:": "The position is interpolated between real heliocentric state vectors obtained in advance from JPL Horizons, including velocity data. Simulation time defaults to current UTC:",
    "Parker Solar Probe, Güneş'in dış atmosferi olan koronanın içinden geçen ilk uzay aracıdır. Güneş rüzgârının kökenini, koronanın nasıl ısındığını ve yüksek enerjili parçacıkların nasıl hızlandığını doğrudan bulunduğu ortamdan ölçer.": "Parker Solar Probe is the first spacecraft to fly through the Sun's corona. It makes in-situ measurements to investigate the origin of the solar wind, coronal heating, and the acceleration of energetic particles.",
    "Parker Solar Probe, Güneş'e son derece yakın geçişler yaparken ısı kalkanını sürekli Güneş'e dönük tutar. Görev boyunca elektrik ve manyetik alanları, plazmayı, enerjik parçacıkları ve Güneş'in yakın çevresindeki yapıları inceler. 2026 yılında da yakın Güneş geçişlerine ve bilimsel gözlemlerine devam etmektedir.": "During its extremely close solar passes, Parker Solar Probe keeps its heat shield pointed toward the Sun. It studies electric and magnetic fields, plasma, energetic particles, and structures near the Sun. The spacecraft continues close approaches and science observations in 2026.",
    "FIELDS elektrik ve manyetik alanları ölçer. SWEAP elektron, proton ve helyum iyonlarını inceler. IS☉IS yüksek enerjili parçacıkları ölçer. WISPR ise koronayı ve Güneş rüzgârındaki yapıları görüntüler.": "FIELDS measures electric and magnetic fields. SWEAP studies electrons, protons, and helium ions; IS☉IS measures energetic particles; WISPR images the corona and structures in the solar wind.",
    "Parker Solar Probe aracını incele": "Explore Parker Solar Probe",
    "Solar Orbiter, Güneş'i hem uzaktan görüntüleyen hem de uzay aracının bulunduğu ortamı doğrudan ölçen on bilimsel cihazla inceler. Görevin en önemli özelliklerinden biri, Güneş'in Dünya'dan gözlenmesi zor olan kutup bölgelerini giderek daha yüksek enlemlerden incelemesidir.": "Solar Orbiter studies the Sun with ten instruments that combine remote sensing with in-situ measurements. A central goal is to observe the Sun's hard-to-see polar regions from increasingly high latitudes.",
    "Solar Orbiter; Güneş'in manyetik döngüsünün nasıl oluştuğunu, koronanın neden çok sıcak olduğunu, Güneş rüzgârının nasıl meydana geldiğini ve Güneş'teki olayların heliosferi nasıl etkilediğini araştırır. Venüs yakın geçişlerinden aldığı kütleçekim desteğiyle yörüngesinin eğimini zamanla artırır. Böylece Güneş'in kutup bölgelerini daha doğrudan gözleyebilir.": "Solar Orbiter investigates the Sun's magnetic cycle, coronal heating, the origin of the solar wind, and how solar events affect the heliosphere. Gravity assists at Venus gradually increase its orbital inclination, enabling more direct views of the solar poles.",
    "Solar Orbiter toplam 10 bilimsel cihaz taşır. Bunların bir bölümü Güneş'i uzaktan görüntülerken bir bölümü uzay aracının çevresindeki manyetik alanı, plazmayı, parçacıkları ve Güneş rüzgârını doğrudan ölçer.": "Solar Orbiter carries ten science instruments. Some image the Sun remotely, while others directly measure magnetic fields, plasma, particles, and the solar wind around the spacecraft.",
    "Solar Orbiter aracını incele": "Explore Solar Orbiter",
    "SOHO, Güneş'in derin iç yapısından dış koronaya ve Güneş rüzgârına kadar çok geniş bir bölgeyi incelemek için geliştirilmiş ESA ve NASA ortak görevidir. Uzay aracı, Dünya'nın yaklaşık 1,5 milyon kilometre Güneş tarafındaki Güneş-Dünya L1 bölgesi çevresinde hareket eder.": "SOHO is a joint ESA–NASA mission designed to study the Sun from its deep interior through the outer corona and solar wind. It operates around the Sun–Earth L1 region, about 1.5 million kilometers sunward of Earth.",
    "SOHO, Güneş-Dünya L1 noktası çevresindeki halo yörüngesi sayesinde Güneş'i büyük ölçüde kesintisiz olarak izleyebilir. 1995'ten beri elde ettiği uzun süreli gözlemler; helioseismoloji, korona, Güneş rüzgârı, kuyruklu yıldızlar ve uzay havası araştırmaları açısından son derece değerli bir veri arşivi oluşturmuştur.": "Its halo orbit around Sun–Earth L1 lets SOHO observe the Sun almost continuously. Since 1995, its long record has built a valuable archive for helioseismology, coronal and solar-wind studies, comet discoveries, and space-weather research.",
    "SOHO başlangıçta 12 bilimsel cihazla fırlatıldı. Görev çok uzun süredir devam ettiği için bu cihazların tamamı günümüzde aktif değildir; ancak SOHO görevi 2026 yılında hâlâ operasyoneldir.": "SOHO launched with 12 science instruments. Not all remain active after three decades in space, but the mission is still operational in 2026.",
    "SOHO aracını incele": "Explore SOHO", "8,1 yıl": "8.1 years"
});

Object.assign(ADDITIONAL_EN, {
    "MARS YÜZEYİ": "MARTIAN SURFACE", "Bu bölgeyi keşfet": "Explore this region", "Bilgi": "Notes", "3B inceleme": "3D exploration", "Mars yüzeyinden uzaklık": "Altitude above Mars",
    "≈ 9.375 km": "≈ 9,375 km", "≈ 5.985 km": "≈ 5,985 km", "≈ 7,65 saat": "≈ 7.65 hours", "1,1°": "1.1°",
    "≈ 23.457 km": "≈ 23,457 km", "≈ 20.067 km": "≈ 20,067 km", "≈ 30,30 saat": "≈ 30.30 hours", "1,8°": "1.8°",
    "KALKAN VOLKANI": "SHIELD VOLCANO", "KANYON SİSTEMİ": "CANYON SYSTEM", "KANYON VE GRABEN AĞI": "CANYON AND GRABEN NETWORK", "DEV ÇARPMA HAVZASI": "GIANT IMPACT BASIN", "ÇARPMA HAVZASI": "IMPACT BASIN", "GENİŞ OVA / ÇARPMA HAVZASI": "BROAD PLAIN / IMPACT BASIN", "KARANLIK VOLKANİK BÖLGE": "DARK VOLCANIC REGION", "ÇARPMA KRATERİ": "IMPACT CRATER", "KUZEY KUTUP BUZ ÖRTÜSÜ": "NORTHERN POLAR ICE CAP", "GÜNEY KUTUP BUZ ÖRTÜSÜ": "SOUTHERN POLAR ICE CAP",
    "Olympus Mons, Güneş Sistemi'nin bilinen en büyük volkanıdır. Çok geniş tabanı ve olağanüstü yüksekliğiyle Mars'ın en belirgin yüzey yapılarından biridir.": "Olympus Mons is the largest known volcano in the Solar System. Its enormous base and exceptional height make it one of Mars's most prominent landforms.",
    "Ascraeus Mons, Tharsis Montes adı verilen üç büyük volkanın en kuzeyde olanıdır. Uzun süreli volkanik etkinliğin oluşturduğu dev bir kalkan volkanıdır.": "Ascraeus Mons is the northernmost of the three great Tharsis Montes volcanoes, a giant shield built by prolonged volcanic activity.",
    "Pavonis Mons, Tharsis Montes zincirinin ortasında ve Mars ekvatoruna çok yakın konumda bulunur. Mars'ın dev volkanik bölgesi Tharsis'in önemli parçalarından biridir.": "Pavonis Mons lies near the Martian equator in the middle of the Tharsis Montes chain and is a major part of the vast Tharsis volcanic province.",
    "Arsia Mons, Tharsis Montes grubunun en güneydeki büyük volkanıdır. Zirvesindeki geniş kaldera, geçmişteki büyük volkanik etkinliğin izlerini taşır.": "Arsia Mons is the southernmost large volcano in the Tharsis Montes group. Its broad summit caldera records major past volcanic activity.",
    "Elysium Mons, Mars'ın Tharsis'ten sonraki önemli volkanik bölgesi olan Elysium Planitia çevresinde yükselir. Mars'ın en büyük volkanlarından biridir.": "Elysium Mons rises in the Elysium volcanic province, Mars's other major volcanic region beyond Tharsis, and is one of the planet's largest volcanoes.",
    "Alba Mons çok yüksek olmamasına rağmen olağanüstü geniş bir volkanik yapıdır. Çok düşük eğimli yamaçları yüzlerce kilometre boyunca uzanır.": "Alba Mons is not exceptionally high, but it is extraordinarily broad, with very gentle slopes extending for hundreds of kilometers.",
    "Valles Marineris, Mars'ın ekvatoru boyunca uzanan dev bir kanyon sistemidir. Bazı bölümleri yaklaşık 7 kilometre derinliğe ulaşır ve Dünya'daki Büyük Kanyon'dan çok daha büyüktür.": "Valles Marineris is an immense canyon system extending along the Martian equatorial region. Some sections reach roughly 7 kilometers deep, and the system is far larger than Earth's Grand Canyon.",
    "Noctis Labyrinthus, birbirine bağlanan vadiler ve çökmüş bloklardan oluşan karmaşık bir arazi sistemidir. Tharsis bölgesi ile Valles Marineris arasında bulunur.": "Noctis Labyrinthus is a complex network of interconnected valleys and collapsed blocks between Tharsis and Valles Marineris.",
    "Hellas Planitia, Güneş Sistemi'nin en büyük çarpma havzalarından biridir. Mars yüzeyinin en alçak bölgelerinden bazılarını içerir.": "Hellas Planitia is one of the Solar System's largest impact basins and contains some of the lowest terrain on Mars.",
    "Argyre Planitia, Mars'ın güney yarımküresindeki büyük ve eski çarpma havzalarından biridir. Çevresindeki dağlık arazi büyük çarpışmanın izlerini korur.": "Argyre Planitia is a large, ancient impact basin in Mars's southern hemisphere. The surrounding highlands preserve traces of the impact.",
    "Utopia Planitia, Mars'ın kuzey yarımküresinde bulunan dev bir düzlük ve eski çarpma havzasıdır. Viking 2 uzay aracı 1976 yılında bu bölgeye iniş yaptı.": "Utopia Planitia is a vast northern plain and ancient impact basin. NASA's Viking 2 lander touched down in this region in 1976.",
    "Isidis Planitia, Mars'ın büyük ve eski çarpma havzalarından biridir. Jezero Krateri bu havzanın batı kenarına yakın bir bölgede yer alır.": "Isidis Planitia is a large, ancient impact basin. Jezero Crater lies near its western margin.",
    "Syrtis Major, teleskopla Dünya'dan bile fark edilebilen koyu renkli büyük bir Mars bölgesidir. Eski ve geniş bir volkanik yapı üzerinde yer alır.": "Syrtis Major is a broad, dark Martian region visible even through telescopes from Earth. It overlies an ancient volcanic structure.",
    "Jezero Krateri'nin geçmişte bir göle ev sahipliği yaptığı düşünülür. Korunmuş nehir deltası nedeniyle NASA'nın Perseverance gezgininin araştırma bölgesi olarak seçilmiştir.": "Jezero Crater once held a lake. Its preserved river delta helped make it the landing and study site for NASA's Perseverance rover.",
    "Gale Krateri, merkezinde yaklaşık 5 kilometre yüksekliğindeki Aeolis Mons'un yükseldiği büyük bir kraterdir. NASA'nın Curiosity gezgini 2012'den beri bu bölgeyi araştırmaktadır.": "Gale Crater is a large impact crater with the roughly 5-kilometer-high Aeolis Mons at its center. NASA's Curiosity rover has explored the region since 2012.",
    "Planum Boreum, Mars'ın kuzey kutbunda bulunan geniş buz örtüsüdür. Büyük ölçüde su buzundan oluşur ve yüzeyindeki spiral biçimli oluklar Mars'ın rüzgârları, buz birikimi ve iklim geçmişiyle ilişkilidir.": "Planum Boreum is Mars's broad northern polar cap. It consists largely of water ice; its spiral troughs reflect interactions among wind, ice deposition, and climate history.",
    "Planum Australe, Mars'ın güney kutup bölgesindeki kalıcı buz örtüsüdür. Su buzu ve karbondioksit buzundan oluşan katmanlar Mars'ın geçmiş iklimi hakkında önemli bilgiler taşır.": "Planum Australe is the permanent southern polar cap. Layers of water ice and carbon-dioxide ice preserve evidence of Mars's past climate.",
    "Phobos, Mars'ın iki doğal uydusunun daha büyük ve daha içte olanıdır.": "Phobos is the larger and inner of Mars's two natural satellites.", "Deimos, Mars'ın daha küçük ve daha dıştaki doğal uydusudur.": "Deimos is the smaller and outer of Mars's two natural satellites.",
    "Phobos zamanla Mars'a yaklaşmaktadır. Gelecekte parçalanması veya Mars'a çarpması beklenmektedir.": "Phobos is slowly spiraling toward Mars and is expected eventually to break apart or collide with the planet.",
    "Deimos, Phobos'a göre Mars'tan çok daha uzakta bulunur ve bir turunu yaklaşık 30,3 saatte tamamlar.": "Deimos orbits much farther from Mars than Phobos and completes one orbit in about 30.3 hours.",
    "17 Ağustos 1877": "August 17, 1877", "11 Ağustos 1877": "August 11, 1877"
});

Object.assign(ADDITIONAL_EN, {
    "Yaklaşık 108 milyon yıl yaşındaki Tycho, Ay'ın jeolojik açıdan genç kraterlerinden biridir. Çarpma sırasında yüzeyden savrulan malzemenin oluşturduğu parlak ışın sistemi binlerce kilometre boyunca uzanır ve dolunay sırasında Dünya'dan bile kolaylıkla seçilebilir.": "Tycho, about 108 million years old, is geologically young for a lunar crater. Its bright rays of impact ejecta extend for thousands of kilometers and are readily visible from Earth near full Moon.",
    "Yaklaşık 800 milyon yıl önce oluşan Copernicus; basamaklı iç duvarları, merkez tepeleri ve çevresine yayılan parlak ışın sistemiyle Ay'ın en belirgin çarpma kraterlerinden biridir.": "Copernicus formed about 800 million years ago and is one of the Moon's most prominent impact craters, with terraced inner walls, central peaks, and a bright ray system.",
    "Aristarchus, Ay'ın Dünya'ya bakan yüzündeki en parlak yapılardan biridir. Yüksek yansıtıcılığa sahip genç yüzeyi, çevresindeki daha koyu arazinin üzerinde güçlü bir kontrast oluşturur.": "Aristarchus is one of the brightest features on the Moon's near side. Its young, highly reflective surface contrasts sharply with the darker surrounding terrain.",
    "Plato, koyu ve oldukça düz tabanıyla kolayca ayırt edilir. Krater tabanını kaplayan bazaltik malzeme nedeniyle Dünya'dan bakıldığında Ay yüzeyindeki belirgin koyu bölgelerden biri gibi görünür.": "Plato is easily recognized by its dark, relatively flat floor. Basaltic material covering the floor makes it appear as a conspicuous dark patch from Earth.",
    "Clavius, Ay'ın güney yarımküresindeki en büyük ve en eski krater yapılarından biridir. Tabanında kavisli bir hat boyunca sıralanan daha küçük kraterler, yapının en ayırt edici özelliklerinden biridir.": "Clavius is one of the largest and oldest crater structures in the Moon's southern hemisphere. A curved chain of smaller craters across its floor is one of its defining features.",
    "Kepler, görece küçük çapına rağmen oldukça belirgin bir kraterdir. Çevresindeki parlak ışın sistemi, yüzeyden savrulan malzemenin çarpma noktasından çok uzaklara taşındığını gösterir.": "Despite its modest diameter, Kepler is a prominent crater. Its bright rays show that ejecta traveled far from the impact site.",
    "Ptolemaeus oldukça eski ve aşınmış bir çarpma yapısıdır. Geniş, düz görünümlü tabanı ve zaman içinde bozulmuş dış duvarları, genç ve keskin kenarlı kraterlerden belirgin biçimde ayrılır.": "Ptolemaeus is an old, eroded impact structure. Its broad, flat-looking floor and degraded walls distinguish it from younger, sharp-rimmed craters.",
    "Mare Imbrium'un doğu kesiminde bulunan Archimedes, geniş ve düz tabanlı bir kraterdir. İç bölgesinin daha sonra volkanik malzemelerle kaplanması, merkez tepesinin görünmemesine neden olmuştur.": "Archimedes lies in eastern Mare Imbrium and has a broad, flat floor. Later volcanic flooding covered its interior, leaving no visible central peak.",
    "Ay'ın Dünya'dan görünmeyen uzak yüzündeki en dikkat çekici yapılardan biridir. Koyu renkli tabanı ve merkezindeki büyük tepe, çevresindeki daha açık renkli yüksek arazilerle güçlü bir kontrast oluşturur.": "Tsiolkovskiy is one of the most striking features on the lunar far side. Its dark floor and large central peak contrast sharply with the brighter surrounding highlands.",
    "Ay'ın güney kutbuna yakın bulunan Schrödinger, devasa bir çarpma havzasıdır. İç kısmındaki belirgin dağ halkası ve iyi korunmuş jeolojik yapısı nedeniyle Ay'ın geçmişini incelemek açısından önemli bir bölgedir.": "Schrödinger is a huge impact basin near the lunar south pole. Its prominent inner mountain ring and well-preserved geology make it important for studying lunar history.",
    "Korolev, Ay'ın uzak yüzündeki çok eski ve geniş bir çarpma havzasıdır. Uzun jeolojik geçmişi boyunca aldığı yeni darbeler nedeniyle yüzeyi çok sayıda daha küçük kraterle kaplanmıştır.": "Korolev is a large, very old impact basin on the lunar far side. Later impacts over its long history have covered it with many smaller craters.",
    "Jackson, Ay'ın uzak yüzündeki genç ve parlak kraterlerden biridir. Çevresine yayılan geniş ışın sistemi nedeniyle görünüş bakımından Tycho'yu anımsatan dikkat çekici bir yapıdır.": "Jackson is a young, bright crater on the lunar far side. Its extensive ray system gives it an appearance reminiscent of Tycho.",
    "Daedalus, Dünya'nın hemen hemen tam karşısında kalan uzak yüz bölgesinde bulunur. Ay'ın uzak yüzünün Dünya kaynaklı radyo gürültüsünden korunması nedeniyle bu bölge, gelecekte kurulabilecek radyo astronomi sistemleri açısından ilgi çekicidir.": "Daedalus lies on the far side, nearly opposite Earth. Shielded from terrestrial radio noise, this region is of interest for possible future radio-astronomy facilities.",
    "Aitken krateri, Ay'ın uzak yüzündeki Güney Kutbu-Aitken Havzası ile ilişkilendirilen önemli yapılardan biridir. Bu bölge, Ay'ın kabuğu ve erken çarpma geçmişinin araştırılmasında büyük bilimsel öneme sahiptir.": "Aitken crater is an important feature associated with the South Pole–Aitken Basin on the lunar far side. The region is scientifically valuable for studying the Moon's crust and early impact history.",
    "Apollo, Ay'ın uzak yüzünün güney kesimindeki devasa ve çok halkalı eski bir çarpma havzasıdır. Milyarlarca yıl boyunca gerçekleşen daha küçük çarpmalar, havzanın yüzeyini yoğun biçimde değiştirmiştir.": "Apollo is a huge, ancient, multi-ring impact basin in the southern lunar far side. Smaller impacts over billions of years have heavily modified its surface."
});

Object.assign(ADDITIONAL_EN, {
    "Güneş'e en uzak gezegen; mavi atmosferinde sistemin en hızlı rüzgârları ölçülür.": "The farthest planet from the Sun; the Solar System's fastest winds have been measured in its blue atmosphere.",
    "Güneş'ten çok az enerji almasına karşın iç ısısı da bulunan gezegenin aşırı hava düzenekleri hâlâ araştırılmaktadır.": "Although Neptune receives very little sunlight and also emits internal heat, the processes driving its extreme weather remain under study.",
    "Mavi görünüm": "Blue appearance",
    "Atmosferdeki metan kırmızı ışığı soğurur. Güncel yeniden işlenmiş görüntüler, Neptün ile Uranüs'ün doğal renkte eski Voyager görsellerinin düşündürdüğünden daha benzer olduğunu gösterir.": "Methane in the atmosphere absorbs red light. Modern reprocessing shows that Neptune and Uranus look more similar in natural color than older Voyager images suggested."
});

Object.assign(ADDITIONAL_EN, {
    "Phobos, Mars çevresinde gerçek boyut ve yörünge oranları korunarak gösteriliyor. Yörünge uzaklığı, eğimi, eksantrikliği ve dolanım süresi simülasyonda hesaba katılıyor.": "Phobos is shown around Mars with its relative physical size and orbit preserved. Orbital distance, inclination, eccentricity, and period are included in the simulation.",
    "Deimos, Mars çevresinde gerçek boyut ve yörünge oranları korunarak gösteriliyor. Yörünge uzaklığı, eğimi, eksantrikliği ve dolanım süresi simülasyonda hesaba katılıyor.": "Deimos is shown around Mars with its relative physical size and orbit preserved. Orbital distance, inclination, eccentricity, and period are included in the simulation.",
    "Mouse ile sürükleyerek Phobos'un çevresinde dönebilir, scroll ile yaklaşıp uzaklaşabilirsin.": "Drag to orbit around Phobos and scroll to zoom in or out.",
    "Mouse ile sürükleyerek Deimos'un çevresinde dönebilir, scroll ile yaklaşıp uzaklaşabilirsin.": "Drag to orbit around Deimos and scroll to zoom in or out.",
    "Mimas, büyük Herschel krateriyle kolayca ayırt edilen küçük ve yoğun biçimde kraterli bir Satürn uydusudur.": "Mimas is a small, heavily cratered moon of Saturn, readily identified by its large Herschel crater.",
    "Enceladus, parlak buz yüzeyi ve güney kutbundan uzaya püsküren su-buz jetleriyle bilinen aktif bir uydudur.": "Enceladus is an active moon known for its bright icy surface and water-ice jets erupting from its south polar region.",
    "Tethys, büyük Odysseus krateri ve dev Ithaca Chasma kanyonu ile dikkat çeken buz ağırlıklı bir uydudur.": "Tethys is an ice-rich moon marked by the large Odysseus crater and enormous Ithaca Chasma.",
    "Dione, yoğun kraterli arazileri ve parlak buz uçurumlarıyla karmaşık bir jeolojik geçmiş gösterir.": "Dione's heavily cratered terrain and bright ice cliffs record a complex geologic history.",
    "Rhea, Satürn'ün ikinci büyük uydusudur; buz ve kaya karışımı, eski ve yoğun kraterli bir yüzeye sahiptir.": "Rhea is Saturn's second-largest moon, with an old, heavily cratered surface made of ice and rock.",
    "Titan, Satürn'ün en büyük uydusudur. Yoğun azot atmosferi, metan bulutları ve yüzeyindeki hidrokarbon gölleriyle benzersizdir.": "Titan is Saturn's largest moon, distinguished by a dense nitrogen atmosphere, methane clouds, and hydrocarbon lakes on its surface.",
    "Iapetus, bir yarımküresinin çok koyu, diğerinin çok parlak olması ve ekvator sırtıyla tanınan uzak bir Satürn uydusudur.": "Iapetus is a distant moon of Saturn known for its starkly dark and bright hemispheres and its equatorial ridge.",
    "Bilimsel önemi": "Scientific significance"
});

Object.assign(ADDITIONAL_EN, {
    "Kutup birikimi": "Polar deposit",
    "Su buzu": "Water ice",
    "Jeolojik etkinlik": "Geologic activity",
    "Halka sistemi": "Ring system",
    "13 halka": "13 rings",
    "En büyük uydu": "Largest moon",
    "Kutuplardaki su buzu": "Water ice at the poles",
    "MESSENGER verileri, kutuplara yakın ve Güneş ışığını hiç almayan derin kraterlerde su buzu bulunduğunu doğruladı. Merkür'ün eksen eğikliği çok küçük olduğu için bu kalıcı gölgeler aşırı soğuk kalabilir.": "MESSENGER data confirmed water ice in deep craters near the poles that never receive sunlight. Because Mercury's axial tilt is extremely small, these permanently shadowed regions can remain intensely cold.",
    "Etkin volkanizma": "Active volcanism",
    "Magellan radar görüntülerinin farklı tarihlerde alınan kareleri, 1990'ların başında yeni lav akıntıları oluştuğunu gösterdi. Bu değişimler Venüs'ün jeolojik olarak hâlâ etkin olduğuna doğrudan kanıt sağlıyor.": "Magellan radar images taken at different times show that new lava flows formed in the early 1990s. These changes provide direct evidence that Venus is still geologically active.",
    "Hareketli kabuk": "A moving crust",
    "Dünya'nın litosferi sürekli hareket eden levhalara ayrılmıştır. Levhaların çarpışması, ayrılması ve birbirinin altına dalması depremleri, volkanları, dağları ve okyanus havzalarını oluşturur.": "Earth's lithosphere is divided into plates that are constantly moving. Their collisions, separation, and subduction produce earthquakes, volcanoes, mountains, and ocean basins.",
    "Katı yüzeyi yok": "No solid surface",
    "Jüpiter'in bulutlarının altında iniş yapılabilecek katı bir yüzey bulunmaz. Artan basınç hidrojeni önce sıvıya, daha derinde elektriği ileten metalik hidrojene dönüştürür; bu katman güçlü manyetik alanın oluşmasına katkı verir.": "Beneath Jupiter's clouds there is no solid surface on which to land. Rising pressure turns hydrogen first into a liquid and, deeper down, into electrically conducting metallic hydrogen that helps generate the planet's powerful magnetic field.",
    "Halkalar ve manyetik alan": "Rings and magnetic field",
    "Uranüs'ün 13 soluk halkası vardır. Manyetik ekseni dönme eksenine göre yaklaşık 60° eğik ve gezegen merkezinden belirgin biçimde kayıktır; bu nedenle manyetosferi son derece asimetriktir.": "Uranus has 13 faint rings. Its magnetic axis is tilted about 60° from its rotation axis and is substantially offset from the planet's center, making the magnetosphere highly asymmetric.",
    "Triton: yakalanmış bir dünya": "Triton: a captured world",
    "Neptün'ün en büyük uydusu Triton, gezegenin dönüşünün ters yönünde dolanır; bu yüzden Kuiper Kuşağı'ndan yakalanmış bir cisim olduğu düşünülür. Voyager 2, aşırı soğuk yüzeyinden yaklaşık 8 km yükselen azot jetleri gözledi.": "Neptune's largest moon, Triton, orbits opposite to the planet's rotation and is therefore thought to be a captured Kuiper Belt object. Voyager 2 observed nitrogen jets rising about 8 km above its extremely cold surface.",
    "115 doğrulanmış": "115 confirmed",
    "Herschel Krateri yaklaşık 130 km genişliğindedir; bu, Mimas'ın çapının yaklaşık üçte biridir. Krateri oluşturan çarpışmanın uyduyu parçalamaya çok yaklaştığı düşünülür.": "Herschel Crater is about 130 km wide, roughly one-third of Mimas's diameter. The impact that formed it is thought to have come close to breaking the moon apart.",
    "Cassini verileri, buz kabuğunun altında küresel bir tuzlu su okyanusu bulunduğunu gösterir. Güney kutbundaki jetler su buharı, buz taneleri, tuzlar ve organik bileşikler taşır.": "Cassini data indicate a global saltwater ocean beneath the ice shell. Jets at the south pole carry water vapor, ice grains, salts, and organic compounds.",
    "Yoğunluğu sıvı sudan biraz düşüktür; bu nedenle neredeyse bütünüyle su buzundan oluştuğu düşünülür. Ithaca Chasma yaklaşık 2.000 km boyunca uzanır.": "Its density is slightly lower than liquid water, suggesting that it is made almost entirely of water ice. Ithaca Chasma extends for about 2,000 km.",
    "Voyager görüntülerinde ince parlak çizgiler gibi görünen yapıların, Cassini gözlemlerinde yüzlerce metre yüksekliğinde parlak buz uçurumları olduğu anlaşıldı. Bu kırıklar geçmişteki tektonik etkinliğin izleridir.": "Features that looked like thin bright lines in Voyager images were revealed by Cassini to be bright ice cliffs hundreds of meters high. These fractures are evidence of past tectonic activity.",
    "Cassini, Rhea'nın çevresinde oksijen ve karbondioksit içeren son derece ince bir ekzosfer saptadı. Bu gaz tabakası solunabilir bir atmosferden trilyonlarca kat daha seyrektir.": "Cassini detected an extremely thin exosphere containing oxygen and carbon dioxide around Rhea. This layer of gas is trillions of times more tenuous than a breathable atmosphere.",
    "Titan, yoğun atmosfere sahip olduğu bilinen tek uydudur ve Dünya dışında yüzeyinde kalıcı sıvılar bulunan tek dünyadır. Metan ve etan yağmuru nehirleri, gölleri ve denizleri besler.": "Titan is the only moon known to have a dense atmosphere and the only world besides Earth with stable liquids on its surface. Methane and ethane rain feeds rivers, lakes, and seas.",
    "Iapetus'un ekvatoru boyunca uzanan dağ zinciri yer yer yaklaşık 10 km yüksekliğe ulaşır. Bu olağan dışı sırtın nasıl oluştuğu kesin olarak bilinmiyor.": "The mountain chain along Iapetus's equator reaches about 10 km high in places. How this extraordinary ridge formed remains uncertain."
});

for (const [source, translated] of Object.entries(ADDITIONAL_EN)) EN.set(source, translated);

const NAME_REPLACEMENTS = [
    [/GÜNEŞ SİSTEMİNİ KEŞFET/g, "EXPLORE THE SOLAR SYSTEM"], [/Güneş Sistemi/g, "Solar System"],
    [/GÜNEŞ/g, "SUN"], [/Güneş/g, "Sun"], [/MERKÜR/g, "MERCURY"], [/Merkür/g, "Mercury"],
    [/VENÜS/g, "VENUS"], [/Venüs/g, "Venus"], [/DÜNYA/g, "EARTH"], [/Dünya/g, "Earth"],
    [/\bAY\b/g, "MOON"], [/\bAy\b/g, "Moon"], [/JÜPİTER/g, "JUPITER"], [/Jüpiter/g, "Jupiter"],
    [/SATÜRN/g, "SATURN"], [/Satürn/g, "Saturn"], [/URANÜS/g, "URANUS"], [/Uranüs/g, "Uranus"],
    [/NEPTÜN/g, "NEPTUNE"], [/Neptün/g, "Neptune"], [/Krateri/g, "Crater"],
    [/ modeli yükleniyor/g, " model loading"], [/ modeli yüklenemedi/g, " model could not be loaded"],
    [/ görünümüne dön/g, " view"], [/ yaklaşık /g, " approximately "], [/ doğrulanmış/g, " confirmed"],
    [/ milyar yıl/g, " billion years"], [/ milyar km/g, " billion km"], [/ milyon km/g, " million km"],
    [/ Dünya yılı/g, " Earth years"], [/ Dünya günü/g, " Earth days"], [/ yıl\b/g, " years"], [/ gün/g, " days"], [/ saat/g, " hours"], [/ dk/g, " min"],
    [/\bAB\b/g, "AU"],
    [/ çap/g, " diameter"], [/ yükseklik/g, " height"], [/ uzunluk/g, " long"], [/ genişlik/g, " wide"]
];

export function t(value) {
    if (language !== "en") return value;
    const source = normalize(value);
    if (!source) return value;
    const exact = EN.get(source);
    if (exact) return exact;

    let translated = source;
    for (const [pattern, replacement] of NAME_REPLACEMENTS) {
        translated = translated.replace(pattern, replacement);
    }
    // Runtime panels format measurements with tr-TR. Convert only numeric
    // punctuation and the Turkish speed unit when English is active.
    translated = translated
        .replace(/\d{1,3}(?:\.\d{3})+(?:,\d+)?/g, (number) => {
            const fractionDigits = number.includes(",") ? number.split(",")[1].length : 0;
            const numericValue = Number(number.replace(/\./g, "").replace(",", "."));
            return numericValue.toLocaleString("en-US", {
                minimumFractionDigits: fractionDigits,
                maximumFractionDigits: fractionDigits
            });
        })
        .replace(/(\d),(\d)/g, "$1.$2")
        .replace(/km\/sn\b/g, "km/s");
    translated = translated.replace(/^(≈\s*)?(\d{4,6}) km$/, (_, prefix = "", digits) => `${prefix}${Number(digits).toLocaleString("en-US")} km`);
    return translated === source ? value : translated;
}

const translateTextNode = (node) => {
    if (language !== "en" || !node.nodeValue?.trim()) return;
    const parent = node.parentElement;
    if (!parent || parent.closest("script, style, code, pre, [data-i18n-ignore]")) return;
    const translated = t(node.nodeValue);
    if (translated === node.nodeValue) return;
    const leading = node.nodeValue.match(/^\s*/)?.[0] ?? "";
    const trailing = node.nodeValue.match(/\s*$/)?.[0] ?? "";
    node.nodeValue = `${leading}${normalize(translated)}${trailing}`;
};

const translateElement = (element) => {
    if (language !== "en" || element.matches("[data-i18n-ignore]")) return;
    for (const attribute of ["aria-label", "title", "alt", "placeholder", "content"]) {
        if (!element.hasAttribute(attribute)) continue;
        const source = element.getAttribute(attribute);
        const translated = t(source);
        if (translated !== source) element.setAttribute(attribute, translated);
    }
};

export function translateSubtree(root = document) {
    if (language !== "en") return;
    if (root.nodeType === Node.TEXT_NODE) {
        translateTextNode(root);
        return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
    if (root.nodeType === Node.ELEMENT_NODE) translateElement(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
        if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
        else translateElement(node);
    }
}

// Three.js sprite labels are drawn to canvas. Translating at the canvas boundary
// keeps those labels bilingual without changing camera, orbit, or interaction code.
if (language === "en") {
    for (const method of ["fillText", "strokeText"]) {
        const original = CanvasRenderingContext2D.prototype[method];
        CanvasRenderingContext2D.prototype[method] = function (text, ...args) {
            return original.call(this, t(text), ...args);
        };
    }
}

const mountSwitcher = () => {
    if (document.querySelector(".language-switch")) return;
    const style = document.createElement("style");
    style.textContent = `
        .language-switch{position:fixed;top:56px;right:32px;z-index:100000;display:flex;align-items:center;gap:7px;color:#777b85;font:600 11px/1 var(--font-mono,monospace);letter-spacing:.16em;text-transform:uppercase}
        .language-switch button{appearance:none;border:0;background:transparent;color:inherit;font:inherit;letter-spacing:inherit;padding:5px 2px;cursor:pointer}
        .language-switch button[aria-pressed="true"]{color:#f4f4f5;border-bottom:1px solid currentColor}
        .language-switch button:focus-visible{outline:1px solid #f4f4f5;outline-offset:4px}
        @media(max-width:720px){.language-switch{top:52px;right:16px;font-size:10px}}
    `;
    document.head.appendChild(style);

    const switcher = document.createElement("div");
    switcher.className = "language-switch";
    switcher.dataset.i18nIgnore = "";
    switcher.setAttribute("role", "group");
    switcher.setAttribute("aria-label", language === "en" ? "Language selection" : "Dil seçimi");
    switcher.innerHTML = `
        <button type="button" data-language="tr" aria-pressed="${language === "tr"}">TR</button>
        <span aria-hidden="true">/</span>
        <button type="button" data-language="en" aria-pressed="${language === "en"}">EN</button>
    `;
    switcher.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-language]");
        if (!button || button.dataset.language === language) return;
        localStorage.setItem(STORAGE_KEY, button.dataset.language);
        location.reload();
    });
    document.body.appendChild(switcher);
};

const start = () => {
    if (language === "en") {
        document.title = t(document.title);
        translateSubtree(document);
        const observer = new MutationObserver((records) => {
            observer.disconnect();
            for (const record of records) {
                for (const node of record.addedNodes) translateSubtree(node);
                if (record.type === "characterData") translateTextNode(record.target);
            }
            observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
        });
        observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    }
    mountSwitcher();
};

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
else start();

export const getLanguage = () => language;
export const setLanguage = (nextLanguage) => {
    if (!SUPPORTED_LANGUAGES.has(nextLanguage)) return;
    localStorage.setItem(STORAGE_KEY, nextLanguage);
    location.reload();
};

window.solarI18n = { t, getLanguage, setLanguage, translateSubtree };
