"use strict";
import { toBanglaDigit } from "./bangla-date.js";

//https://www.lexilogos.com/keyboard/bengali.htm

export function hjbrlAge(date) {
  const now = new Date();
  const birthDate = new Date(date);
  const yyyy = now.getFullYear();
  const birthYyyy = birthDate.getFullYear();
  let age = yyyy - birthYyyy;
  let hAge = 0;
  const ubound = 40;
  const lbound = 10;
  let delta = 1;
  while (age > 0) {
    hAge += delta;
    if (delta === 1 && hAge >= ubound) delta = -1;
    if (delta === -1 && hAge <= lbound) delta = 1;
    age--;
  }
  return `হযবরল বয়েস: ${toBanglaDigit(hAge)} বছর (${
    delta === 1 ? "বাড়তি" : "কমতি"
  })`;
}
