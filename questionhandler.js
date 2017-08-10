define(["jquery"],function(){
	return function questionHandler(bodyManager,headManager,kernelParams,interactManager){
		var question=this; var widObj;
		var baseProdUrl=kernelParams.baseProdUrl;
		submitBtn=kernelParams.submitBtn;
		submitBtn.disabled=true;

		//submitBtnManager, with 
		// 1. attach getAns
		// 2. greyOut
		// 3. hide
		this.initBaseProdUrl=function(tempBaseProdUrl){
			// update baseProdUrl if something non-trivial is passed;
			// else, revert to default found in kernelParams
			if(tempBaseProdUrl!=""){
				baseProdUrl=tempBaseProdUrl;
			} 
			require.config({
				packages:[
					{"name":"ctype","location":baseProdUrl+"ctype/"},
				]
			})
		}
		this.execQn=function(widName,widParams,currAns){
			headManager.clear();bodyManager.clear();
			widPath=baseProdUrl+"mods/"+widName+".js";
			require([widPath],function(mod){
				var currWidObj=new mod.appEngine(widParams);
				var restoreState;
				if(currAns==undefined){
					restoreState=function(){}
					// submit button manager
					// submitBtn.enabled()
					submitBtn.onclick=question.submit;
					submitBtn.disabled=false;
				} else {
					restoreState=function(){
						currWidObj.putAns(currAns);
						currWidObj.grayOut();
					}
					// submitBtn.disabled()
					submitBtn.disabled=true;
				}	
				currWidObj.onDomReady(restoreState);
				// check if widHead exists first.		
				if(typeof(currWidObj.widHead)=="function"){
					// if typeof is string, pass it to jquery
					// console.log(widObj.widHead())
					// var $style=$()
					// console.log($style)
					// $style.appendTo($head);
					headManager.set(currWidObj.widHead());
				}

				// $body.html(widObj.widBody());
				// check if widBody exists first.	
				bodyManager.set(currWidObj.widBody())
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
					submitBtn.onclick=function(){
						var ans=widObj.getAns();
						if(ans!=null){
							interactManager.studResp(ans)
							widObj.grayOut();
							submitBtn.disabled=true;
						} 
					}
				} else {
					// hide submit button also
					submitBtn.onclick=function(){
						console.warn("getAns does not exist for " + widName);	
					}
				}
				widObj=currWidObj;
			},function(err){
				// in case of invalid widName
				console.error(err+" when loading widget "+widName);
			});
		}
	}
})