/*****
Todo:
-place byte with certain endian
-can have a breakpoint return byte, and any input into the 'return' function will write to that byte
	-string and bytes

Why does gameboy 'catch up' after breakpoint?

For holding down keys, only the last key is repeated
	-use timeout loop instead?
	-doesnt work properly when focus switches to input
	
Work for gameboy color?
	-banks different?
	-ram has banks?
	
HTML elements got into a div with ID 'interaction'
*****/
function Breakpoint( data, gb ){
	
	var char_map, inverse_char_map, each, break_byte,
		breaks = {},
		global_breaks = {},
		sym = data.sym,
		callbacks = data.callbacks,
		FLAGS = {
			USING_EMULATOR :		0,
			RETURN :				1,
			CONNECTED_TO_SERVER :	2,
			LOGGED_IN :				3,
			CARRY :					4,
			HALF_CARRY :			5,
			OPERATION :				6,
			ZERO :					7,
		},
		helpers = {
			placeString : placeString,
			placeBytes : placeBytes,
			return : breakpointReturn,
			getBytes : getBytes,
			getString : getString,
			setBit : setBit,
			getBit : getBit,
			setCarry : setCarry,
			setHalfCarry : setHalfCarry,
			setOperation : setOperation,
			setZero : setZero,
			resetFlags : resetFlags,
			cleanString : cleanString,
			preventInput : preventInput
		};
	
	//if there is no breakpoint data, then return false
	if( !('BreakpointByte' in sym) || !('BreakpointReturn' in sym) ) return false;
	
	//Store the char_map if one was provided
	if( data.char_map ){
		char_map = data.char_map;
		inverse_char_map = {};
		for( each in char_map ){
			inverse_char_map[ char_map[each] ] = each;
		}
	}
	
	/*****
	Helpers
	*****/
	function setCarry( val ){
		setBit(break_byte, FLAGS.CARRY, val);
	};
	function setHalfCarry( val ){
		setBit(break_byte, FLAGS.HALF_CARRY, val);
	};
	function setOperation( val ){
		setBit(break_byte, FLAGS.OPERATION, val);
	};
	function setZero( val ){
		setBit(break_byte, FLAGS.ZERO, val);
	};
	
	//to place chars at a certain location in memory
	function placeString(){
		var str, len, f, i,
			args = Array.prototype.slice.call(arguments),
			byte_location = args.splice(0,1)[0];
		
		if( char_map ){
			f = function( arr, j ){
				arr[j] = char_map[str[i]];
			}
		}
		else{
			f = function( arr, j ){
				arr[j] = str[i];
			}
		}
		
		while( args.length > 0 ){
			str = args.splice(0,1)[0];
			if( str.constructor === String || str.constructor === Array ){
				len = str.length;
				for(i=0;i<len;i++){
					setByte( byte_location, f );
					byte_location[ byte_location.length-1 ]++;
				}
			}
		}
	}
	
	//to place bytes at a certain location in memory
	function placeBytes(){
		var i, j, len, f, num,
			args = Array.prototype.slice.call(arguments),
			byte_location = args.splice(0,1)[0];
		
		f = function( arr, k ){
			arr[k] = num;
		}
		
		while( args.length > 0 ){
			i = args.splice(0,1)[0];
			if( i.constructor === Number ){
				num = i;
				setByte( byte_location, f );
			}
			else if( i.constructor === Array ){
				len = i.length;
				for(j=0;j<len;j++){
					num = i[j];
					setByte( byte_location, f );
					byte_location[ byte_location.length-1 ]++;
				}
			}
		}
	}
	
	//To return from the breakpoint and resume game function
	function breakpointReturn(){
		var f = function( arr, i ){
			arr[i] |= 1 << FLAGS.RETURN;
		}
		setByte( break_byte, f );
	}
	
	//to read bytes
	function getBytes( byte_data, length ){
		var ret = [],
			count = byte_data[ byte_data.length -1 ],
			bank;

		if( byte_data.length > 1 ) bank = byte_data[0];
			
		if( bank ) count += bank*0x4000;
		
		//if a length was given, then return an array
		if( length ) while( length-- > 0 ) ret.push( gb.memory[count++] );
		else return gb.memory[count];
		
		return ret;
	}
	
	//to read a string
	function getString(){
		var c, getNext,
			args = Array.prototype.slice.call(arguments),
			byte_location = args.splice(0,1)[0],
			next = args.splice(0,1)[0],
			ret = '';
		
		if( inverse_char_map ){
			getNext = function( i ){
				return inverse_char_map[ getBytes( byte_location ) ];
			}
		}
		else{
			getNext = function( i ){
				var s = i > 0x10 ? '' : '0';
				return s+i.toString(0x10);
			}
		}
		
		if( next.constructor === String ){
			c = getNext(byte_location );
			while( next !== c ){
				ret += c;
				byte_location[ byte_location.length-1 ]++;
				c = getNext(byte_location );
			}
		}
		else if(next.constructor === Number ){
			while( next-- > 0 ){
				ret += getNext(byte_location );
				byte_location[ byte_location.length-1 ]++;
			}
		}
		
		return ret;
	}
	
	//to modify a byte
	function setByte( byte_data, f ){
		var count = byte_data[ byte_data.length -1 ],
			bank;

		if( byte_data.length > 1 ) bank = byte_data[0];
			
		if( bank ){
			f( gb.ROM, count + bank*0x4000 );
			//if we are in the current bank, then apply to the memory
			if( gb.ROMBank1offs === bank ) f( gb.memory, count );
		}
		else{
			f( gb.memory, count );
			//if it is in the home bank, then also apply to the ROM
			if( count < 0x4000 ) f( gb.ROM, count );
		}
	}
	
	//to reset the flags
	function resetFlags(){
		var f = function( arr, i ){
			arr[i] &= 0x0F;
		}
		setByte( break_byte, f );
	}
	
	//to set a bit
	function setBit(byte_data, bit, val){
		var f;
		
		if(val === undefined){
			val = true;
		}
		
		if( val ){
			f = function( arr, i ){
				arr[i] |= (1 << bit );
			}
		}
		else{
			f = function( arr, i ){
				arr[i] &= ~( 1 << bit );
			}
		}
		
		setByte( byte_data, f );
	}
	
	//to get a bit
	function getBit( byte_data, bit ){
		return getBytes( byte_data ) & 1 << bit;
	}
	
	//to remove unacceptable chars from the given string
	function cleanString( str ){
		var i, c,
			ret_str = '',
			l = str.length;
			
		for(i=0;i<l;i++){
			c = str[i];
			if( c in char_map  ) ret_str += c;
		}
		
		return ret_str;
	}
	
	//to prevent the input of the given element(s) from controlling the emulator
	function preventInput(){
		var args = Array.prototype.slice.call(arguments);
		
		function stopProp(e){
			e.stopPropagation();
		}
		
		args.forEach(
			function( el ){
				el.addEventListener("keydown",stopProp);
				el.addEventListener("keyup",stopProp);
			}
		);
	}
	
	/*****
	Functions called from the GameBoyCore
	*****/
	//To check to see if we reached a breakpoint, and execute if so
	this.checkBreakpoint = function(){
		var index,
			bank = gb.ROMBank1offs,
			count = gb.programCounter;
		
		if( count in global_breaks ) setTimeout(global_breaks[count],1);
		else if( bank in breaks ){
			index = breaks[bank].counts.indexOf(count);
			if( index > -1 ) setTimeout(breaks[bank].callbacks[index],1);
		}		
	}
	
	//initialize the breakpoint byte
	this.initBreakpointByte = function(){
		setBit( break_byte, FLAGS.USING_EMULATOR );
	}
	
	/*****
	To init the breakpoint data
	*****/
	function init(){
		var each, count, bank, callback;
		
		function getResetFlagCallback( f ){
			return function(){
				resetFlags();
				f( helpers );
			}
		}
		
		function getCallback( f ){
			return function(){
				f( helpers );
			}
		}
		
		//To set up the breakpoints for quick references
		for( each in sym ){
			count = sym[each][sym[each].length-1];
			bank = null;
			callback = null;
			
			//To get the bank from the sym if it exists
			//Won't exists for home bank or RAM
			if( sym[each].length > 1 ) bank = sym[each][0];
			
			if( each === 'BreakpointByte' )	break_byte = sym[ each ];
			else if( each === 'BreakpointReturn' ){
				callback = getCallback( function(){
					setBit(break_byte, FLAGS.RETURN, false);
				} );
			}
			else if( each in callbacks ){
				callback = getResetFlagCallback( callbacks[each] );
			}

			if( callback ){
				if( bank ){
					if( bank in breaks ){
						breaks[bank].counts.push(count);
						breaks[bank].callbacks.push( callback );
					}
					else{
						breaks[bank] = {
							counts : [count],
							callbacks : [callback]
						};
					}
				}
				else{
					global_breaks[count] = callback;
				}
			}
		}
		
		//initialize if necessary
		if( data.init ) data.init( helpers );
		
	}
	
	//Init the data
	init();
	
}