import type { LocaleCopy, Source, Story } from "@/lib/types";

function loc(title: string, dek: string, region: string, body: string): LocaleCopy {
  return { title, dek, region, body: body.trim(), audio: null };
}

function story(
  id: string,
  theme: Story["theme"],
  date: string,
  sources: Source[],
  locales: Story["locales"],
): Story {
  return { id, theme, date, sources, locales };
}

const carbonEn = loc(
  "The carbon books, reconciled",
  "National inventories and satellite measurements are being read against each other — not as a headline, but as an accounting problem.",
  "Global",
  `
Every country that reports under the climate convention keeps a greenhouse-gas inventory: a ledger of what is burned, grown, stored, and released. Those ledgers are the official record. They are also slow, and they depend on methods that differ from one capital to the next. [1]

A second set of books now comes from orbit. Instruments measure methane plumes and changes in atmospheric carbon dioxide, then scientists work backward toward the regions that could have produced them. The two records rarely match on the first reading. The work of recent years has been to ask why — a missing landfill, a revised emission factor, a wind field — rather than to declare a winner. [2]

Synthesis assessments still set the frame. Warming is unequivocally human-driven, and the remaining carbon budget is a quantity with a range, not a slogan. What the paired books change is the resolution: which basins, which sectors, which years deserve a closer audit. [3]
`,
);

const carbonTr = loc(
  "Karbon defterleri, yan yana",
  "Ulusal envanterler ile uydu ölçümleri bir manşet olarak değil, bir muhasebe sorunu olarak birlikte okunuyor.",
  "Küresel",
  `
İklim sözleşmesi kapsamında rapor veren her ülke bir sera gazı envanteri tutar: yakılanın, yetişenin, tutulanın ve salınanın defteri. Bu defterler resmî kayıttır. Aynı zamanda yavaştır ve başkentten başkente değişen yöntemlere dayanır. [1]

İkinci bir defter artık yörüngeden geliyor. Aygıtlar metan bulutlarını ve atmosferdeki karbondioksit değişimini ölçer; bilim insanları da buna hangi bölgelerin yol açmış olabileceğini geriye doğru sorar. İki kayıt ilk okumada nadiren örtüşür. Son yılların işi bir kazanan ilan etmek değil, nedenini sormak oldu: eksik bir depolama sahası, güncellenmiş bir salım katsayısı, bir rüzgâr alanı. [2]

Sentez değerlendirmeleri çerçeveyi hâlâ belirliyor. Isınma tartışmasız biçimde insan kaynaklıdır; kalan karbon bütçesi bir slogan değil, aralığı olan bir niceliktir. Yan yana duran defterlerin değiştirdiği şey çözünürlüktür: hangi havzaların, hangi sektörlerin, hangi yılların daha yakından denetlenmeyi hak ettiği. [3]
`,
);

const carbonAr = loc(
  "دفاتر الكربون، متقابلة",
  "تُقرأ قوائم الجرد الوطنية وقياسات الأقمار معًا لا كعنوان عاجل، بل كمسألة محاسبة.",
  "عالمي",
  `
كل دولة تقدّم تقاريرها بموجب اتفاقية المناخ تحتفظ بجرد لغازات الاحتباس الحراري: دفتر لما يُحرق ويُزرع ويُخزَّن ويُطلَق. هذه الدفاتر هي السجل الرسمي. وهي أيضًا بطيئة، وتعتمد على مناهج تختلف من عاصمة إلى أخرى. [1]

ثمة دفتر ثانٍ يأتي الآن من المدار. تقيس الأجهزة أعمدة الميثان وتغيّر ثاني أكسيد الكربون في الغلاف الجوي، ثم يسأل العلماء إلى الوراء أي الأقاليم يمكن أن يكون مصدرها. نادرًا ما يتطابق السجلان في القراءة الأولى. كان عمل السنوات الأخيرة أن نسأل عن السبب — مكبّ نفايات غائب، معامل انبعاث مُراجع، حقل رياح — لا أن نُعلن فائزًا. [2]

ما زالت تقييمات التجميع ترسم الإطار. الاحترار بشري بلا لبس، وميزانية الكربون المتبقية كمية لها مدى، لا شعار. ما تغيّره الدفاتر المتقابلة هو درجة الوضوح: أي الأحواض وأي القطاعات وأي السنوات تستحق تدقيقًا أدق. [3]
`,
);

const carbonFr = loc(
  "Les livres du carbone, rapprochés",
  "Les inventaires nationaux et les mesures satellitaires se lisent l’un contre l’autre — non comme une manchette, mais comme un problème de comptes.",
  "Monde",
  `
Chaque pays qui rend compte au titre de la convention sur le climat tient un inventaire de gaz à effet de serre : un livre de ce qui est brûlé, cultivé, stocké et rejeté. Ces livres sont le registre officiel. Ils sont aussi lents, et ils reposent sur des méthodes qui diffèrent d’une capitale à l’autre. [1]

Un second jeu de livres vient désormais de l’orbite. Des instruments mesurent les panaches de méthane et les variations du dioxyde de carbone atmosphérique ; les scientifiques remontent ensuite vers les régions qui ont pu les produire. Les deux registres coïncident rarement à la première lecture. Le travail de ces dernières années a consisté à demander pourquoi — une décharge absente, un facteur d’émission révisé, un champ de vent — plutôt qu’à désigner un vainqueur. [2]

Les évaluations de synthèse fixent encore le cadre. Le réchauffement est sans équivoque d’origine humaine, et le budget carbone restant est une quantité dotée d’une fourchette, non un slogan. Ce que les livres rapprochés changent, c’est la résolution : quels bassins, quels secteurs, quelles années méritent un audit plus fin. [3]
`,
);

const carbonEs = loc(
  "Los libros del carbono, conciliados",
  "Los inventarios nacionales y las mediciones por satélite se leen uno contra el otro: no como un titular, sino como un problema de contabilidad.",
  "Global",
  `
Cada país que informa bajo la convención del clima lleva un inventario de gases de efecto invernadero: un libro de lo que se quema, se cultiva, se almacena y se libera. Esos libros son el registro oficial. También son lentos, y dependen de métodos que cambian de una capital a otra. [1]

Un segundo juego de libros llega ahora desde la órbita. Los instrumentos miden penachos de metano y cambios en el dióxido de carbono atmosférico; después, los científicos preguntan hacia atrás qué regiones pudieron producirlos. Los dos registros rara vez coinciden en la primera lectura. El trabajo de los últimos años ha sido preguntar por qué —un vertedero ausente, un factor de emisión revisado, un campo de viento— en lugar de declarar un ganador. [2]

Las evaluaciones de síntesis siguen marcando el marco. El calentamiento es inequívocamente humano, y el presupuesto de carbono restante es una cantidad con un rango, no un lema. Lo que cambian los libros puestos en paralelo es la resolución: qué cuencas, qué sectores, qué años merecen una auditoría más fina. [3]
`,
);

const citiesEn = loc(
  "After ten million",
  "A megacity used to be an exception. The public record now has enough of them to compare the planning, not the skyline.",
  "Lagos · Dhaka · São Paulo",
  `
The United Nations counts a megacity at ten million inhabitants. The line used to mark a rarity. It now marks a class large enough to compare: how water, rail, and housing are planned when a city is no longer an exception in the tables. [1]

Population tables do not say how those residents are housed. Household surveys and national accounts still disagree on informal settlements, and the disagreement is the substance, not a footnote. A city can be officially growing while the count of serviced homes barely moves. [2]

The useful comparison is not a ranking of towers. It is whether the public record — census, utility connections, building permits — can be read in the same decade as the people it describes. [1]
`,
);

const citiesTr = loc(
  "On milyondan sonra",
  "Megakent bir istisnaydı. Kamusal kayıtta artık silueti değil planlamayı karşılaştırmaya yetecek kadar kent var.",
  "Lagos · Dakka · São Paulo",
  `
Birleşmiş Milletler bir megakenti on milyon kişiyle sayar. Bu çizgi eskiden bir nadirliği işaretlerdi. Şimdi karşılaştırmaya yetecek bir sınıfı işaretliyor: bir kent tablolarda istisna olmaktan çıktığında su, raylı sistem ve konut nasıl planlanır. [1]

Nüfus tabloları bu insanların nasıl barındığını söylemez. Hane araştırmaları ile ulusal hesaplar kayıt dışı yerleşimler konusunda hâlâ ayrışır; ayrışma bir dipnot değil, asıl meseledir. Bir kent resmen büyürken hizmet götürülen konut sayısı yerinden kıpırdamayabilir. [2]

Yararlı kıyas kulelerin sıralaması değildir. Asıl soru; nüfus sayımı, şebeke bağlantısı ve yapı ruhsatından oluşan kamusal kaydın, anlattığı insanlarla aynı on yıl içinde okunup okunamadığıdır. [1]
`,
);

const citiesAr = loc(
  "بعد عشرة ملايين",
  "كانت المدينة العملاقة استثناءً. في السجل العام اليوم ما يكفي منها لمقارنة التخطيط لا خط الأفق.",
  "لاغوس · دكا · ساو باولو",
  `
تعدّ الأمم المتحدة المدينة العملاقة عند عشرة ملايين نسمة. كان هذا الخط يدل على الندرة. صار اليوم يدل على فئة تتسع للمقارنة: كيف يُخطَّط للماء والسكك والمسكن حين تكفّ المدينة عن أن تكون استثناءً في الجداول. [1]

جداول السكان لا تقول كيف يُسكَن هؤلاء. ما زالت مسوح الأسر والحسابات الوطنية تختلف في شأن المستوطنات غير الرسمية، والاختلاف هو المتن لا الحاشية. قد تنمو مدينة في السجل الرسمي بينما لا يكاد يتحرك عدد المساكن المخدومة. [2]

المقارنة المفيدة ليست ترتيب الأبراج. هي ما إذا كان السجل العام — التعداد، ووصلات المرافق، ورخص البناء — يُقرأ في العقد نفسه الذي يعيشه الناس الذين يصفهم. [1]
`,
);

const citiesFr = loc(
  "Après dix millions",
  "Une mégapole était une exception. Le registre public en compte désormais assez pour comparer l’urbanisme, non la silhouette.",
  "Lagos · Dacca · São Paulo",
  `
Les Nations unies comptent une mégapole à partir de dix millions d’habitants. Ce seuil marquait une rareté. Il marque aujourd’hui une classe assez large pour être comparée : comment l’eau, le rail et le logement se planifient quand une ville n’est plus une exception dans les tableaux. [1]

Les tableaux de population ne disent pas comment ces habitants sont logés. Les enquêtes auprès des ménages et les comptes nationaux divergent encore sur les quartiers informels, et cette divergence est le sujet, non une note. Une ville peut croître officiellement tandis que le nombre de logements desservis bouge à peine. [2]

La comparaison utile n’est pas un classement de tours. C’est de savoir si le registre public — recensement, raccordements, permis de construire — peut se lire dans la même décennie que les personnes qu’il décrit. [1]
`,
);

const citiesEs = loc(
  "Después de diez millones",
  "Una megaciudad era una excepción. El registro público ya tiene bastantes para comparar la planificación, no el perfil de las torres.",
  "Lagos · Daca · São Paulo",
  `
Las Naciones Unidas cuentan una megaciudad a partir de diez millones de habitantes. Ese umbral marcaba una rareza. Hoy marca una clase lo bastante amplia para comparar: cómo se planifican el agua, el ferrocarril y la vivienda cuando una ciudad deja de ser una excepción en las tablas. [1]

Las tablas de población no dicen cómo se aloja a esos residentes. Las encuestas de hogares y las cuentas nacionales siguen discrepando sobre los asentamientos informales, y la discrepancia es el asunto, no una nota. Una ciudad puede crecer en el registro mientras el número de viviendas con servicios apenas se mueve. [2]

La comparación útil no es un ranking de torres. Es si el registro público —censo, conexiones, permisos de obra— puede leerse en la misma década que las personas a las que describe. [1]
`,
);

const grainEn = loc(
  "How grain actually moves",
  "Wheat, maize, and rice cross borders as balance sheets before they cross them as ships.",
  "Black Sea · Mekong · Paraná",
  `
Wheat, maize, and rice do not travel as headlines. They travel as contracts, port drafts, and seasonal windows. The public agencies that watch those flows publish balance sheets: production, trade, and stocks left at the end of the year, country by country. [1]

A balance sheet is not a forecast of price, and this atlas does not offer one. It is a way to see concentration. A small group of exporters still supplies a large share of the wheat that crosses a border. When one corridor slows, the sheet shows who else has grain to sell — and who imports enough that a delay becomes a domestic question. [2]

Reading the sheet well means noticing what it leaves out. Grain lost before the farm gate, cargo refused for quality, sacks that never meet a customs officer: none of these enter the line, and the gap is part of the record. [1]
`,
);

const grainTr = loc(
  "Tahıl gerçekten nasıl gider",
  "Buğday, mısır ve pirinç bir sınırı gemi olarak geçmeden önce bilanço olarak geçer.",
  "Karadeniz · Mekong · Paraná",
  `
Buğday, mısır ve pirinç manşet olarak yolculuk etmez. Sözleşme, liman su çekimi ve mevsim penceresi olarak gider. Bu akışları izleyen kamu kurumları bilanço yayımlar: üretim, ticaret ve yıl sonunda kalan stok, ülke ülke. [1]

Bilanço bir fiyat tahmini değildir; bu atlas da fiyat söylemez. Bilanço, yoğunlaşmayı görmenin yoludur. Sınırı geçen buğdayın büyük payını hâlâ küçük bir ihracatçı grubu karşılar. Bir koridor yavaşlayınca kâğıt, satacak tahılı başka kimde olduğunu ve gecikmenin iç meseleye döneceği kadar ithalat yapanın kim olduğunu gösterir. [2]

Kâğıdı iyi okumak, dışarıda bıraktığını fark etmektir. Çiftlik kapısından önce yiten tahıl, kalite yüzünden geri çevrilen yük, gümrükle hiç karşılaşmayan çuval: bunların hiçbiri satıra girmez ve boşluk kaydın parçasıdır. [1]
`,
);

const grainAr = loc(
  "كيف تتحرك الحبوب فعلًا",
  "القمح والذرة والأرز يعبرون الحدود كميزانية قبل أن يعبروها كسفينة.",
  "البحر الأسود · ميكونغ · بارانا",
  `
لا يسافر القمح والذرة والأرز كعناوين. يسافر كعقود وغاطس موانئ ونوافذ مواسم. الجهات العامة التي ترصد هذه التدفقات تنشر موازين: الإنتاج والتجارة والمخزون في آخر السنة، بلدًا بلدًا. [1]

الميزان ليس توقعًا للسعر، وهذا الأطلس لا يعرض سعرًا. هو طريقة لرؤية التركّز. ما زالت مجموعة صغيرة من المصدّرين تمدّ حصة كبيرة من القمح الذي يعبر حدودًا. حين يبطئ ممرّ، تُظهر الورقة من لديه حبوب أخرى للبيع، ومن يستورد ما يكفي كي يصير التأخير شأنًا داخليًا. [2]

قراءة الورقة جيدًا هي أن نلاحظ ما تتركه خارجها. حبوب تضيع قبل باب المزرعة، شحنة تُرفض لجودتها، أكياس لا تلتقي موظف جمرك: لا شيء من هذا يدخل السطر، والفراغ جزء من السجل. [1]
`,
);

const grainFr = loc(
  "Comment le grain voyage vraiment",
  "Le blé, le maïs et le riz franchissent une frontière comme un bilan avant de la franchir comme un navire.",
  "Mer Noire · Mékong · Paraná",
  `
Le blé, le maïs et le riz ne voyagent pas comme des manchettes. Ils voyagent comme des contrats, des tirants d’eau et des fenêtres de saison. Les organismes publics qui suivent ces flux publient des bilans : production, échanges et stocks en fin d’année, pays par pays. [1]

Un bilan n’est pas une prévision de prix, et cet atlas n’en propose pas. C’est une façon de voir la concentration. Un petit groupe d’exportateurs fournit encore une large part du blé qui traverse une frontière. Quand un corridor ralentit, la feuille montre qui d’autre a du grain à vendre — et qui importe assez pour qu’un retard devienne une question intérieure. [2]

Bien lire la feuille, c’est voir ce qu’elle laisse dehors. Grain perdu avant la ferme, cargaison refusée pour la qualité, sacs qui ne croisent jamais un douanier : rien de cela n’entre dans la ligne, et le manque fait partie du registre. [1]
`,
);

const grainEs = loc(
  "Cómo se mueve de verdad el grano",
  "El trigo, el maíz y el arroz cruzan una frontera como balance antes de cruzarla como barco.",
  "Mar Negro · Mekong · Paraná",
  `
El trigo, el maíz y el arroz no viajan como titulares. Viajan como contratos, calados de puerto y ventanas de temporada. Los organismos públicos que siguen esos flujos publican balances: producción, comercio y existencias al cierre del año, país por país. [1]

Un balance no es un pronóstico de precio, y este atlas no ofrece uno. Es una forma de ver la concentración. Un grupo pequeño de exportadores sigue aportando una parte grande del trigo que cruza una frontera. Cuando un corredor se frena, la hoja muestra quién más tiene grano para vender — y quién importa lo bastante para que un retraso se vuelva una pregunta interna. [2]

Leer bien la hoja es notar lo que deja fuera. Grano perdido antes de la puerta de la finca, carga rechazada por calidad, sacos que nunca ven a un aduanero: nada de eso entra en la línea, y el hueco es parte del registro. [1]
`,
);

const langEn = loc(
  "Which languages keep the record",
  "A public figure can be careful and still stop at the border of the language it was released in.",
  "Global",
  `
Most people still meet the state in a language. School guidance, a census note, a health instruction: each is a source. When they exist only in a language a city does not speak at home, the record is formally public and practically closed. UNESCO’s account of languages in education puts a measure on one part of that gap: a large share of learners are not taught in a language they understand well. [1]

Statistical systems have their own version of the same problem. Indicator notes, glossaries, and methods are often published once, in the working language of the office that produced them. Another office can cite the figure without being able to check the definition. The Sustainable Development Goals database is one of the few global ledgers that tries to keep the indicator list in more than one UN language — and even there, the depth of translation is uneven. [2]

The comparison worth making is simple. Take one claim. Count the languages in which a reader can open the underlying note, not a paraphrase. That count is the real width of the source.
`,
);

const langTr = loc(
  "Kaydı hangi diller tutar",
  "Kamuya açık bir sayı özenli olabilir ve yine de yayımlandığı dilin sınırında durabilir.",
  "Küresel",
  `
İnsanların çoğu devletle hâlâ bir dilde karşılaşır. Okul yönergesi, sayım notu, sağlık açıklaması birer kaynaktır. Bunlar bir kentin evinde konuşulmayan bir dilde varsa kayıt biçimsel olarak kamusal, pratikte kapalıdır. UNESCO’nun eğitim dilleri üzerine hesabı bu boşluğun bir yanına ölçü koyar: öğrenenlerin kayda değer bir bölümü, iyi anladığı dilde eğitim görmez. [1]

İstatistik düzenlerinin de aynı sorunun kendi biçimi vardır. Gösterge notları, sözlükler ve yöntemler çoğu kez bir kez, onları üreten ofisin çalışma dilinde yayımlanır. Başka bir ofis, tanımı denetleyemeden rakamı aktarabilir. Sürdürülebilir Kalkınma Amaçları veri tabanı, gösterge listesini Birleşmiş Milletler’in birden fazla dilinde tutmaya çalışan az sayıdaki küresel defterden biridir; orada bile çevirinin derinliği eşit değildir. [2]

Yapılmaya değer kıyas sadedir. Bir iddiayı ele al. Okurun, altta yatan notu bir aktarım olarak değil kaç dilde açabildiğini say. Bu sayı kaynağın gerçek genişliğidir.
`,
);

const langAr = loc(
  "أي اللغات تمسك بالسجل",
  "قد يكون رقم عام دقيقًا، ثم يقف عند حدود اللغة التي نُشر بها.",
  "عالمي",
  `
أكثر الناس ما زالوا يلتقون الدولة في لغة. توجيه المدرسة، وحاشية التعداد، وتعليمات الصحة: كل منها مصدر. إذا وُجدت فقط في لغة لا تُتكلَّم في البيت، فالسجل عام في الشكل ومغلق في الممارسة. حساب اليونسكو عن اللغات في التعليم يضع مقياسًا على جانب من هذه الفجوة: شريحة واسعة من المتعلمين لا تُدرَّس بلغة تفهمها جيدًا. [1]

للنظم الإحصائية صيغة المشكلة نفسها. حواشي المؤشرات والمعاجم والمناهج تُنشر غالبًا مرة واحدة، بلغة العمل في المكتب الذي أنتجها. قد ينقل مكتب آخر الرقم من غير أن يستطيع مراجعة التعريف. قاعدة أهداف التنمية المستدامة من قلة الدفاتر العالمية التي تحاول إبقاء قائمة المؤشرات بأكثر من لغة من لغات الأمم المتحدة — وحتى هناك، عمق الترجمة غير متساوٍ. [2]

المقارنة التي تستحق بسيطة. خذ دعوى واحدة. عدّ اللغات التي يستطيع فيها قارئ أن يفتح الحاشية الأصلية، لا إعادة صياغتها. هذا العدد هو العرض الحقيقي للمصدر.
`,
);

const langFr = loc(
  "Quelles langues tiennent le registre",
  "Un chiffre public peut être soigneux et s’arrêter pourtant à la frontière de la langue qui l’a publié.",
  "Monde",
  `
La plupart des gens rencontrent encore l’État dans une langue. Une note scolaire, une notice de recensement, une consigne de santé sont des sources. Quand elles n’existent que dans une langue qu’une ville ne parle pas chez elle, le registre est officiellement public et pratiquement fermé. Le constat de l’UNESCO sur les langues dans l’éducation mesure une part de cet écart : une large part des apprenants n’est pas instruite dans une langue qu’elle comprend bien. [1]

Les systèmes statistiques ont leur version du même problème. Notes d’indicateur, glossaires et méthodes paraissent souvent une seule fois, dans la langue de travail du service qui les a produits. Un autre service peut citer le chiffre sans pouvoir vérifier la définition. La base des Objectifs de développement durable est l’un des rares livres mondiaux qui tente de tenir la liste des indicateurs dans plus d’une langue des Nations unies — et même là, la profondeur de la traduction reste inégale. [2]

La comparaison qui vaut est simple. Prendre une affirmation. Compter les langues dans lesquelles un lecteur peut ouvrir la note d’origine, non une paraphrase. Ce nombre est la largeur réelle de la source.
`,
);

const langEs = loc(
  "Qué lenguas guardan el registro",
  "Una cifra pública puede ser cuidadosa y, aun así, detenerse en la frontera de la lengua en que se publicó.",
  "Global",
  `
La mayoría de la gente sigue encontrándose con el Estado en una lengua. Una guía escolar, una nota censal, una instrucción de salud son fuentes. Si solo existen en una lengua que una ciudad no habla en casa, el registro es formalmente público y en la práctica está cerrado. El recuento de la UNESCO sobre las lenguas en la educación mide una parte de esa brecha: una porción amplia de quienes aprenden no estudia en una lengua que entiende bien. [1]

Los sistemas estadísticos tienen su propia forma del mismo problema. Las notas de los indicadores, los glosarios y los métodos suelen publicarse una sola vez, en la lengua de trabajo de la oficina que los produjo. Otra oficina puede citar la cifra sin poder revisar la definición. La base de los Objetivos de Desarrollo Sostenible es uno de los pocos libros mundiales que intenta mantener la lista de indicadores en más de una lengua de las Naciones Unidas; incluso ahí, la profundidad de la traducción es desigual. [2]

La comparación que importa es simple. Tomar una afirmación. Contar las lenguas en las que un lector puede abrir la nota de origen, no una paráfrasis. Ese número es el ancho real de la fuente.
`,
);

export const SEED: Story[] = [
  story(
    "carbon-books",
    "climate",
    "2026-03-12",
    [
      {
        n: 1,
        label: "IPCC — Sixth Assessment Report, Synthesis",
        url: "https://www.ipcc.ch/report/ar6/syr/",
      },
      {
        n: 2,
        label: "IEA — Global Methane Tracker 2026",
        url: "https://www.iea.org/reports/global-methane-tracker-2026",
      },
      {
        n: 3,
        label: "NASA Earth Science — Climate vital signs",
        url: "https://climate.nasa.gov/",
      },
    ],
    { tr: carbonTr, ar: carbonAr, en: carbonEn, fr: carbonFr, es: carbonEs },
  ),
  story(
    "after-ten-million",
    "cities",
    "2026-01-20",
    [
      {
        n: 1,
        label: "United Nations — World Urbanization Prospects",
        url: "https://population.un.org/wup/",
      },
      {
        n: 2,
        label: "World Bank — Urban Development",
        url: "https://www.worldbank.org/en/topic/urbandevelopment",
      },
    ],
    { tr: citiesTr, ar: citiesAr, en: citiesEn, fr: citiesFr, es: citiesEs },
  ),
  story(
    "grain-moves",
    "trade",
    "2025-11-04",
    [
      {
        n: 1,
        label: "FAO — Cereal Supply and Demand Brief",
        url: "https://www.fao.org/worldfoodsituation/csdb/en",
      },
      {
        n: 2,
        label: "AMIS — Agricultural Market Information System",
        url: "https://www.amis-outlook.org/",
      },
    ],
    { tr: grainTr, ar: grainAr, en: grainEn, fr: grainFr, es: grainEs },
  ),
  story(
    "languages-of-record",
    "knowledge",
    "2026-02-08",
    [
      {
        n: 1,
        label: "UNESCO — Languages in education",
        url: "https://www.unesco.org/en/languages-education",
      },
      {
        n: 2,
        label: "UN Statistics Division — Sustainable Development Goals",
        url: "https://unstats.un.org/sdgs/",
      },
    ],
    { tr: langTr, ar: langAr, en: langEn, fr: langFr, es: langEs },
  ),
];
