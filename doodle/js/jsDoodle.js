

(function($){

    $.fn.jsDoodle = function(options) {
    
        function posFromEvent(e,self) {
          return {x:(e.pageX-self.offsetLeft)*1.0/self.offsetWidth,
            y:(e.pageY-self.offsetTop)*1.0/self.offsetHeight
          };
        }
        
        function createCanvas(parent) {
          var w=parent.clientWidth-4;
          var h=parent.clientHeight-4;
          var cv=$('<canvas width="'+w+'" height="'+h+'"></canvas>');
          cv.appendTo(parent);
          return cv.get(0);
        }
        
        SetLineWidth=function(width) {
          return {
            w:width,
            draw:function(ctx) { ctx.lineWidth=this.w*ctx.canvas.width/400; }
          }
        };
        SetLineCap=function(width) {
          return {
            w:width,
            draw:function(ctx) { ctx.lineCap=this.w; }
          }
        };
        
        SetStrokeStyle=function(pstyle) {
          return {
            style:pstyle,
            draw:function(ctx) { ctx.strokeStyle=this.style; }
          }
        }
        
        DrawTo=function(toPos){
          return {
            to:toPos,
            draw:function(ctx) {ctx.lineTo(this.to.x*ctx.canvas.width,this.to.y*ctx.canvas.height); }
          }
        };
        BeginPath=function() {
          return {
            draw:function(ctx) {ctx.beginPath(); }
          }
        };
        ClosePath=function(){
          return {
            draw:function(ctx) {ctx.closePath(); }
          }
        };
        MoveTo=function(toPos){
          return {
            to:toPos,
            draw:function(ctx) { 
            ctx.moveTo(this.to.x*ctx.canvas.width,this.to.y*ctx.canvas.height); }
          }
        };
        Stroke=function() {
          return {
            draw:function(ctx) {ctx.stroke(); }
          }
        }

        // Define default settings.
        var options = $.extend({
            lineWidth: 6,
            lineColor:'#FFFF00',
            lineCap:"round",
            readonly:false,
        },options);
        
        var self=this.get(0);
        var canvas;
        var name;
        if(self.nodeName=="CANVAS")
          canvas=self;
        else
          canvas=createCanvas(self);
        
       if ($.browser.msie) // excanvas hack
         canvas = window.G_vmlCanvasManager.initElement(canvas);
       var ctx = canvas.getContext("2d");
       
       Array.prototype.clone=function() {
         a=[];
         for(i=0;i<this.length;i++)
           a[a.length]=this[i];
         return a;
       }

       var drawList=[];
       var onclicks=[];
       
       $(this).click(function(e) {
         if(options.readonly) {
           var i;
           for(i=0;i<onclicks.length;i++)
             onclicks[i](this,e);
         }
       });

       $(this).mousedown(function(e){
         if(!options.readonly)
           this.linePos=posFromEvent(e,this);
       });
       $(this).mouseup(function(e) {
         if(!options.readonly)
           this.linePos=null;
       });
       $(this).mousemove(function(e) {
        if(options.readonly)
          return;
        if(!this.linePos)
            return;
          var pos=posFromEvent(e,this);
          var oldpos=this.linePos;
          this.linePos=pos;

          append(new BeginPath());
          append(new MoveTo(oldpos));
          append(new DrawTo(pos));
          append(new Stroke());
          append(new ClosePath());
       });
       
       function append(object) {
         drawList[drawList.length]=object;
         object.draw(ctx);
       }
       
       function init() {
         append(new SetLineWidth(options.lineWidth));
         append(new SetStrokeStyle(options.lineColor));
         append(new SetLineCap(options.lineCap));
         append(new BeginPath());
       }
       
       init();
       
       simpleCloneFunction=function() {
          return {drawList:this.drawList.clone(),name:this.name,clone:this.clone};
       }
       
       
       self.doodle_api={
       
         setColor:function(color) {
           options.lineColor=color;
           append(new SetStrokeStyle(options.lineColor));

         },
       
         undo:function() {
           drawList.pop();
           this.redraw();
         },
         
         setEmpty:function() {
           var empty= { drawList: [],
           name:name, clone: simpleCloneFunction};

           this.setImage(empty);
         },
       
         redraw:function() {
           var i;
           this.clear();
           for(i=0;i<drawList.length;i++) {
             drawList[i].draw(ctx);
           }
         },
         
         setImage:function(x) {
           drawList=x.drawList;
           name=x.name;
           this.redraw();
         },
         
         getImage:function() {
           
           return { drawList: drawList,
           name:name, clone: simpleCloneFunction};
         },
         
         clear:function() {
           //alert("cler");
           ctx.fillStyle='#fff';
           ctx.lineWidth=0;
           ctx.clearRect(0,0,canvas.width,canvas.height);
         },
         
         onclick:function(handler) {
           onclicks[onclicks.length]=handler;
         },
 
       }
       return self.doodle_api;
    };
})(jQuery);


(function($){

    $.fn.jsDoodleList = function(options) {
      var self=this.get(0);
      var count=0;
      
      function initFromLocalStorage() {
      
        var i;
        if (typeof(sessionStorage) == 'undefined' || typeof(localStorage) == 'undefined') {
          alert('local and session storage not supported by this browser.');
        }
        
        for(i=0;i<getImageCount();i++) {
          addImage(localStorage.getItem("image"+i));
        }
      }
      
      function getImageCount() {
        var imageCount=localStorage.getItem("imageCount");
        if(imageCount)
          imageCount=imageCount+1;
        else
          imageCount=0;
        return imageCount;
      }
      
      function addToLocalStorage(image) {
        var c=getImageCount();
        var name="image"+c;
        alert(name);
        localStorage.setItem(name,image);
        localStorage.setItem("imageCount",c+1);
      }
      
      function addImage(image) {
          var cv=$('<div class="listItem" id="listItem'+count+'"></div>');
          count=count+1;
          cv.appendTo(self);
          var listItem=cv.jsDoodle({readonly:true});
          listItem.setImage(image);
//          addToLocalStorage(image);
          return listItem;
      }
      
//      initFromLocalStorage();
      
      return {
        add:function(image) {
          return addImage(image);
        }
      }
    }
})(jQuery);