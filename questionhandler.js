define([],function(){
	return function questionHandler(optDiv,submitBtn,kernelParams,interactManager){
		var question=this; var widObj;
		var baseProdUrl=kernelParams.baseProdUrl;
		submitBtn.disabled=true;
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
			var restoreState;
			$(optDiv).empty(); $(optDiv).attr("class","");
			if(currAns==undefined){
				restoreState=function(){}
				submitBtn.onclick=this.submit;
				submitBtn.disabled=false;
			} else {
				restoreState=function(){
					widObj.putAns(currAns);
					widObj.grayOut();
				}
				submitBtn.disabled=true;
			}
			widPath=baseProdUrl+"mods/"+widName+".js"
			require([widPath],function(mod){
				widObj=new mod.appEngine(widParams,restoreState);
				$(optDiv).html(widObj.responseDom());
				
				// determine if this is the right pattern
				// when constructing this on the widget side. 
				if(typeof(widObj.sigAw)=="function"){
					widObj.sigAw(kernelParams.sigAw);
				}
				if(typeof(widObj.sigWa)=="function"){
					question.sigWa=widObj.sigWa;
				}else{
					question.sigWa=function(data){
						console.warn("signal handler does not exist for " + widName);
					}
				}
			});
		}
		this.submit=function(){
			var ans=widObj.getAns();
			if(ans!=null){
				interactManager.studResp(ans)
				widObj.grayOut();
				submitBtn.disabled=true;
			} 
		}
	}
})