import * as THREE from "three";

import {
    GLTFLoader
} from "three/addons/loaders/GLTFLoader.js";

import {
    DRACOLoader
} from "three/addons/loaders/DRACOLoader.js";

import {
    resetMarsMoonInspectionToOverview
} from "./mars-moons.js";


// ======================================================
// 1. GERÇEK BOYUT ORANI
// ======================================================

const MARS_RADIUS_KM =
    3390;

const EARTH_RADIUS_KM =
    6371;

const MARS_RADIUS_SCENE =
    1;

const EARTH_RADIUS_SCENE =
    EARTH_RADIUS_KM
    / MARS_RADIUS_KM;


// Gezegenlerin yüzeyleri arasındaki yalnızca görsel boşluk.
// Gezegen çaplarının kendi oranını değiştirmez.
const SURFACE_GAP =
    0.5;


const CENTER_DISTANCE =
    MARS_RADIUS_SCENE
    + EARTH_RADIUS_SCENE
    + SURFACE_GAP;


// İki gezegenin oluşturduğu toplam genişliği sahne merkezine al.
const MARS_COMPARE_X =
    -(
        CENTER_DISTANCE
        + EARTH_RADIUS_SCENE
        - MARS_RADIUS_SCENE
    ) / 2;


const EARTH_COMPARE_X =
    MARS_COMPARE_X
    + CENTER_DISTANCE;


// ======================================================
// 2. STATE
// ======================================================

export const marsCompareState = {

    active: false,
    earthLoaded: false,
    earthRoot: null

};


let sceneRef = null;
let marsRootRef = null;
let rendererRef = null;
let cameraRef = null;
let controlsRef = null;

let earthRoot = null;
let labelsRoot = null;
let marsLabel = null;
let earthLabel = null;

let savedView = null;
let savedMarsPosition = null;

let tween = null;
let pendingStart = false;


// ======================================================
// 3. LABEL
// ======================================================

function createLabel(text) {

    const canvas =
        document.createElement("canvas");

    canvas.width = 512;
    canvas.height = 128;


    const ctx =
        canvas.getContext("2d");


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.font =
        "700 34px Arial";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";

    ctx.strokeStyle =
        "rgba(0,0,0,0.9)";

    ctx.lineWidth =
        8;


    ctx.strokeText(
        text,
        256,
        64
    );


    ctx.fillStyle =
        "#ffffff";

    ctx.fillText(
        text,
        256,
        64
    );


    const texture =
        new THREE.CanvasTexture(canvas);

    texture.colorSpace =
        THREE.SRGBColorSpace;


    const material =
        new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            depthWrite: false
        });


    const sprite =
        new THREE.Sprite(material);


    sprite.scale.set(
        0.9,
        0.225,
        1
    );

    sprite.renderOrder =
        100;


    return sprite;

}


// ======================================================
// 4. MODEL MATERYALLERİ
// ======================================================

function improveEarthMaterials(model) {

    const anisotropy =
        rendererRef
            .capabilities
            .getMaxAnisotropy();


    model.traverse(
        (object) => {

            if (!object.isMesh) {
                return;
            }


            const materials =
                Array.isArray(object.material)
                    ? object.material
                    : [object.material];


            materials.forEach(
                (material) => {

                    if (!material) {
                        return;
                    }


                    if (material.map) {

                        material.map.colorSpace =
                            THREE.SRGBColorSpace;

                        material.map.anisotropy =
                            anisotropy;

                        material.map.needsUpdate =
                            true;

                    }


                    material.needsUpdate =
                        true;

                }
            );

        }
    );

}


// ======================================================
// 5. EARTH GLB
// ======================================================

function loadEarth() {

    const dracoLoader =
        new DRACOLoader();

    dracoLoader.setDecoderPath(
        "https://cdn.jsdelivr.net/npm/three@0.185.1/examples/jsm/libs/draco/"
    );


    const loader =
        new GLTFLoader();

    loader.setDRACOLoader(
        dracoLoader
    );


    loader.load(
        "../assets/models/earth/earth.glb",

        (gltf) => {

            const model =
                gltf.scene;


            improveEarthMaterials(model);

            model.updateMatrixWorld(true);


            const box =
                new THREE.Box3()
                    .setFromObject(model);

            const size =
                box.getSize(
                    new THREE.Vector3()
                );

            const center =
                box.getCenter(
                    new THREE.Vector3()
                );


            model.position.sub(center);


            const largestSide =
                Math.max(
                    size.x,
                    size.y,
                    size.z
                );


            // Mars radius = 1.
            // Dünya radius ≈ 1.879.
            const realEarthDiameter =
                EARTH_RADIUS_SCENE * 2;


            const wrapper =
                new THREE.Group();

            wrapper.add(model);


            wrapper.scale.setScalar(
                realEarthDiameter
                / largestSide
            );


            earthRoot.add(wrapper);

            marsCompareState.earthLoaded =
                true;


            console.log(
                "Dünya karşılaştırma modeli yüklendi. Ölçek:",
                EARTH_RADIUS_SCENE.toFixed(3),
                "Mars yarıçapı"
            );


            if (pendingStart) {

                pendingStart =
                    false;

                startMarsComparison();

            }

        },

        undefined,

        (error) => {

            console.error(
                "Dünya modeli yüklenemedi:",
                error
            );

        }
    );

}
// ======================================================
// 6. KARŞILAŞTIRMA BİLGİ PANELİ
// ======================================================

function showComparisonInfo() {

    const infoContent =
        document.getElementById(
            "info-content"
        );


    if (!infoContent) {
        return;
    }


    infoContent.parentElement.scrollTop =
        0;


    infoContent.innerHTML = `

        <nav
            class="module-return-nav"
            aria-label="Mars görünümüne dön"
        >
            <button id="exit-mars-comparison" type="button">
                ← MARS
            </button>
        </nav>

        <p class="info-kicker">
            GERÇEK BOYUT ORANI
        </p>

        <h1 class="info-title">
            Mars ve Dünya
        </h1>

        <p class="info-lead">
            Mars ve Dünya burada gerçek çap oranları korunarak
            yan yana gösteriliyor. Dünya'nın yarıçapı Mars'ın
            yaklaşık 1,88 katıdır.
        </p>

        <table class="compare-table mars-compare-table">

            <thead>
                <tr>
                    <th>Özellik</th>
                    <th>Mars</th>
                    <th>Dünya</th>
                </tr>
            </thead>

            <tbody>
                <tr>
                    <td>Çap</td>
                    <td><strong>6.779 km</strong></td>
                    <td><strong>12.742 km</strong></td>
                </tr>
                <tr>
                    <td>Kütle</td>
                    <td>6,42 × 10²³ kg</td>
                    <td>5,97 × 10²⁴ kg</td>
                </tr>
                <tr>
                    <td>Yerçekimi</td>
                    <td>3,71 m/s²</td>
                    <td>9,81 m/s²</td>
                </tr>
                <tr>
                    <td>Dönüş süresi</td>
                    <td>≈ 24 sa 37 dk</td>
                    <td>≈ 23 sa 56 dk</td>
                </tr>
                <tr>
                    <td>Yörünge süresi</td>
                    <td>687 Dünya günü</td>
                    <td>365,25 gün</td>
                </tr>
                <tr>
                    <td>Ortalama sıcaklık</td>
                    <td>≈ −63 °C</td>
                    <td>≈ +15 °C</td>
                </tr>
                <tr>
                    <td>Atmosfer</td>
                    <td>≈ %95 karbondioksit</td>
                    <td>Azot + Oksijen</td>
                </tr>
                <tr>
                    <td>Hacim</td>
                    <td><strong>≈ 0,151 Dünya</strong></td>
                    <td>1 Dünya</td>
                </tr>
            </tbody>

        </table>


        <section class="info-section">

            <h2 class="info-section-title">
                Boyut farkı
            </h2>

            <p>
                Dünya'nın çapı Mars'ın yaklaşık 1,88 katıdır.
                Aynı ölçek kullanıldığında Mars'ın Dünya'ya göre
                ne kadar küçük olduğu doğrudan görülebilir.
            </p>

        </section>


        <section class="info-section">

            <h2 class="info-section-title">
                Neden uydular görünmüyor?
            </h2>

            <p>
                Bu mod yalnızca iki gezegenin fiziksel özelliklerini
                ve boyutlarını karşılaştırmak için tasarlandı.
                Phobos, Deimos, yörünge çizgileri ve yüzey etiketleri
                karşılaştırma sırasında bilerek gizlenir.
            </p>

        </section>


    `;

}


// ======================================================
// 7. İKİ GEZEGENİ KADRAJA SIĞDIR
// ======================================================

function calculateCompareView() {

    const totalWidth =
        (
            EARTH_COMPARE_X
            + EARTH_RADIUS_SCENE
        )
        -
        (
            MARS_COMPARE_X
            - MARS_RADIUS_SCENE
        );


    const totalHeight =
        EARTH_RADIUS_SCENE * 2;


    const verticalFov =
        THREE.MathUtils.degToRad(
            cameraRef.fov
        );


    const horizontalFov =
        2
        *
        Math.atan(

            Math.tan(
                verticalFov / 2
            )

            *
            cameraRef.aspect

        );


    const distanceForWidth =
        totalWidth
        /
        (
            2
            *
            Math.tan(
                horizontalFov / 2
            )
        );


    const distanceForHeight =
        totalHeight
        /
        (
            2
            *
            Math.tan(
                verticalFov / 2
            )
        );


    const isNarrow =
        rendererRef.domElement.clientWidth
        <=
        900;


    const distance =
        Math.max(
            distanceForWidth,
            distanceForHeight
        )
        *
        (
            isNarrow
                ?
                1.42
                :
                1.62
        );


    const focusX =
        isNarrow
            ?
            0
            :
            -0.45;


    // Sol taraftaki bilgi paneli nedeniyle
    // iki gezegeni biraz sağa kaydırıyoruz.
    return {
        camera:
            new THREE.Vector3(
                focusX,
                0.12,
                distance
            ),

        target:
            new THREE.Vector3(
                focusX,
                0,
                0
            ),

        minDistance:
            distance * 0.88,

        maxDistance:
            distance * 2.15
    };

}


// ======================================================
// 8. KARŞILAŞTIRMAYI BAŞLAT
// ======================================================

export function startMarsComparison() {

    if (
        marsCompareState.active
    ) {
        return;
    }


    // Dünya henüz yüklenmediyse bekle.
    if (
        !marsCompareState.earthLoaded
    ) {

        pendingStart =
            true;


        console.log(
            "Dünya modeli hazırlanıyor..."
        );


        return;

    }


    // ==================================================
    // PHOBOS / DEIMOS İNCELEME MODU AÇIKSA KAPAT
    // ==================================================
    //
    // Böylece kullanıcı Phobos'a yakınken direkt
    // Dünya karşılaştırmasına basarsa kamera bozulmaz.
    //

    resetMarsMoonInspectionToOverview();


    marsCompareState.active =
        true;


    // ==================================================
    // ESKİ MARS GÖRÜNÜMÜNÜ KAYDET
    // ==================================================

    savedView = {

        camera:
            cameraRef
                .position
                .clone(),

        target:
            controlsRef
                .target
                .clone(),

        minDistance:
            controlsRef
                .minDistance,

        maxDistance:
            controlsRef
                .maxDistance,

        zoomSpeed:
            controlsRef
                .zoomSpeed,

        rotateSpeed:
            controlsRef
                .rotateSpeed,

        enabled:
            controlsRef
                .enabled

    };


    savedMarsPosition =
        marsRootRef
            .position
            .clone();


    // ==================================================
    // DÜNYAYI VE İSİMLERİ GÖSTER
    // ==================================================

    earthRoot.visible =
        true;


    labelsRoot.visible =
        true;


    // ==================================================
    // DÜNYA KONUMU
    // ==================================================

    earthRoot.position.set(

        EARTH_COMPARE_X,

        0,

        0

    );


    // ==================================================
    // LABEL KONUMLARI
    // ==================================================

    marsLabel.position.set(

        MARS_COMPARE_X,

        1.35,

        0

    );


    earthLabel.position.set(

        EARTH_COMPARE_X,

        EARTH_RADIUS_SCENE
        +
        0.35,

        0

    );


    // ==================================================
    // HEDEF KAMERA
    // ==================================================

    const compareView =
        calculateCompareView();


    tween =
        null;


    marsRootRef.position.set(
        MARS_COMPARE_X,
        0,
        0
    );


    cameraRef.position.copy(
        compareView.camera
    );


    controlsRef.target.copy(
        compareView.target
    );


    controlsRef.minDistance =
        compareView.minDistance;


    controlsRef.maxDistance =
        compareView.maxDistance;


    controlsRef.zoomSpeed =
        0.65;


    controlsRef.rotateSpeed =
        0.42;


    controlsRef.enabled =
        true;


    controlsRef.update();


    // Sol paneli karşılaştırma verilerine geçir.
    showComparisonInfo();


    // ==================================================
    // MARS.JS'E HABER VER
    // ==================================================
    //
    // mars.js bu event'i alınca:
    //
    // - Phobos'u gizleyecek
    // - Deimos'u gizleyecek
    // - yörüngeleri gizleyecek
    // - uydu kartlarını gizleyecek
    // - uydu tıklamalarını kapatacak
    // - Mars markerlarını gizleyecek
    //

    window.dispatchEvent(

        new CustomEvent(

            "mars-compare-change",

            {

                detail: {

                    active:
                        true

                }

            }

        )

    );

}
// ======================================================
// 9. KARŞILAŞTIRMADAN ÇIK
// ======================================================

export function exitMarsComparison() {

    if (
        !marsCompareState.active
        ||
        !savedView
    ) {
        return;
    }


    tween = {

        type:
            "out",

        start:
            performance.now(),

        duration:
            850,


        fromCamera:
            cameraRef
                .position
                .clone(),

        toCamera:
            savedView.camera.clone(),


        fromTarget:
            controlsRef
                .target
                .clone(),

        toTarget:
            savedView.target.clone(),


        fromMars:
            marsRootRef
                .position
                .clone(),

        toMars:
            savedMarsPosition.clone()

    };


    controlsRef.enabled =
        false;

}


// ======================================================
// 10. TWEEN UPDATE
// ======================================================

export function updateMarsComparison() {

    if (
        !tween
    ) {
        return;
    }


    const rawT =

        THREE.MathUtils.clamp(

            (
                performance.now()
                -
                tween.start
            )

            /
            tween.duration,

            0,

            1

        );


    const t =

        rawT
        *
        rawT
        *
        (
            3
            -
            2 * rawT
        );


    cameraRef.position.lerpVectors(

        tween.fromCamera,

        tween.toCamera,

        t

    );


    controlsRef.target.lerpVectors(

        tween.fromTarget,

        tween.toTarget,

        t

    );


    marsRootRef.position.lerpVectors(

        tween.fromMars,

        tween.toMars,

        t

    );


    if (
        rawT < 1
    ) {
        return;
    }


    // ==================================================
    // GİRİŞ BİTTİ
    // ==================================================

    if (
        tween.type ===
        "in"
    ) {

        controlsRef.enabled =
            true;


        controlsRef.minDistance =
            tween.minDistance;


        controlsRef.maxDistance =
            tween.maxDistance;


        controlsRef.zoomSpeed =
            0.65;


        controlsRef.rotateSpeed =
            0.42;


        controlsRef.update();


        tween =
            null;


        return;

    }


    // ==================================================
    // ÇIKIŞ BİTTİ
    // ==================================================

    if (
        tween.type ===
        "out"
    ) {

        marsRootRef.position.copy(
            savedMarsPosition
        );


        earthRoot.visible =
            false;


        labelsRoot.visible =
            false;


        controlsRef.minDistance =
            savedView.minDistance;


        controlsRef.maxDistance =
            savedView.maxDistance;


        controlsRef.zoomSpeed =
            savedView.zoomSpeed;


        controlsRef.rotateSpeed =
            savedView.rotateSpeed;


        controlsRef.enabled =
            savedView.enabled;


        controlsRef.update();


        marsCompareState.active =
            false;


        tween =
            null;


        savedView =
            null;


        savedMarsPosition =
            null;


        // Mars.js'e karşılaştırmanın kapandığını bildir.
        window.dispatchEvent(

            new CustomEvent(

                "mars-compare-change",

                {

                    detail: {

                        active:
                            false

                    }

                }

            )

        );


        // Sol paneli tekrar Mars genel bilgisine döndür.
        window.dispatchEvent(

            new CustomEvent(
                "mars-overview-requested"
            )

        );

    }

}


// ======================================================
// 11. INIT
// ======================================================

export function initMarsComparison({

    scene,

    marsRoot,

    renderer,

    camera,

    controls

}) {

    sceneRef =
        scene;


    marsRootRef =
        marsRoot;


    rendererRef =
        renderer;


    cameraRef =
        camera;


    controlsRef =
        controls;


    // ==================================================
    // EARTH ROOT
    // ==================================================

    earthRoot =
        new THREE.Group();


    earthRoot.name =
        "EARTH_COMPARE_ROOT";


    earthRoot.visible =
        false;


    sceneRef.add(
        earthRoot
    );


    marsCompareState.earthRoot =
        earthRoot;


    // ==================================================
    // LABEL ROOT
    // ==================================================

    labelsRoot =
        new THREE.Group();


    labelsRoot.name =
        "COMPARE_LABEL_ROOT";


    labelsRoot.visible =
        false;


    sceneRef.add(
        labelsRoot
    );


    marsLabel =
        createLabel(
            "MARS"
        );


    earthLabel =
        createLabel(
            "DÜNYA"
        );


    labelsRoot.add(
        marsLabel
    );


    labelsRoot.add(
        earthLabel
    );


    // ==================================================
    // DÜNYAYI ÖNCEDEN YÜKLE
    // ==================================================

    loadEarth();


    // ==================================================
    // BUTON EVENTLERİ
    // ==================================================

    document.addEventListener(

        "click",

        (event) => {


            // ------------------------------------------
            // DÜNYA İLE KARŞILAŞTIR
            // ------------------------------------------

            if (
                event.target.closest(
                    "#compare-earth-button"
                )
            ) {

                startMarsComparison();

                return;

            }


            // ------------------------------------------
            // MARS'A DÖNÜŞ
            // ------------------------------------------

            if (
                event.target.closest(
                    "#exit-mars-comparison"
                )
            ) {

                exitMarsComparison();

            }

        }

    );


    console.log(
        "Mars ↔ Dünya karşılaştırma sistemi hazır."
    );

}
