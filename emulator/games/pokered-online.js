
addon = {
	sym : {
		TextInput : [1, 0x6597],
		BreakpointByte : [0x0000],
		BreakpointReturn : [0x0012]
	},
	char_map : {" " : 0x7f, A : 0x80, B : 0x81, C : 0x82, D : 0x83, E : 0x84, F : 0x85, G : 0x86, H : 0x87, I : 0x88, J : 0x89, K : 0x8A, L : 0x8B, M : 0x8C, N : 0x8D, O : 0x8E, P : 0x8F, Q : 0x90, R : 0x91, S : 0x92, T : 0x93, U : 0x94, V : 0x95, W : 0x96, X : 0x97, Y : 0x98, Z : 0x99, a : 0xA0, b : 0xA1, c : 0xA2, d : 0xA3, e : 0xA4, f : 0xA5, g : 0xA6, h : 0xA7, i : 0xA8, j : 0xA9, k : 0xAA, l : 0xAB, m : 0xAC, n : 0xAD, o : 0xAE, p : 0xAF, q : 0xB0, r : 0xB1, s : 0xB2, t : 0xB3, u : 0xB4, v : 0xB5, w : 0xB6, x : 0xB7, y : 0xB8, z : 0xB9, 0 : 0xF6, 1 : 0xF7, 2 : 0xF8, 3 : 0xF9, 4 : 0xFA, 5 : 0xFB, 6 : 0xFC, 7 : 0xFD, 8 : 0xFE, 9 : 0xFF },
	callbacks : {
		TextInput : function( breakpoint ){
			var name = document.getElementById('name'),
				go = document.getElementById('go'),
				l = 7;
			name.value = '';
			if( breakpoint.getBytes([0xD07D]) == 2) l = 10;
			name.setAttribute("maxlength", l );
			name.style.display="block";
			go.style.display="block";
			name.focus();
		}
	},
	init : function( breakpoint ){
		var go = document.getElementById('go'),
			name = document.getElementById('name');
				
		function submitName(){
			var byte_location = [0xCF4B];
			
			breakpoint.placeString( byte_location, name.value );
			breakpoint.placeBytes( byte_location, 0x50 );
			
			name.blur();
			name.style.display='none';
			go.style.display = 'none';
			
			breakpoint.return();
		}
		
		go.addEventListener('click',submitName);
		
		breakpoint.preventInput( name );
		
		name.addEventListener('keyup',function(e){ if( e.keyCode === 13 ) submitName(); });
		
		name.addEventListener('input',function(){
			name.value = breakpoint.cleanString( name.value );
		});
	}
}