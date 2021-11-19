// Set min value for interval between calls to the drawing function
const c_interval = 1;
var pinpoint; // Hold the setInterval event
const pi = 3.14159;
const pi_strip_width = 0.5;

// Select input elemeents
var input = {
  pi_calc: 3.14159,
  scale_start: 3.1,
  scale_end: 3.2,
  scale_unit: 0.001,
  color: "#ffe100",
  interval: "normal", // Timelapse between calls to the drawing function, set initial value
  limit: 5000, // Set initial limit for number of points to plot
  points_inside: 0, // Num of points inside the circumference
  status: "idle", // Indicate whether the calculation is in progress or not initiated
  count: 0, // Store the tally of points drawn
  points_plot: document.querySelector("#points_plot"),
  range: document.querySelector("#range"),
  num: document.querySelector("#num"),
  progress_bar: document.querySelector(".progress-bar"),
  label_left: document.querySelector("#label-left"),
  label_right: document.querySelector("#label-right"),
  pi_calc_el: document.querySelector("#pi-calc"),
  pi_real_el: document.querySelector("#pi-real"),
  diff_bar: document.querySelector("#diff-bar"),
  get_val: function (el) {
    return this[el].value;
  }, // Get input limit for number of points to draw
  set_limit: function (el, value) {
    this[el].value = value;
  },
  remove_circles: function () {
    let num_circles = this.points_plot.children.length;
    // Delete previous plot, if exists
    for (let k = 0; k < num_circles; k++) {
      this.points_plot.children[0].remove();
    }
  },
  // Disable or enable interaction with input elements
  change_inputs_state: function (el_class) {
    let els = document.getElementsByClassName(el_class);
    for (let j = 0; j < els.length; j++) {
      if (els[j].hasAttribute("disabled")) {
        els[j].removeAttribute("disabled");
      } else {
        let attr = document.createAttribute("disabled");
        els[j].setAttributeNode(attr);
      }
    }
  },
  update_progress_bar: function () {
    this.progress_bar.style.width = `${(100 * this.count) / this.limit}%`;
    this.label_left.textContent = `Progress: ${(
      (100 * this.count) /
      this.limit
    ).toFixed(1)}%`;
    this.label_right.textContent = `Progress: ${(
      (100 * this.count) /
      this.limit
    ).toFixed(1)}%`;
    this.label_right.style["clip-path"] = `inset(0% 0% 0% ${
      (100 * this.count) / this.limit
    }%)`;
  },
  reset: function () {
    if (pinpoint) {
      clearInterval(pinpoint);
    }

    this.diff_bar.setAttribute("width", "0%");
    this.progress_bar.style.width = "0%";
    this.label_left.textContent = "";
    this.label_right.textContent = "";
    document.querySelector("#calc-btn").removeAttribute("disabled");

    let active_btns = document.getElementsByClassName("interaction-btn");
    for (let i = 0; i < active_btns.length; i++) {
      if (!active_btns[i].hasAttribute("disabled")) {
        let attr = document.createAttribute("disabled");
        active_btns[i].setAttributeNode(attr);
      }
    }

    let inactive_inputs = document.getElementsByClassName("graph-txt");
    for (let i = 0; i < inactive_inputs.length; i++) {
      if (inactive_inputs[i].hasAttribute("disabled")) {
        inactive_inputs[i].removeAttribute("disabled");
      }
    }

    this.status = "idle";
    this.points_inside = 0;
  }
};

var set_pi_on_scale = function (element_name, position = pi) {
  let pos_on_scale = (position - input.scale_start) / input.scale_unit;
  let corrected_pos =
    pos_on_scale >= 100
      ? 100 - pi_strip_width / 2
      : pos_on_scale <= 0
      ? 0 + pi_strip_width / 2
      : pos_on_scale;

  if (input[element_name].getAttribute("x1") !== corrected_pos + "%") {
    input[element_name].setAttribute("x1", corrected_pos + "%");
    input[element_name].setAttribute("x2", corrected_pos + "%");
  } else {
    corrected_pos = null;
  }

  if (element_name === "pi_real_el") {
    input[element_name].style.strokeWidth = pi_strip_width + "%";
  }

  return corrected_pos;
};

var reset_scale = function (input_el = null) {
  let new_limit = input_el ? input_el.value : null;
  if (new_limit) {
    if (
      (input_el.id === "scale_start" && new_limit < pi) ||
      (input_el.id === "scale_end" && new_limit > pi)
    ) {
      input[input_el.id] = new_limit;
      input.scale_unit = (input.scale_end - input.scale_start) / 100;

      if (input.pi_calc_el.style.strokeWidth === pi_strip_width + "%") {
        set_pi_on_scale("pi_calc_el", input.pi_calc);
      }
    } else {
      input_el.value = input[input_el.id];
    }
  }
  set_pi_on_scale("pi_real_el");
};

// Associate a reciprocal function to set the limit value for number of points to draw
var set_limit = function (origin_el) {
  let target_el = "rangenum".replace(origin_el.id, "");

  if (
    origin_el.value <= Number(origin_el.max) &&
    origin_el.value >= Number(origin_el.min)
  ) {
    input.set_limit(target_el, origin_el.value);
  } else {
    input.set_limit(origin_el.id, input.get_val(target_el)); // If limit exceeded, reset value from target input element
  }
};

// Set interval for drawing function to be called
var set_interval = function () {
  let selected_interval = document.querySelector("#speed-opts").value;

  if (selected_interval === "normal") {
    input.interval = "normal";
  } else {
    input.interval = c_interval / Number(selected_interval);
  }
};

// Set fill color for points drawn
var set_color = function () {
  input.color = document.querySelector("#col-opts").value;
};

var draw_point = function () {
  if (input.count < input.limit) {
    // Generate coords between 0 and 100 and draw the point when the calculation is done by intervals
    let x = Math.random() * 100;
    let y = Math.random() * 100;
    let distance = Math.sqrt(x ** 2 + y ** 2);
    if (distance <= 100) {
      input.points_inside++;
    }
    input.pi_calc =
      Math.round(100000 * ((input.points_inside * 4) / (input.count + 1))) /
      100000;
    input.count++; //Increment count of points drawn
    if (input.interval !== "normal") {
      input.update_progress_bar();

      let pi_pos = set_pi_on_scale("pi_calc_el", input.pi_calc);
      if (pi_pos) {
        input.diff_bar.setAttribute(
          "x",
          input.pi_calc >= pi
            ? input.pi_real_el.getAttribute("x1")
            : pi_pos + "%"
        );
        input.diff_bar.setAttribute(
          "width",
          Math.abs(
            Number(input.pi_real_el.getAttribute("x1").replace("%", "")) -
              pi_pos
          ) + "%"
        );
      }

      let r = input.limit > 10000 ? "0.1" : "0.8";
      let new_circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      new_circle.setAttribute("cx", x);
      new_circle.setAttribute("cy", y);
      new_circle.setAttribute("r", r);
      new_circle.setAttribute("fill", input.color);
      new_circle.setAttribute("class", "circle circle-" + input.interval);
      input.points_plot.appendChild(new_circle);
    }
  } else {
    // Terminate drawing amd reset initial input values
    document.querySelector("#pi-txt").textContent = input.pi_calc.toFixed(5);

    if (input.interval === "normal") {
      input.pi_calc_el.style.strokeWidth = pi_strip_width + "%";
      input.update_progress_bar();
      set_pi_on_scale("pi_calc_el", input.pi_calc);
    }
    input.count++; // Increment count to exit loop
    input.reset();
  }
};

var draw = function (el = null) {
  let initiate = new Promise(function (resolve, reject) {
    input.pi_calc_el.style.strokeWidth = "0%";
    input.diff_bar.setAttribute("width", "0%");
    document.querySelector("#pi-txt").textContent = "";
    input.limit = input.get_val("num"); // Set value for limit for points to draw from 'num' input

    if (input.status === "idle") {
      input.status = "in progress";
      input.count = 0;

      if (input.points_plot.hasChildNodes()) {
        input.remove_circles();
      }

      if (el) {
        let attr = document.createAttribute("disabled");
        el.setAttributeNode(attr); // Disable button while calculation is in progress
      }
    }

    input.change_inputs_state("graph-txt");
    set_interval();
    set_color();
    resolve("success");
  });

  initiate.then((msg) => {
    setTimeout(() => {
      if (input.interval === "normal") {
        while (input.count <= input.limit) {
          draw_point();
        }
      } else {
        input.pi_calc_el.style.strokeWidth = pi_strip_width + "%";
        input.change_inputs_state("pause");
        pinpoint = setInterval(draw_point, input.interval);
      }
    }, 10);
  });
};
// Pause calculation and animation (works when the interval is set)
function pause() {
  clearInterval(pinpoint);

  input.change_inputs_state("plot-control");
  document.querySelector("#pi-txt").textContent = input.pi_calc;
  input.label_left.textContent = "";
  input.label_right.textContent = "";
  input.diff_bar.setAttribute("width", "0%");
}
// Restart calculation at the point where it was stopped
function restart() {
  input.change_inputs_state("restart");
  draw();
}

function new_plot() {
  document.querySelector("#pi-txt").textContent = "";

  if (input.interval !== "normal" || input.status === "idle") {
    input.diff_bar.setAttribute("width", "0%");
    input.pi_calc_el.style.strokeWidth = "0%";

    if (input.status === "in progress") {
      input.reset();
    }

    if (input.points_plot.hasChildNodes()) {
      input.remove_circles();
    }
  }
}

window.onload = reset_scale();
