/**
 * bengali names were taken from https://github.com/nuhil/bangla-calendar - MIT licensed
 */

const MONTHS = [
  "বৈশাখ",
  "জ্যৈষ্ঠ",
  "আষাঢ়",
  "শ্রাবণ",
  "ভাদ্র",
  "আশ্বিন",
  "কার্তিক",
  "অগ্রহায়ণ",
  "পৌষ",
  "মাঘ",
  "ফাল্গুন",
  "চৈত্র",
];
const daysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 29, 30];
const DAYS = [
  "রবিবার",
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
  "শনিবার",
];

const DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

// let banglas;

// const createBanglas = () => {
//   banglas = DIGITS.reduce((o, c, i) => {
//     o[c] = i;
//     return o;
//   }, {});
// };

export const toBanglaDigit = (number) =>
  String(number).replace(/\d/g, (digit) => DIGITS[digit]);

// export const banglaToDigit = (bangla) => {
//   if (!banglas) createBanglas(); // memoize
//   const month = MONTHS.indexOf(bangla);
//   const str =
//     month !== -1
//       ? month + 1
//       : String(bangla).replace(/./g, (bangla) => {
//           const r = banglas[bangla];
//           return r !== undefined ? r : bangla;
//         });
//   return Number(str);
// };

export function toBanglaDate(date) {
  const gregorian = new Date(date);

  const yyyy = Number(gregorian.getFullYear());
  const mm = Number(gregorian.getMonth());
  const dd = Number(gregorian.getDate());
  const d = Number(gregorian.getDay());
  if (isNaN(yyyy) || isNaN(mm) || isNaN(dd)) return "";
  const isBongPreNy = mm < 3 || (mm === 3 && dd <= 14);
  const bongYear = yyyy - (isBongPreNy ? 594 : 593);
  const isLeapYear = (yyyy % 4 === 0 && yyyy % 100 !== 0) || yyyy % 400 === 0;

  const bongNyStart = new Date(yyyy - (isBongPreNy ? 1 : 0), 3, 13);

  let elapsedDays = (gregorian - bongNyStart) / (24 * 60 * 60 * 1000);
  elapsedDays = Math.floor(elapsedDays);

  let bongMonth = 0;

  daysInMonth.forEach((v, i) => {
    const daysInThismonth = isLeapYear && i === 10 ? 31 : v;
    if (elapsedDays > daysInThismonth) {
      elapsedDays = elapsedDays - daysInThismonth;
      if (bongMonth === 11) bongMonth = 0;
      else bongMonth++;
    }
  });

  return (
    DAYS[d] +
    " " +
    toBanglaDigit(elapsedDays) +
    " " +
    MONTHS[bongMonth] +
    " " +
    toBanglaDigit(bongYear)
  );
}
