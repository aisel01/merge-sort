var canvas,
	ctx,
	animatedObject,
	mergeSort;

var randArrButton,
	pushArrButton,
	animationSpeed,
	arrayInput,
	arrayLength,
	startSortButton;

function disableButtons(value) {
	pushArrButton.disabled = value;
	randArrButton.disabled = value;
	startSortButton.disabled = value;
}

function CanvasArray(width, height, borderColor, textColor) {

    this.array = new Array;
    this.length = 0;
    this.arrayElemWidth = width;
    this.arrayElemHeight = height;
    this.borderColor = borderColor;
    this.textColor = textColor;
    this.font = '20px Arial';

    this.startXPos = 0;
    this.startYPos = 0;

}
CanvasArray.prototype.fillRand = function() {
    for(var i = 0; i < this.length; i++){
        this.array[i] = parseInt(Math.random() * 100);
	}
};
    
CanvasArray.prototype.fillByUser = function() {
    var inputArr = arrayInput.value.split(' ').slice(0, this.length);

	for(var i = 0; i < this.length; i++) {
		this.array[i] = +inputArr[i];
		if  (isNaN(this.array[i])) {
			alert("Проверьте массив!"); 
			this.array = null;
			break;
		}
	}
};

CanvasArray.prototype.init = function(randomly) { 
   	this.array = new Array();
   	this.length = +arrayLength.value;
   	this.startXPos = (canvas.width - this.length * this.arrayElemWidth) / 2;
	this.startYPos = canvas.height - 400;
	randomly ? this.fillRand() : this.fillByUser();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	this.draw(this.startXPos, this.startYPos, 0, this.length - 1, 'black');
};

CanvasArray.prototype.draw = function(marginLeft, marginTop , leftIdx, rightIdx,color) {
    if (marginLeft === undefined) marginLeft = this.startXPos;
   	if (marginTop === undefined) marginTop = this.startYPos;
    if (leftIdx === undefined) leftIdx = 0;
    if (rightIdx === undefined) rightIdx = this.length - 1;

    if (this.array === null) return;
    var textMarginLeft = this.arrayElemWidth/2 + marginLeft,
    	textMarginTop = this.arrayElemHeight/2 + marginTop;

    ctx.strokeStyle = color || this.borderColor;
	ctx.fillStyle = color || this.textColor;
	ctx.font = this.font;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

    for(var j = 0, i = leftIdx; i <= rightIdx; i++, j++) {	
    	ctx.strokeRect(j * this.arrayElemWidth + marginLeft, marginTop, this.arrayElemWidth, this.arrayElemHeight);
		ctx.fillText(this.array[i], j*this.arrayElemWidth + textMarginLeft, textMarginTop);
	}
};

CanvasArray.prototype.highlightRange = function(low,high) {
	ctx.fillStyle = 'rgba(0, 0, 254, 0.3)';
		
	for(var i = low; i <= high; i++) {
		ctx.fillRect(	
			this.startXPos + i * this.arrayElemWidth, 
			this.startYPos, 
			this.arrayElemWidth, 
			this.arrayElemHeight
		);				
	}	
	for(var i = low; i <= high; i++) {
		this.draw(
			this.startXPos + low * this.arrayElemWidth,
			this.startYPos,
			low,
			high,
			'black'
		);
	}
};

function Algorithm(array) {
	this.commands = new Array();
	this.arrayData = array;
}

Algorithm.prototype.doMergeSort = function(lb, ub) {
	this.cmd('highlight', lb, ub, 'blue');
	var split;	
	if (lb < ub){
		split = parseInt((lb + ub) / 2);	
		this.doMergeSort(lb, split);
		this.doMergeSort(split + 1, ub);
		this.merge(lb, split, ub);
	}
	return;
};

Algorithm.prototype.merge = function(lb, split, ub) {
	this.cmd('highlight', lb, ub, 'green');
	var i = lb,
		j = split + 1;
		k = 0,
		temp = [];

	while(i <= split && j <= ub) {
		if (this.arrayData[i] <= this.arrayData[j]){
			this.cmd('move', i, k + lb);
			temp[k++] = this.arrayData[i++];
		} else {
			this.cmd('move', j, k + lb);
			temp[k++] = this.arrayData[j++];
		}
	}

	while(i <= split) {
		this.cmd('move', i, k + lb);
		temp[k++] = this.arrayData[i++];
	}
	while(j <= ub) {
		this.cmd('move', j, k + lb);
		temp[k++] = this.arrayData[j++];
	}
	this.cmd('movemerged', lb, ub, temp);
	for(k = 0; k < ub - lb + 1; k++){
		this.arrayData[lb + k] = temp[k]; 
	}
	return;
};

Algorithm.prototype.cmd = function() {
	var command = arguments[0];
	for(i = 1; i < arguments.length; i++) {
		command = command + "<;>" + String(arguments[i]);
	}
	this.commands.push(command);
};

function step() {
	var args = arguments[0];

	args = args.split('<;>');
	
	var command = args[0];
	var n = args.length;
	if (command === 'highlight' || command === 'movemerged') n--;

	for(i = 1; i < n; i++){
		args[i] = parseInt(args[i]);
	}
	
	if (command === 'highlight') {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		animatedObject.draw();
		animatedObject.highlightRange(args[1], args[2]);	
	}
	if (command === 'move') {
		ctx.clearRect(
			animatedObject.startXPos + animatedObject.arrayElemWidth * args[1] + 1,
			animatedObject.startYPos + 1,
			animatedObject.arrayElemWidth - 2,
			animatedObject.arrayElemHeight - 2 
		);
		animatedObject.draw(
			animatedObject.startXPos + animatedObject.arrayElemWidth * args[2],
			animatedObject.startYPos + 100,
			args[1],
			args[1],
			'black'
		);	
		ctx.fillStyle = 'rgba(0, 0, 254, 0.3)';
		ctx.fillRect(
			animatedObject.startXPos + animatedObject.arrayElemWidth * args[2],
			animatedObject.startYPos + 100,
			animatedObject.arrayElemWidth,
			animatedObject.arrayElemHeight
		);
	}
	if (command === 'movemerged') {
		var tmp = args[3].split(',');
		for(var i = args[1], j = 0; i <= args[2]; i++, j++){
			animatedObject.array[i] = tmp[j];
		}
		animatedObject.draw(
			animatedObject.startXPos + animatedObject.arrayElemWidth * args[1],
			animatedObject.startYPos,
			args[1],
			args[2],
			'black'
		);	
		ctx.clearRect(
			animatedObject.startXPos - 1,
			animatedObject.startYPos + 100 - 1,
			animatedObject.arrayElemWidth * animatedObject.length + 2,
			animatedObject.arrayElemHeight + 2
		);
	}
}

function animatestep(i) {
	animationSpeed = document.getElementById('speed').value;
	if (i >= mergeSort.commands.length){
		clearTimeout(timer);
		disableButtons(false);
	}

	step(mergeSort.commands[i]);
	timer = setTimeout(function() {
		animatestep(i + 1);
	}, 3000/animationSpeed);

}

function initCanvas() {
	canvas =  document.getElementById("canvas");
	ctx = canvas.getContext('2d');

	animatedObject = new CanvasArray(30, 30, 'grey', 'grey');

	randArrButton = document.getElementById('randomize-button');
	pushArrButton = document.getElementById('submit-array-button');
	animationSpeed = document.getElementById('speed').value;
	arrayInput = document.getElementById('input-array');
	arrayLength = document.getElementById('arr-length');
	startSortButton = document.getElementById('sort-button');

	animatedObject.init(true);

	randArrButton.onclick = function() {
		animatedObject.init(true);
	};

	pushArrButton.onclick = function() {
		animatedObject.init(false);
	};	

	startSortButton.onclick = function() {
		disableButtons(true);
		var tmpArray = animatedObject.array.map(function(item){return item});
		mergeSort = new Algorithm(tmpArray);		

		mergeSort.doMergeSort(0, animatedObject.array.length - 1);		
		
		var timer;
		animatestep(0);
	};
}

initCanvas();