"use strict";
//Tech debt: clean code
//introduce page
//include comments
//fix file name, error
//fix print view
document.addEventListener("DOMContentLoaded", () => {
  showSpinner(true);
  setPreset();
});
async function getPreset(presetParam) {
  const masterConfig =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRCuYHYbpKul9EY6MNL5opCrpkqDFEZ_wI_5WFQvrThHmXnLzUxOduVagbzTuJ8gxAPFD8XY-UdkU23/pub?gid=0&single=true&output=csv";
  const preset = {};
  if (!presetParam) return preset;
  const presetToMatch = presetParam.trim().toLowerCase();
  let collectPreset = false;
  await new Promise((resolve, reject) => {
    streamCsvRecords(
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
        if (action === "end") resolve(true);
      }
    );
  });

  return preset;
}
const presets = {};
function getPresetFile(key) {
  showNav(false);
  if (!presets[key]) return;
  const presetDiv = removeChildElements("#presets");
  for (const key in presets) {
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = key;
    a.setAttribute("onclick", `getPresetFile("${key}")`);
    presetDiv.append(a);
  }
  fileWithData = presets[key];
  showSpinner(true);
  $.draw();
  //showSpinner(false);
}
async function setPreset() {
  for (const key in presets) delete presets[key];

  const params = new URLSearchParams(window.location.search);
  const presetParam = params.get("preset");
  const externalPresets = await getPreset(presetParam);
  for (const key in externalPresets)
    if (key[0] !== "$") presets[key] = externalPresets[key];
  presets["Example"] =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSQqvT3WCpTuIlqLcqBYDRoF4Wi8tNVM4-Xu-A6sm_r4kioWKhgTLiwdFm37Fr6uPzPU3Uafl54XBmP/pub?gid=0&single=true&output=csv";
  getPresetFile(Object.keys(presets)[0]);
}

function showNav(show) {
  document.querySelector(".sidenav").style.width = show ? "15rem" : "0";
}
function showSpinner(show) {
  document.querySelector("#loading").style.visibility = show ? "" : "hidden";
  document.querySelector("main").style.visibility = show ? "hidden" : "";
}

let fileWithData;
function showError(err) {
  const error = document.querySelector("#error");
  error.textContent = typeof err === "string" ? err : JSON.stringify(err);
}

const $ = (function () {
  let currentFile;
  let individuals = [];
  let view = "left-right";
  const startID = 0;
  return { setView, draw, getLineage, search };

  function getDisplayName(id) {
    const { name, aka } = individuals[id];
    return name + (aka ? ` (${aka})` : "");
  }
  function show(id) {
    // const viewType = document.querySelector("#viewType").value;
    // //if (viewType === "tree") drawTopDown()
    // if (viewType === "lineage") {
    //   const ancestors = $.getLineage(Number(id), "up");
    //   ancestors.pop();
    //   const decendents = $.getLineage(Number(id));
    //   const lineage = [...ancestors, ...decendents];
    //   drawLineage(lineage);
    // }
    //if (viewType === "print") drawPrint()

    const div = document.querySelector("#id" + id);
    if (!div) return;
    div.classList.add("selected");
    div.scrollIntoView();
  }
  function setView(newView) {
    if (view === newView) return;
    view = newView;
    draw();
  }
  async function draw(id) {
    const fileURL = fileWithData;

    if (currentFile !== fileURL) {
      await readCsvFile(fileURL, callback, individuals);
      individuals = xxx.map((v) => v);
      currentFile = fileURL;
    }
    removeChildElements("#tree");
    drawHeadersNotess();
    if (param.error) return;
    drawLoadedFile();
    showSpinner(false);
    function drawHeadersNotess() {
      {
        // const fileName = removeChildElements("#file-name");
        // const a = document.createElement("a")
        // a.textContent = "File in use"
        // a.href = fileWithData
        // a.target = "_blank"
        // fileName.append(a)
      }
      console.log(param);
      const title = removeChildElements("#main-title");
      const comment = removeChildElements("#comments");
      const notes = removeChildElements("#notes");
      const error = removeChildElements("#error");
      const warning = removeChildElements("#warning");
      if (param.error) {
        showError(param.error);
        return;
      }

      title.textContent = param.title;

      if (param.notes.length > 0) {
        if (param.notes.length === 1)
          notes.textContent = "Note: " + param.notes[0];
        else {
          const p = document.createElement("p");
          p.textContent = "Notes:";
          notes.append(p);
          const ol = document.createElement("ol");
          for (const note of param.notes) {
            const li = document.createElement("li");
            li.textContent = note;
            ol.append(li);
          }
          notes.append(ol);
        }
      }
    }
    function drawLoadedFile() {
      const div = document.querySelector("#tree");
      div.removeAttribute("class");
      div.setAttribute("class", view);
      if (view === "top-down") drawTopDown();
      // if (view === "lineage") drawLineage(id);
      if (view === "left-right") drawRightLeft();
    }
  }
  //abhijit.majumdar@no-code-dashboard.com
  //noCodeDash20230217

  function newDrawIndividual(individual, options = {}, drawSposue = false) {
    const defaultStyles = {}; //{ textAlign: "center", cursor: "default" };
    const styles = { ...defaultStyles, ...options.styles };
    // const individual = individuals[id];
    const person = document.createElement("div");
    const { name, gender, aka, ID, spouse } = individual;
    const first = document.createElement("span");
    first.classList.add(gender ? gender : "M");
    first.textContent = name + (aka ? ` (${aka})` : "");
    person.append(first);
    if (spouse && drawSposue) {
      const plus = document.createElement("span");
      plus.textContent = " + ";
      person.append(plus);
      const second = document.createElement("span");
      const { name, gender, aka } = spouse;
      second.classList.add(gender ? gender : "M");
      second.textContent = name + (aka ? ` (${aka})` : "");
      person.append(second);
    }
    person.setAttribute("class", "person");
    if (ID) person.setAttribute("id", "id" + ID);
    for (const style in styles) person.style[style] = styles[style];
    return person;
  }

  function hasFamily(id) {
    // if (hasSpouse(id)) return true;
    const children = getChildren(id);
    return children.length > 0 || hasSpouse(id);
  }
  function hasSpouse(id) {
    return Boolean(individuals[id]?.spouse);
  }

  // function drawPrintx() {
  //   const div = document.querySelector("#tree");
  //   let i = 1;
  //   while (drawGeneration(i)) i++;

  //   function drawGeneration(i) {
  //     const generation = individuals.filter((v) => v.row === i);
  //     if (generation.length === 0) return false;
  //     const isPresent = generation.filter((v) => hasFamily(v.ID)).length > 0;
  //     if (!isPresent) return false;
  //     const h3 = document.createElement("h3");
  //     h3.textContent = `Generation: ${i}`;
  //     div.append(h3);

  //     generation.forEach((v) => {
  //       if (hasFamily(v.ID)) div.append(drawFamily(v.ID));
  //     });
  //     return true;

  //     function drawFamily(id) {
  //       const children = getChildren(id);
  //       const individual = individuals[id];
  //       const { row, spouse, parent } = individual;

  //       const family = getElementsFromTemplate("#generation-template");
  //       // family.querySelector("#generation-number").textContent =
  //       //   "Generation: " + row;

  //       const parents = family.querySelector("#parents");
  //       const person = newDrawIndividual(individual, {}, true);
  //       person.id = "parent-id" + id;
  //       if (parent !== undefined) {
  //         parents.append(
  //           link({ href: "#parent-id" + parent, title: "Go to parent" })
  //         );
  //       }

  //       parents.append(person);

  //       // if (spouse) {
  //       //   const plus = document.createElement("div");
  //       //   plus.textContent = "+";
  //       //   parents.append(plus);
  //       //   parents.append(newDrawIndividual(spouse));
  //       // }

  //       const childrenDiv = family.querySelector("#children");
  //       if (children.length === 0)
  //         childrenDiv.append(newDrawIndividual({ name: " " }));

  //       for (const childId of children) {
  //         const child = newDrawIndividual(individuals[childId]);
  //         if (hasFamily(childId))
  //           child.append(
  //             link({ href: "#parent-id" + childId, title: "Go to family" })
  //           );
  //         childrenDiv.append(child);
  //       }

  //       return family;

  //       function link({ href, textContent, title }) {
  //         const div = document.createElement("div");
  //         div.style.display = "inline";
  //         const a = document.createElement("a");
  //         a.setAttribute("href", href);
  //         a.textContent = "...";
  //         a.title = title;
  //         div.append(a);
  //         return div;
  //       }
  //     }
  //   }
  // }
  function drawRightLeft() {
    const div = document.querySelector("#tree");
    const ul = document.createElement("ul");
    drawGeneration(0, ul);
    div.append(ul);

    function drawGeneration(i, wrapper) {
      const children = getChildren(i);
      const li = document.createElement("li");
      if (children.length === 0) {
        const person = newDrawIndividual(individuals[i], {}, true);
        li.append(person);
        wrapper.append(li);
        return;
      }

      const details = document.createElement("details");
      details.open = true;
      const summary = document.createElement("summary");
      const parent = newDrawIndividual(individuals[i], {}, true);
      summary.append(parent);
      details.append(summary);
      const ul = document.createElement("ul");
      details.append(ul);
      li.append(details);
      children.forEach((v) => drawGeneration(v, ul));
      wrapper.append(li);
    }
  }
  function drawTopDown(data) {
    const { maxRow, maxCol } = individuals.reduce(
      (v, individual) => {
        const maxRow = Math.max(v.maxRow, individual.row);
        const maxCol = Math.max(v.maxCol, individual.column);
        return { maxRow, maxCol };
      },
      { maxRow: -1, maxCol: -1 }
    );
    if (maxRow === -1 || maxCol == -1) return;

    const div = document.querySelector("#tree");

    // const root = document.querySelector(":root");
    // root.style.setProperty("--columns", maxCol);
    // root.style.setProperty("--rows", maxRow);
    div.setAttribute("grid-template-columns",`repeat(${maxCol}, 1fr`);
    div.setAttribute("grid-template-rows",`repeat(${maxRow}, 1fr grid-auto-rows`);
    individuals.forEach((p) => {
      const union = newDrawIndividual(p, {}, true);
      union.id = "person-" + p.ID;
      union.style.gridColumn = p.column;
      union.style.gridRow = p.row;
      if (p.span) union.style.gridColumnEnd = p.span;
      union.title = `${p.name} (row ${p.row}, column ${p.column})`;
      div.append(union);
    });
    function drawPerson(id, withSpouse = true) {
      const clone = getElementsFromTemplate("#parents-template"); //document.createElement("div");
      const union = clone.querySelector("#parents");

      const first = union.querySelector("#main");
      first.append(newDrawIndividual(individuals[id]));
      const spouse = withSpouse ? individuals[id].spouse : undefined;
      const second = union.querySelector("#spouse");
      if (!spouse) {
        union.querySelector("#plus").remove();
        second.remove();
      } else second.append(newDrawIndividual(spouse));
      return union;
    }
  }

  function getLineage(id, direction = "down") {
    const lineage = [];
    buildLineage(id);
    return lineage;
    function buildLineage(id) {
      if (direction === "down") {
        lineage.push(id);
        const children = getChildren(id);
        if (children.length === 0) return;
        buildLineage(children[0], direction);
      } else {
        lineage.unshift(id);
        const parent = individuals[id].parent;
        if (typeof parent === "undefined") return;
        buildLineage(parent, direction);
      }
    }
  }

  function getChildren(id) {
    if (!individuals[id].children) {
      const children = individuals.filter((v) => v.parent === id);
      individuals[id].children = children; //memorise
    }
    return individuals[id].children;
  }

  function drawLineage(ineageToDraw) {}

  // function drawGeneration(id) {
  //   const generation = getElementsFromTemplate("#generation-template");
  //   const children = getChildren(id);
  //   if (!individuals[id].spouse && children.length === 0) return;
  //   const parentDiv = generation.querySelector("#parents");
  //   drawParents(parentDiv, id, children);
  //   drawChildren(generation, id, children);
  //   document.querySelector("#tree").appendChild(generation);
  // }
  function drawParents(parentDiv, id, children) {
    const individual = individuals[id];
    const spouse = individual.spouse;

    //if (!spouse && children.length === 0) return

    // const parentDiv = generation.querySelector("#parents");
    drawIndividual(parentDiv, individual);

    if (!spouse) return;
    const union = document.createElement("div");
    union.textContent = "+";
    parentDiv.append(union);
    drawIndividual(parentDiv, spouse);
  }
  function drawChildren(generation, id, children) {
    const div = generation.querySelector("#children");
    if (children.length === 0) {
      const p = document.createElement("p");
      p.textContent = "None";
      div.append(p);
      div.remove();
      return;
    }
    children.forEach((child, i) => drawIndividual(div, individuals[child]));
  }

  function drawIndividual(div, individual, options = {}) {
    const { styles } = options;

    const person = document.createElement("div");

    const { name, gender, aka, ID } = individual;
    person.textContent = name + (aka ? ` (${aka})` : "");
    if (ID) person.setAttribute("id", "id" + ID);
    person.classList.add(gender ? gender : "M");
    person.style.textAlign = "center";
    person.style.cursor = "default";
    for (const style in styles) person.style[style] = styles[style];

    div.append(person);
  }

  function search(searchString) {
    if (!searchString) return;
    if (searchString.trim() === "") return;
    const foundList = [];
    var regex = new RegExp(searchString.trim(), "i");
    individuals.forEach((individual) => {
      const { ID, name, aka, spouse } = individual;
      if (findString(name)) return;
      if (findString(aka)) return;
      if (spouse !== undefined && isNaN(spouse)) {
        const { name, aka } = spouse;
        if (findString(name, true)) return;
        if (findString(aka, true)) return;
      }

      function findString(s, spouse = false) {
        if (!s) return false;
        const found = s.match(regex);
        if (found) {
          let display = getDisplayName(ID + 0);
          if (spouse) {
            display = s + ": " + display + "'s spouse";
          } else {
            const parent = individuals[ID].parent; //getParentOffspring(id);
            if (parent) {
              display += `: ${getDisplayName(parent)}'s child`;
            }
          }
          foundList.push({ ID, display });
          return true;
        }
        return false;
      }
    });

    return foundList;
  }
})();
function childClicked(child, event) {
  //console.log(child, )
  const target = event.target;
  const targetId = target.getAttribute("id");
  if (!targetId) return;
  const id = Number(targetId.replace("id", ""));
  if (isNaN(id)) return;
  if (target.classList.contains("selected")) return;
  const ancestors = $.getLineage(id, "up");
  ancestors.pop();
  const decendents = $.getLineage(id);
  const lineage = [...ancestors, ...decendents];
  $.draw(lineage);
}

function markRowColumns(individuals) {
  let row = 1;
  let maxRow = row;
  let column = 1;
  markPerson(0);

  function markPerson(id) {
    const person = individuals[id];
    if (!person) return;
    person.row = row;
    person.column = column;
    const children = person.children;
    if (!children) return;
    if (children.length === 0) return;
    row++;
    if (maxRow < row) maxRow = row;
    children.forEach((id) => {
      markPerson(id);
      column++;
    });
    person.span = column;
    column--;
    row--;
  }
}
let xxx = [];

let rowNumber = 0;
let column = 1;
const parents = [];
const param = {};

function callback({ action, error, data, count }) {
  if (action === "error") {
    showError("Unbale to load config. " + error);
    console.log(count, error);
  }
  if (action === "end") complete();
  if (action === "step") step();

  function step() {
    const tokens = data;
    const gen = tokens.reduce(
      (prev, curr, i) => (prev !== -1 ? prev : curr.trim() !== "" ? i : prev),
      -1
    );
    const allSpaces = gen === -1;
    if (allSpaces) return;

    const isGenOK =
      true ||
      param.prevGen === -1 ||
      gen <= param.prevGen ||
      gen + 1 === param.prevGen;
    if (!isGenOK) {
      param.error = `Error in gen at row ${tokens}`;
      console.log(param.error, param.prevGen, gen);
      return;
    }
    param.prevGen = gen;

    if (isCommand()) return;

    const persons = tokens[gen].split("|");
    for (const person of persons) createIndividual(person.trim());

    function createIndividual(person) {
      rowNumber++;
      const pair = person.split("+");
      const id = rowNumber - 1;
      const individual = { ...getProp(pair[0]), gen, ID: id };
      if (pair[1]) individual.spouse = getProp(pair[1]);
      saveParent({ gen, id });
      const parent = getParent();
      if (parent) {
        individual.parent = parent.id;
        addChildToParent({ parent: parent.id, child: id });
      }
      xxx.push(individual);
    }
    function isCommand() {
      const commandLine = tokens[gen].trim();
      if (commandLine[0] !== "#") return false;
      const command = commandLine.split(" ")[0].trim().toLowerCase();
      const text = commandLine.replace(command, "").trim();
      if (!param.notes) param.notes = [];
      switch (command) {
        case "#notes":
        case "#note":
          param.notes.push(text);
          break;
        default:
          if (command.length > 1) {
            param[command.substring(1)] = text;
          }
          break;
      }
      return true;
    }
  }

  function complete() {
    markRowColumns(xxx);
    if (!param.title) param.title = xxx[0].name + " Family Tree";
  }
  function getParent() {
    return parents[parents.length - 2];
  }
  function saveParent({ gen, id }) {
    let currentParent = parents[parents.length - 1];
    if (!currentParent) {
      parents.push({ gen, id });
      return;
    }
    if (currentParent.gen < gen) {
      parents.push({ gen, id });
      return;
    }

    while (currentParent && currentParent.gen >= gen) {
      parents.pop();
      currentParent = parents[parents.length - 1];
    }
    parents.push({ gen, id });
  }
  function addChildToParent({ parent, child }) {
    if (!xxx[parent].children) xxx[parent].children = [];
    xxx[parent].children.push(child);
  }
  function getProp(individualString) {
    const name = individualString.split("(")[0].trim();
    const props = individualString.split("(")[1];
    const individual = { name };
    if (props) {
      const properties = props.replace(")", "").trim().split(" ");
      for (let i = 0; i < properties.length; i += 2) {
        const key = properties[i];
        const value = properties[i + 1];
        if (key && value) individual[key] = value;
      }
    }
    if (!individual.gender) {
      individual.gender = "M";
      if (["wife", "daughter"].includes(name.toLowerCase()))
        individual.gender = "F";
    }
    return individual;
  }
}
function initialiseParam() {
  while (xxx.length > 0) xxx.pop();
  Object.assign(param, {
    title: "",
    subTitle: "",
    notes: [],
    error: "",
    warning: "",
    prevGen: -1,
  });
  rowNumber = 0;
  column = 1;
}
async function readCsvFile(fileName, callback) {
  initialiseParam();
  await new Promise((resolve) => {
    streamCsvRecords(
      fileName,
      { hasHeaders: false},
      ({ action, data, error, count }) => {
        callback({ action, error, data, count });
        if (action === "error") resolve(0);
        if (action === "end") resolve(1);
      }
    );
  });
}

async function fileSelected(event) {
  const file = event.target.files[0];
  if (file) {
    try {
      const url = URL.createObjectURL(file);
      fileWithData - url;
      $.draw();
    } catch (error) {
      console.error("Failed to read file:", error);
    }
  }
}
/**
//  * * Sets up a dialog.
//  * * @param {string} dialogSelector selector for the dialog
//  * * @param {string} confirmSelector selector for the confirm/OK button
//  * * @param {function} callback is called with (event, param, dialog) where event = "close" or "change", param
//  * * equals "cancel" if cancel is clicked, value if confirm is clicked or the target that has changed if event
//  * * is "change". callback must return a value if event is "change"
//  * * @returns dialog object */

function setupDialog(dialogSelector, confirmSelector, callback) {
  const dialog = document.querySelector(dialogSelector);

  // const confirm = dialog.querySelector(confirmSelector);
  // confirm.disabled = true;
  dialog.addEventListener("change", (e) => {
    confirm.value = callback({
      type: "change",
      target: e.target,
      returnValue: dialog.returnValue,
      dialog,
    });

    //console.log(confirm.value);
  });
  dialog.addEventListener("close", (e) => {
    callback({
      type: "close",
      target: e.target,
      returnValue: dialog.returnValue,
      dialog,
    });
  });
  // Prevent the "confirm" button from the default behavior of submitting the form, and close the dialog with the `close()` method, which triggers the "close" event. confirm.
  // confirm.addEventListener("click", (event) => {
  //   event.preventDefault(); // We don't want to submit this fake form
  //   dialog.close(confirm.value);
  // });
  return dialog;
}
function dialogCallback(event, param, dialog) {
  // cancel button pressed, do nothing
  if (event === "close" && param === "cancel") {
    return;
  }
  const confirm = dialog.querySelector("#confirm");
  const id = param.value;
  // confirm button pressed
  if (event === "close") {
    const id = confirm.value;
    $.show(id);
  }

  //something changed in dialog
  if (event === "change") {
    const id = param.value;

    confirm.disabled = false;
    confirm.value = Number(id);
    return id;
  }
}
function showLoadFileDialog() {
  const input = document.querySelector("#file-input");

  input.addEventListener("change", (event) => {
    const file = event.target.files[0];
    const blob = URL.createObjectURL(file);
    presets["Local file"] = blob;
    getPresetFile("Local file");

    // if (selectedFiles && selectedFiles.length > 0) {
    //   console.log('Selected files:', selectedFiles);
    // }
  });

  input.click();
}

// function showSearchDialog() {
//   const dialog = setupDialog("#search-dialog", null, searchCallback);
//   dialog.querySelector("input").value = "";
//   dialog.querySelector("#error").textContent = "";
//   removeChildElements("dialog #radio-group");

//   dialog.showModal();
// }
// function searchCallback(action, e, dialog) {
//   //console.log({ action, e, dialog });
//   // console.log(dialog.querySelector("#search-string").value)
//   if (action === "change") {
//     const searchString = dialog.querySelector("#search-string").value;
//     const confirm = dialog.querySelector("#confirm");
//     confirm.disabled = searchString.trim() === "";
//   }
// }
// function buttonSearch() {
//   // const error = document.querySelector("#search-bar #error");
//   // error.textContent = "";
//   const input = document.querySelector("#search-dialog input");
//   const searchString = input.value.trim();
//   if (searchString === "") return;

//   const searchResult = $.search(searchString);
//   if (searchResult.length == 0) {
//     const p = document.querySelector("dialog #error");
//     p.textContent = "No match found";
//     return;
//   }

//   if (searchResult.length > 1) {
//     setUpRadioButtons(searchResult);
//     return;
//   }
//   console.log(searchResult[0]);
//   closeDialog();
//   $.show(searchResult[0].ID);
// }
// function closeDialog() {
//   const dialogs = Array.from(document.querySelectorAll("dialog"));
//   for (const dialog of dialogs) if (dialog.open) dialog.close();
// }
// function show(id) {
//   const div = document.querySelector("#id" + id);
//   if (!div) return;
//   div.classList.add("selected");
//   div.scrollIntoView();
//   // const rect = div.getBoundingClientRect();
//   // console.log(div, rect);
//   //
//   // window.scroll(rect.width / 2 + rect.x, rect.y);
// }
// function setUpRadioButtons(matches) {
//   const radioGroup = removeChildElements("dialog #radio-group");

//   const listMax = 5;

//   const p = document.createElement("p");
//   p.textContent = `${matches.length} matches found, select one to proceed`;
//   radioGroup.append(p);
//   matches.forEach((v, i) => {
//     // const checked = ""; //i == 0 ? `checked="checked"` : "";
//     if (i > listMax) return;
//     if (i === listMax) {
//       const p = document.createElement("p");
//       p.textContent = `.. and ${matches.length - listMax} others`;
//       radioGroup.append(p);
//       return;
//     }
//     const radio = getElementsFromTemplate("#radio-template");
//     const input = radio.querySelector("input");
//     input.id = v.ID;
//     const label = radio.querySelector("label");
//     label.setAttribute("for", v.ID);
//     label.textContent = v.display;
//     radioGroup.appendChild(radio);
//   });
// }

function getElementsFromTemplate(templateSelector) {
  const template = document.querySelector(templateSelector);
  return template.content.cloneNode(true);
}
function removeChildElements(parent) {
  if (!parent) {
    console.warn("attempted to remove a null or undefined element.");
    return;
  }
  const parentElement =
    typeof parent === "string" ? document.querySelector(parent) : parent;

  while (parentElement.firstElementChild) {
    const child = parentElement.firstElementChild;
    parentElement.removeChild(child);
  }
  return parentElement;
}
