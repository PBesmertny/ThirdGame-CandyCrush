 //create board
 function createBoard(grid, width, units, candyColors, firstRow) {
  for (let i = 0; i < width*width; i++) {
    const unit = document.createElement("div");
    unit.setAttribute("draggable", true);
    unit.setAttribute("id", i);
    let randomColor = Math.floor(Math.random() * candyColors.length);
    unit.style.backgroundImage = candyColors[randomColor];
    grid.appendChild(unit);
    units.push(unit);
  }
  for (j = 0; j < width; j++) {
    firstRow.push(j);
  }    
}





document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".grid");
  const scoreDisplay = document.querySelector("#score")
  const width = 9;
  const units = [];
  const candyColors = [
    "url(src/images/red-candy.png)",
    "url(src/images/orange-candy.png)",
    "url(src/images/yellow-candy.png)",
    "url(src/images/purple-candy.png)",
    "url(src/images/blue-candy.png)",
    "url(src/images/green-candy.png)"
  ];
  let colorBeingDragged;
  let colorBeingReplaced;
  let unitBeingDragged;
  let unitBeingReplaced;
  let score = 0;
  const notValidThree = [];
  const notValidFour = [];
  const notValidFive= [];
  const firstRow = [];


  createBoard(grid, width, units, candyColors, firstRow);

    //setting up notValid parameters to prevent wrapArounds
    function initiateNotValid() {
      for (j = 0; j < (width * width); j++) {
        if (j % width == (width - 1) || j % width == (width - 2)) {
          notValidThree.push(j);
          notValidFour.push(j);
          notValidFive.push(j);
        }else if (j % width == (width - 3)) {
          notValidFour.push(j);
          notValidFive.push(j);
        } else if (j % width == (width - 4)) {
          notValidFive.push(j);
        }
      } 
  }
  
  initiateNotValid();

  //drag the candies
  units.forEach(unit => unit.addEventListener("dragstart", dragStart));
  units.forEach(unit => unit.addEventListener("dragend", dragEnd));
  units.forEach(unit => unit.addEventListener("dragover", dragOver));
  units.forEach(unit => unit.addEventListener("dragenter", dragEnter));
  units.forEach(unit => unit.addEventListener("dragleave", dragLeave));
  units.forEach(unit => unit.addEventListener("drop", dragDrop));

  function dragStart() {
    colorBeingDragged = this.style.backgroundImage;
    unitBeingDragged = parseInt(this.id);
    console.log(this.id, "dragstart");
  }
  
  function dragOver(e) {
    e.preventDefault();
    console.log(this.id, "dragover");
  }
  
  function dragEnter(e) {
    e.preventDefault();
    console.log(this.id, "dragenter");
  }
  
  function dragLeave() {
    console.log(this.id, "dragleave");
  }
  
  function dragDrop() {
    console.log(this.id, "dragdrop");
    colorBeingReplaced = this.style.backgroundImage;
    unitBeingReplaced = parseInt(this.id);
    units[unitBeingDragged].style.backgroundImage = colorBeingReplaced;
    this.style.backgroundImage = colorBeingDragged;
  }

  function dragEnd() {
    console.log(this.id, "dragend");
    //what is a valid move?
    let validMoves = [
      unitBeingDragged - 1,
      unitBeingDragged + 1,
      unitBeingDragged - width,
      unitBeingDragged + width
    ];
    //ensuring that the sum of one of the above 4 possibilities  include the Unit ID of the square we're replacing.
    let canMove = validMoves.includes(unitBeingReplaced);
    //if the unit being replaced EXISTS (not dragging square off of the grid, for example) and canMove = true, then refresh the variables.
    // else give the originating and destination squares their colors back; else, return the originating square it's color
    if (unitBeingReplaced && canMove) {
      unitBeingReplaced = null
    } else if (unitBeingReplaced && !canMove) {
      units[unitBeingDragged].style.backgroundImage = colorBeingDragged;
      units[unitBeingReplaced].style.backgroundImage = colorBeingReplaced;
    } else {
      units[unitBeingDragged].style.backgroundImage = colorBeingDragged;
    }
  }

  //drop candies if ones below them have been cleared
  function candyDrop() {
    //we are checking for all units on all rows but the very last one, starting from the bottom and going up.
    //if the square beneath the one we are looking at has nothing in it, drop this square into it's place.
    for (i = (width * (width - 1)) - 1; i >= 0; i--) {
      if (units[(i + width)].style.backgroundImage === "") {
        units[i + width].style.backgroundImage = units[i].style.backgroundImage;
        units[i].style.backgroundImage = "";
        candySpawn();
      }
    }
  }

  //now we make it so that new candies drop in from the top.
  function candySpawn() {
    for (k = 0; k < firstRow.length; k++) {
      if (units[k].style.backgroundImage === "") {
        let randomColor = Math.floor(Math.random() * candyColors.length)
        units[k].style.backgroundImage = candyColors[randomColor]
      }
    }
  }

  //checking for matches
    //row of 3
  function checkRowForThree() {
    //(width * width)- 2 since we are checking for a row of 3 and cannot go beyond the outermost candy (which will be width - 1, since we are startin our array at 0)
    for (i = 0; i < ((width * width) - 2); i++) {
      if (notValidThree.includes(i)) continue; //if notValidThree has I, this command CONTINUES through to the next i.
      let rowOfThree = [i, i + 1, i + 2];
      let decidedColor = units[i].style.backgroundImage;
      const isBlank = units[i].style.backgroundImage === "";
      //here we are making sure that none of our checks start with the last 2 columns (that way they can't wrap around to the other side)
      if (rowOfThree.every(index => units[index].style.backgroundImage === decidedColor && !isBlank)) {
        rowOfThree.forEach(index => {
          units[index].style.backgroundImage = "";
          score += 3;
          scoreDisplay.innerHTML = score;
        })
      }
    }
  }
    //column of 3
    function checkColumnForThree() {
      //width * (width- 2) - 1 since we are checking for a Column of 3 and cannot have this go beyond the bottom-most, right-most candy.
      //  (so in a 9x9 grid, candy 80 is the last one, which means 2 column values above that would be 80-width*2)
      for (i = 0; i < ((width * (width - 2))); i++) {
        let columnOfThree = [i, i + width, i + (width * 2)];
        let decidedColor = units[i].style.backgroundImage;
        const isBlank = units[i].style.backgroundImage === "";
        if (columnOfThree.every(index => units[index].style.backgroundImage === decidedColor && !isBlank)) {
          columnOfThree.forEach(index => {
            units[index].style.backgroundImage = "";
            score += 3;
            scoreDisplay.innerHTML = score;
          })
        }
      }
    }

    //row of 4
    function checkRowForFour() {
      for(i = 0; i < ((width * width) - 3); i++) {
        if (notValidFour.includes(i)) continue;
        let rowOfFour = [i, i + 1, i + 2, i + 3];
        let decidedColor = units[i].style.backgroundImage;
        const isBlank = units[i].style.backgroundImage === "";
        if (rowOfFour.every(index => units[index].style.backgroundImage === decidedColor && !isBlank)) {
          rowOfFour.forEach(index => {
            units[index].style.backgroundImage = "";
            score += 5;
            scoreDisplay.innerHTML = score;
          })
        }
      }
    }
    //column of 4
    function checkColumnForFour() {
      for (i = 0; i < ((width * (width - 3))); i++) {
        let columnOfFour = [i, i + width, i + (width * 2), i + (width * 3)];
        let decidedColor = units[i].style.backgroundImage;
        const isBlank = units[i].style.backgroundImage === "";
        if (columnOfFour.every(index => units[index].style.backgroundImage === decidedColor && !isBlank)) {
          columnOfFour.forEach(index => {
            units[index].style.backgroundImage = "";
            score += 5;
            scoreDisplay.innerHTML = score;
          })
        }
      }
    }
    //row of 5
    function checkRowForFive() {
      for(i = 0; i < ((width * width) - 4); i++) {
        if (notValidFive.includes(i)) continue;
        let rowOfFive = [i, i + 1, i + 2, i + 3, i + 4];
        let decidedColor = units[i].style.backgroundImage;
        const isBlank = units[i].style.backgroundImage === "";
        if (rowOfFive.every(index => units[index].style.backgroundImage === decidedColor && !isBlank)) {
          rowOfFive.forEach(index => {
            units[index].style.backgroundImage = "";
            score += 8;
            scoreDisplay.innerHTML = score;
          })
        }
      }
    }
    //column of 5
    function checkColumnForFive() {
      for (i = 0; i < ((width * (width - 4))); i++) {
        let columnOfFive = [i, i + width, i + (width * 2), i + (width * 3), i + (width * 4)];
        let decidedColor = units[i].style.backgroundImage;
        const isBlank = units[i].style.backgroundImage === "";
        if (columnOfFive.every(index => units[index].style.backgroundImage === decidedColor && !isBlank)) {
          columnOfFive.forEach(index => {
            units[index].style.backgroundImage = "";
            score += 8;
            scoreDisplay.innerHTML = score;
          })
        }
      }
    }

  //currently runs indefinitely until the tab is closed.  
  window.setInterval(function() {
    candyDrop();
    checkRowForFive();
    checkColumnForFive();
    checkRowForFour();
    checkColumnForFour();
    checkRowForThree();
    checkColumnForThree();
    candySpawn();
  }, 100)

})