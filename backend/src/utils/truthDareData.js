/**
 * Truth or Dare card data - SPECIAL 5 MONTHS ANNIVERSARY EDITION!
 * Lives on the backend so the server remains the single source of truth.
 */

const truthCards = [
  // --- LEVEL 1: Baper & Throwback (Anniversary Vibes) ---
  { id: 't_01', type: 'truth', text: 'Selamat 5 bulan, sayang! Apa satu momen di awal kita kenal yang bikin lu mikir, "Wah, gua kaga salah pilih cowok"?' },
  { id: 't_02', type: 'truth', text: 'Selama 5 bulan ini, sebutin satu hal kecil dari gua yang sukses bikin lu jatuh cinta lebih dalam lagi.' },
  { id: 't_03', type: 'truth', text: 'Jujur, dari semua malam kita VC-an, malam mana yang paling berkesan dan bikin lu susah tidur?' },
  { id: 't_04', type: 'truth', text: 'Apa perubahan paling positif yang lu rasain di diri lu semenjak kita jadian 5 bulan lalu?' },
  { id: 't_05', type: 'truth', text: 'Kalo hari ini kita kaga LDR dan bisa ngerayain bareng, apa hal pertama yang pengen lu lakuin pas liat gua?' },
  { id: 't_06', type: 'truth', text: 'Apa ketakutan terbesar lu di awal hubungan kita, yang sekarang udah hilang gara-gara gua?' },
  { id: 't_07', type: 'truth', text: 'Bagian mana dari fisik atau sifat gua yang dulunya lu biasa aja, tapi sekarang lu candu banget?' },
  
  // --- LEVEL 2: Deep & Intimate ---
  { id: 't_08', type: 'truth', text: 'Jujur, seberapa sering lu nangis atau sedih sendirian karena nahan kangen pengen dipeluk selama 5 bulan ini?' },
  { id: 't_09', type: 'truth', text: 'Apa satu hal yang belum pernah lu ceritain ke gua karena malu, tapi sebenernya pengen banget gua tau?' },
  { id: 't_10', type: 'truth', text: 'Kalau kita lagi kangen-kangenan di chat, pernah kaga lu sampai senyum-senyum sendiri meluk bantal?' },
  { id: 't_11', type: 'truth', text: 'Apa ekspektasi lu buat hubungan kita ke depannya setelah ngelewatin 5 bulan pertama ini?' },
  
  // --- LEVEL 3: Spicy & 18+ (Teasing) ---
  { id: 't_12', type: 'truth', text: 'Kalo kita rayain anniversary ini berdua aja di dalem kamar yang dikunci, adegan apa yang bakal terjadi?' },
  { id: 't_13', type: 'truth', text: 'Jujur, pernah kaga lu ngerasa "kepanasan" atau *turn on* cuma gara-gara denger suara gua pas VC?' },
  { id: 't_14', type: 'truth', text: 'Apa fantasi terliar lu tentang kita berdua buat nebus waktu LDR 5 bulan ini pas kita ketemu nanti?' },
  { id: 't_15', type: 'truth', text: 'Dari 1 sampai 10, seberapa pengen lu ngerasain bibir gua sekarang juga?' },
  { id: 't_16', type: 'truth', text: 'Gaya ciuman atau sentuhan kayak gimana yang selalu lu bayangin tiap kali lu lagi kangen berat sama gua?' },
  { id: 't_17', type: 'truth', text: 'Kalo gua ada di sebelah lu sekarang, bagian tubuh gua mana yang bakal lu pegang duluan?' },
  { id: 't_18', type: 'truth', text: 'Pernah ngebayangin kaga kita mandi bareng? Kalo iya, ceritain dikit dong apa yang lu bayangin!' },
  { id: 't_19', type: 'truth', text: 'Apa hal paling nakal yang pernah lewat di otak lu pas lagi ngeliatin muka gua di layar HP?' },
  { id: 't_20', type: 'truth', text: 'Kalo gua ngasih lu izin buat ngelakuin SATU hal kotor ke gua sekarang, lu mau ngapain?' },
];

const dareCards = [
  // --- LEVEL 1: Sweet & Romantic ---
  { id: 'd_01', type: 'dare', text: 'VN ke gua sekarang, ucapin "Happy Anniversary Ndut/Tuan Putri love you moreeee" pake nada yang paling manja.' },
  { id: 'd_02', type: 'dare', text: 'Bikin "Kupon Spesial" di selembar kertas (misal: Kupon Peluk, Kupon Pijat), fotoin ke gua. Nanti gua tuker pas kita ketemu!' },
  { id: 'd_03', type: 'dare', text: 'Tatap mata gua di VC selama 1 menit tanpa ngomong apa-apa. Biarin mata lu yang ngasih tau seberapa sayang lu sama gua.' },
  { id: 'd_04', type: 'dare', text: 'Kirim satu foto lama kita atau *screenshot* chat awal-awal kita deket, terus ceritain kenapa itu spesial buat lu.' },
  { id: 'd_05', type: 'dare', text: 'Tulis pesan cinta 3 kalimat yang ngegambarin perasaan lu selama 5 bulan ini, kirim di chat sekarang.' },
  
  // --- LEVEL 2: Flirty & Teasing ---
  { id: 'd_06', type: 'dare', text: 'Kirim foto *selfie* lu saat ini juga dengan senyum paling manis khusus buat ngerayain 5 bulan kita.' },
  { id: 'd_07', type: 'dare', text: 'Kasih gua satu janji manis (tapi agak nakal) yang bakal lu tepatin pas kita akhirnya ketemu nanti.' },
  { id: 'd_08', type: 'dare', text: 'Deskripsiin secara detail banget, *outfit* apa yang bakal lu pake pas kita *date* pertama kali setelah LDR ini.' },
  { id: 'd_09', type: 'dare', text: 'VN nyanyiin satu bait lagu yang liriknya paling pas buat ngegambarin kita berdua saat ini.' },
  { id: 'd_10', type: 'dare', text: 'Tutup mata lu sekarang, bayangin gua lagi meluk lu dari belakang nyium leher lu. Ceritain apa yang lu rasain.' },
  
  // --- LEVEL 3: Hot & 18+ (Action) ---
  { id: 'd_11', type: 'dare', text: 'Kirim VN berbisik deket banget ke *mic* HP: "Aku pengen banget kamu lakuin [isi sendiri] ke aku sekarang."' },
  { id: 'd_12', type: 'dare', text: 'Kasih liat ke kamera (VC) bagian tubuh lu yang paling lu banggain dan pengen banget gua sentuh.' },
  { id: 'd_13', type: 'dare', text: 'Ambil lipstik atau dandan dikit, terus kirim video *kiss bye* yang paling menggoda buat gua.' },
  { id: 'd_14', type: 'dare', text: 'Lu jadi "Bos" selama 5 menit. Kasih perintah apapun yang berbau nakal ke gua, dan gua harus nurut.' },
  { id: 'd_15', type: 'dare', text: 'Kirim foto *outfit* paling seksi/santai yang lagi lu pake sekarang di kamar (no edit!).' },
  { id: 'd_16', type: 'dare', text: 'Ambil HP lu, rekam VN suara napas lu yang agak berat selama 10 detik sambil mikirin gua, kirim sekarang.' },
  { id: 'd_17', type: 'dare', text: 'Jawab jujur: Kalo malem ini kita tidur bareng, posisi lu meluk gua bakal kayak gimana?' },
  { id: 'd_18', type: 'dare', text: 'Ketikin satu skenario *roleplay* singkat (3-4 kalimat) yang pengen lu lakuin sama gua di ranjang.' },
  { id: 'd_19', type: 'dare', text: 'Panggil nama gua pake desahan pelan di VN. Bikin gua merinding dengernya.' },
  { id: 'd_20', type: 'dare', text: 'Tantangan 10 menit: Longgarin baju atau celana lu dikit pas VC, bikin gua penasaran tapi jangan diliatin full!' },

  // --- LEVEL TAMBAHAN ---
  { id: 'd_21', type: 'dare', text: 'Udud depan emak pas vc.' },
  { id: 'd_22', type: 'dare', text: 'sharescreen genre bokep terfav dan kenapa pilih itu.' },
  { id: 'd_23', type: 'dare', text: 'dalam 1 bulan kedepan yang berat badannya turun wajib membelikan apapun yang pasangannya mau.' },
  { id: 'd_24', type: 'dare', text: 'lu jadi "Bos" selama 1x24 jam, kasih perintah apapun yang berbau nakal dan harus jawab iya sayang' },
  { id: 'd_25', type: 'dare', text: 'sebutkan mantan terindah' },
  { id: 'd_21', type: 'dare', text: '' },
];

module.exports = { truthCards, dareCards };