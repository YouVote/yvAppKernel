// - gets yvBaseProdUrl from information sent by host. 
define(["jquery"],function(){
	return function questionHandler(
			bodyManager,headManager,submitManager,kernelParams,interactManager
		){
		var question=this; var widObj;
		var baseProdUrl=kernelParams.baseProdUrl;

		this.initBaseProdUrl=function(tempBaseProdUrl){
			// baseProdUrl is provided by host,
			// defaults to kernelParams if not passed.
			if(tempBaseProdUrl!=""){
				baseProdUrl=tempBaseProdUrl;
			} 
			require.config({
				packages:[
					{"name":"ctype","location":baseProdUrl+"ctype/"},
					{"name":"async","location":baseProdUrl+"async/"},
				]
			})
		}
		// clean up the process.   
		this.execQn=function(widName,widParams,currAns){
			headManager.clear();bodyManager.clear();
			widPath=baseProdUrl+"mods/"+widName+".js";
			// inject yvProdBaseAddr into params.
			var system={}; if(widParams==null){widParams={}}; 
			system.yvProdBaseAddr=kernelParams.yvProdBaseAddr; 
			widParams["system"]=system;
			require([widPath],function(widget){
				var currWidObj=new widget.appEngine(widParams);
				var restoreState;
				if(currAns==undefined){
					submitManager.greyOut(false);
				} else {
					currWidObj.putAns(currAns);
					currWidObj.grayOut();
					submitManager.greyOut(true);
				}	
				if(typeof(currWidObj.widHead)=="function"){
					headManager.set(currWidObj.widHead());
				}
				if(typeof(currWidObj.widBody)=="function"){
					bodyManager.set(currWidObj.widBody())
				}
				// determine if this is the right pattern
				// when constructing this on the widget side. 
				if(typeof(currWidObj.passSigAw)=="function"){
					currWidObj.passSigAw(interactManager.sigAw);
				}
				if(typeof(currWidObj.sigWa)=="function"){
					question.sigWa=currWidObj.sigWa;
				}else{
					question.sigWa=function(data){
						console.warn("signal handler does not exist for " + widName);
					}
				}
				if(typeof(currWidObj.getAns)=="function"){
					submitManager.attachOnClick(function(){
						var ans=widObj.getAns();
						if(ans!=null){
							interactManager.studResp(ans)
							widObj.grayOut();
							submitManager.greyOut(true);
						} 
					});
					submitManager.hide(false);
				} else {
					submitManager.attachOnClick(function(){
						console.warn("getAns does not exist for " + widName);	
					});
					submitManager.hide(true);
				}
				widObj=currWidObj;
			},function(err){
				console.error(err+" when loading widget "+widName);
			});
		}
	}
})