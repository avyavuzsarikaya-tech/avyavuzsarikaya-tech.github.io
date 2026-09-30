import type { Lang } from "@/lib/types";

export type PublishCopy = {
  connectTitle: string;
  connectLead: string;
  steps: string[];
  makeToken: string;
  tokenLabel: string;
  tokenHelp: string;
  connect: string;
  checking: string;
  connected: string;
  disconnect: string;
  badToken: string;
  noAccess: string;
  network: string;
  failed: string;
  needConnect: string;
  publishing: string;
  published: string;
  removed: string;
  image: string;
  imageHint: string;
  chooseImage: string;
  replaceImage: string;
  removeImage: string;
  credit: string;
  imageFail: string;
};

const PUBLISH: Record<Lang, PublishCopy> = {
  tr: {
    connectTitle: "Yayın bağlantısı",
    connectLead:
      "Panelde kaydedilen her yazı, görseli ve sesiyle birlikte doğrudan siteye yayınlanır. Bunun için bu cihazı bir kez GitHub'a bağlayın.",
    steps: [
      "Aşağıdaki bağlantıdan GitHub'da yeni bir anahtar sayfası açın.",
      "Ad verin; süreyi en uzun seçenek ya da süresiz yapın.",
      "Repository access: Only select repositories, ardından avyavuzsarikaya-tech.github.io deposunu seçin.",
      "Permissions: Contents için Read and write seçin.",
      "Generate token deyip çıkan anahtarı buraya yapıştırın.",
    ],
    makeToken: "GitHub'da anahtar oluştur",
    tokenLabel: "GitHub anahtarı",
    tokenHelp: "Anahtar yalnızca bu tarayıcıda saklanır ve yalnızca bu depoya yazabilir.",
    connect: "Bağlan",
    checking: "Denetleniyor…",
    connected: "Bu cihaz siteye yayın yapabilir.",
    disconnect: "Bağlantıyı kes",
    badToken: "Anahtar geçersiz ya da süresi dolmuş.",
    noAccess:
      "Bu anahtar depoya yazamıyor. Depoyu ve Contents: Read and write iznini seçtiğinizden emin olun.",
    network: "GitHub'a ulaşılamadı. İnternet bağlantısını denetleyin.",
    failed: "Yayınlanamadı.",
    needConnect: "Yayınlamak için önce bu cihazı panel ana sayfasından bağlayın.",
    publishing: "Yayınlanıyor…",
    published: "Yayınlandı. Site birkaç dakika içinde güncellenir.",
    removed: "Kaldırıldı. Site birkaç dakika içinde güncellenir.",
    image: "Görsel",
    imageHint: "Yazının tablosu. Okuma sayfasında başlığın altında ve ana sayfada görünür.",
    chooseImage: "Görsel seç",
    replaceImage: "Görseli değiştir",
    removeImage: "Görseli kaldır",
    credit: "Alt yazı (ressam, eser, yıl)",
    imageFail: "Görsel okunamadı.",
  },
  ar: {
    connectTitle: "ربط النشر",
    connectLead:
      "كل قراءة تُحفظ في اللوحة تُنشر مباشرة على الموقع مع صورتها وتسجيلها. لذلك اربط هذا الجهاز بـ GitHub مرة واحدة.",
    steps: [
      "افتح صفحة مفتاح جديد في GitHub من الرابط أدناه.",
      "سمِّ المفتاح واختر أطول مدة أو بلا انتهاء.",
      "Repository access: Only select repositories، ثم اختر المستودع avyavuzsarikaya-tech.github.io.",
      "Permissions: اختر Read and write لـ Contents.",
      "اضغط Generate token والصق المفتاح هنا.",
    ],
    makeToken: "أنشئ مفتاحًا في GitHub",
    tokenLabel: "مفتاح GitHub",
    tokenHelp: "يُحفظ المفتاح في هذا المتصفح فقط، ولا يكتب إلا في هذا المستودع.",
    connect: "اربط",
    checking: "جارٍ التحقق…",
    connected: "هذا الجهاز يستطيع النشر على الموقع.",
    disconnect: "افصل",
    badToken: "المفتاح غير صالح أو منتهي الصلاحية.",
    noAccess:
      "هذا المفتاح لا يستطيع الكتابة في المستودع. تأكد من اختيار المستودع وإذن Contents: Read and write.",
    network: "تعذّر الوصول إلى GitHub. تحقّق من الاتصال بالإنترنت.",
    failed: "تعذّر النشر.",
    needConnect: "للنشر، اربط هذا الجهاز أولًا من الصفحة الرئيسية للوحة.",
    publishing: "جارٍ النشر…",
    published: "نُشر. سيُحدَّث الموقع خلال دقائق.",
    removed: "أُزيل. سيُحدَّث الموقع خلال دقائق.",
    image: "الصورة",
    imageHint: "لوحة القراءة. تظهر تحت العنوان في صفحة القراءة وفي الصفحة الرئيسية.",
    chooseImage: "اختر صورة",
    replaceImage: "استبدل الصورة",
    removeImage: "احذف الصورة",
    credit: "التعليق (الرسام، العمل، السنة)",
    imageFail: "تعذّرت قراءة الصورة.",
  },
  en: {
    connectTitle: "Publishing",
    connectLead:
      "Every reading saved in the panel is published straight to the site, with its picture and recordings. Connect this device to GitHub once to allow it.",
    steps: [
      "Open a new token page on GitHub with the link below.",
      "Give it a name; choose the longest expiry or none.",
      "Repository access: Only select repositories, then pick avyavuzsarikaya-tech.github.io.",
      "Permissions: set Contents to Read and write.",
      "Press Generate token and paste the token here.",
    ],
    makeToken: "Create a token on GitHub",
    tokenLabel: "GitHub token",
    tokenHelp: "The token is kept only in this browser and can write only to this repository.",
    connect: "Connect",
    checking: "Checking…",
    connected: "This device can publish to the site.",
    disconnect: "Disconnect",
    badToken: "The token is not valid or has expired.",
    noAccess:
      "This token cannot write to the repository. Make sure you picked the repository and Contents: Read and write.",
    network: "GitHub could not be reached. Check the connection.",
    failed: "Could not publish.",
    needConnect: "To publish, first connect this device on the panel's front page.",
    publishing: "Publishing…",
    published: "Published. The site updates within a few minutes.",
    removed: "Removed. The site updates within a few minutes.",
    image: "Picture",
    imageHint:
      "The reading's painting. It appears under the title on the reading page and on the front page.",
    chooseImage: "Choose picture",
    replaceImage: "Replace picture",
    removeImage: "Remove picture",
    credit: "Caption (painter, work, year)",
    imageFail: "The picture could not be read.",
  },
  fr: {
    connectTitle: "Publication",
    connectLead:
      "Chaque lecture enregistrée dans le panneau est publiée directement sur le site, avec son image et ses enregistrements. Reliez cet appareil à GitHub une seule fois.",
    steps: [
      "Ouvrez une page de nouveau jeton sur GitHub avec le lien ci-dessous.",
      "Donnez-lui un nom ; choisissez l’échéance la plus longue ou aucune.",
      "Repository access : Only select repositories, puis choisissez avyavuzsarikaya-tech.github.io.",
      "Permissions : Contents en Read and write.",
      "Cliquez sur Generate token et collez le jeton ici.",
    ],
    makeToken: "Créer un jeton sur GitHub",
    tokenLabel: "Jeton GitHub",
    tokenHelp: "Le jeton reste dans ce navigateur et ne peut écrire que dans ce dépôt.",
    connect: "Relier",
    checking: "Vérification…",
    connected: "Cet appareil peut publier sur le site.",
    disconnect: "Déconnecter",
    badToken: "Le jeton n’est pas valide ou a expiré.",
    noAccess:
      "Ce jeton ne peut pas écrire dans le dépôt. Vérifiez le dépôt choisi et Contents : Read and write.",
    network: "GitHub est injoignable. Vérifiez la connexion.",
    failed: "Publication impossible.",
    needConnect: "Pour publier, reliez d’abord cet appareil depuis l’accueil du panneau.",
    publishing: "Publication…",
    published: "Publié. Le site se met à jour en quelques minutes.",
    removed: "Retiré. Le site se met à jour en quelques minutes.",
    image: "Image",
    imageHint:
      "Le tableau de la lecture. Il paraît sous le titre sur la page de lecture et en une.",
    chooseImage: "Choisir une image",
    replaceImage: "Remplacer l’image",
    removeImage: "Retirer l’image",
    credit: "Légende (peintre, œuvre, année)",
    imageFail: "L’image n’a pas pu être lue.",
  },
  es: {
    connectTitle: "Publicación",
    connectLead:
      "Cada lectura guardada en el panel se publica directamente en el sitio, con su imagen y sus grabaciones. Conecte este dispositivo a GitHub una sola vez.",
    steps: [
      "Abra una página de token nuevo en GitHub con el enlace de abajo.",
      "Póngale un nombre; elija el vencimiento más largo o ninguno.",
      "Repository access: Only select repositories y elija avyavuzsarikaya-tech.github.io.",
      "Permissions: Contents en Read and write.",
      "Pulse Generate token y pegue el token aquí.",
    ],
    makeToken: "Crear un token en GitHub",
    tokenLabel: "Token de GitHub",
    tokenHelp:
      "El token se guarda solo en este navegador y solo puede escribir en este repositorio.",
    connect: "Conectar",
    checking: "Comprobando…",
    connected: "Este dispositivo puede publicar en el sitio.",
    disconnect: "Desconectar",
    badToken: "El token no es válido o ha caducado.",
    noAccess:
      "Este token no puede escribir en el repositorio. Compruebe el repositorio elegido y Contents: Read and write.",
    network: "No se pudo llegar a GitHub. Compruebe la conexión.",
    failed: "No se pudo publicar.",
    needConnect: "Para publicar, conecte primero este dispositivo desde la portada del panel.",
    publishing: "Publicando…",
    published: "Publicado. El sitio se actualiza en unos minutos.",
    removed: "Retirado. El sitio se actualiza en unos minutos.",
    image: "Imagen",
    imageHint:
      "El cuadro de la lectura. Aparece bajo el título en la página de lectura y en la portada.",
    chooseImage: "Elegir imagen",
    replaceImage: "Cambiar imagen",
    removeImage: "Quitar imagen",
    credit: "Pie (pintor, obra, año)",
    imageFail: "No se pudo leer la imagen.",
  },
};

export function usePublishCopy(lang: Lang): PublishCopy {
  return PUBLISH[lang];
}
