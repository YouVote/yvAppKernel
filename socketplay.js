define([],function(){
	return function socketPlay(kernelParams,interactManager){
		var socketPlayObj=this;
		require(["socketio-server"],function(io){
			try{
				var socketCore=io.connect(kernelParams.socketServerURL);
			} catch(err){
				interactManager.socketFailCallback(2,err);
			}
			socketCore.on('connectType?',function(){ 
				socketCore.emit('connectType=',{'app':'cl','type':'play','gameId':kernelParams.gameId}); 
			}); 

			var shutdownmsg="";
			socketCore.on('shutdown',function(msg){
				shutdownmsg=msg;
			});
			socketCore.on('disconnect',function(msg){
				if(shutdownmsg==""){
					interactManager.socketFailCallback(3, msg);	
				} else {
					interactManager.socketFailCallback(4, msg+' - '+shutdownmsg);
				}
			});
			socketCore.on('ping',function(){
				socketCore.emit('pong',{beat:1}); 
			});

			socketCore.on('relay',function(packet){
				switch(packet.title){
					case 'studentParams?':
						socketPlayObj.relay({'title':'studentParams=','studentName':kernelParams.studentName,'uuid':kernelParams.deviceUuid}); 
						interactManager.socketPassCallback(packet.baseUrl);
						break;
					case 'execModule':
						interactManager.execQn(packet.modName,packet.modParams,packet.currAns);
						break;
					case "tranSig":
						interactManager.sigWa(packet.data);
						break;
					case 'qnStatus':
						break;
				};
			});
			socketPlayObj.relay=function(msg){
				socketCore.emit('relay',msg);
			}
		},function(err){
			interactManager.socketFailCallback(1,err)
		})
		return socketPlayObj;
	}
})

