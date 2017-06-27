// yvAppKernel can generally be used as is - requirements are generally 
// clear from the interface. 
// One requirement that is not so obvious is the specification of jquery
// through require.config(). 
// This is required by questionhandler, and allows for specifying the file
// locally as in the ionic use case. 

define(["./clicker","./socketplay","./questionhandler"],
function(clicker,socketPlayEngine,qnHandlerEngine){
	return function(gameId,studentName,deviceUuid){
		var yvAppKernel=this;
		var connectCalled=false;
		var kernelParams={
			"socketScriptURL":"https://avalon-gabrielwu84.rhcloud.com/socket.io/socket.io",
			"socketServerURL":"https://avalon-gabrielwu84.rhcloud.com:8443",
			"gameId": gameId,
			"deviceUuid":deviceUuid,
			"studentName":studentName,
			"optDiv":document.createElement("div"),
			"submitBtn":document.createElement("button"),
			"baseProdUrl":"https://youvote.github.io/clicker-prod/",
			onConnectPass:function(baseProdUrl){},
			onConnectFail:function(humanErrMsg,origErrMsg){}
		}
		var interactManager={
			// used in socketPlay
			socketPassCallback:function(baseProdUrl){
				// updating kernelParams here is not really necessary.
				// qnHandlerObj.initBaseProdUrl already initiates changes where it matters.  
				// remove this comment when it becomes necessary, stating where,  
				// and consider if should pass through setKernelParams method. 
				kernelParams["baseProdUrl"]=baseProdUrl; 
				qnHandlerObj.initBaseProdUrl(baseProdUrl);
				kernelParams.onConnectPass(baseProdUrl);
			},
			socketFailCallback:function(originCode,errmsg){ 
				// original message
				var human="Error "+originCode+": \n"+errmsg;
				// try to decode cause into human format
				switch(originCode){
					case 1:
						human="Could not connect to server. Please check your internet connection.";
						break;
					case 2:
						break;
					case 3:
						switch(errmsg){
							case "transport error":
								human="Internet connection interrupted";
								break;
							case "io server disconnect":
								human="Lesson not found. Please check Lesson ID.";
								break;
						}
						break;
					case 4:
						human="Lesson Ended";
						break;
				}
				kernelParams.onConnectFail(human,"Error "+originCode+": \n"+errmsg);
			},
			execQn:function(widName,widParams,currAns){
				qnHandlerObj.execQn(widName,widParams,currAns);
			},
			sigWa:function(data){
				qnHandlerObj.sigWa(data);
			},
			// used in qnHandler
			studResp:function(ans){
				socketPlayObj.relay({'title':'ans','data':ans});
			},
			sigAw:function(sig){
				socketPlayObj.relay({'title':'transig','data':sig})
			}
		}
		this.setKernelParam=function(name,value){
			if(typeof(kernelParams[name])!==typeof(value)){ 
				if(typeof(kernelParams[name])!="undefined"){
					console.warn("WARNING: param '"+name+"' is not of correct type.");
					console.warn("Should be of type "+ typeof(kernelParams[name]));
					console.warn("but it is of type "+ typeof(value));
				} else {
					console.warn("WARNING: param '"+name+"' is not a valid kernelParam.");
				}
			}
			if(!connectCalled){
				kernelParams[name]=value;
			}else{
				console.warn("cannot change kernel params after socket opened");
				console.warn("setKernelParams "+ name +"="+value+" is ignored");	
			}
		}

		this.connect=function(){
			connectCalled=true;
			qnHandlerObj=new qnHandlerEngine(kernelParams,interactManager);
			require.config({paths:{"socketio-server":kernelParams.socketScriptURL}});
			socketPlayObj=new socketPlayEngine(kernelParams,interactManager);
		}
	}
})
