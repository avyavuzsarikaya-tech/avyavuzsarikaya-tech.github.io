import type { Lang } from "@/lib/types";

/**
 * Terms of use, privacy policy and refund policy, in English and Turkish.
 *
 * `{publisher}` in a text is replaced with EDITORIAL.publisherName (src/lib/editorial.ts),
 * or with "Orbis" while that is empty. `{email}` is replaced with the contact address.
 * Other languages show the English text.
 */
export type LegalPage = "terms" | "privacy" | "refunds";

export const LEGAL_PAGES: readonly LegalPage[] = ["terms", "privacy", "refunds"];

type Section = { heading: string; paragraphs: string[] };
type Doc = { title: string; lead: string; sections: Section[] };

export const LEGAL_UPDATED = "2026-10-09";

const EN: Record<LegalPage, Doc> & { updated: string; footer: string; agree: string[] } = {
  updated: "Last updated",
  footer: "Legal",
  agree: ["Supporting membership is subject to the", "and the", "."],
  terms: {
    title: "Terms of use",
    lead: "These terms apply to everyone who reads, listens to or takes part in Orbis at orbisreadingatlas.com.",
    sections: [
      {
        heading: "Who we are",
        paragraphs: [
          "Orbis is a reading atlas: sourced, long-form readings on questions that outlast the news. Orbis is published by {publisher}. You can reach us at {email}.",
        ],
      },
      {
        heading: "Using the readings",
        paragraphs: [
          "The texts, recordings, pictures and videos on Orbis belong to their authors and to Orbis. You may read, listen, print and share links freely for your own, non-commercial use. Short quotations are welcome with the name Orbis and a link to the reading.",
          "Republishing a whole reading, a recording or a picture, or using them commercially, needs our written permission.",
        ],
      },
      {
        heading: "What the readings are, and are not",
        paragraphs: [
          "Every reading is built on the sources listed in its chain of documents, and we check them with care. Even so, the readings are general information. They are not legal, medical, financial or other professional advice, and they do not replace it.",
          "If you find an error, write to {email} with the address of the reading and the source concerned. We correct errors openly.",
        ],
      },
      {
        heading: "Membership and your account",
        paragraphs: [
          "Membership is free. You sign in with your e-mail address, which receives a one-time link and code. Keep access to that address to yourself; what is done from your account is your responsibility.",
          "We may suspend or close an account that breaks these terms. You may close your account at any time by writing to {email}.",
        ],
      },
      {
        heading: "Comments",
        paragraphs: [
          "Members may comment under the readings. Comments must stay on the subject and be civil. Insults, hate speech, threats, personal information about others, advertising and links are not allowed.",
          "Each comment is the responsibility of the member who wrote it. Comments that members report are hidden automatically, and the editors may remove any comment that breaks these rules.",
        ],
      },
      {
        heading: "Supporting membership and payment",
        paragraphs: [
          "Supporting membership gives access to the members-only readings and videos for as long as it is active. It is offered monthly or yearly at the prices shown on the payment page, and it renews automatically at the end of each period until you cancel.",
          "Payments are taken by our payment provider, which acts as the seller of record and may add taxes due in your country. Your card details go to the provider and are never seen or stored by Orbis.",
          "You can cancel at any time. Access continues until the end of the period you have paid for. Periods already paid for are not refunded; see the refund policy.",
        ],
      },
      {
        heading: "Changes",
        paragraphs: [
          "We may change these terms. The date at the top shows the latest version. If a change affects supporting members, we tell them by e-mail before it applies.",
        ],
      },
      {
        heading: "Law",
        paragraphs: [
          "These terms are governed by the laws of the Republic of Türkiye. The mandatory rights you have as a consumer under the law of your country are not affected.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy policy",
    lead: "Orbis collects as little about its readers as it can. This page says what is collected, why, and what you can do about it.",
    sections: [
      {
        heading: "Who is responsible",
        paragraphs: [
          "The data controller is {publisher}, publisher of Orbis. For anything about your data, write to {email}.",
        ],
      },
      {
        heading: "Reading without an account",
        paragraphs: [
          "You can read and listen without giving us anything. Orbis uses no advertising and no tracking cookies.",
          "Your browser keeps a few choices on your own device so the site remembers them: language, colour scheme, playback speed and the state of the menu. They are not sent to us.",
          "Our hosting provider, Cloudflare, processes the technical data every website receives (such as IP address and browser type) to deliver the pages and protect the site from attacks.",
        ],
      },
      {
        heading: "Members",
        paragraphs: [
          "When you join, we keep your e-mail address, the name you choose for your comments, your comments, and your membership status. We use them to run your account and the comment section.",
          "The legal basis is the performance of our agreement with you (KVKK article 5/2-c; GDPR article 6(1)(b)).",
        ],
      },
      {
        heading: "Supporting members",
        paragraphs: [
          "Payments are handled by our payment provider. It receives your card details; we do not. From the provider we receive your name, e-mail address, country, the plan you chose and whether your membership is active. We keep payment records for as long as tax law requires.",
        ],
      },
      {
        heading: "Newsletter",
        paragraphs: [
          "If you subscribe to the newsletter, we keep your e-mail address to send it, on the basis of your consent. Every newsletter has a link to unsubscribe, and unsubscribing deletes your address from the list.",
        ],
      },
      {
        heading: "Who else processes the data",
        paragraphs: [
          "We use a small number of service providers: Cloudflare (hosting), Supabase (member accounts and comments), an e-mail delivery service (sign-in codes and the newsletter) and our payment provider. They process data only on our instructions.",
          "Some of these providers keep data on servers outside Türkiye, including in the European Union and the United States. Where the law requires it, such transfers are made with your explicit consent or under the safeguards the law provides (KVKK article 9; GDPR chapter V).",
        ],
      },
      {
        heading: "How long we keep it",
        paragraphs: [
          "Account data is kept until you close your account. Comments are kept with the reading they belong to; when an account is closed, its comments are deleted. Newsletter addresses are kept until you unsubscribe.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: [
          "You may ask whether we process data about you, receive a copy, have it corrected or deleted, object to its processing and withdraw consent at any time (KVKK article 11; GDPR articles 15 to 21). Write to {email}; we answer within thirty days.",
          "You may also complain to the Turkish Personal Data Protection Authority (KVKK) or, in the European Union, to the data protection authority of your country.",
        ],
      },
    ],
  },
  refunds: {
    title: "Refund policy",
    lead: "You can cancel supporting membership at any time. Periods already paid for are not refunded.",
    sections: [
      {
        heading: "Cancelling",
        paragraphs: [
          "You can cancel from the link in your payment receipt or by writing to {email}. Cancelling stops the next payment; access to the members-only readings and videos continues until the end of the period you have paid for. Your free membership stays.",
        ],
      },
      {
        heading: "Refunds",
        paragraphs: [
          "Payments for monthly or yearly periods are not refunded, and no partial refund is made for the unused part of a period.",
        ],
      },
      {
        heading: "Payment errors",
        paragraphs: [
          "If you are charged twice for the same period, or charged after cancelling, write to {email} from the address you used to pay. The wrongly charged amount is returned to the card you paid with.",
        ],
      },
    ],
  },
};

const TR: typeof EN = {
  updated: "Son güncelleme",
  footer: "Yasal",
  agree: ["Destekçi üyeliğe", "ve", "uygulanır."],
  terms: {
    title: "Kullanım şartları",
    lead: "Bu şartlar, orbisreadingatlas.com adresindeki Orbis'i okuyan, dinleyen ya da Orbis'e katılan herkes için geçerlidir.",
    sections: [
      {
        heading: "Biz kimiz",
        paragraphs: [
          "Orbis bir okuma atlasıdır: gündemden uzun ömürlü sorulara kaynaklara dayalı, uzun okumalar. Orbis'in yayıncısı: {publisher}. Bize {email} adresinden ulaşabilirsiniz.",
        ],
      },
      {
        heading: "Okumaların kullanımı",
        paragraphs: [
          "Orbis'teki metinler, ses kayıtları, görseller ve videolar yazarlarına ve Orbis'e aittir. Kişisel ve ticari olmayan kullanımınız için okuyabilir, dinleyebilir, yazdırabilir ve bağlantılarını serbestçe paylaşabilirsiniz. Orbis adı ve okumanın bağlantısı verilerek kısa alıntı yapılabilir.",
          "Bir okumanın, ses kaydının ya da görselin bütün olarak yeniden yayımlanması veya ticari amaçla kullanılması yazılı iznimize bağlıdır.",
        ],
      },
      {
        heading: "Okumalar ne değildir",
        paragraphs: [
          "Her okuma, belge zincirinde gösterilen kaynaklara dayanır ve bu kaynaklar özenle kontrol edilir. Yine de okumalar genel bilgi niteliğindedir; hukuki, tıbbi, mali ya da başka bir mesleki tavsiye değildir ve onun yerini tutmaz.",
          "Bir yanlışlık görürseniz okumanın adresini ve ilgili kaynağı {email} adresine yazın. Düzeltmeler açıkça yapılır.",
        ],
      },
      {
        heading: "Üyelik ve hesabınız",
        paragraphs: [
          "Üyelik ücretsizdir. E-posta adresinizle giriş yaparsınız; bu adrese tek kullanımlık bir bağlantı ve kod gönderilir. Bu adrese erişimi yalnız kendinizde tutun; hesabınızdan yapılan işlemlerden siz sorumlusunuz.",
          "Bu şartlara aykırı kullanılan bir hesap askıya alınabilir veya kapatılabilir. Hesabınızı dilediğiniz zaman {email} adresine yazarak kapatabilirsiniz.",
        ],
      },
      {
        heading: "Yorumlar",
        paragraphs: [
          "Üyeler okumaların altına yorum yazabilir. Yorumlar konuyla ilgili ve saygılı olmalıdır. Hakaret, nefret söylemi, tehdit, başkalarına ait kişisel bilgiler, reklam ve bağlantı yasaktır.",
          "Her yorumun sorumluluğu onu yazan üyeye aittir. Üyelerin bildirdiği yorumlar kendiliğinden gizlenir; editörler bu kurallara aykırı her yorumu kaldırabilir.",
        ],
      },
      {
        heading: "Destekçi üyelik ve ödeme",
        paragraphs: [
          "Destekçi üyelik, etkin olduğu sürece üyelere özel okumalara ve videolara erişim sağlar. Ödeme sayfasında gösterilen fiyatlarla aylık ya da yıllık olarak sunulur ve iptal edilinceye kadar her dönemin sonunda kendiliğinden yenilenir.",
          "Ödemeler, satıcı sıfatıyla hareket eden ödeme hizmet sağlayıcımız tarafından alınır; sağlayıcı bulunduğunuz ülkede ödenmesi gereken vergileri ekleyebilir. Kart bilgileriniz doğrudan sağlayıcıya iletilir; Orbis bu bilgileri görmez ve saklamaz.",
          "Üyeliğinizi dilediğiniz zaman iptal edebilirsiniz. Erişiminiz ödemesini yaptığınız dönemin sonuna kadar sürer. Ödemesi yapılmış dönemler için iade yapılmaz; ayrıntılar iade politikasındadır.",
        ],
      },
      {
        heading: "Değişiklikler",
        paragraphs: [
          "Bu şartlar değiştirilebilir. Sayfanın başındaki tarih son sürümü gösterir. Destekçi üyeleri etkileyen bir değişiklik, yürürlüğe girmeden önce kendilerine e-postayla bildirilir.",
        ],
      },
      {
        heading: "Uygulanacak hukuk",
        paragraphs: [
          "Bu şartlara Türkiye Cumhuriyeti hukuku uygulanır. Tüketici olarak kendi ülkenizin hukukundan doğan emredici haklarınız saklıdır.",
        ],
      },
    ],
  },
  privacy: {
    title: "Gizlilik politikası",
    lead: "Orbis okurları hakkında olabildiğince az bilgi toplar. Bu sayfa neyin, neden toplandığını ve bu konuda neler yapabileceğinizi anlatır.",
    sections: [
      {
        heading: "Veri sorumlusu",
        paragraphs: [
          "Veri sorumlusu: {publisher} (Orbis'in yayıncısı). Verilerinizle ilgili her konuda {email} adresine yazabilirsiniz.",
        ],
      },
      {
        heading: "Hesapsız okuma",
        paragraphs: [
          "Hiçbir bilgi vermeden okuyabilir ve dinleyebilirsiniz. Orbis reklam ve takip çerezi kullanmaz.",
          "Tarayıcınız, sitenin tercihlerinizi hatırlaması için bazı seçimleri kendi cihazınızda saklar: dil, renk teması, oynatma hızı ve menünün durumu. Bunlar bize gönderilmez.",
          "Barındırma hizmeti sağlayıcımız Cloudflare, sayfaları ulaştırmak ve siteyi saldırılara karşı korumak için her web sitesine gelen teknik verileri (IP adresi, tarayıcı türü gibi) işler.",
        ],
      },
      {
        heading: "Üyeler",
        paragraphs: [
          "Üye olduğunuzda e-posta adresiniz, yorumlarınızda görünmesini seçtiğiniz ad, yorumlarınız ve üyelik durumunuz saklanır. Bunlar hesabınızı ve yorum bölümünü yürütmek için kullanılır.",
          "Hukuki sebep, sizinle aramızdaki sözleşmenin ifasıdır (KVKK m. 5/2-c; GDPR m. 6/1-b).",
        ],
      },
      {
        heading: "Destekçi üyeler",
        paragraphs: [
          "Ödemeler ödeme hizmet sağlayıcımız tarafından yürütülür. Kart bilgileriniz sağlayıcıya iletilir, bize gelmez. Sağlayıcıdan adınız, e-posta adresiniz, ülkeniz, seçtiğiniz plan ve üyeliğinizin etkin olup olmadığı bilgisi gelir. Ödeme kayıtları vergi mevzuatının öngördüğü süre boyunca saklanır.",
        ],
      },
      {
        heading: "Bülten",
        paragraphs: [
          "Bültene kaydolursanız e-posta adresiniz, açık rızanıza dayanarak, bülteni göndermek için saklanır. Her bültende abonelikten çıkma bağlantısı bulunur; çıktığınızda adresiniz listeden silinir.",
        ],
      },
      {
        heading: "Verileri işleyen diğer taraflar",
        paragraphs: [
          "Az sayıda hizmet sağlayıcıyla çalışıyoruz: Cloudflare (barındırma), Supabase (üye hesapları ve yorumlar), bir e-posta gönderim hizmeti (giriş kodları ve bülten) ve ödeme hizmet sağlayıcımız. Bu sağlayıcılar verileri yalnız bizim talimatımızla işler.",
          "Bu sağlayıcılardan bazıları verileri Avrupa Birliği ve Amerika Birleşik Devletleri dahil Türkiye dışındaki sunucularda tutar. Kanunun aradığı hâllerde bu aktarımlar açık rızanızla ya da kanunun öngördüğü güvencelerle yapılır (KVKK m. 9; GDPR V. bölüm).",
        ],
      },
      {
        heading: "Saklama süresi",
        paragraphs: [
          "Hesap verileri, hesabınızı kapatana kadar saklanır. Yorumlar ait oldukları okumayla birlikte durur; hesap kapatıldığında o hesabın yorumları silinir. Bülten adresleri abonelikten çıkılana kadar saklanır.",
        ],
      },
      {
        heading: "Haklarınız",
        paragraphs: [
          "Hakkınızda veri işlenip işlenmediğini öğrenme, bir kopyasını alma, düzeltilmesini veya silinmesini isteme, işlenmesine itiraz etme ve rızanızı dilediğiniz zaman geri alma haklarına sahipsiniz (KVKK m. 11; GDPR m. 15-21). Başvurularınızı {email} adresine yazabilirsiniz; otuz gün içinde yanıt verilir.",
          "Kişisel Verileri Koruma Kurumu'na ya da Avrupa Birliği'nde bulunuyorsanız kendi ülkenizin veri koruma otoritesine şikâyette bulunabilirsiniz.",
        ],
      },
    ],
  },
  refunds: {
    title: "İade politikası",
    lead: "Destekçi üyeliği dilediğiniz zaman iptal edebilirsiniz. Ödemesi yapılmış dönemler için iade yapılmaz.",
    sections: [
      {
        heading: "İptal",
        paragraphs: [
          "Üyeliğinizi ödeme makbuzunuzdaki bağlantıdan ya da {email} adresine yazarak iptal edebilirsiniz. İptal bir sonraki ödemeyi durdurur; üyelere özel okumalara ve videolara erişiminiz ödemesini yaptığınız dönemin sonuna kadar sürer. Ücretsiz üyeliğiniz devam eder.",
        ],
      },
      {
        heading: "İade",
        paragraphs: [
          "Aylık ya da yıllık dönemler için yapılan ödemeler iade edilmez; dönemin kullanılmayan kısmı için kısmi iade yapılmaz.",
        ],
      },
      {
        heading: "Hatalı ödemeler",
        paragraphs: [
          "Aynı dönem için iki kez ya da iptalden sonra ücret alınmışsa ödemede kullandığınız adresten {email} adresine yazın. Hatalı alınan tutar ödeme yaptığınız karta iade edilir.",
        ],
      },
    ],
  },
};

export function legalCopy(lang: Lang) {
  return lang === "tr" ? TR : EN;
}
