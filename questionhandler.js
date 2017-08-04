define(["jquery"],function(){
	return function questionHandler(kernelParams,interactManager){
		var question=this; var widObj;
		var baseProdUrl=kernelParams.baseProdUrl;
		var widFrame=kernelParams.widFrame;
		submitBtn=kernelParams.submitBtn;
		submitBtn.disabled=true;


		// create a head manager. 
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

		//submitBtnManager

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
				bodyManager.set(currWidObj.widBody())
				// determine if this is the right pattern
				// when constructing this on the widget side. 
				if(typeof(currWidObj.sigAw)=="function"){
					currWidObj.sigAw(kernelParams.sigAw);
				}
				if(typeof(currWidObj.sigWa)=="function"){
					question.sigWa=currWidObj.sigWa;
				}else{
					question.sigWa=function(data){
						console.warn("signal handler does not exist for " + widName);
					}
				}
				widObj=currWidObj;
			},function(err){
				// in case of invalid widName
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