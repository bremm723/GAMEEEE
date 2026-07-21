/**
 * Local mirror of the Truth or Dare card pool. The backend is the source of
 * truth for which card is actually drawn (see backend/src/utils/truthDareData.js);
 * this copy is used for lightweight client-side previews such as the card-back
 * flip animation placeholder before the real card payload arrives.
 */

export const truthCards = [
  { id: 't_01', type: 'truth', text: 'Apa momen paling berkesan waktu kita pertama kali ketemu?' },
  { id: 't_02', type: 'truth', text: 'Apa hal kecil yang aku lakukan yang bikin kamu jatuh cinta lebih dalam?' },
  { id: 't_03', type: 'truth', text: 'Kapan terakhir kali kamu kangen banget sama aku dan gak bilang?' },
  { id: 't_04', type: 'truth', text: 'Apa satu ketakutan terbesar kamu soal hubungan jarak jauh kita?' },
  { id: 't_05', type: 'truth', text: 'Kalau bisa teleport sekarang, apa hal pertama yang mau kamu lakukan sama aku?' },
];

export const dareCards = [
  { id: 'd_01', type: 'dare', text: 'Kirim voice note nyanyi lagu favorit kita sekarang juga.' },
  { id: 'd_02', type: 'dare', text: 'Kirim foto/selfie kamu saat ini, tanpa persiapan!' },
  { id: 'd_03', type: 'dare', text: 'Tulis pesan cinta 3 kalimat dan kirim sekarang.' },
  { id: 'd_04', type: 'dare', text: 'Video call selama 30 detik dan bilang alasan kamu sayang aku.' },
  { id: 'd_05', type: 'dare', text: 'Ceritakan mimpi paling absurd yang pernah kamu punya soal kita.' },
];

export function getCardBack(type) {
  return type === 'dare' ? 'DARE' : 'TRUTH';
}
