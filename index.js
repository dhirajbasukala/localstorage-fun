// fraily plan as you code... 
function generateId() {
  return parseInt(Math.random() * 1e16, 10);
}

const box = document.querySelector(".box");
const xy = document.querySelector("#xy");
const boxConnection = document.querySelector(".box-connection");

let boxPosition = {
  x: window.screenX + box.offsetLeft,
  y: window.screenY + box.offsetTop,
};

function updateBoxPosition() {
  boxPosition = {
    x: window.screenX + box.offsetLeft,
    y: window.screenY + box.offsetTop,
  };
  xy.innerHTML = `${boxPosition.x},${boxPosition.y}`;
  // update localStorage data
  updateDataStore(boxPosition);
}

function init() {
  // assign a random id as window name
  // it will be used to track windows across the browser sessions
  if(window.name === ''){

      const hasBoxes = localStorage.getItem("boxes");
        console.log(hasBoxes);
      window.name = hasBoxes ? generateId() : "originParent";
  }

  if (window.name !== "originParent") {
    document.getElementById("box").classList.add("child");
  }
  updateBoxPosition();

  // init localSTorage if not done already
  let boxes = {};
  if (localStorage.getItem("boxes")) {
    boxes = JSON.parse(localStorage.getItem("boxes"));
  }
  updateInclination();
}

function updateDataStore(boxPosition) {
  let boxes = {};
  if (localStorage.getItem("boxes")) {
    boxes = JSON.parse(localStorage.getItem("boxes"));
  } else {
    window.name = "originParent";
  }
  boxes[window.name] = boxPosition;
  window.localStorage.setItem("boxes", JSON.stringify(boxes));
  updateInclination();
}

let updateBoxPositionTimer = null;
document.addEventListener("mouseout", (evt) => {
  if (evt.toElement === null && evt.relatedTarget === null) {
    updateBoxPositionTimer = setInterval(() => {
      updateBoxPosition();
    }, 200);
  }
});

document.addEventListener("mouseenter", () => {
  clearInterval(updateBoxPositionTimer);
});
window.addEventListener("resize", updateBoxPosition);

// update connection line inclination upon storage event change
window.addEventListener("storage", function () {
  updateInclination();
});

function updateInclination() {
  const points = localStorage.getItem("boxes")
    ? JSON.parse(localStorage.getItem("boxes"))
    : [];

  if (points && Object.keys(points).length > 1) {
    const originParentPoint = points.originParent;
    if (!originParentPoint) {
      return;
    }

    if (window.name === "originParent") {
      // loop thru and create line from originParent point to all other points
      Object.keys(points).forEach((pointKey) => {
        // draw a line from originParent point to point
        if (pointKey === "originParent") {
          // do nth
        } else {
          //draw a line from originParent point to this point
          // create a div for each point
          const connDivID = `bc-${pointKey}`;
          let connDiv = null;
          if (!document.getElementById(connDivID)) {
            connDiv = document.createElement("div");
            connDiv.classList.add("box-connection");
            connDiv.id = `bc-${pointKey}`;
            document.getElementById("box").append(connDiv);
          } else {
            connDiv = document.getElementById(connDivID);
          }
          const point = points[pointKey];
          const inclination = getAngle(
            originParentPoint.x,
            originParentPoint.y,
            point.x,
            point.y
          );
          connDiv.style.transform = `rotate(${inclination}deg)`;

          // can mock distance with large value instead of actual distance.
            const length = getDistance(
              originParentPoint.x,
              originParentPoint.y,
              point.x,
              point.y
            );
          connDiv.style.width = `${length}px`;
        }
      });
    } else {
      // find current window point and originParent point and draw a line in between
      const point = points[window.name];
      const inclination = getAngle(
        point.x,
        point.y,
        originParentPoint.x,
        originParentPoint.y
      );
      boxConnection.style.transform = `rotate(${inclination}deg)`;

      // can mock distance with large value instead of actual distance.
        const length = getDistance(
          originParentPoint.x,
          originParentPoint.y,
          point.x,
          point.y
        );
      boxConnection.style.width = `${length}px`;
    }
  }
}

function getAngle(cx, cy, ex, ey) {
  var dy = ey - cy;
  var dx = ex - cx;
  var theta = Math.atan2(dy, dx); // range (-PI, PI]
  theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
  return theta;
}

function getDistance(x1, y1, x2, y2) {
  let x = x2 - x1;
  let y = y2 - y1;
  return Math.sqrt(x * x + y * y);
}

window.onbeforeunload = function (event) {
  let boxes = {};
  if (localStorage.getItem("boxes")) {
    boxes = JSON.parse(localStorage.getItem("boxes"));
    delete boxes[window.name];

    boxes && localStorage.setItem("boxes", JSON.stringify(boxes));
  }
};

const resetBtn = document.getElementById("reset");
resetBtn.addEventListener("click", () => {
  localStorage.clear();
});

init();
