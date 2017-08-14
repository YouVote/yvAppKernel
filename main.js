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
		var socketPlayObj, qnHandlerObj;
		var connectCalled=false;
		var kernelParams={
			"socketScriptURL":"https://avalon-gabrielwu84.rhcloud.com/socket.io/socket.io",
			"socketServerURL":"https://avalon-gabrielwu84.rhcloud.com:8443",
			"gameId": gameId,
			"deviceUuid":deviceUuid,
			"studentName":studentName,
			"widFrame":document.createElement("iframe"),
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
				socketPlayObj.relay({'title':'tranSig','data':sig})
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

		// Tidy this up when gadget and widlets implemented.  
		function initManagers(){
			// var widFrame=kernelParams.widFrame;
			// 1. remove old head, and add new head. 
			var headManager=new function($head){
				// var $currPermStyle
				// currwidstyle should be an array of jquery styles. 
				var $currWidHead=null;
				this.setPerm=function(newStyle){
					$head.append(newStyle)
				}
				this.clear=function(){ // simply clear
					// check if exists [loop over and remove]
					if($currWidHead!=null){
						$currWidHead.remove();
					}
				}
				this.set=function(newStyle){ // setItem
					// generalize this to check if array
					// check if newStyle is array.
					if(typeof(newStyle)=="string"){
						$newStyle=$(newStyle);
					} else {
					// check if it is jquery obj.
						$newStyle=newStyle;
					}
					$newStyle.appendTo($head);
					// push.
					$currWidHead=$newStyle;
				}
			}($(widFrame).contents().find("head"));
	
			var url = "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css";
			headManager.setPerm($("<link/>", { rel: "stylesheet", href: url, type: "text/css" } ));
	
			var bodyManager=new function($body){
				this.clear=function(){
					$body.empty(); $body.attr("class","");
				}
				this.set=function(content){
					$body.html(content);
				}
			}($(widFrame).contents().find("body"));
	
			var submitManager=new function($submitBtn){
				this.attachOnClick=function(getAns){
					$submitBtn.onclick=getAns;
				}
				this.greyOut=function(bool){
					$submitBtn.disabled=bool;
				}
				this.hide=function(bool){
					// yet to implement in ionic
					$submitBtn.disabled=bool;
				}
			}(kernelParams.submitBtn);

			return {
				"body":bodyManager,
				"head":headManager,
				"submit":submitManager
			}
		}

		this.connect=function(){
			connectCalled=true;
			var managers=initManagers();
			// head.clear()
			qnHandlerObj=new qnHandlerEngine(
				managers.body,managers.head,managers.submit,
				kernelParams,interactManager
			);
			require.config({paths:{"socketio-server":kernelParams.socketScriptURL}});
			socketPlayObj=new socketPlayEngine(kernelParams,interactManager);
		}
	}
})
