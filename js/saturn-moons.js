import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

const SATURN_RADIUS_KM = 60268;
const SATURN_VISUAL_RADIUS = 1;
const KM_TO_SCENE = SATURN_VISUAL_RADIUS / SATURN_RADIUS_KM;

const DEFAULT_SPEED = 1;

const ORBIT_EPOCH_MS =
    Date.parse(
        "2026-01-01T00:00:00Z"
    );

const CLICK_DRAG_THRESHOLD_PX =
    7;


// ======================================================
// STATE
// ======================================================

export const saturnMoonsState = {

    root:
        null,

    moons:
        [],

    selectedMoon:
        null,

    speed:
        DEFAULT_SPEED,

    live:
        true,

    simulationTime:
        Date.now(),

    previousFrameTime:
        performance.now(),

    camera:
        null,

    controls:
        null,

    renderer:
        null,

    scene:
        null,

    saturnRoot:
        null,

    raycaster:
        new THREE.Raycaster(),

    pointer:
        new THREE.Vector2(),

    loaded:
        false,

    focusMode:
        "saturn",

    interactionEnabled:
        true,

    lastFocusWorldPosition:
        new THREE.Vector3(),

    pointerDown:
        null,

    eventController:
        null,

    savedSaturnPanelFragment:
        null

};


// ======================================================
// SATÜRN UYDULARI
// ======================================================

const SATURN_MOONS_DATA = [

    {
        id:
            "mimas",

        name:
            "Mimas",

        modelPath:
            "../assets/models/saturn/mimas.glb",

        radiusKm:
            198.2,

        massKg:
            3.7493e19,

        semiMajorAxisKm:
            185539,

        eccentricity:
            0.0196,

        inclinationDeg:
            1.57,

        orbitalPeriodDays:
            0.942,

        rotationPeriodDays:
            0.942,

        phaseDeg:
            20,

        fallbackColor:
            0xb7b7b7,

        description:
            "Mimas, büyük Herschel krateriyle kolayca ayırt edilen küçük ve yoğun biçimde kraterli bir Satürn uydusudur.",

        science:
            "Herschel Krateri yaklaşık 130 km genişliğindedir; bu, Mimas'ın çapının yaklaşık üçte biridir. Krateri oluşturan çarpışmanın uyduyu parçalamaya çok yaklaştığı düşünülür."
    },


    {
        id:
            "enceladus",

        name:
            "Enceladus",

        modelPath:
            "../assets/models/saturn/enceladus.glb",

        radiusKm:
            252.1,

        massKg:
            1.08022e20,

        semiMajorAxisKm:
            238042,

        eccentricity:
            0.0047,

        inclinationDeg:
            0.009,

        orbitalPeriodDays:
            1.370,

        rotationPeriodDays:
            1.370,

        phaseDeg:
            85,

        fallbackColor:
            0xe8f4ff,

        description:
            "Enceladus, parlak buz yüzeyi ve güney kutbundan uzaya püsküren su-buz jetleriyle bilinen aktif bir uydudur.",

        science:
            "Cassini verileri, buz kabuğunun altında küresel bir tuzlu su okyanusu bulunduğunu gösterir. Güney kutbundaki jetler su buharı, buz taneleri, tuzlar ve organik bileşikler taşır."
    },


    {
        id:
            "tethys",

        name:
            "Tethys",

        modelPath:
            "../assets/models/saturn/tethys.glb",

        radiusKm:
            531.1,

        massKg:
            6.17449e20,

        semiMajorAxisKm:
            294619,

        eccentricity:
            0.0001,

        inclinationDeg:
            1.09,

        orbitalPeriodDays:
            1.888,

        rotationPeriodDays:
            1.888,

        phaseDeg:
            155,

        fallbackColor:
            0xd7dce2,

        description:
            "Tethys, büyük Odysseus krateri ve dev Ithaca Chasma kanyonu ile dikkat çeken buz ağırlıklı bir uydudur.",

        science:
            "Yoğunluğu sıvı sudan biraz düşüktür; bu nedenle neredeyse bütünüyle su buzundan oluştuğu düşünülür. Ithaca Chasma yaklaşık 2.000 km boyunca uzanır."
    },


    {
        id:
            "dione",

        name:
            "Dione",

        modelPath:
            "../assets/models/saturn/dione.glb",

        radiusKm:
            561.4,

        massKg:
            1.095452e21,

        semiMajorAxisKm:
            377396,

        eccentricity:
            0.0022,

        inclinationDeg:
            0.028,

        orbitalPeriodDays:
            2.737,

        rotationPeriodDays:
            2.737,

        phaseDeg:
            225,

        fallbackColor:
            0xcbd3dc,

        description:
            "Dione, yoğun kraterli arazileri ve parlak buz uçurumlarıyla karmaşık bir jeolojik geçmiş gösterir.",

        science:
            "Voyager görüntülerinde ince parlak çizgiler gibi görünen yapıların, Cassini gözlemlerinde yüzlerce metre yüksekliğinde parlak buz uçurumları olduğu anlaşıldı. Bu kırıklar geçmişteki tektonik etkinliğin izleridir."
    },


    {
        id:
            "rhea",

        name:
            "Rhea",

        modelPath:
            "../assets/models/saturn/rhea.glb",

        radiusKm:
            763.8,

        massKg:
            2.306518e21,

        semiMajorAxisKm:
            527108,

        eccentricity:
            0.001,

        inclinationDeg:
            0.345,

        orbitalPeriodDays:
            4.518,

        rotationPeriodDays:
            4.518,

        phaseDeg:
            295,

        fallbackColor:
            0xbfc5cc,

        description:
            "Rhea, Satürn'ün ikinci büyük uydusudur; buz ve kaya karışımı, eski ve yoğun kraterli bir yüzeye sahiptir.",

        science:
            "Cassini, Rhea'nın çevresinde oksijen ve karbondioksit içeren son derece ince bir ekzosfer saptadı. Bu gaz tabakası solunabilir bir atmosferden trilyonlarca kat daha seyrektir."
    },


    {
        id:
            "titan",

        name:
            "Titan",

        modelPath:
            "../assets/models/saturn/titan.glb",

        radiusKm:
            2574.7,

        massKg:
            1.3452e23,

        semiMajorAxisKm:
            1221870,

        eccentricity:
            0.0288,

        inclinationDeg:
            0.349,

        orbitalPeriodDays:
            15.945,

        rotationPeriodDays:
            15.945,

        phaseDeg:
            55,

        fallbackColor:
            0xd49a4c,

        description:
            "Titan, Satürn'ün en büyük uydusudur. Yoğun azot atmosferi, metan bulutları ve yüzeyindeki hidrokarbon gölleriyle benzersizdir.",

        science:
            "Titan, yoğun atmosfere sahip olduğu bilinen tek uydudur ve Dünya dışında yüzeyinde kalıcı sıvılar bulunan tek dünyadır. Metan ve etan yağmuru nehirleri, gölleri ve denizleri besler."
    },


    {
        id:
            "iapetus",

        name:
            "Iapetus",

        modelPath:
            "../assets/models/saturn/iapetus.glb",

        radiusKm:
            734.5,

        massKg:
            1.805635e21,

        semiMajorAxisKm:
            3560820,

        eccentricity:
            0.0286,

        inclinationDeg:
            15.47,

        orbitalPeriodDays:
            79.3215,

        rotationPeriodDays:
            79.3215,

        phaseDeg:
            190,

        fallbackColor:
            0x9a9188,

        description:
            "Iapetus, bir yarımküresinin çok koyu, diğerinin çok parlak olması ve ekvator sırtıyla tanınan uzak bir Satürn uydusudur.",

        science:
            "Iapetus'un ekvatoru boyunca uzanan dağ zinciri yer yer yaklaşık 10 km yüksekliğe ulaşır. Bu olağan dışı sırtın nasıl oluştuğu kesin olarak bilinmiyor."
    }

];


// ======================================================
// KM → SCENE
// ======================================================

function kmToScene(
    km
) {

    return (
        km
        *
        KM_TO_SCENE
    );

}


// ======================================================
// KEPLER
// ======================================================

function solveKepler(
    meanAnomaly,
    eccentricity
) {

    let E =
        meanAnomaly;


    for (
        let i = 0;
        i < 8;
        i++
    ) {

        E -=

            (
                E
                -
                eccentricity
                *
                Math.sin(E)
                -
                meanAnomaly
            )

            /

            (
                1
                -
                eccentricity
                *
                Math.cos(E)
            );

    }


    return E;

}


// ======================================================
// UYDU KONUMU
// ======================================================

function getMoonPosition(
    moon,
    simulationTime
) {

    const periodMs =

        moon.orbitalPeriodDays
        *
        86400000;


    const elapsed =

        simulationTime
        -
        ORBIT_EPOCH_MS;


    const basePhase =

        THREE.MathUtils.degToRad(
            moon.phaseDeg
            ||
            0
        );


    const meanAnomaly =

        THREE.MathUtils.euclideanModulo(

            (
                elapsed
                /
                periodMs
            )

            *
            Math.PI
            *
            2

            +

            basePhase,

            Math.PI
            *
            2

        );


    const E =

        solveKepler(
            meanAnomaly,
            moon.eccentricity
        );


    const a =

        kmToScene(
            moon.semiMajorAxisKm
        );


    const b =

        a
        *
        Math.sqrt(

            1

            -

            moon.eccentricity
            *
            moon.eccentricity

        );


    const position =

        new THREE.Vector3(

            a
            *
            (
                Math.cos(E)
                -
                moon.eccentricity
            ),

            0,

            b
            *
            Math.sin(E)

        );


    position.applyAxisAngle(

        new THREE.Vector3(
            1,
            0,
            0
        ),

        THREE.MathUtils.degToRad(
            moon.inclinationDeg
        )

    );


    return position;

}


// ======================================================
// YÖRÜNGE ÇİZGİSİ
// ======================================================

function createOrbitLine(
    moon
) {

    const points =
        [];


    const a =

        kmToScene(
            moon.semiMajorAxisKm
        );


    const b =

        a
        *
        Math.sqrt(

            1

            -

            moon.eccentricity
            *
            moon.eccentricity

        );


    const inclination =

        THREE.MathUtils.degToRad(
            moon.inclinationDeg
        );


    for (
        let i = 0;
        i <= 320;
        i++
    ) {

        const E =

            (
                i
                /
                320
            )

            *
            Math.PI
            *
            2;


        const point =

            new THREE.Vector3(

                a
                *
                (
                    Math.cos(E)
                    -
                    moon.eccentricity
                ),

                0,

                b
                *
                Math.sin(E)

            );


        point.applyAxisAngle(

            new THREE.Vector3(
                1,
                0,
                0
            ),

            inclination

        );


        points.push(
            point
        );

    }


    const geometry =

        new THREE.BufferGeometry()
            .setFromPoints(
                points
            );


    const material =

        new THREE.LineBasicMaterial({

            color:
                0x7fcfff,

            transparent:
                true,

            opacity:
                0.30,

            depthWrite:
                false

        });


    const line =

        new THREE.LineLoop(
            geometry,
            material
        );


    line.name =
        `${moon.name}_ORBIT`;


    return line;

}


// ======================================================
// FALLBACK
// ======================================================

function createFallbackMoonMesh(
    moon
) {

    const radius =

        kmToScene(
            moon.radiusKm
        );


    return new THREE.Mesh(

        new THREE.SphereGeometry(
            radius,
            48,
            48
        ),

        new THREE.MeshStandardMaterial({

            color:
                moon.fallbackColor
                ??
                0xbfc5cc,

            roughness:
                0.9,

            metalness:
                0

        })

    );

}


// ======================================================
// CANVAS SPRITE
// ======================================================

function createCanvasSprite(
    canvas,
    options = {}
) {

    const texture =

        new THREE.CanvasTexture(
            canvas
        );


    texture.colorSpace =
        THREE.SRGBColorSpace;


    const material =

        new THREE.SpriteMaterial({

            map:
                texture,

            transparent:
                true,

            depthTest:
                false,

            depthWrite:
                false,

            sizeAttenuation:
                options.sizeAttenuation
                ??
                false

        });


    const sprite =

        new THREE.Sprite(
            material
        );


    sprite.renderOrder =

        options.renderOrder
        ??
        100;


    return sprite;

}


// ======================================================
// NORMAL GÖRÜNÜM ETİKETİ
//
// ○ Mimas
// ======================================================

function createOverviewTag(
    name
) {

    const canvas =

        document.createElement(
            "canvas"
        );


    canvas.width =
        720;

    canvas.height =
        180;


    const ctx =

        canvas.getContext(
            "2d"
        );


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // ------------------------------------------
    // ÇEMBER
    // ------------------------------------------

    ctx.strokeStyle =
        "rgba(210,240,255,0.95)";

    ctx.lineWidth =
        7;


    ctx.beginPath();

    ctx.arc(
        58,
        90,
        25,
        0,
        Math.PI * 2
    );

    ctx.stroke();


    // ------------------------------------------
    // ORTA NOKTA
    // ------------------------------------------

    ctx.fillStyle =
        "#ffffff";


    ctx.beginPath();

    ctx.arc(
        58,
        90,
        4,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // ------------------------------------------
    // İSİM
    // ------------------------------------------

    ctx.font =
        "700 58px Arial";

    ctx.textAlign =
        "left";

    ctx.textBaseline =
        "middle";


    ctx.strokeStyle =
        "rgba(0,0,0,0.92)";

    ctx.lineWidth =
        11;


    ctx.strokeText(
        name,
        105,
        90
    );


    ctx.fillStyle =
        "#ffffff";


    ctx.fillText(
        name,
        105,
        90
    );


    const sprite =

        createCanvasSprite(

            canvas,

            {
                sizeAttenuation:
                    false,

                renderOrder:
                    120
            }

        );


    sprite.name =

        `MOON_OVERVIEW_TAG_${name.toUpperCase()}`;


    sprite.center.set(
        0.05,
        0.5
    );


    sprite.scale.set(
        0.18,
        0.045,
        1
    );


    return sprite;

}


// ======================================================
// YAKIN PLAN ETİKETİ
//
// • Mimas
// ======================================================

function createFocusLabel(
    name
) {

    const canvas =

        document.createElement(
            "canvas"
        );


    canvas.width =
        640;

    canvas.height =
        160;


    const ctx =

        canvas.getContext(
            "2d"
        );


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // ------------------------------------------
    // NOKTA
    // ------------------------------------------

    ctx.fillStyle =
        "#ffffff";


    ctx.shadowColor =
        "rgba(255,255,255,0.8)";

    ctx.shadowBlur =
        8;


    ctx.beginPath();

    ctx.arc(
        44,
        80,
        7,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.shadowBlur =
        0;


    // ------------------------------------------
    // İSİM
    // ------------------------------------------

    ctx.font =
        "600 54px Arial";

    ctx.textAlign =
        "left";

    ctx.textBaseline =
        "middle";


    ctx.strokeStyle =
        "rgba(2,4,10,0.96)";

    ctx.lineWidth =
        10;


    ctx.strokeText(
        name,
        72,
        80
    );


    ctx.fillStyle =
        "#ffffff";


    ctx.fillText(
        name,
        72,
        80
    );


    const sprite =

        createCanvasSprite(

            canvas,

            {
                sizeAttenuation:
                    false,

                renderOrder:
                    150
            }

        );


    sprite.name =

        `MOON_FOCUS_LABEL_${name.toUpperCase()}`;


    sprite.center.set(
        0.05,
        0.5
    );


    sprite.scale.set(
        0.13,
        0.0325,
        1
    );


    sprite.visible =
        false;


    return sprite;

}


// ======================================================
// GÖRÜNMEYEN TIKLAMA ALANI
// ======================================================

function createMoonHitSphere(
    moon
) {

    const visibleRadius =

        kmToScene(
            moon.radiusKm
        );


    // ==================================================
    // GENEL SATÜRN GÖRÜNÜMÜ İÇİN TIKLAMA ALANI
    // ==================================================
    //
    // Gerçek uydular özellikle Mimas ve Enceladus
    // çok küçük olduğu için fiziksel gövdeye tıklamak
    // neredeyse imkânsız.
    //
    // Bu mesh sadece görünmeyen bir UI hitbox.
    //
    // Uydu yakın incelemesindeyken zaten raycast
    // tamamen kapatılacağı için Titan'daki eski
    // "dev tıklama alanı" sorunu geri gelmeyecek.
    // ==================================================

    const hitRadius =

        Math.max(

            visibleRadius
            *
            3.0,

            0.18

        );


    const geometry =

        new THREE.SphereGeometry(
            hitRadius,
            20,
            20
        );


    const material =

        new THREE.MeshBasicMaterial({

            transparent:
                true,

            opacity:
                0,

            depthTest:
                false,

            depthWrite:
                false,

            colorWrite:
                false

        });


    const mesh =

        new THREE.Mesh(
            geometry,
            material
        );


    mesh.name =
        `${moon.name}_CLICK_TARGET`;


    mesh.userData.isSaturnMoonHitTarget =
        true;


    mesh.userData.moonId =
        moon.id;


    return mesh;

}


// ======================================================
// GLB MATERYALLERİNİ HAZIRLA
// ======================================================

function prepareImportedMaterials(
    model,
    moon
) {

    const anisotropy =

        saturnMoonsState
            .renderer
            ?.capabilities
            ?.getMaxAnisotropy
            ?.()

        ??

        1;


    const meshes =
        [];


    model.traverse(

        (object) => {

            if (
                !object.isMesh
            ) {

                return;

            }


            meshes.push(
                object
            );


            object.frustumCulled =
                true;


            const materials =

                Array.isArray(
                    object.material
                )

                    ?

                    object.material

                    :

                    [
                        object.material
                    ];


            for (
                const material
                of
                materials
            ) {

                if (
                    !material
                ) {

                    continue;

                }


                if (
                    material.map
                ) {

                    material.map.colorSpace =
                        THREE.SRGBColorSpace;


                    material.map.anisotropy =
                        anisotropy;


                    material.map.needsUpdate =
                        true;

                }


                material.depthTest =
                    true;


                material.depthWrite =
                    true;


                material.needsUpdate =
                    true;

            }

        }

    );


    // ==================================================
    // TITAN
    //
    // Bazı GLB modellerinde ayrıca büyük bir şeffaf
    // atmosfer / haze kabuğu bulunabiliyor.
    //
    // Yakın planda sarı disk gibi modelin önünde
    // kalıyorsa yalnızca bu ek kabuğu gizliyoruz.
    // ==================================================

    if (
        moon.id ===
        "titan"
        &&
        meshes.length > 1
    ) {

        for (
            const mesh
            of
            meshes
        ) {

            const materials =

                Array.isArray(
                    mesh.material
                )

                    ?

                    mesh.material

                    :

                    [
                        mesh.material
                    ];


            const searchableName =

                `${mesh.name} ${
                    materials
                        .map(
                            (material) =>
                                material?.name
                                ||
                                ""
                        )
                        .join(" ")
                }`;


            const namedAsShell =

                /atmos|haze|cloud|glow|shell/i
                    .test(
                        searchableName
                    );


            const transparentShell =

                materials.some(

                    (material) =>

                        material
                        &&
                        material.transparent === true
                        &&
                        Number.isFinite(
                            material.opacity
                        )
                        &&
                        material.opacity < 0.98

                );


            if (
                namedAsShell
                ||
                transparentShell
            ) {

                mesh.visible =
                    false;


                console.log(
                    "Titan ek atmosfer/haze mesh'i gizlendi:",
                    mesh.name
                    ||
                    "isimsiz mesh"
                );

            }

        }

    }

}


// ======================================================
// GLB GERÇEK BOYUTA GETİR
// ======================================================

function normalizeLoadedMoon(
    model,
    moon
) {

    model.updateMatrixWorld(
        true
    );


    const box =

        new THREE.Box3()
            .setFromObject(
                model
            );


    const size =

        box.getSize(
            new THREE.Vector3()
        );


    const center =

        box.getCenter(
            new THREE.Vector3()
        );


    const largestSide =

        Math.max(
            size.x,
            size.y,
            size.z
        )

        ||

        1;


    // Modeli merkeze taşı.

    model.position.sub(
        center
    );


    // Fiziksel çap.

    const desiredDiameter =

        kmToScene(
            moon.radiusKm
            *
            2
        );


    const wrapper =

        new THREE.Group();


    wrapper.name =
        `${moon.name}_MODEL_WRAPPER`;


    wrapper.add(
        model
    );


    // ÖNEMLİ:
    // X Y Z'ye aynı scale uygulanıyor.
    //
    // Yani GLB'nin kendi gerçek şekli korunuyor.
    // Küreye çevrilmiyor.

    wrapper.scale.setScalar(

        desiredDiameter
        /
        largestSide

    );


    moon.modelNativeSize =
        size.clone();


    moon.modelNativeRatio = {

        x:
            size.x
            /
            largestSide,

        y:
            size.y
            /
            largestSide,

        z:
            size.z
            /
            largestSide

    };


    console.log(
        `${moon.name} GLB şekil oranı:`,
        moon.modelNativeRatio
    );


    return wrapper;

}


// ======================================================
// UYDU OBJESİNİ OLUŞTUR
// ======================================================

async function buildMoonObject(
    moon,
    loader
) {

    const orbitAnchor =

        new THREE.Group();


    orbitAnchor.name =
        `${moon.name}_ANCHOR`;


    const bodyGroup =

        new THREE.Group();


    bodyGroup.name =
        `${moon.name}_BODY_GROUP`;


    orbitAnchor.add(
        bodyGroup
    );


    // ==================================================
    // GERÇEK GLB
    // ==================================================

    try {

        console.log(
            "UYDU MODELİ YÜKLENİYOR:",
            moon.name,
            moon.modelPath
        );


        const gltf =

            await loader.loadAsync(
                moon.modelPath
            );


        const model =
            gltf.scene;


        prepareImportedMaterials(
            model,
            moon
        );


        const wrapper =

            normalizeLoadedMoon(
                model,
                moon
            );


        bodyGroup.add(
            wrapper
        );


        moon.wrapper =
            wrapper;


        moon.loadedFromGLB =
            true;


        console.log(
            "UYDU MODELİ BAŞARIYLA GELDİ:",
            moon.name
        );

    }


    // ==================================================
    // SADECE GLB GELMEZSE FALLBACK
    // ==================================================

    catch (
        error
    ) {

        console.warn(
            `${moon.name} GLB yüklenemedi; fallback kullanılacak.`,
            error
        );


        const fallback =

            createFallbackMoonMesh(
                moon
            );


        bodyGroup.add(
            fallback
        );


        moon.wrapper =
            fallback;


        moon.loadedFromGLB =
            false;

    }


    // ==================================================
    // NORMAL GÖRÜNÜM ETİKETİ
    // ==================================================

    const overviewTag =

    createOverviewTag(
        moon.name
    );


// ==================================================
// UYDU İSMİ DE TIKLANABİLİR
// ==================================================

overviewTag.userData.isSaturnMoonHitTarget =
    true;

overviewTag.userData.moonId =
    moon.id;


bodyGroup.add(
    overviewTag
);
    // ==================================================
    // YAKIN PLAN • MIMAS ETİKETİ
    // ==================================================

    const focusLabel =

        createFocusLabel(
            moon.name
        );


    bodyGroup.add(
        focusLabel
    );


    // ==================================================
    // TIKLAMA ALANI
    // ==================================================

    const hitSphere =

        createMoonHitSphere(
            moon
        );


    bodyGroup.add(
        hitSphere
    );


    // ==================================================
    // STATE REFERANSLARI
    // ==================================================

    moon.anchor =
        orbitAnchor;


    moon.bodyGroup =
        bodyGroup;


    moon.overviewTag =
        overviewTag;


    moon.focusLabel =
        focusLabel;


    moon.hitSphere =
        hitSphere;


    // İlk frame'i beklemeden doğru konuma koy.

    orbitAnchor.position.copy(

        getMoonPosition(

            moon,

            saturnMoonsState
                .simulationTime

        )

    );

}


// ======================================================
// INFO CONTENT
// ======================================================

function getInfoContent() {

    return document.getElementById(
        "info-content"
    );

}


// ======================================================
// SATÜRN PANELİNİ KORU
//
// Moon moduna girerken mevcut Satürn panelindeki
// gerçek DOM node'larını saklıyoruz.
//
// Böylece compare-earth-button gibi mevcut
// event listenerlar da kaybolmuyor.
// ======================================================

function captureSaturnPanel() {

    const infoContent =
        getInfoContent();


    if (
        !infoContent
        ||
        saturnMoonsState
            .savedSaturnPanelFragment
    ) {

        return;

    }


    const fragment =

        document.createDocumentFragment();


    while (
        infoContent.firstChild
    ) {

        fragment.appendChild(
            infoContent.firstChild
        );

    }


    saturnMoonsState
        .savedSaturnPanelFragment =
        fragment;

}


// ======================================================
// SATÜRN PANELİNİ GERİ GETİR
// ======================================================

function restoreSaturnPanel() {

    const infoContent =
        getInfoContent();


    const fragment =

        saturnMoonsState
            .savedSaturnPanelFragment;


    if (
        !infoContent
        ||
        !fragment
    ) {

        return;

    }


    infoContent.replaceChildren();


    infoContent.appendChild(
        fragment
    );


    saturnMoonsState
        .savedSaturnPanelFragment =
        null;

}


// ======================================================
// KÜTLE FORMAT
// ======================================================

function formatMass(
    value
) {

    if (
        !Number.isFinite(
            value
        )
    ) {

        return "—";

    }


    const [
        mantissa,
        exponent
    ] =

        value
            .toExponential(2)
            .split("e");


    return (
        `${mantissa.replace(".", ",")} × 10^${Number(exponent)}`
    );

}


// ======================================================
// UYDU BİLGİ PANELİ
// ======================================================

function setPanelToMoon(
    moon
) {

    const infoContent =
        getInfoContent();


    if (
        !infoContent
    ) {

        return;

    }


    // İlk uyduya girerken Satürn panelini
    // DOM eventleriyle beraber sakla.

    captureSaturnPanel();


    // Önceki moon panelini temizle.

    infoContent.replaceChildren();


    const diameterKm =

        moon.radiusKm
        *
        2;


    const periodHours =

        moon.orbitalPeriodDays
        *
        24;


    const meanOrbitalSpeed =

        (
            2
            *
            Math.PI
            *
            moon.semiMajorAxisKm
        )

        /

        (
            moon.orbitalPeriodDays
            *
            86400
        );


    const wrapper =

        document.createElement(
            "div"
        );


    wrapper.className =
        "saturn-moon-info-view";


    infoContent.parentElement.scrollTop =
        0;


    wrapper.innerHTML = `

        <nav
            class="module-return-nav"
            aria-label="Satürn görünümüne dön"
        >
            <button id="back-from-saturn-moon" type="button">
                ← SATÜRN
            </button>
        </nav>

        <p class="info-kicker">
            SATÜRN'ÜN DOĞAL UYDUSU
        </p>

        <h1 class="info-title">
            ${moon.name}
        </h1>

        <p class="info-lead">
            ${moon.description}
        </p>

        <div class="quick-stats">

            <div class="quick-stat">
                <span>
                    Çap
                </span>
                <strong>
                    ≈ ${diameterKm.toLocaleString(
                        "tr-TR",
                        {
                            maximumFractionDigits: 1
                        }
                    )} km
                </strong>
            </div>

            <div class="quick-stat">
                <span>
                    Kütle
                </span>
                <strong>
                    ${formatMass(moon.massKg)} kg
                </strong>
            </div>

            <div class="quick-stat">
                <span>
                    Satürn merkezinden uzaklık
                </span>
                <strong>
                    ≈ ${Math.round(
                        moon.semiMajorAxisKm
                    ).toLocaleString("tr-TR")} km
                </strong>
            </div>

            <div class="quick-stat">
                <span>
                    Yörünge süresi (gün)
                </span>
                <strong>
                    ≈ ${moon.orbitalPeriodDays.toLocaleString(
                        "tr-TR",
                        {
                            maximumFractionDigits: 4
                        }
                    )} gün
                </strong>
            </div>

            <div class="quick-stat">
                <span>
                    Yörünge süresi (saat)
                </span>
                <strong>
                    ≈ ${periodHours.toLocaleString(
                        "tr-TR",
                        {
                            maximumFractionDigits: 1
                        }
                    )} saat
                </strong>
            </div>

            <div class="quick-stat">
                <span>
                    Ortalama yörünge hızı
                </span>
                <strong>
                    ≈ ${meanOrbitalSpeed.toLocaleString(
                        "tr-TR",
                        {
                            maximumFractionDigits: 2
                        }
                    )} km/sn
                </strong>
            </div>

            <div class="quick-stat">
                <span>
                    Yörünge eğimi
                </span>
                <strong>
                    ≈ ${moon.inclinationDeg.toLocaleString(
                        "tr-TR",
                        {
                            maximumFractionDigits: 3
                        }
                    )}°
                </strong>
            </div>

            <div class="quick-stat">
                <span>
                    Eksantriklik
                </span>
                <strong>
                    ${moon.eccentricity.toLocaleString(
                        "tr-TR",
                        {
                            maximumFractionDigits: 4
                        }
                    )}
                </strong>
            </div>

        </div>

        <section class="info-section">

            <h2 class="info-section-title">
                Bilimsel önemi
            </h2>

            <p>
                ${moon.science}
            </p>

        </section>

    `;


    infoContent.appendChild(
        wrapper
    );


    document
        .getElementById(
            "back-from-saturn-moon"
        )
        ?.addEventListener(

            "click",

            returnToSaturnOverview,

            {
                once:
                    true
            }

        );

}
// ======================================================
// ORTA-ÜST UYDU BUTON SETİ
// ======================================================

function installSaturnControlStyles() {

    if (
        document.getElementById(
            "saturn-control-style"
        )
    ) {
        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "saturn-control-style";


    style.textContent = `
        #saturn-moon-selector {
            scrollbar-width: none;
        }

        #saturn-moon-selector::-webkit-scrollbar {
            display: none;
        }

        .saturn-moon-selector-button {
            position: relative;
        }

        .saturn-moon-selector-button::after {
            position: absolute;
            right: 0;
            bottom: 0;
            left: 0;
            height: 1px;
            background: #ffffff;
            content: "";
            opacity: 0;
            transform: scaleX(0.35);
            transition: opacity 160ms ease, transform 180ms ease;
        }

        .saturn-moon-selector-button[data-active="true"]::after {
            opacity: 1;
            transform: scaleX(1);
        }

        .saturn-moon-selector-button:focus-visible,
        .saturn-speed-range:focus-visible {
            outline: 1px solid rgba(255,255,255,0.72);
            outline-offset: 5px;
        }

        #saturn-moon-speed-controls {
            position: fixed;
            top: 78px;
            left: 50vw;
            z-index: 79;
            display: flex;
            align-items: center;
            width: min(330px, calc(100vw - 40px));
            gap: 16px;
            padding: 8px 0;
            border: 0;
            transform: translateX(-50%);
            background: transparent;
            font-family: Arial, sans-serif;
        }

        .saturn-speed-value {
            flex: 0 0 72px;
            color: rgba(255,255,255,0.72);
            font-size: 8px;
            font-weight: 700;
            letter-spacing: 0.10em;
            text-align: right;
            white-space: nowrap;
        }

        .saturn-speed-range {
            width: 100%;
            height: 20px;
            margin: 0;
            padding: 0;
            border: 0;
            background: transparent;
            cursor: pointer;
            appearance: none;
            -webkit-appearance: none;
        }

        .saturn-speed-range::-webkit-slider-runnable-track {
            height: 1px;
            background: rgba(255,255,255,0.28);
        }

        .saturn-speed-range::-webkit-slider-thumb {
            width: 9px;
            height: 9px;
            margin-top: -4px;
            border: 1px solid rgba(0,0,0,0.72);
            border-radius: 50%;
            background: #ffffff;
            box-shadow: 0 0 0 3px rgba(255,255,255,0.08);
            appearance: none;
            -webkit-appearance: none;
        }

        .saturn-speed-range::-moz-range-track {
            height: 1px;
            border: 0;
            background: rgba(255,255,255,0.28);
        }

        .saturn-speed-range::-moz-range-thumb {
            width: 9px;
            height: 9px;
            border: 1px solid rgba(0,0,0,0.72);
            border-radius: 50%;
            background: #ffffff;
            box-shadow: 0 0 0 3px rgba(255,255,255,0.08);
        }

        @media (max-width: 900px) {
            .saturn-page .celestial-info {
                bottom: 164px !important;
                max-height: calc(100vh - 250px) !important;
            }

            #saturn-moon-selector {
                top: auto !important;
                bottom: 70px !important;
                gap: 9px !important;
                max-width: calc(100vw - 32px) !important;
            }

            #saturn-moon-selector .saturn-moon-selector-title {
                display: none;
            }

            #saturn-moon-selector .saturn-moon-selector-button {
                font-size: 7px !important;
                letter-spacing: 0.08em !important;
            }

            #saturn-moon-speed-controls {
                top: auto;
                bottom: 112px;
                width: min(286px, calc(100vw - 44px));
                gap: 12px;
            }

            .saturn-speed-value {
                flex-basis: 64px;
                font-size: 7px;
            }
        }
    `;


    document.head.appendChild(
        style
    );

}

function ensureMoonSelector() {

    installSaturnControlStyles();

    document
        .getElementById(
            "saturn-moon-selector"
        )
        ?.remove();


    const panel =

        document.createElement(
            "div"
        );


    panel.id =
        "saturn-moon-selector";


    Object.assign(

        panel.style,

        {

            position:
                "fixed",

            left:
                "50vw",

            top:
                "24px",

            transform:
                "translateX(-50%)",

            zIndex:
                "80",

            display:
                "flex",

            alignItems:
                "center",

            gap:
                "22px",

            maxWidth:
                "calc(100vw - 32px)",

            overflowX:
                "auto",

            padding:
                "11px 0 9px",

            border:
                "0",

            borderTop:
                "1px solid rgba(255,255,255,0.16)",

            borderBottom:
                "1px solid rgba(255,255,255,0.08)",

            borderRadius:
                "0",

            background:
                "transparent",

            backdropFilter:
                "none",

            WebkitBackdropFilter:
                "none",

            whiteSpace:
                "nowrap",

            scrollbarWidth:
                "none",

            fontFamily:
                "Arial, sans-serif"

        }

    );


    // ==================================================
    // BAŞLIK
    // ==================================================

    const title =

        document.createElement(
            "span"
        );


    title.textContent =
        "UYDULAR";


    title.className =
        "saturn-moon-selector-title";


    Object.assign(

        title.style,

        {

            margin:
                "0",

            color:
                "rgba(255,255,255,0.30)",

            fontSize:
                "7px",

            fontWeight:
                "700",

            letterSpacing:
                "0.12em",

            userSelect:
                "none"

        }

    );


    panel.appendChild(
        title
    );


    // ==================================================
    // SATÜRN + UYDULAR
    // ==================================================

    const entries =

    SATURN_MOONS_DATA.map(

        (moon) => ({

            id:
                moon.id,

            label:
                moon.name.toUpperCase()

        })

    );


    // ==================================================
    // BUTONLAR
    // ==================================================

    for (
        const entry
        of
        entries
    ) {

        const button =

            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.textContent =
            entry.label;


        button.dataset.target =
            entry.id;


        button.className =
            "saturn-moon-selector-button";


        Object.assign(

            button.style,

            {

                height:
                    "auto",

                padding:
                    "4px 1px 7px",

                border:
                    "0",

                borderRadius:
                    "0",

                background:
                    "transparent",

                color:
                    "rgba(255,255,255,0.54)",

                fontSize:
                    "8px",

                fontWeight:
                    "800",

                letterSpacing:
                    "0.12em",

                cursor:
                    "pointer",

                transition:
                    "color 160ms ease"

            }

        );


       button.addEventListener(

    "click",

    () => {

        focusMoonById(
            entry.id
        );

    }

);


        panel.appendChild(
            button
        );

    }


    document.body.appendChild(
        panel
    );


    updateMoonButtonState();


    if (
        !saturnMoonsState
            .interactionEnabled
    ) {

        panel.style.display =
            "none";


        panel.setAttribute(
            "aria-hidden",
            "true"
        );


        panel
            .querySelectorAll(
                ".saturn-moon-selector-button"
            )
            .forEach(
                (button) => {

                    button.disabled =
                        true;

                }
            );

    }

}


// ======================================================
// UYDU BUTON ACTIVE STATE
// ======================================================

function updateMoonButtonState() {

    document
        .querySelectorAll(
            ".saturn-moon-selector-button"
        )
        .forEach(

            (button) => {

                const target =
                    button.dataset.target;


                const active =

                    target ===
                    "saturn"

                        ?

                        saturnMoonsState
                            .focusMode
                        ===
                        "saturn"

                        :

                        saturnMoonsState
                            .selectedMoon
                            ?.id
                        ===
                        target;


                button.dataset.active =

                    active
                        ?
                        "true"
                        :
                        "false";


                button.setAttribute(
                    "aria-pressed",
                    String(active)
                );


                button.style.background =
                    "transparent";


                button.style.color =

                    active
                        ?
                        "#ffffff"
                        :
                        "rgba(255,255,255,0.54)";


                button.style.borderColor =
                    "transparent";

            }

        );

}


// ======================================================
// HIZ KONTROLLERİ
// ======================================================

function ensureSpeedControls() {

    installSaturnControlStyles();

    document
        .getElementById(
            "saturn-moon-speed-controls"
        )
        ?.remove();


    const controls =

        document.createElement(
            "div"
        );


    controls.id =
        "saturn-moon-speed-controls";


    const valueLabel =
        document.createElement(
            "span"
        );


    valueLabel.className =
        "saturn-speed-value";


    valueLabel.setAttribute(
        "aria-live",
        "polite"
    );


    const slider =
        document.createElement(
            "input"
        );


    slider.type =
        "range";


    slider.className =
        "saturn-speed-range";


    slider.min =
        "0";


    slider.max =
        "5";


    slider.step =
        "0.01";


    slider.setAttribute(
        "aria-label",
        "Satürn uydularının yörünge hızı"
    );


    slider.addEventListener(
        "input",
        () => {

            const exponent =
                Number(
                    slider.value
                );


            if (
                exponent
                <=
                0.001
            ) {

                saturnMoonsState.live =
                    true;


                saturnMoonsState.simulationTime =
                    Date.now();

            }


            else {

                saturnMoonsState.live =
                    false;


                saturnMoonsState.speed =
                    10 ** exponent;

            }


            updateSpeedButtonState();

        }
    );


    controls.append(
        valueLabel,
        slider
    );


    document.body.appendChild(
        controls
    );


    updateSpeedButtonState();

}


// ======================================================
// HIZ BUTON ACTIVE
// ======================================================

function updateSpeedButtonState() {

    const controls =
        document.getElementById(
            "saturn-moon-speed-controls"
        );


    const slider =
        controls
            ?.querySelector(
                ".saturn-speed-range"
            );


    const valueLabel =
        controls
            ?.querySelector(
                ".saturn-speed-value"
            );


    if (
        !slider
        ||
        !valueLabel
    ) {
        return;
    }


    const speed =
        Math.max(
            1,
            saturnMoonsState.speed
        );


    slider.value =
        saturnMoonsState.live
            ?
            "0"
            :
            String(
                Math.log10(
                    speed
                )
            );


    valueLabel.textContent =
        saturnMoonsState.live
            ?
            "CANLI"
            :
            `${Math.round(speed).toLocaleString("tr-TR")}×`;


    slider.setAttribute(
        "aria-valuetext",
        valueLabel.textContent
    );

}


// ======================================================
// ETİKET / ORBIT GÖRÜNÜMÜ
// ======================================================

function refreshMoonVisualState() {

    for (
        const moon
        of
        saturnMoonsState.moons
    ) {

        const selected =

            saturnMoonsState
                .selectedMoon
            ===
            moon

            &&

            saturnMoonsState
                .focusMode
            ===
            "moon";


        const moonRadius =

            kmToScene(
                moon.radiusKm
            );


        // ==================================================
        // NORMAL ○ MIMAS ETİKETİ
        // ==================================================

        if (
            moon.overviewTag
        ) {

            // İncelediğimiz uydunun normal büyük
            // çember etiketi tamamen kaybolsun.

            moon.overviewTag.visible =
                !selected;


            // Bir uyduyu incelerken kenardaki
            // diğer etiketleri küçült.

            if (
                saturnMoonsState.focusMode
                ===
                "moon"
            ) {

                moon.overviewTag.scale.set(
                    0.10,
                    0.025,
                    1
                );


                moon.overviewTag.material.opacity =
                    0.42;

            }


            // Normal Satürn görünümü.

            else {

                moon.overviewTag.scale.set(
                    0.18,
                    0.045,
                    1
                );


                moon.overviewTag.material.opacity =
                    1;

            }


            moon.overviewTag.position.set(

                moonRadius
                *
                1.4,

                Math.max(

                    moonRadius
                    *
                    1.5,

                    0.008

                ),

                0

            );

        }


        // ==================================================
        // YAKIN PLAN • MIMAS
        // ==================================================

        if (
            moon.focusLabel
        ) {

            moon.focusLabel.visible =
                selected;


            // sizeAttenuation false olduğu için
            // Titan, Mimas, Iapetus fark etmeksizin
            // ekranda aynı yazı boyutu.

            moon.focusLabel.scale.set(
                0.13,
                0.0325,
                1
            );


            moon.focusLabel.material.opacity =
                1;


            moon.focusLabel.position.set(

                moonRadius
                *
                1.25,

                moonRadius
                *
                1.20,

                0

            );

        }


        // ==================================================
        // HITBOX ASLA GÖRÜNMESİN
        // ==================================================

        if (
            moon.hitSphere
        ) {

            moon.hitSphere
                .material
                .colorWrite =
                false;


            moon.hitSphere
                .material
                .opacity =
                0;

        }


        // ==================================================
        // YÖRÜNGE VURGUSU
        // ==================================================

        if (
            moon.orbitLine?.material
        ) {

            moon.orbitLine.material.opacity =

                saturnMoonsState.focusMode
                ===
                "moon"

                    ?

                    (
                        selected
                            ?
                            0.65
                            :
                            0.12
                    )

                    :

                    0.30;

        }

    }

}


// ======================================================
// UYDUYA GİT
// ======================================================

function focusMoonById(
    moonId
) {

    if (
        !saturnMoonsState
            .interactionEnabled
    ) {
        return;
    }

    const moon =

        saturnMoonsState
            .moons
            .find(

                (item) =>
                    item.id
                    ===
                    moonId

            );


    if (
        !moon?.anchor
        ||
        !saturnMoonsState.camera
        ||
        !saturnMoonsState.controls
    ) {

        return;

    }


    // ==================================================
    // AYNI UYDU ZATEN AÇIKSA
    //
    // Modeli tekrar yükleme,
    // kamerayı tekrar zıplatma.
    // ==================================================

    if (
        saturnMoonsState.focusMode
        ===
        "moon"

        &&

        saturnMoonsState.selectedMoon
        ===
        moon
    ) {

        setPanelToMoon(
            moon
        );


        return;

    }


    // ==================================================
    // STATE
    // ==================================================

    saturnMoonsState.selectedMoon =
        moon;


    saturnMoonsState.focusMode =
        "moon";


    updateMoonButtonState();


    setPanelToMoon(
        moon
    );


    refreshMoonVisualState();


    // ==================================================
    // DÜNYA KOORDİNATINDA UYDU
    // ==================================================

    const target =

        new THREE.Vector3();


    moon.anchor.getWorldPosition(
        target
    );


    saturnMoonsState
        .lastFocusWorldPosition
        .copy(
            target
        );


    // ==================================================
    // GERÇEK FİZİKSEL YARIÇAP
    // ==================================================

    const moonRadius =

        kmToScene(
            moon.radiusKm
        );


    // ==================================================
    // KAMERA MESAFESİ
    //
    // Mimas da Titan da kendi fiziksel çapına
    // göre kadrajlanıyor.
    // ==================================================

    const desiredDistance =

        Math.max(

            moonRadius
            *
            5.4,

            0.018

        );


    const cameraDirection =

        new THREE.Vector3(
            1.25,
            0.55,
            1.5
        )
            .normalize();


    // ==================================================
    // CLIPPING
    // ==================================================

    saturnMoonsState.camera.near =

        Math.max(

            moonRadius
            *
            0.015,

            0.00005

        );


    // Iapetus 59 scene unit civarında olduğu için.

    saturnMoonsState.camera.far =

        Math.max(

            saturnMoonsState
                .camera
                .far,

            250

        );


    saturnMoonsState
        .camera
        .updateProjectionMatrix();


    // ==================================================
    // CONTROLS
    // ==================================================

    saturnMoonsState
        .controls
        .target
        .copy(
            target
        );


    saturnMoonsState
        .controls
        .minDistance =

        Math.max(

            moonRadius
            *
            1.18,

            0.0035

        );


    saturnMoonsState
        .controls
        .maxDistance =

        Math.max(

            moonRadius
            *
            35,

            0.55

        );


    // ==================================================
    // KAMERA
    // ==================================================

    saturnMoonsState
        .camera
        .position
        .copy(

            target
                .clone()
                .add(

                    cameraDirection
                        .multiplyScalar(
                            desiredDistance
                        )

                )

        );


    saturnMoonsState
        .controls
        .update();

}


// ======================================================
// SATÜRN'E GERİ DÖN
// ======================================================

export function returnToSaturnOverview() {

    if (
        !saturnMoonsState.camera
        ||
        !saturnMoonsState.controls
    ) {

        return;

    }


    // ==================================================
    // STATE
    // ==================================================

    saturnMoonsState.selectedMoon =
        null;


    saturnMoonsState.focusMode =
        "saturn";


    updateMoonButtonState();


    // ==================================================
    // PANEL
    //
    // Moon'a geçmeden önce sakladığımız gerçek
    // Satürn panelini event listenerlarıyla beraber
    // geri takıyoruz.
    // ==================================================

    restoreSaturnPanel();


    refreshMoonVisualState();


    // ==================================================
    // SATÜRN'ÜN DÜNYA KONUMU
    // ==================================================

    const saturnWorld =

        new THREE.Vector3();


    saturnMoonsState
        .saturnRoot
        ?.getWorldPosition(
            saturnWorld
        );


    // ==================================================
    // KAMERA
    // ==================================================

    saturnMoonsState.camera.near =
        0.01;


    saturnMoonsState.camera.far =

        Math.max(

            saturnMoonsState
                .camera
                .far,

            250

        );


    saturnMoonsState
        .camera
        .updateProjectionMatrix();


    saturnMoonsState
        .controls
        .target
        .copy(
            saturnWorld
        );


    saturnMoonsState
        .camera
        .position
        .copy(

            saturnWorld
                .clone()
                .add(

                    new THREE.Vector3(
                        0,
                        1.3,
                        6.2
                    )

                )

        );


    saturnMoonsState
        .controls
        .minDistance =
        1.08;


    saturnMoonsState
        .controls
        .maxDistance =
        120;


    saturnMoonsState
        .controls
        .update();

}


// ======================================================
// KAMERA SEÇİLİ UYDUYU TAKİP ETSİN
// ======================================================

function keepCameraOutsideSelectedMoon() {

    const moon =
        saturnMoonsState.selectedMoon;


    const camera =
        saturnMoonsState.camera;


    const controls =
        saturnMoonsState.controls;


    if (
        !moon?.anchor
        ||
        !camera
        ||
        !controls
        ||
        saturnMoonsState.focusMode
        !==
        "moon"
    ) {

        return;

    }


    // ==================================================
    // UYDUNUN YENİ KONUMU
    // ==================================================

    const currentTarget =

        new THREE.Vector3();


    moon.anchor.getWorldPosition(
        currentTarget
    );


    // ==================================================
    // UYDU HAREKET ETTİYSE KAMERA DA AYNI MİKTARDA
    // HAREKET ETSİN.
    // ==================================================

    const movement =

        currentTarget
            .clone()
            .sub(

                saturnMoonsState
                    .lastFocusWorldPosition

            );


    camera.position.add(
        movement
    );


    controls.target.copy(
        currentTarget
    );


    saturnMoonsState
        .lastFocusWorldPosition
        .copy(
            currentTarget
        );


    // ==================================================
    // KAMERANIN UYDUNUN İÇİNE GİRMESİNİ ENGELLE
    // ==================================================

    const moonRadius =

        kmToScene(
            moon.radiusKm
        );


    const safeDistance =

        Math.max(

            moonRadius
            *
            1.18,

            0.0035

        );


    const offset =

        camera
            .position
            .clone()
            .sub(
                currentTarget
            );


    if (
        offset.length()
        <
        safeDistance
    ) {

        if (
            offset.lengthSq()
            <
            1e-12
        ) {

            offset.set(
                0,
                0,
                safeDistance
            );

        }

        else {

            offset.setLength(
                safeDistance
            );

        }


        camera.position.copy(

            currentTarget
                .clone()
                .add(
                    offset
                )

        );

    }


    controls.minDistance =
        safeDistance;

}


// ======================================================
// POINTER KOORDİNATI
// ======================================================

function setPointerFromEvent(
    event
) {

    const canvas =

        saturnMoonsState
            .renderer
            .domElement;


    const rect =

        canvas
            .getBoundingClientRect();


    saturnMoonsState.pointer.x =

        (
            (
                event.clientX
                -
                rect.left
            )

            /
            rect.width

        )

        *
        2

        -

        1;


    saturnMoonsState.pointer.y =

        -

        (
            (
                event.clientY
                -
                rect.top
            )

            /
            rect.height

        )

        *
        2

        +

        1;


    saturnMoonsState
        .raycaster
        .setFromCamera(

            saturnMoonsState.pointer,

            saturnMoonsState.camera

        );

}


// GERÇEK CLICK
// ======================================================

function handleSceneClick(
    event
) {

    if (
        !saturnMoonsState.loaded
        ||
        !saturnMoonsState
            .interactionEnabled
    ) {

        return;

    }


    // ==================================================
    // UYDU YAKIN PLANINDAYKEN
    // 3D SAHNE TIKLAMALARINI KAPAT
    // ==================================================
    //
    // Böylece:
    //
    // - Satürn'e tıklamak bir şey yapmaz.
    // - Halkaya tıklamak bir şey yapmaz.
    // - Seçili uyduya tekrar tıklamak bir şey yapmaz.
    //
    // OrbitControls çalışmaya devam eder çünkü
    // pointermove / drag sistemini kapatmıyoruz.
    //
    // Başka uyduya geçmek için üstteki uydu
    // butonları kullanılabilir.
    //
    // Satürn'e dönmek için sol paneldeki
    // ← SATÜRN kontrolü kullanılır.
    // ==================================================

    if (
        saturnMoonsState.focusMode
        ===
        "moon"
    ) {

        return;

    }


    setPointerFromEvent(
        event
    );

    // ==================================================
    // 1. ÖNCE UYDULAR
    // ==================================================

    const moonHitMeshes =

    saturnMoonsState.moons

        .flatMap(

            (moon) => [

                // Uydunun etrafındaki
                // görünmeyen tıklama alanı
                moon.hitSphere,

                // ○ Mimas / ○ Titan gibi
                // görünen isim etiketi
                moon.overviewTag

            ]

        )

        .filter(
            Boolean
        );

    const moonHits =

        saturnMoonsState
            .raycaster
            .intersectObjects(

                moonHitMeshes,

                false

            );


    if (
        moonHits.length > 0
    ) {

        const moonId =

            moonHits[
                0
            ]
                .object
                .userData
                .moonId;


        // ==================================================
        // TITAN SORUNUNU DA BURASI ÇÖZÜYOR
        //
        // Seçili uydu zaten açıksa bir daha focus etmiyoruz.
        // ==================================================

        if (
            saturnMoonsState.focusMode
            ===
            "moon"

            &&

            saturnMoonsState
                .selectedMoon
                ?.id
            ===
            moonId
        ) {

            return;

        }


        focusMoonById(
            moonId
        );


        return;

    }


    // ==================================================
    // 2. UYDU İNCELERKEN SATÜRN'E TIKLARSA
    //
    // SADECE PANEL DEĞİL,
    // KAMERA DA SATÜRN'E GERİ DÖNÜYOR.
    // ==================================================


}


// ======================================================
// KARŞILAŞTIRMA MODU İÇİN GEÇİCİ ETKİLEŞİM KİLİDİ
// ======================================================

export function setSaturnMoonsEnabled(
    enabled
) {

    const nextEnabled =
        Boolean(
            enabled
        );


    saturnMoonsState.interactionEnabled =
        nextEnabled;


    if (
        saturnMoonsState.root
    ) {

        saturnMoonsState.root.visible =
            nextEnabled;

    }


    const selector =
        document.getElementById(
            "saturn-moon-selector"
        );


    const speedControls =
        document.getElementById(
            "saturn-moon-speed-controls"
        );


    if (
        speedControls
    ) {

        speedControls.style.display =
            nextEnabled
                ?
                "flex"
                :
                "none";


        speedControls.setAttribute(
            "aria-hidden",
            String(!nextEnabled)
        );


        speedControls
            .querySelectorAll("input")
            .forEach(
                (input) => {

                    input.disabled =
                        !nextEnabled;

                }
            );

    }


    if (
        selector
    ) {

        selector.style.display =
            nextEnabled
                ?
                "flex"
                :
                "none";


        selector.setAttribute(
            "aria-hidden",
            nextEnabled
                ?
                "false"
                :
                "true"
        );

    }


    document
        .querySelectorAll(
            ".saturn-moon-selector-button"
        )
        .forEach(
            (button) => {

                button.disabled =
                    !nextEnabled;

            }
        );


    if (
        !nextEnabled
    ) {

        saturnMoonsState.pointerDown =
            null;

    }

}


// ======================================================
// POINTER EVENTLERİ
//
// ÖNEMLİ:
//
// Eski kod pointerdown anında uyduyu açıyordu.
// OrbitControls ile modeli döndürürken de pointerdown
// gerçekleştiği için Titan tekrar tekrar açılıyordu.
//
// Yeni sistem:
// pointerdown → başlangıcı kaydet
// pointermove → sürükleme var mı bak
// pointerup → gerçekten click ise seçim yap
// ======================================================

function bindScenePointerEvents() {

    saturnMoonsState
        .eventController
        ?.abort();


    saturnMoonsState.eventController =

        new AbortController();


    const signal =

        saturnMoonsState
            .eventController
            .signal;


    const canvas =

        saturnMoonsState
            .renderer
            .domElement;


    // ==================================================
    // POINTER DOWN
    // ==================================================

    canvas.addEventListener(

        "pointerdown",

        (event) => {

            saturnMoonsState.pointerDown = {

                pointerId:
                    event.pointerId,

                x:
                    event.clientX,

                y:
                    event.clientY,

                moved:
                    false

            };

        },

        {
            signal
        }

    );


    // ==================================================
    // POINTER MOVE
    // ==================================================

    canvas.addEventListener(

        "pointermove",

        (event) => {

            const start =
                saturnMoonsState.pointerDown;


            if (
                !start
                ||
                start.pointerId
                !==
                event.pointerId
            ) {

                return;

            }


            const distance =

                Math.hypot(

                    event.clientX
                    -
                    start.x,

                    event.clientY
                    -
                    start.y

                );


            if (
                distance
                >
                CLICK_DRAG_THRESHOLD_PX
            ) {

                start.moved =
                    true;

            }

        },

        {
            signal
        }

    );


    // ==================================================
    // POINTER UP
    // ==================================================

    canvas.addEventListener(

        "pointerup",

        (event) => {

            const start =
                saturnMoonsState.pointerDown;


            saturnMoonsState.pointerDown =
                null;


            if (
                !start
                ||
                start.pointerId
                !==
                event.pointerId
                ||
                start.moved
            ) {

                return;

            }


            handleSceneClick(
                event
            );

        },

        {
            signal
        }

    );


    // ==================================================
    // POINTER CANCEL
    // ==================================================

    canvas.addEventListener(

        "pointercancel",

        () => {

            saturnMoonsState.pointerDown =
                null;

        },

        {
            signal
        }

    );

}


// ======================================================
// SATÜRN UYDU SİSTEMİNİ BAŞLAT
// ======================================================

export async function initSaturnMoons({

    scene,

    saturnRoot,

    renderer,

    camera,

    controls

}) {

    // ==================================================
    // PARAMETRE KONTROL
    // ==================================================

    if (
        !scene
        ||
        !saturnRoot
        ||
        !renderer
        ||
        !camera
        ||
        !controls
    ) {

        throw new Error(
            "initSaturnMoons: scene, saturnRoot, renderer, camera ve controls zorunlu."
        );

    }


    // ==================================================
    // ESKİ EVENT VARSA TEMİZLE
    // ==================================================

    saturnMoonsState
        .eventController
        ?.abort();


    // ==================================================
    // STATE RESET
    // ==================================================

    saturnMoonsState
        .moons
        .length =
        0;


    saturnMoonsState.selectedMoon =
        null;


    saturnMoonsState.focusMode =
        "saturn";


    saturnMoonsState.scene =
        scene;


    saturnMoonsState.camera =
        camera;


    saturnMoonsState.controls =
        controls;


    saturnMoonsState.renderer =
        renderer;


    saturnMoonsState.saturnRoot =
        saturnRoot;


    saturnMoonsState.previousFrameTime =
        performance.now();


    // ==================================================
    // IAPETUS İÇİN FAR PLANE
    // ==================================================

    camera.far =

        Math.max(

            camera.far,

            250

        );


    camera.updateProjectionMatrix();


    controls.maxDistance =

        Math.max(

            controls.maxDistance,

            120

        );


    // ==================================================
    // ROOT
    // ==================================================

    saturnMoonsState
        .root
        ?.removeFromParent();


    const root =

        new THREE.Group();


    root.name =
        "SATURN_MOONS_ROOT";


    saturnRoot.add(
        root
    );


    saturnMoonsState.root =
        root;


    // ==================================================
    // GLTF + DRACO
    // ==================================================

    const dracoLoader =

        new DRACOLoader();


    dracoLoader.setDecoderPath(

        "https://www.gstatic.com/draco/v1/decoders/"

    );


    const loader =

        new GLTFLoader();


    loader.setDRACOLoader(
        dracoLoader
    );


    // ==================================================
    // UI
    // ==================================================

    ensureMoonSelector();

    ensureSpeedControls();


    // ==================================================
    // TÜM UYDULAR
    // ==================================================

    for (
        const moonData
        of
        SATURN_MOONS_DATA
    ) {

        const moon = {

            ...moonData

        };


        // ------------------------------------------
        // YÖRÜNGE
        // ------------------------------------------

        moon.orbitLine =

            createOrbitLine(
                moon
            );


        root.add(
            moon.orbitLine
        );


        // ------------------------------------------
        // GERÇEK GLB
        // ------------------------------------------

        await buildMoonObject(
            moon,
            loader
        );


        // ------------------------------------------
        // ANCHOR
        // ------------------------------------------

        root.add(
            moon.anchor
        );


        saturnMoonsState
            .moons
            .push(
                moon
            );

    }


    // ==================================================
    // GÖRSEL STATE
    // ==================================================

    refreshMoonVisualState();


    // ==================================================
    // CLICK / DRAG
    // ==================================================

    bindScenePointerEvents();


    // ==================================================
    // HAZIR
    // ==================================================

    saturnMoonsState.loaded =
        true;


    updateMoonButtonState();


    console.log(
        "Satürn uydu sistemi hazır: gerçek GLB + güvenli tıklama + Satürn dönüşü."
    );


    return saturnMoonsState;

}


// ======================================================
// HER FRAME
// ======================================================

export function updateSaturnMoons(
    now
) {

    if (
        !saturnMoonsState.loaded
    ) {

        return;

    }


    // ==================================================
    // DELTA TIME
    // ==================================================

    const deltaSeconds =

        Math.min(

            Math.max(

                (
                    now
                    -
                    saturnMoonsState
                        .previousFrameTime
                )

                /

                1000,

                0

            ),

            0.1

        );


    saturnMoonsState.previousFrameTime =
        now;


    // ==================================================
    // SİMÜLASYON ZAMANI
    // ==================================================

    if (
        saturnMoonsState.live
    ) {

        saturnMoonsState.simulationTime =
            Date.now();

    }

    else {

        saturnMoonsState.simulationTime +=

            deltaSeconds
            *
            1000
            *
            saturnMoonsState.speed;

    }


    // ==================================================
    // TÜM UYDULARIN YÖRÜNGE KONUMU
    // ==================================================

    for (
        const moon
        of
        saturnMoonsState.moons
    ) {

        moon.anchor.position.copy(

            getMoonPosition(

                moon,

                saturnMoonsState
                    .simulationTime

            )

        );

    }


    // ==================================================
    // UI
    // ==================================================

    refreshMoonVisualState();


    // ==================================================
    // SEÇİLİ UYDUYU KAMERA TAKİP ETSİN
    // ==================================================

    keepCameraOutsideSelectedMoon();

}
