# Explore the Solar System

Güneş Sistemi'ni etkileşimli üç boyutlu sahneler ve bilimsel bilgilerle keşfetmeye yönelik, Türkçe ve İngilizce dil desteğine sahip bir web projesi.

## Özellikler

- Güneş, sekiz gezegen ve Ay'ı içeren etkileşimli Güneş Sistemi sahnesi
- Gök cisimleri için temel fiziksel veriler ve bilimsel açıklamalar
- Güneş, Ay, Mars ve Satürn için ayrıntılı keşif sayfaları
- Mars ve Satürn uydularının yörünge görselleştirmeleri
- Güneş araçları için yörünge ve görev bilgileri
- Kraterler, gezegen yüzeyleri ve halka bölgeleri için etkileşimli inceleme modları
- Temel astronomi konularını anlatan **Uzayı Anla** modülü
- Türkçe ve İngilizce arayüz
- Masaüstü ve mobil ekranlara uyumlu tasarım

## Kullanılan Teknolojiler

- HTML5
- CSS3
- JavaScript (ES Modules)
- Three.js
- GLTF/GLB üç boyutlu modeller
- JSON tabanlı bilimsel veri dosyaları

## Projeyi Çalıştırma

Proje derleme adımı veya backend servisi gerektirmez. ES modülleri ve yerel veri dosyaları nedeniyle dosyaları doğrudan açmak yerine bir yerel web sunucusu kullanılmalıdır.

### Visual Studio Code ile

1. Proje klasörünü Visual Studio Code ile açın.
2. **Live Server** eklentisini kurun.
3. `index.html` dosyasına sağ tıklayıp **Open with Live Server** seçeneğini kullanın.

### Python ile

Proje klasöründe aşağıdaki komutu çalıştırın:

```bash
python -m http.server 8000
```

Ardından tarayıcıda `http://localhost:8000` adresini açın.

## Proje Yapısı

```text
assets/          3B modeller, görseller ve bilimsel veri dosyaları
css/             Sayfa ve bileşen stilleri
js/              Sahne, etkileşim, veri ve dil modülleri
pages/           Güneş, Ay, Mars ve Satürn keşif sayfaları
uzayi-anla/      Temel astronomi eğitim modülü
index.html       Giriş sayfası
solar-system.html Ana Güneş Sistemi sahnesi
```

## Bilimsel Kaynaklar

Projedeki temel astronomi bilgileri ve sayısal değerler aşağıdaki kurumsal kaynaklarla karşılaştırılmıştır:

- [NASA Science – Solar System](https://science.nasa.gov/solar-system/)
- [NASA/JPL Solar System Dynamics](https://ssd.jpl.nasa.gov/)
- [NASA Planetary Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/)

## Kullanım

Sahneleri fare veya dokunmatik hareketlerle döndürebilir, yakınlaştırabilir ve bilgi panellerini açmak için gök cisimlerini seçebilirsiniz. Dil seçeneği sayfaların sağ üst köşesinde bulunur.
