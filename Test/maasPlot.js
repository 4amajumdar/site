import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6/+esm"
import * as d3 from "https://cdn.skypack.dev/d3@4"
//import {min} from "https://cdn.jsdelivr.net/npm/d3-array@3/+esm";

export const maasPlot = (() => {
    const self = {}
    ///////////////////////////////////////////////////////////////////////////common

    ////////////////////////////////////////////////////////////////////////////bar
    self.barChart = (options) => {
        function setCallback(index, scales, values, dimensions, context, next) {
            const el = next(index, scales, values, dimensions, context)
            const elements = el.querySelectorAll("rect")
            for (let i = 0; i < elements.length; i++) {
                elements[i].addEventListener("click", () =>
                    callback(id, data[i])
                )
            }
            return el
        }

        const { id, data, x, xLabel, y, yLabel, callback, fill } = options
        const barY = {
            x,
            y,
            fill,
            // .attr("class",'x')
            tip: "x", //tip? "x": null
            render: typeof callback === "function" ? setCallback : null,
            font: "inherit",
        }

        const text = {
            x,
            y,
            text: (d) => d[y],
            dy: -5,
            lineAnchor: "bottom",
        }

        const plot = Plot.plot({
            grid: true,
            style: "font: inherit;",
            x: { axis: "bottom", label: xLabel },
            y: { label: yLabel },
            marks: [() => {}, Plot.barY(data, barY), Plot.text(data, text)],
        })
        return plot
        // document.querySelector(selector).appendChild(plot)
    }
    /////////////////////////////////////////////////////////////////////////////2x2
    self.twoByTwoChart = (options) => {
        function setCallback(index, scales, values, dimensions, context, next) {
            const el = next(index, scales, values, dimensions, context)
            const elements = el.querySelectorAll("rect")
            for (let i = 0; i < elements.length; i++) {
                elements[i].addEventListener("click", () =>
                    callback(id, data[i])
                )
            }
            return el
        }
        const { id, data, x, y, z, xLabel, yLabel, callback, fill } = options
        // console.log(data)
        const plot = Plot.plot({
            padding: 0, //padding between cells
            grid: true,
            x: { axis: "top", label: xLabel },
            y: { label: yLabel },
            style: "font: inherit;",
            // color: (d) => {
            //     d[x] == 1 ? "red" : "blue"
            // }, //{ type: "categorical", scheme: "tableau10" }, //////////risk?????????
            marks: [
                Plot.cell(data, {
                    x, //: "season",
                    y, //: "episode",
                    fill: z, //: "rating",
                    inset: 0.5,
                    tip: "x",
                    render: typeof callback === "function" ? setCallback : null,
                }),
                Plot.text(data, {
                    x, //: "season",
                    y, //: "episode",
                    text: (d) => d[z], //?.toFixed(1),
                    fill: "white", ///fot color
                    // title: "title",
                }),
            ],
        })

        return plot
        // document.querySelector(selector).appendChild(plot)
    }
    return self
})()

export default null
