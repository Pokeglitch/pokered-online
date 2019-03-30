
var Interface = ( function(){


	document.addEventListener("DOMContentLoaded",function(){
		gameboy = GameBoyCore( document.getElementById("mainCanvas"), ROM, {
			sound : XAudio,
		}, addon );
	});

	//Order: Right, Left, Up, Down, A, B, Select, Start, Speed up, Rapid
	var map = [39, 37, 38, 40, 90, 88, 13, 220, 32, 16];
	var map_state = [false,false,false,false,false,false,false,false,false,false];

	function handleKeyPress( code, val ){
		var index = map.indexOf(code),
			speed = val ? 3 : 1;
		if (index>-1){
			if(index < 8) {
				//if rapid, then switch the value to the opposite of current value
				if( map_state[9] ){
					val = !map_state[index];
				}
				gameboy.JoyPadEvent(index, val);
			}
			//change speed if appropro
			else if(index == 8 && map_state[8] !== val) gameboy.setSpeed( speed );
			
			map_state[index] = val;
		}
	}

	document.addEventListener('keydown', function(ev){
	  handleKeyPress(ev.keyCode, true);
	});

	document.addEventListener('keyup', function(ev){
	  handleKeyPress(ev.keyCode, false);
	});
	
})();