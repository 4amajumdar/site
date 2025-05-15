"use strict";
import { streamCsv } from "./readfile.js";
import { draw } from "./drawTree.js";
import { _removeChildren, _select, _selectAll, showError } from "./common.js";
//Tech debt: clean code
//introduce page
//include comments
//fix print view

const presets = {},
  PRESET_MENU_PREFIX = "preset-";
let fileWithData,
  view = "left-right";

document.addEventListener("DOMContentLoaded", () => {
  addMenuListeners();
  setPresets()
  // console.log(presets, firstKey);
  // showPresetFile(firstKey);
  
});
function addMenuListeners() {
  const menus = _selectAll(".menu");
  for (const menu of menus) {
    menu.addEventListener("click", (e) => menuClicks(e));
  }
}
function menuClicks(e) {
  const menuId = e.target.id;
  showNav(false);
  // if (menuId === "close") showNav(false);
  if (menuId === "show") showNav(true);
  if (menuId === "load-file") showLoadFileDialog();
  if (menuId === "set-view-left-right") setView("left-right");
  if (menuId === "set-view-top-down") setView("top-down");
  if (menuId === "show-gen") toggleGen();
  if (menuId.substring(0, PRESET_MENU_PREFIX.length) === PRESET_MENU_PREFIX)
    showPresetFile(menuId.replace(PRESET_MENU_PREFIX, ""));
}
async function getPreset(param) {
  if (!param) {
    await new Promise((resolve) => resolve(true));
    return {};
  }

  const masterConfig =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRCuYHYbpKul9EY6MNL5opCrpkqDFEZ_wI_5WFQvrThHmXnLzUxOduVagbzTuJ8gxAPFD8XY-UdkU23/pub?gid=0&single=true&output=csv";
  const preset = {};

  const presetToMatch = param.trim().toLowerCase();
  let collectPreset = false;
  await new Promise((resolve) => {
    streamCsv(
      masterConfig,
      { hasHeaders: false },
      ({ action, data, error, count }) => {
        if (action === "step") {
          if (data[0] === "" && collectPreset) {
            preset[data[1]] = data[2];
          }

          if (data[0] !== "")
            if (data[0].toLowerCase() === presetToMatch) collectPreset = true;
            else collectPreset = false;
        }
        if (action === "error") {
          showError("Unbale to load config. " + error);
          resolve(false);
        }
        if (action === "end") {
          resolve(true);
        }
      }
    );
  });
  return preset;
}

async function showPresetFile(key) {
  if (!presets[key]) return;
  fileWithData = presets[key];
  showSpinner(true);
  console.log(key);
  await draw(fileWithData, view);
  showSpinner(false);
}
async function setView(newView) {
  if (view === newView) return;
  view = newView;
  showSpinner(true);
  await draw(fileWithData, view); //.then(showSpinner(false));
  showSpinner(false);
}

async function setPresets() {
  for (const key in presets) delete presets[key];

  const params = new URLSearchParams(window.location.search);
  const presetParam = params.get("preset");
  if (presetParam) {
    const externalPresets = await getPreset(presetParam);
    for (const key in externalPresets)
      if (key[0] !== "$") presets[key] = externalPresets[key];
  }
  presets["Example"] =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSQqvT3WCpTuIlqLcqBYDRoF4Wi8tNVM4-Xu-A6sm_r4kioWKhgTLiwdFm37Fr6uPzPU3Uafl54XBmP/pub?gid=0&single=true&output=csv";
  setPresetMenus();
  showPresetFile(Object.keys(presets)[0])

  function setPresetMenus() {
    const presetDiv = _removeChildren("#presets");
    for (const key in presets) {
      const a = document.createElement("a");
      a.href = "#";
      a.textContent = key;
      a.id = PRESET_MENU_PREFIX + key;
      a.setAttribute("class", "menu");
      a.addEventListener("click", (e) => {
        menuClicks(e);
        // showNav(false);
        // showPresetFile(key);
      });
      presetDiv.append(a);
    }
  }
}

function showNav(show) {
  _select(".sidenav").style.width = show ? "15rem" : "0";
}
function showSpinner(show) {
  _select("#loading").style.visibility = show ? "" : "hidden";
  _select("main").style.visibility = show ? "hidden" : "";
}

function toggleGen() {
  const trees = _select("#trees");
  trees.classList.toggle("show-generation");
  const showGeneration = trees.classList.contains("show-generation");
  const menu = _select("#show-gen");
  menu.textContent = showGeneration ? "Hide generation" : "Show generation";
}

function showLoadFileDialog() {
  const input = _select("#file-input");

  input.addEventListener("change", (event) => {
    const file = event.target.files[0];
    const blob = URL.createObjectURL(file);
    presets["Local file"] = blob;
    showPresetFile("Local file");
  });

  input.click();
}
