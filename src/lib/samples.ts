import type { Lang, LocaleCopy, Story } from "@/lib/types";

/**
 * Sample readings, only for testing the layout. They carry no research and no sources.
 * To remove them: delete this file and the two lines that mention SAMPLES in seed.ts.
 */

const body: Record<Lang, { dek: string; region: string; text: string }> = {
  tr: {
    dek: "Deneme yazısı.",
    region: "Deneme",
    text: `Bu bir deneme yazısıdır. Sayfa düzenini denemek için konulmuştur; içindeki metin gerçek bir araştırmaya dayanmaz.

Bu başlıktaki asıl yazı, kaynaklarıyla birlikte daha sonra yayımlanacak.`,
  },
  ar: {
    dek: "قراءة تجريبية.",
    region: "تجريبي",
    text: `هذه قراءة تجريبية، وُضعت لاختبار تصميم الصفحة، ونصّها لا يستند إلى أي بحث.

ستُنشر القراءة الحقيقية تحت هذا العنوان لاحقًا مع مصادرها.`,
  },
  en: {
    dek: "A sample reading.",
    region: "Sample",
    text: `This is a sample reading. It is here to test the page layout; the text does not rest on any research.

The real reading under this title will be published later, with its sources.`,
  },
  fr: {
    dek: "Une lecture d’essai.",
    region: "Essai",
    text: `Ceci est une lecture d’essai. Elle sert à tester la mise en page ; le texte ne repose sur aucune recherche.

La vraie lecture sous ce titre sera publiée plus tard, avec ses sources.`,
  },
  es: {
    dek: "Una lectura de prueba.",
    region: "Prueba",
    text: `Esta es una lectura de prueba. Está aquí para probar el diseño de la página; el texto no se basa en ninguna investigación.

La lectura real con este título se publicará más adelante, con sus fuentes.`,
  },
};

function sample(
  id: string,
  theme: Story["theme"],
  date: string,
  titles: Record<Lang, string>,
): Story {
  const locales = {} as Record<Lang, LocaleCopy>;
  for (const lang of Object.keys(titles) as Lang[]) {
    locales[lang] = {
      title: titles[lang],
      dek: body[lang].dek,
      region: body[lang].region,
      body: body[lang].text,
      audio: null,
    };
  }
  return { id: `sample-${id}`, theme, date, sources: [], locales };
}

export const SAMPLES: Story[] = [
  sample("migration-vote", "politics", "2025-07-10", {
    tr: "Göç, seçmenleri sağa mı kaydırıyor?",
    ar: "هل تدفع الهجرة الناخبين نحو اليمين؟",
    en: "Does migration move voters to the right?",
    fr: "La migration pousse-t-elle les électeurs vers la droite ?",
    es: "¿La migración empuja a los votantes hacia la derecha?",
  }),
  sample("quake-economy", "economy", "2025-06-18", {
    tr: "Bir deprem, bir ekonomiyi kaç yıl geriye götürür?",
    ar: "كم سنة يكلّف الزلزال اقتصاد بلد؟",
    en: "How many years does an earthquake cost an economy?",
    fr: "Combien d’années un séisme coûte-t-il à une économie ?",
    es: "¿Cuántos años le cuesta un terremoto a una economía?",
  }),
  sample("bread-diabetes", "health", "2025-05-22", {
    tr: "Sofradaki ekmek ve diyabet",
    ar: "الخبز على المائدة، والسكري",
    en: "Bread on the table, and diabetes",
    fr: "Le pain sur la table, et le diabète",
    es: "El pan en la mesa, y la diabetes",
  }),
  sample("consumption", "research", "2025-04-30", {
    tr: "Daha çok tüketmek, daha iyi yaşamak mı?",
    ar: "هل يعني الاستهلاك الأكثر حياة أفضل؟",
    en: "Does consuming more mean living better?",
    fr: "Consommer plus, est-ce vivre mieux ?",
    es: "¿Consumir más es vivir mejor?",
  }),
  sample("sea-level", "science", "2025-04-02", {
    tr: "Deniz seviyesi nasıl ölçülür?",
    ar: "كيف يُقاس مستوى سطح البحر؟",
    en: "How is sea level measured?",
    fr: "Comment mesure-t-on le niveau de la mer ?",
    es: "¿Cómo se mide el nivel del mar?",
  }),
  sample("data-water", "technology", "2025-03-12", {
    tr: "Veri merkezleri ne kadar su harcar?",
    ar: "كم من الماء تستهلك مراكز البيانات؟",
    en: "How much water do data centres use?",
    fr: "Combien d’eau consomment les centres de données ?",
    es: "¿Cuánta agua consumen los centros de datos?",
  }),
  sample("rivers", "environment", "2025-02-19", {
    tr: "Nehirler neden kuruyor?",
    ar: "لماذا تجفّ الأنهار؟",
    en: "Why are rivers running dry?",
    fr: "Pourquoi les rivières s’assèchent-elles ?",
    es: "¿Por qué se secan los ríos?",
  }),
  sample("cuisine", "culture", "2025-01-28", {
    tr: "Mutfak, bir milletin kimliğini nasıl kurar?",
    ar: "كيف يبني المطبخ هوية أمة؟",
    en: "How does a cuisine build a nation’s identity?",
    fr: "Comment une cuisine construit-elle l’identité d’une nation ?",
    es: "¿Cómo construye una cocina la identidad de una nación?",
  }),
  sample("city-light", "health", "2024-12-17", {
    tr: "Şehir ışıkları uykuyu nasıl etkiler?",
    ar: "كيف تؤثّر أضواء المدينة في النوم؟",
    en: "How do city lights affect sleep?",
    fr: "Comment les lumières de la ville affectent-elles le sommeil ?",
    es: "¿Cómo afectan las luces de la ciudad al sueño?",
  }),
  sample("turnout", "politics", "2024-11-26", {
    tr: "Seçimlere katılım neden düşüyor?",
    ar: "لماذا تتراجع نسبة المشاركة في الانتخابات؟",
    en: "Why is election turnout falling?",
    fr: "Pourquoi la participation électorale baisse-t-elle ?",
    es: "¿Por qué cae la participación electoral?",
  }),
];
