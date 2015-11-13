var breakpoints = {
	0 : {
		bank: 1,
		count: 0x6597,
		callback : function(){
			e = document.getElementById('name');
			e.value = ''
			e.style.display="block";
			l = 7;
			if( gameboy.memory[0xD07D] == 2) l = 10;
			e.setAttribute("maxlength", l )
			g = document.getElementById('go');
			g.style.display="block";
			e.focus();
		},
	},
	//unset the flag
	1 : {
		bank : 0,
		count : 0x0012,
		callback : initBreakpointByte,
	}
}

function initBreakpointByte(){
	gameboy.memory[0] = 0x01;
}

function finishBreakpoint(){
	gameboy.memory[0] |= 1 << 1;
}