"use strict";
import { streamCsv } from "./readfile.js";
import { _removeChildren, _select, _create, showError } from "./common.js";

//abhijit.majumdar@no-code-dashboard.com
//noCodeDash20230217

let rowNumber = 0;
let column = 1;
const parents = [];
const param = {};
let currentFile;
let individuals = [];
const startID = 0;
// return { setView, draw, loadData };

function initialise() {
  individuals = [];
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

export function loadData({ action, error, data, count }) {
  if (action === "error") {
    showError("Unbale to load config. " + error);
    console.log(count, error);
  }
  if (count === 1) initialise();

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

    // const isGenOK =
    //   true ||
    //   param.prevGen === -1 ||
    //   gen <= param.prevGen ||
    //   gen + 1 === param.prevGen;

    let deltaGen = gen - param.prevGen;
    while (param.prevGen !== -1 && deltaGen > 1) {
      createIndividual("Missing parent");
      deltaGen--;
    }
    param.prevGen = gen;

    if (isCommand()) return;

    const persons = [tokens[gen]]; //.split("|");
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
      individuals.push(individual);
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
    markRowColumns(individuals);
    if (!param.title) param.title = individuals[0].name + " Family Tree";
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
    if (!individuals[parent].children) individuals[parent].children = [];
    individuals[parent].children.push(child);
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
export async function draw(fileWithData, view) {
  const fileURL = fileWithData;

  if (currentFile !== fileURL) {
    await readCsvFile(fileURL, loadData);
    // individuals = xxx.map((v) => v);
    currentFile = fileURL;
  }
  _removeChildren("#tree");
  drawHeadersNotess();
  if (param.error) return;
  drawLoadedFile();
  //showSpinner(false);
  function drawHeadersNotess() {
    const title = _removeChildren("#main-title");
    const comment = _removeChildren("#comments");
    const notes = _removeChildren("#notes");
    const error = _removeChildren("#error");
    const warning = _removeChildren("#warning");
    if (param.error) {
      showError(param.error);
      return;
    }

    title.textContent = param.title;

    if (param.notes.length > 0) {
      if (param.notes.length === 1)
        notes.textContent = "Note: " + param.notes[0];
      else {
        const p = _create({ p: { text: "Notes" } });
        notes.append(p);
        const ol = _create("ol");
        for (const note of param.notes) {
          const li = _create({ li: { text: note } });
          ol.append(li);
        }
        notes.append(ol);
      }
    }
  }
  function drawLoadedFile() {
    const div = _select("#tree");
    div.removeAttribute("class");
    div.setAttribute("class", view);
    if (view === "top-down") drawTopDown();
    // if (view === "lineage") drawLineage(id);
    if (view === "left-right") drawRightLeft();
  }
}

async function readCsvFile(fileName, callback) {
  await new Promise((resolve) => {
    streamCsv(
      fileName,
      { hasHeaders: false },
      ({ action, data, error, count }) => {
        callback({ action, error, data, count });
        if (action === "error") resolve(0);
        if (action === "end") resolve(1);
      }
    );
  });
}
function markRowColumns(individuals) {
  let gen = 1;
  let row = 1;
  let maxRow = row;
  let column = 1;
  markPerson(0);

  function markPerson(id) {
    const person = individuals[id];
    if (!person) return;
    person.row = row;
    const multiGen = person.name.split(">").length;
    person.gen = gen + (multiGen > 1 ? "-" + (gen + multiGen - 1) : "");
    person.column = column;
    const children = person.children;
    if (!children) return;
    if (children.length === 0) return;
    row++;
    gen += multiGen;
    if (maxRow < row) maxRow = row;
    children.forEach((id) => {
      markPerson(id);
      column++;
    });
    person.span = column;
    column--;
    row--;
    gen -= multiGen;
  }
}
function drawUnion(individual, drawSposue = false) {
  const { name } = individual;
  const hasMultipleNames = name.includes(">");
  if (hasMultipleNames) {
    let gen = Number(individual.gen.split("-")[0]);
    const names = name.split(">").map((v) => v.trim());
    const wrapper = _create({ div: { class: "multi-gen" } });
    names.forEach((name) => {
      const p = _create({ p: { class: "multi-names" } });
      const genSpan = _create({ span: { text: gen + ": ", class: "gen" } });
      p.append(genSpan);
      gen++;
      const span = _create({ span: { text: name } });
      p.append(span);
      wrapper.append(p);
    });
    return wrapper;
  }
  const { ID, spouse, gen } = individual;
  const person = _create({ div: { class: "person", id: ID } });
  const genSpan = _create({ span: { text: gen + ": ", class: "gen" } });
  person.append(genSpan);

  const first = makeNameSpan(individual);
  person.append(first);
  if (spouse && drawSposue) {
    const plus = _create({ span: { text: " + " } });
    person.append(plus);
    const second = makeNameSpan(spouse);
    person.append(second);
  }
  return person;

  function makeNameSpan({ name, gender, aka }) {
    // const names = name.split(">").map((v) => v.trim());
    // if (names.length == 1)
    return _create({
      span: {
        text: name + (aka ? ` (${aka})` : ""),
        class: gender ? gender : "M",
      },
    });
  }
}

function hasFamily(id) {
  // if (hasSpouse(id)) return true;
  const children = getChildren(id);
  return children.length > 0 || hasSpouse(id);
}
function hasSpouse(id) {
  return Boolean(individuals[id]?.spouse);
}
function drawRightLeft() {
  const div = _select("#tree");
  const ul = document.createElement("ul");
  drawGeneration(0, ul);
  div.append(ul);

  function drawGeneration(i, wrapper) {
    const children = getChildren(i);
    const li = document.createElement("li");
    if (children.length === 0) {
      const person = drawUnion(individuals[i], true);
      li.append(person);
      wrapper.append(li);
      return;
    }

    const details = document.createElement("details");
    details.open = true;
    const summary = document.createElement("summary");
    const parent = drawUnion(individuals[i], true);
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

  const div = _select("#tree");
  div.setAttribute("grid-template-columns", `repeat(${maxCol}, 1fr`);
  div.setAttribute(
    "grid-template-rows",
    `repeat(${maxRow}, 1fr grid-auto-rows`
  );
  individuals.forEach((p) => {
    const union = drawUnion(p, true);
    union.id = "person-" + p.ID;
    union.style.gridColumn = p.column;
    union.style.gridRow = p.row;
    if (p.span) union.style.gridColumnEnd = p.span;
    union.title = `${p.name} (row ${p.row}, column ${p.column})`;
    div.append(union);
  });
}

function getChildren(id) {
  if (!individuals[id].children) {
    const children = individuals.filter((v) => v.parent === id);
    individuals[id].children = children; //memorise
  }
  return individuals[id].children;
}
