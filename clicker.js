//require([],function(){
	$_GET=function(key) {
	    var value = window.location.search.match(new RegExp('[?&]' + key + '=([^&#]*)'));
	    return value && value[1];
	}

	// remove this in production.
	// and check that it does not interfere with original device.uuid function
	// when run on devices.
	genId={
		genChar:function (){
			var i=Math.floor(Math.random()*36);
			return (i>9?String.fromCharCode(i-10+97):i.toString());
		},

		genStr:function (len){
			var s='';while(len--){s+=genId.genChar();}return s;
		}
	}
	// make sure to execute
	// cordova plugin add cordova-plugin-device
	if(typeof device=='undefined'){
		var device={};
		if($_GET('uuid')!=null){
			device.uuid=$_GET('uuid');
		} else {
			device.uuid=genId.genStr(8);
		}
	}
//});