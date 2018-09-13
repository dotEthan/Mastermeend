"use strict";

//HTML Elements
const optTab = document.querySelector('.options__tab');
const resetButton = document.querySelector('.reset__button');
const optPanel = document.querySelector('.options__contain');
const eachColorChoice = document.querySelectorAll('.option__colours--each');
const eachPatternChoice = document.querySelectorAll('.option__patterns--each');
const eachTurnChoice = document.querySelectorAll('.option__turns');
const colorSelect = document.querySelectorAll('.choices');
const patternSelect = document.querySelectorAll('.cell');
const pegSelect = document.querySelectorAll('.row');
const statusIndSelect = document.querySelectorAll('.status--indicator');
const turnSelect = document.querySelectorAll('.status');
const overlay = document.querySelector('.overlay__contain');
const overlayScore = document.querySelector('.score');
const headerScore = document.querySelector('.headerscore');
const headerHighScore = document.querySelector('.highscore');
const win = document.querySelector('.win');
const lose = document.querySelector('.lose');
const instructionTag = document.querySelector('.instruct');
const instructionTab = document.querySelector('.instructions');

//Settings
let colorNumber = 4;
let patternNumber = "4";
let turnNumber = 10;
let depth = 0;
let answer = [];
let guess = [];
let playerChoice;
let ready = false;

//Score
let score = 0;
let highScore = 0;

let colors = [
  "#f066f4", //pink
  "#660066", //purple
  "#000080", //dark blue
  "#48d1cc", //light blue
  "#006400", //forest green
  "#ffff00", //yellow
  "#614126", //dark red
  "#ff00ff", //weird pink
]

// Options Event Listeners
optTab.addEventListener('click', openDrawer);
eachColorChoice.forEach(choice => choice.addEventListener('click', changeChoice))
eachPatternChoice.forEach(choice => choice.addEventListener('click', changeChoice))
eachTurnChoice.forEach(choice => choice.addEventListener('click', changeChoice))
resetButton.addEventListener('click', gameInit);
instructionTag.addEventListener('click', slideOut);

// Open the Option Tab
function openDrawer() {
  if(optPanel.classList.contains('open')) {
    optPanel.classList.remove('open'); 
    if(instructionTab.classList.contains('open')) instructionTab.classList.remove('open');
  } else {
    optPanel.classList.add('open');
  } 
}

// Instruction Drawer
function slideOut() {
  
  (instructionTab.classList.contains('open')) ? instructionTab.classList.remove('open') : instructionTab.classList.add('open');
}

// Initialize starting conditions.
function gameInit() {
  depth = 0;
  createAnswer();
  colorSelectInit();
  patternSelectInit();
  turnSelectInit();
  readyGuess(patternNumber);
  if(win.classList.contains('on')) win.classList.remove('on');
  if(lose.classList.contains('on')) lose.classList.remove('on');
  if(overlay.classList.contains('on')) overlay.classList.remove('on');
  headerScore.innerText = 0;
}
gameInit();

/***
** Re-write how guesses are made
**/

// Setup the guess array
function readyGuess(len) {
  guess = [];
  
  do{
    guess.push('none');
    len--;
  }while(len>0);
  
}

// Set correct number of colors
function colorSelectInit() {
  colorSelect.forEach((one,i) => {
    if(i <= colorNumber-1) { //If under color limit
      if(!one.classList.contains('on')) one.classList.add('on');
      one.addEventListener('click', changeUserColor);
    } else { // If not
      if(one.classList.contains('on')) {
        one.classList.remove('on');
        one.removeEventListener('click',changeUserColor);        
      }
    }
  });
}

// User Color Changes on Click
function changeUserColor(e) {
  console.log(e.target);
  const targetId = e.target.id.split('-');
  const playerChoiceCirc = document.getElementById('colourchoice')
  playerChoice = colors[targetId[1]];
  playerChoiceCirc.style.backgroundColor = playerChoice;
}

// Changing number of spots to use. 4 or 5.
function patternSelectInit() {
  
  // Remove "Submit" buttons
  const buttonSelect = document.querySelectorAll('.ready');
  buttonSelect.forEach((butt) => { if(butt.classList.contains('on')) butt.classList.remove('on') });
  
  // Remove row indicators except first
  statusIndSelect.forEach((indicator) => { 
    if(indicator.classList.contains('active')) indicator.classList.remove('active');
    if(indicator.classList.contains('old')) indicator.classList.remove('old');
  });
  statusIndSelect[0].classList.add('active');
  
  // Reset any used hints
  const hintSelect = document.querySelectorAll('.hints');
  hintSelect.forEach((hint) => { 
    if(hint.classList.contains('right--right')) hint.classList.remove('right--right');
    if(hint.classList.contains('right--wrong')) hint.classList.remove('right--wrong');
  });
  
  // Set up Peg Arrangement
  pegSelect.forEach(peg => peg.style.backgroundColor = 'transparent');
  patternSelect.forEach(spot => { 
    
    // patternNumber decides on or off
    if(spot.classList[2].endsWith('4') && patternNumber === '4') {
      if(spot.classList.contains('on')) spot.classList.remove('on');
    }
    if(spot.classList[2].endsWith('4') && patternNumber === '5') {
      if(!spot.classList.contains('on')) spot.classList.add('on');
    }
    
    //first row ready
    if (patternNumber === '4' && spot.classList[1].endsWith('0') && !spot.classList[2].endsWith('4')) spot.addEventListener('click', setColor);
    if (patternNumber === '5' && spot.classList[1].endsWith('0')) spot.addEventListener('click', setColor);
  })
}

// Turn off rows based on Options
function turnSelectInit() {
  turnSelect.forEach((turn,i)=>{
    if(i<turnNumber) {
      if(!turn.classList.contains('on')) turn.classList.add('on');
    } else {
      if(turn.classList.contains('on')) turn.classList.remove('on');
    }
  });
}

// Placing colors for user choice
function setColor(e) {
  const peg = e.currentTarget.children[0];
  const fullLocation = peg.classList[2];
  const locationNumber = fullLocation.charAt(fullLocation.length-1);
  
  if(!playerChoice) { // If no choice, flash red.
    const playerChoiceCirc = document.getElementById('colourchoice');
    if(!playerChoiceCirc.classList.contains('error')) playerChoiceCirc.classList.add('error');
    setTimeout(function(){
        playerChoiceCirc.classList.remove('error');
    },300);
  } else { // Assign color to spot
    peg.style.backgroundColor = playerChoice;
    guess[locationNumber] = playerChoice; 
    
    // Are all the 'Guess' spots full?
    ready = true;
    console.log(guess);
    guess.forEach(individual => {
    console.log(individual);
      if(individual === 'none') ready = false;
    });   
  }
  
  // ready to submit
  if(ready) {
    const readyName = `.ready${depth}`;
    const readyButton = document.querySelector(readyName);
    if (!readyButton.classList.contains('on')) readyButton.classList.add('on');
    readyButton.addEventListener('click', readySubmit);
  }
}

// Check which are right, wrong and wrong place
function readySubmit() {
  let won = true;  
  let allRights = 0;
  console.log(answer);
  
  //which are right
  answer.map((each,i)=> { 
    (each !== guess[i]) ? won = false : allRights++;
  });
  
  findCorrect(allRights);
  
  if(won) {
    let thisScore = findScore();
    openPanel("win", thisScore);
  } else if (depth+1 >= turnNumber) {
    openPanel("lose", 0);    
  }else {
    depth++;
    nextLineInit(depth);
  }
}

// which are right, right place, and right, wrong place
function findCorrect(rightNumber) {
  const wrongNumberX = rightWrong();
  const wrongNumber = wrongNumberX - rightNumber;
  updateHints(rightNumber, wrongNumber);
}

// How many right colour
function rightWrong() {
  let wrongNumber = 0;
  const answerArr = [...answer];
  const guessHash = guess.reduce((hash, next) => {
    (hash[next]) ? hash[next]++ : hash[next] = 1;
    return hash;
  },{});
  answerArr.forEach(ans => {
    if(guessHash[ans]) {
      wrongNumber++;
      guessHash[ans]--;
    }
  });
  return wrongNumber;
}

// Update Hint array
function updateHints(rightNum, wrongNum) {
  const cellName = `.hintcell${depth}`;
  const hintCells = document.querySelectorAll(cellName);
  let rightNumber = rightNum;
  let wrongNumber = wrongNum;
  
  hintCells.forEach(hint => {
    
    if (rightNumber>0) {
      if(!hint.classList.contains('right--right')) hint.classList.add('right--right');
      rightNumber--;
    } 
    
    if (wrongNumber > 0) {
      if(!hint.classList.contains('right--right') && !hint.classList.contains('right--wrong')) hint.classList.add('right--wrong');
      wrongNumber--;
    }
  });
}

/***
** Refactor nextLineInit to smaller pieces?
***/

// Get the next line ready for Clicks
function nextLineInit(level) {
  
  // Row Indicator updating
  statusIndSelect[level-1].classList.remove('active')
  statusIndSelect[level-1].classList.add('old');
  statusIndSelect[level].classList.add('active');
  
  // Pegs & Submit updating
  patternSelect.forEach(spot => {
    const readyName = `.ready${depth-1}`;
    const readyButton = document.querySelector(readyName);
    const oldClass = spot.classList[1];
    if(parseInt(oldClass.charAt(oldClass.length-1)) === depth-1){
      spot.removeEventListener('click', setColor);
      if (readyButton.classList.contains('on')) readyButton.classList.remove('on');
      readyButton.removeEventListener('click', readySubmit);
    }
    if(parseInt(oldClass.charAt(oldClass.length-1)) === depth){
      spot.addEventListener('click', setColor);
    }
    readyGuess(patternNumber);
  });
}

// Finds the score using a mostly arbitrary method.
function findScore() {
  return score = ((colorNumber * 200) + (turnNumber * 200) + (4000/turnNumber));
}

// Display win or lose panel
function openPanel(verdict, score) {
  
  if (!overlay.classList.contains('on')) overlay.classList.add('on');
  (verdict === "win") ? win.classList.add('on') : lose.classList.add('on');
  
  updateScore(score);
}

// Updating score and high score. Later add local storage.
function updateScore(score) {
  
  if(score===0) {
    return;
  }
  
  overlayScore.innerText = score;
  if(score > highScore) {
    highScore = score;
    headerHighScore.innerText = score;
  }
  
  headerScore.innerText = score;
  
}

// Split the class Name to get value and option-type
function splitType(event) {
  const type = event.currentTarget.classList[1];
  const splitType = type.split('-');
  return [splitType[0], splitType[1]];
}

// Reinitialize the part of the board that changed.
function changeChoice(e) {
  const [thisType, thisNum] = splitType(e, thisType);
  if(thisType === 'colour') {
    colorsInit(thisNum);
  } else {
    initPatTurn(thisType, thisNum);
  } 
}

// initialize which colors are usable. 
function colorsInit(thisNum) {
  eachColorChoice.forEach(one => {
    const colorDiv = one.querySelector('.option__colour');
    if(one.dataset.which <= thisNum && !one.classList.contains('on')) {
      colorDiv.classList.add('on');
    } else if (one.dataset.which > thisNum) {
      colorDiv.classList.remove('on');
    }
  });
  colorNumber = thisNum;
  gameInit();
}

// Initialize the Rows
function initPatTurn(thisType, thisNum) {
  const typeName = `.option__${thisType}--number`
  const typeOptions = document.querySelectorAll(typeName);
  const elemName = `option-${thisNum}`
  const base = (thisType==='pattern')? eachPatternChoice: eachTurnChoice;
  
  (thisType === 'pattern') ? patternNumber = thisNum : turnNumber = thisNum;
  typeOptions.forEach((one) => { 
    
    if (one.classList.contains('on') && !one.classList.contains(elemName)){
      one.classList.remove('on');      
    } else if(!one.classList.contains('on') && one.classList.contains(elemName)) {
      one.classList.add('on');
    }
  });
  gameInit();
}

// Returns 42
function createAnswer() {
  answer = [];
  for (let i=0; i<patternNumber; i++) {
    answer.push(colors[Math.floor(Math.random() * (colorNumber))]);
  }
}

// Lets the user choose a color
function chooseColor(e) {
  if( !e ) e = window.event;
  let former = e.target;
  let bg = window.getComputedStyle(former, null).getPropertyValue("background-color");
  chosenColor = document.querySelector('.chosen');
  chosenColor.style.backgroundColor = bg;
  let rgbColor = chosenColor.style.backgroundColor;
  hexColor = rgbToHex(rgbColor);
  for(let i=0;i<colors.length;i++){
    if (colors[i] === hexColor) {
      choiceColor = i;
    }
  }
}