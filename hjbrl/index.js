"use strict";
import { toBanglaDate } from "./bangla-date.js";
import { hjbrlAge } from "./hjbrl-age.js";

const _inputDate = document.querySelector("#input-date");
const _banglaDate = document.querySelector("#bangla-date");
const _hjbrlAge = document.querySelector("#hjbrl-age");

// if ("serviceWorker" in navigator) {
//   navigator.serviceWorker.register("./service-worker.js");
// }

document.addEventListener("DOMContentLoaded", () => {
  initialise();
});
function initialise() {
  _inputDate.addEventListener("change", (event) =>
    dateChange(event.target.value)
  );

  const now = new Date();
  const today = now.toISOString().substring(0, 10);
  _inputDate.setAttribute("value", today);
  dateChange(today);
}

function dateChange(date) {
  _banglaDate.textContent = `বাংলা দিন: ${toBanglaDate(date)}`;
  _hjbrlAge.textContent = hjbrlAge(date);
}
