"use strict"

function drawTree() {
    drawGeneration(startID, 1)
    document.querySelector('#maintitle').textContent = individuals[startID - 1].name + "'s Familiy Tree"
}

function drawIndividual(placeholder, id, select = false) {

    // const pesronTemplate = document.querySelector('#pesron-template')
    // const person = pesronTemplate.content.cloneNode(true)
    const person = document.createElement('div')

    person.textContent = "Unknown"

    const isString = value => typeof value === 'string' || value instanceof String;
    if (isString(id)) {
        person.textContent = id
    }
    //to do: remove object?
    const isObject = value => typeof value === 'object' && value.name
    if (isObject(id)) {
        const { ID, name, gender, aka } = id
        person.textContent = name + (aka ? ` (${aka})` : "")
        person.classList.add(gender)
        person.setAttribute("data-id", ID)
    }

    if (individuals[id - 1]) {
        const { name, aka, gender } = individuals[id - 1]
        person.textContent = name + (aka ? ` (${aka})` : "")
        person.classList.add(gender)
        person.setAttribute("data-id", id)
    }
    if (select) {
        person.classList.add("selected");
    }
    person.setAttribute("onclick", "childClicked(this)")
    placeholder.appendChild(person)
}

function getChildren(id) {

    const union = unions.find(u => u.offspring == id || u.spouse == id)

    if (!union) return []
    const children = individuals.filter(individual => individual.FID == union.FID)
    return children
}

function drawParents(generation, id) {
    const u = unions.find(v => v.offspring == id || v.spouse == id)
    if (!u) return
    const placeholder = generation.querySelector('#parents')
    drawIndividual(placeholder, u.offspring)
    if (u.married)
        drawIndividual(placeholder, "m " + u.married)
    else
        drawIndividual(placeholder, "+")

    if (u.divorced)
        drawIndividual(placeholder, "d " + u.divorced)

    drawIndividual(placeholder, u.spouse)
}

function drawChild(generation, id, select) {
    const placeholder = generation.querySelector('#children')
    drawIndividual(placeholder, id, select)
}

function drawGeneration(id) {
    const generationtemplate = document.querySelector('#genaration-template')
    const generation = generationtemplate.content.cloneNode(true)
    drawParents(generation, id)

    const children = getChildren(id)
    const selectedchildId = 0
    children.forEach((child, i) => drawChild(generation, child, i === selectedchildId))


    document.querySelector('#generations').appendChild(generation)

    if (children.length > 0) {

        drawGeneration(children[selectedchildId].ID)
    }
}
function childClicked(child) {
    if (child.classList.contains('selected')) return

    const children = child.parentElement
    if (children.id != "children") return

    const currentselected = children.querySelector(".selected")
    currentselected.classList.remove('selected')
    child.classList.add('selected')

    const generation = children.parentElement
    let nextgeration = generation.nextElementSibling
    while (nextgeration) {

        nextgeration.remove()
        nextgeration = generation.nextSibling
    }

    drawGeneration(child.getAttribute('data-id'))
}

function search(nametosearch) {
    if (!nametosearch) return

    const maxnumberfound = 5
    let foundlist = []

    var regex = new RegExp(nametosearch.trim(), "i");

    individuals.forEach(individual => {
        function findstring(s) {
            if (!s) return false
            const found = s.match(regex)
            if (found) {
                foundlist.push(ID)
                return true
            }
            return false
        }

        const { ID, name, aka } = individual

        if (findstring(name)) {
            console.log(individual)
            return
        }

        if (findstring(aka)) {
            console.log(individual)
            return
        }

    })
    return foundlist
}

const getIndivudual = (id) => individuals.find(ind => ind.ID == id)
const getUnion = (fid) => unions.find(u => u.FID == fid)
 
function getancestors(id) {

    function getparentoffspring(id) {
        const individual = getIndivudual(id)
        // console.log(individual, individual.FID)
        if (!individual) return
        const union = unions.find(u => u.FID == individual.FID)
        if (!union) return
        return union.offspring
    }
    const ancestors = []
    const individual = getIndivudual(id)
    if (!individual) return ancestors
    console.log(individual)
    ancestors.push(id)
    let parent = getparentoffspring(id)

    while (parent) {
        console.log(getIndivudual(parent))
        ancestors.unshift(parent)
        parent = getparentoffspring(parent)
    }
    return ancestors
}